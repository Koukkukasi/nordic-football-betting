import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { apiFootball } from '@/lib/api-football'

const prisma = new PrismaClient()

// Cache for odds to avoid excessive recalculations
let oddsCache = new Map<string, { odds: any, lastUpdate: number }>()
const ODDS_CACHE_DURATION = 20000 // 20 seconds

// GET /api/live-betting/odds - Get dynamic live odds for a match
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')
    const market = searchParams.get('market') || 'all'
    
    if (!matchId) {
      return NextResponse.json(
        { success: false, error: 'matchId required' },
        { status: 400 }
      )
    }

    // Get match details
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        odds: true,
        events: {
          orderBy: { minute: 'desc' },
          take: 10
        }
      }
    })

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      )
    }

    if (match.status !== 'LIVE') {
      return NextResponse.json(
        { success: false, error: 'Match is not live' },
        { status: 400 }
      )
    }

    // Check cache first
    const cacheKey = `${matchId}-${market}`
    const now = Date.now()
    const cached = oddsCache.get(cacheKey)

    let dynamicOdds
    if (cached && (now - cached.lastUpdate) < ODDS_CACHE_DURATION) {
      dynamicOdds = cached.odds
      console.log(`📋 Using cached odds for match ${matchId}`)
    } else {
      // Calculate fresh odds
      dynamicOdds = await calculateDynamicLiveOdds(match)
      oddsCache.set(cacheKey, { odds: dynamicOdds, lastUpdate: now })
      console.log(`🔄 Calculated fresh odds for match ${matchId}`)
    }

    // Filter by market if specified
    let filteredOdds = dynamicOdds
    if (market !== 'all') {
      filteredOdds = dynamicOdds.filter((odds: any) => 
        odds.market.toLowerCase().includes(market.toLowerCase())
      )
    }

    // Add betting availability and restrictions
    const bettingInfo = calculateBettingAvailability(match)

    return NextResponse.json({
      success: true,
      match: {
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        minute: match.minute,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        status: match.status
      },
      odds: filteredOdds,
      betting: bettingInfo,
      lastUpdate: new Date().toISOString(),
      cacheStatus: cached && (now - cached.lastUpdate) < ODDS_CACHE_DURATION ? 'cached' : 'fresh'
    })

  } catch (error) {
    console.error('Error fetching live odds:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live odds' },
      { status: 500 }
    )
  }
}

// Calculate dynamic live odds based on current match state
async function calculateDynamicLiveOdds(match: any) {
  const minute = match.minute || 1
  const homeScore = match.homeScore || 0
  const awayScore = match.awayScore || 0
  const scoreDiff = homeScore - awayScore
  const totalGoals = homeScore + awayScore
  
  // Get base odds from database
  const baseOdds = match.odds.find((o: any) => o.market === 'MATCH_RESULT')
  
  if (!baseOdds) {
    throw new Error('No base odds found for match')
  }

  const odds = []

  // 1. MATCH RESULT (1X2) - Live adjusted
  const matchResultOdds = calculateLiveMatchResult(baseOdds, minute, homeScore, awayScore, match.isDerby)
  odds.push({
    market: 'MATCH_RESULT',
    selections: [
      {
        name: 'Home Win',
        selection: 'HOME',
        odds: matchResultOdds.homeWin,
        enhancedOdds: Math.round(matchResultOdds.homeWin * 1.3),
        diamondReward: calculateDiamondReward(matchResultOdds.homeWin, match.isDerby)
      },
      {
        name: 'Draw',
        selection: 'DRAW',
        odds: matchResultOdds.draw,
        enhancedOdds: Math.round(matchResultOdds.draw * 1.3),
        diamondReward: calculateDiamondReward(matchResultOdds.draw, match.isDerby)
      },
      {
        name: 'Away Win',
        selection: 'AWAY',
        odds: matchResultOdds.awayWin,
        enhancedOdds: Math.round(matchResultOdds.awayWin * 1.3),
        diamondReward: calculateDiamondReward(matchResultOdds.awayWin, match.isDerby)
      }
    ]
  })

  // 2. NEXT GOAL (15-minute window)
  const nextGoalOdds = calculateNextGoalOdds(minute, homeScore, awayScore, match.isDerby)
  odds.push({
    market: 'NEXT_GOAL',
    timeFrame: '15 minutes',
    selections: [
      {
        name: `${match.homeTeam.name} to score next`,
        selection: 'HOME',
        odds: nextGoalOdds.home,
        diamondReward: calculateDiamondReward(nextGoalOdds.home, match.isDerby)
      },
      {
        name: `${match.awayTeam.name} to score next`,
        selection: 'AWAY',
        odds: nextGoalOdds.away,
        diamondReward: calculateDiamondReward(nextGoalOdds.away, match.isDerby)
      },
      {
        name: 'No goal in next 15 minutes',
        selection: 'NONE',
        odds: nextGoalOdds.none,
        diamondReward: calculateDiamondReward(nextGoalOdds.none, match.isDerby)
      }
    ]
  })

  // 3. TOTAL GOALS - Live adjusted thresholds
  const liveOverUnder = calculateLiveTotalGoals(totalGoals, minute, match.isDerby)
  odds.push({
    market: 'TOTAL_GOALS',
    note: 'Odds adjust based on current score',
    selections: [
      {
        name: 'Over 1.5 Goals',
        selection: 'OVER_1_5',
        odds: liveOverUnder.over15,
        diamondReward: calculateDiamondReward(liveOverUnder.over15, match.isDerby)
      },
      {
        name: 'Under 1.5 Goals',
        selection: 'UNDER_1_5',
        odds: liveOverUnder.under15,
        diamondReward: calculateDiamondReward(liveOverUnder.under15, match.isDerby)
      },
      {
        name: 'Over 2.5 Goals',
        selection: 'OVER_2_5',
        odds: liveOverUnder.over25,
        diamondReward: calculateDiamondReward(liveOverUnder.over25, match.isDerby)
      },
      {
        name: 'Under 2.5 Goals',
        selection: 'UNDER_2_5',
        odds: liveOverUnder.under25,
        diamondReward: calculateDiamondReward(liveOverUnder.under25, match.isDerby)
      },
      {
        name: 'Over 3.5 Goals',
        selection: 'OVER_3_5',
        odds: liveOverUnder.over35,
        diamondReward: calculateDiamondReward(liveOverUnder.over35, match.isDerby)
      },
      {
        name: 'Under 3.5 Goals',
        selection: 'UNDER_3_5',
        odds: liveOverUnder.under35,
        diamondReward: calculateDiamondReward(liveOverUnder.under35, match.isDerby)
      }
    ]
  })

  // 4. BOTH TEAMS TO SCORE (BTTS)
  const bttsOdds = calculateLiveBTTS(homeScore, awayScore, minute, match.isDerby)
  odds.push({
    market: 'BOTH_TEAMS_TO_SCORE',
    selections: [
      {
        name: 'Both Teams to Score',
        selection: 'YES',
        odds: bttsOdds.yes,
        diamondReward: calculateDiamondReward(bttsOdds.yes, match.isDerby)
      },
      {
        name: 'One or No Team to Score',
        selection: 'NO',
        odds: bttsOdds.no,
        diamondReward: calculateDiamondReward(bttsOdds.no, match.isDerby)
      }
    ]
  })

  // 5. NEXT CORNER
  const nextCornerOdds = calculateNextCornerOdds(minute, scoreDiff, match.isDerby)
  odds.push({
    market: 'NEXT_CORNER',
    timeFrame: '10 minutes',
    selections: [
      {
        name: `${match.homeTeam.name} corner`,
        selection: 'HOME',
        odds: nextCornerOdds.home,
        diamondReward: calculateDiamondReward(nextCornerOdds.home, match.isDerby)
      },
      {
        name: `${match.awayTeam.name} corner`,
        selection: 'AWAY',
        odds: nextCornerOdds.away,
        diamondReward: calculateDiamondReward(nextCornerOdds.away, match.isDerby)
      }
    ]
  })

  // 6. NEXT CARD
  const nextCardOdds = calculateNextCardOdds(minute, Math.abs(scoreDiff), match.isDerby)
  odds.push({
    market: 'NEXT_CARD',
    timeFrame: '20 minutes',
    selections: [
      {
        name: `${match.homeTeam.name} player carded`,
        selection: 'HOME',
        odds: nextCardOdds.home,
        diamondReward: calculateDiamondReward(nextCardOdds.home, match.isDerby)
      },
      {
        name: `${match.awayTeam.name} player carded`,
        selection: 'AWAY',
        odds: nextCardOdds.away,
        diamondReward: calculateDiamondReward(nextCardOdds.away, match.isDerby)
      },
      {
        name: 'No card in next 20 minutes',
        selection: 'NONE',
        odds: nextCardOdds.none,
        diamondReward: calculateDiamondReward(nextCardOdds.none, match.isDerby)
      }
    ]
  })

  // 7. CORRECT SCORE (most likely outcomes)
  const correctScoreOdds = calculateLiveCorrectScore(homeScore, awayScore, minute)
  odds.push({
    market: 'CORRECT_SCORE',
    note: 'Most likely final scores',
    selections: correctScoreOdds.map((score: any) => ({
      name: `${score.home}-${score.away}`,
      selection: `${score.home}_${score.away}`,
      odds: score.odds,
      diamondReward: calculateDiamondReward(score.odds, match.isDerby)
    }))
  })

  return odds
}

// Individual odds calculation functions
function calculateLiveMatchResult(baseOdds: any, minute: number, homeScore: number, awayScore: number, isDerby: boolean) {
  const timeRemaining = Math.max(0, 90 - minute)
  const scoreDiff = homeScore - awayScore
  
  let homeWin = baseOdds.homeWin || 200
  let draw = baseOdds.draw || 300
  let awayWin = baseOdds.awayWin || 400

  // Dramatic adjustments based on current score
  if (scoreDiff > 0) {
    // Home leading
    homeWin = Math.max(110, homeWin - (scoreDiff * 30) - (timeRemaining * 2))
    awayWin = Math.min(1000, awayWin + (scoreDiff * 50) + (timeRemaining * 4))
    if (scoreDiff >= 2) {
      awayWin = Math.min(1500, awayWin * 1.5) // Very unlikely comeback
    }
  } else if (scoreDiff < 0) {
    // Away leading
    awayWin = Math.max(110, awayWin + (scoreDiff * 30) - (timeRemaining * 2))
    homeWin = Math.min(1000, homeWin - (scoreDiff * 50) + (timeRemaining * 4))
    if (scoreDiff <= -2) {
      homeWin = Math.min(1500, homeWin * 1.5) // Very unlikely comeback
    }
  }

  // Draw adjustments
  if (homeScore === awayScore) {
    if (minute > 80) {
      draw = Math.max(250, draw - (90 - minute) * 8) // More likely as time runs out
    }
  } else {
    draw = Math.min(800, draw + Math.abs(scoreDiff) * 40) // Less likely with score difference
  }

  return {
    homeWin: Math.round(homeWin),
    draw: Math.round(draw),
    awayWin: Math.round(awayWin)
  }
}

function calculateNextGoalOdds(minute: number, homeScore: number, awayScore: number, isDerby: boolean) {
  const scoreDiff = homeScore - awayScore
  const totalGoals = homeScore + awayScore
  
  let homeOdds = 300
  let awayOdds = 350
  let noneOdds = 400

  // Time adjustments
  if (minute > 75) {
    homeOdds += 100
    awayOdds += 100
    noneOdds -= 50
  }

  // Score pressure adjustments
  if (scoreDiff < 0) homeOdds -= 70 // Home trailing, more desperate
  if (scoreDiff > 0) awayOdds -= 70 // Away trailing, more desperate

  // High-scoring game factor
  if (totalGoals > 2) {
    homeOdds -= 30
    awayOdds -= 30
    noneOdds += 60
  }

  // Derby factor
  if (isDerby) {
    homeOdds -= 20
    awayOdds -= 20
    noneOdds += 40
  }

  return {
    home: Math.max(150, Math.round(homeOdds)),
    away: Math.max(150, Math.round(awayOdds)),
    none: Math.max(200, Math.round(noneOdds))
  }
}

function calculateLiveTotalGoals(currentGoals: number, minute: number, isDerby: boolean) {
  const timeRemaining = Math.max(0, 90 - minute)
  
  // Calculate odds for different thresholds
  const calculateForThreshold = (threshold: number, type: 'over' | 'under') => {
    if (type === 'over') {
      if (currentGoals > threshold) return 100 // Already won
      const goalsNeeded = threshold - currentGoals + 0.5
      let odds = 150 + (goalsNeeded * 80) + ((90 - timeRemaining) * 3)
      if (isDerby) odds -= 30 // More goals in derbies
      return Math.max(105, Math.min(1000, Math.round(odds)))
    } else {
      if (currentGoals <= threshold) {
        if (minute > 85) return 110 // Very likely to stay under
        let odds = 200 - ((90 - timeRemaining) * 2)
        return Math.max(105, Math.round(odds))
      }
      return 1500 // Already lost
    }
  }

  return {
    over15: calculateForThreshold(1.5, 'over'),
    under15: calculateForThreshold(1.5, 'under'),
    over25: calculateForThreshold(2.5, 'over'),
    under25: calculateForThreshold(2.5, 'under'),
    over35: calculateForThreshold(3.5, 'over'),
    under35: calculateForThreshold(3.5, 'under')
  }
}

function calculateLiveBTTS(homeScore: number, awayScore: number, minute: number, isDerby: boolean) {
  const bothScored = homeScore > 0 && awayScore > 0
  
  if (bothScored) {
    return { yes: 100, no: 1500 } // BTTS already happened
  }

  const oneTeamScored = homeScore > 0 || awayScore > 0
  const timeRemaining = Math.max(0, 90 - minute)
  
  let yesOdds = 180
  let noOdds = 200

  if (!oneTeamScored) {
    // Neither team has scored
    yesOdds += (90 - timeRemaining) * 4 // Gets harder as time passes
    noOdds -= (90 - timeRemaining) * 2 // Gets easier
  } else {
    // One team has scored, need the other to score
    yesOdds += (90 - timeRemaining) * 3
    if (minute > 70) yesOdds += 50
  }

  if (isDerby) {
    yesOdds -= 30 // More goals in derbies
  }

  return {
    yes: Math.max(110, Math.round(yesOdds)),
    no: Math.max(110, Math.round(noOdds))
  }
}

function calculateNextCornerOdds(minute: number, scoreDiff: number, isDerby: boolean) {
  let homeOdds = 320
  let awayOdds = 380

  // Attacking pressure based on score
  if (scoreDiff < 0) homeOdds -= 60 // Home trailing
  if (scoreDiff > 0) awayOdds -= 60 // Away trailing

  // Time pressure
  if (minute > 80) {
    homeOdds -= 40
    awayOdds -= 40
  }

  // Home advantage for corners
  homeOdds -= 30

  return {
    home: Math.max(200, Math.round(homeOdds)),
    away: Math.max(200, Math.round(awayOdds))
  }
}

function calculateNextCardOdds(minute: number, scoreDiffAbs: number, isDerby: boolean) {
  let homeOdds = 450
  let awayOdds = 450
  let noneOdds = 200

  // Cards more likely in second half
  if (minute > 45) {
    homeOdds -= 50
    awayOdds -= 50
    noneOdds += 30
  }

  // Tension factors
  if (isDerby) {
    homeOdds -= 100
    awayOdds -= 100
    noneOdds += 50
  }

  if (scoreDiffAbs === 0) { // Draw = tension
    homeOdds -= 30
    awayOdds -= 30
  }

  return {
    home: Math.max(250, Math.round(homeOdds)),
    away: Math.max(250, Math.round(awayOdds)),
    none: Math.max(150, Math.round(noneOdds))
  }
}

function calculateLiveCorrectScore(homeScore: number, awayScore: number, minute: number) {
  const timeRemaining = Math.max(0, 90 - minute)
  const baseOdds = 500
  
  // Generate most likely final score scenarios
  const scenarios = []
  
  // Current score (no more goals)
  scenarios.push({
    home: homeScore,
    away: awayScore,
    odds: Math.max(200, baseOdds - (90 - timeRemaining) * 8)
  })

  // One more goal scenarios
  if (timeRemaining > 10) {
    scenarios.push({
      home: homeScore + 1,
      away: awayScore,
      odds: baseOdds + 100
    })
    scenarios.push({
      home: homeScore,
      away: awayScore + 1,
      odds: baseOdds + 150
    })
  }

  // Two more goals scenarios (if early in match)
  if (timeRemaining > 30) {
    scenarios.push({
      home: homeScore + 2,
      away: awayScore,
      odds: baseOdds + 400
    })
    scenarios.push({
      home: homeScore,
      away: awayScore + 2,
      odds: baseOdds + 500
    })
    scenarios.push({
      home: homeScore + 1,
      away: awayScore + 1,
      odds: baseOdds + 300
    })
  }

  return scenarios.slice(0, 6) // Return top 6 most likely
}

function calculateDiamondReward(odds: number, isDerby: boolean): number {
  const decimalOdds = odds / 100
  let diamonds = 2 // Base live betting reward

  if (decimalOdds >= 10.0) diamonds = 15
  else if (decimalOdds >= 5.0) diamonds = 10
  else if (decimalOdds >= 3.0) diamonds = 6
  else if (decimalOdds >= 2.0) diamonds = 4
  else diamonds = 2

  // Derby multiplier
  if (isDerby) diamonds = Math.round(diamonds * 1.5)

  return diamonds
}

function calculateBettingAvailability(match: any) {
  const minute = match.minute || 0
  
  return {
    available: minute < 75,
    cashOutAvailable: minute > 5 && minute < 75,
    restrictions: {
      timeBasedClosure: minute >= 75 ? 'Betting closed after 75th minute' : null,
      earlyBetting: minute < 5 ? 'Cash-out available after 5th minute' : null
    },
    diamondMultiplier: match.isDerby ? 3 : 2,
    enhancedOddsAvailable: true,
    lastOddsUpdate: new Date().toISOString()
  }
}

// POST /api/live-betting/odds - Manually update odds (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { matchId, market, selections } = body

    if (!matchId || !market || !selections) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify match exists and is live
    const match = await prisma.match.findUnique({
      where: { id: matchId }
    })

    if (!match || match.status !== 'LIVE') {
      return NextResponse.json(
        { success: false, error: 'Match not found or not live' },
        { status: 404 }
      )
    }

    // Clear cache for this match
    const cacheKeys = Array.from(oddsCache.keys()).filter(key => key.startsWith(matchId))
    cacheKeys.forEach(key => oddsCache.delete(key))

    return NextResponse.json({
      success: true,
      message: 'Odds cache cleared, fresh odds will be calculated on next request'
    })

  } catch (error) {
    console.error('Error updating odds:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update odds' },
      { status: 500 }
    )
  }
}