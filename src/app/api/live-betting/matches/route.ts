import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { apiFootball, NORDIC_LEAGUES } from '@/lib/api-football'

const prisma = new PrismaClient()

// Cache for API-Football data to avoid rate limits
let liveMatchesCache: any = null
let lastFetchTime = 0
const CACHE_DURATION = 30000 // 30 seconds

// GET /api/live-betting/matches - Get all live matches with enhanced odds
export async function GET(request: NextRequest) {
  try {
    const now = Date.now()
    
    // Check cache first (30-second polling)
    let apiLiveMatches = []
    if (liveMatchesCache && (now - lastFetchTime) < CACHE_DURATION) {
      apiLiveMatches = liveMatchesCache
      console.log('📋 Using cached live matches')
    } else {
      // Fetch fresh data from API-Football
      try {
        apiLiveMatches = await apiFootball.getLiveMatches()
        liveMatchesCache = apiLiveMatches
        lastFetchTime = now
        console.log(`🔄 Fetched ${apiLiveMatches.length} live matches from API-Football`)
      } catch (apiError) {
        console.error('API-Football error, using cached data:', apiError)
        apiLiveMatches = liveMatchesCache || []
      }
    }
    
    // Get live matches from our database
    const dbLiveMatches = await prisma.match.findMany({
      where: {
        status: 'LIVE'
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
        odds: {
          where: {
            isLive: true
          }
        },
        events: {
          orderBy: {
            minute: 'desc'
          },
          take: 10
        }
      }
    })

    // Combine and format matches for live betting
    const liveMatches = dbLiveMatches.map(match => {
      // Find corresponding API match for real-time data
      const apiMatch = apiLiveMatches.find((am: any) => 
        am.fixture.id.toString() === match.externalId
      )

      // Calculate enhanced odds for F2P
      const enhancedOdds = match.odds.map(odds => ({
        ...odds,
        enhancedHomeWin: odds.homeWin ? Math.round(odds.homeWin * 1.3) : null,
        enhancedDraw: odds.draw ? Math.round(odds.draw * 1.3) : null,
        enhancedAwayWin: odds.awayWin ? Math.round(odds.awayWin * 1.3) : null,
        // Live markets with dynamic odds
        nextGoalHome: calculateNextGoalOdds(match, 'HOME'),
        nextGoalAway: calculateNextGoalOdds(match, 'AWAY'),
        nextGoalNone: calculateNextGoalOdds(match, 'NONE'),
        nextCornerHome: calculateNextCornerOdds(match, 'HOME'),
        nextCornerAway: calculateNextCornerOdds(match, 'AWAY'),
        nextCardHome: calculateNextCardOdds(match, 'HOME'),
        nextCardAway: calculateNextCardOdds(match, 'AWAY'),
        // Live Over/Under with dynamic adjustment
        liveOver15: calculateLiveOverUnder(match, 1.5, 'over'),
        liveUnder15: calculateLiveOverUnder(match, 1.5, 'under'),
        liveOver25: calculateLiveOverUnder(match, 2.5, 'over'),
        liveUnder25: calculateLiveOverUnder(match, 2.5, 'under'),
        liveOver35: calculateLiveOverUnder(match, 3.5, 'over'),
        liveUnder35: calculateLiveOverUnder(match, 3.5, 'under'),
        // BTTS live odds
        liveBttsYes: calculateLiveBTTS(match, true),
        liveBttsNo: calculateLiveBTTS(match, false)
      }))

      return {
        id: match.id,
        externalId: match.externalId,
        league: {
          id: match.league.id,
          name: match.league.name,
          country: match.league.country,
          tier: match.league.tier
        },
        homeTeam: {
          id: match.homeTeam.id,
          name: match.homeTeam.name,
          city: match.homeTeam.city,
          logoUrl: match.homeTeam.logoUrl
        },
        awayTeam: {
          id: match.awayTeam.id,
          name: match.awayTeam.name,
          city: match.awayTeam.city,
          logoUrl: match.awayTeam.logoUrl
        },
        startTime: match.startTime,
        status: match.status,
        minute: match.minute,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        isDerby: match.isDerby,
        isFeatured: match.isFeatured,
        odds: enhancedOdds,
        recentEvents: match.events.slice(0, 5),
        // Live betting specific data
        liveBettingAvailable: match.minute ? match.minute < 75 : true, // No betting after 75'
        diamondMultiplier: match.isDerby ? 3 : 2, // 2x for live, 3x for derby live
        cashOutAvailable: match.minute ? match.minute > 5 && match.minute < 75 : false, // Cash-out after 5' until 75'
        // API data for real-time sync
        apiData: apiMatch ? {
          elapsed: apiMatch.fixture.status.elapsed,
          homeGoals: apiMatch.goals.home,
          awayGoals: apiMatch.goals.away,
          lastUpdate: new Date().toISOString()
        } : null
      }
    })

    return NextResponse.json({
      success: true,
      matches: liveMatches,
      count: liveMatches.length,
      lastUpdate: new Date().toISOString(),
      cacheStatus: (now - lastFetchTime) < CACHE_DURATION ? 'cached' : 'fresh',
      apiResponseTime: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching live matches:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live matches' },
      { status: 500 }
    )
  }
}

// Helper functions to calculate dynamic live odds
function calculateNextGoalOdds(match: any, team: 'HOME' | 'AWAY' | 'NONE'): number {
  const minute = match.minute || 1
  const scoreDiff = (match.homeScore || 0) - (match.awayScore || 0)
  const totalGoals = (match.homeScore || 0) + (match.awayScore || 0)
  
  let baseOdds = 300 // Base 3.00
  
  if (team === 'NONE') {
    // No goal in next 15 minutes
    baseOdds = 400
    if (minute > 75) baseOdds -= 100 // More likely near end
    if (totalGoals > 2) baseOdds += 50 // High-scoring games likely to continue
    return Math.max(150, Math.min(600, baseOdds))
  }
  
  // Adjust for time - higher odds as time passes
  if (minute > 60) baseOdds += 50
  if (minute > 75) baseOdds += 100
  if (minute > 85) baseOdds += 150
  
  // Adjust for score difference
  if (team === 'HOME') {
    if (scoreDiff > 0) baseOdds += 50 // Leading team less likely to score
    if (scoreDiff < 0) baseOdds -= 50 // Trailing team more likely to score
    if (scoreDiff <= -2) baseOdds -= 100 // Desperately trailing
  } else {
    if (scoreDiff < 0) baseOdds += 50
    if (scoreDiff > 0) baseOdds -= 50
    if (scoreDiff >= 2) baseOdds -= 100 // Desperately trailing
  }
  
  // Derby factor
  if (match.isDerby) baseOdds -= 30
  
  // Random variance for realism
  baseOdds += Math.floor(Math.random() * 40) - 20
  
  return Math.max(150, Math.min(800, baseOdds))
}

function calculateNextCornerOdds(match: any, team: 'HOME' | 'AWAY'): number {
  const minute = match.minute || 1
  const scoreDiff = (match.homeScore || 0) - (match.awayScore || 0)
  
  let baseOdds = 350 // Base 3.50
  
  // Corners are more frequent in certain periods
  if (minute < 15 || minute > 75) baseOdds -= 50
  if (minute > 85) baseOdds -= 30 // Desperate attacks
  
  // Home teams generally get more corners
  if (team === 'HOME') baseOdds -= 30
  else baseOdds += 30
  
  // Trailing teams get more corners (attacking pressure)
  if (team === 'HOME' && scoreDiff < 0) baseOdds -= 40
  if (team === 'AWAY' && scoreDiff > 0) baseOdds -= 40
  
  return Math.max(200, Math.min(600, baseOdds + Math.floor(Math.random() * 60) - 30))
}

function calculateNextCardOdds(match: any, team: 'HOME' | 'AWAY'): number {
  const minute = match.minute || 1
  const scoreDiff = Math.abs((match.homeScore || 0) - (match.awayScore || 0))
  
  let baseOdds = 400 // Base 4.00
  
  // Cards more likely in second half
  if (minute > 45) baseOdds -= 50
  if (minute > 75) baseOdds -= 50
  if (minute > 85) baseOdds -= 30 // Tension increases
  
  // Derby matches have more cards
  if (match.isDerby) baseOdds -= 100
  
  // Close games have more cards (tension)
  if (scoreDiff === 0) baseOdds -= 30
  if (scoreDiff === 1) baseOdds -= 20
  
  return Math.max(250, Math.min(800, baseOdds + Math.floor(Math.random() * 100) - 50))
}

// New helper functions for enhanced live markets
function calculateLiveOverUnder(match: any, threshold: number, type: 'over' | 'under'): number {
  const minute = match.minute || 1
  const currentGoals = (match.homeScore || 0) + (match.awayScore || 0)
  const timeRemaining = Math.max(0, 90 - minute)
  
  // Calculate goals needed
  const goalsNeeded = type === 'over' 
    ? Math.max(0, threshold - currentGoals + 0.5)
    : Math.max(0, currentGoals - threshold + 0.5)
  
  // If already decided
  if (type === 'over' && currentGoals > threshold) return 100
  if (type === 'under' && currentGoals <= threshold && minute > 85) return 110
  
  // Base calculation
  let odds = 200 + (goalsNeeded * 60) + ((90 - timeRemaining) * 3)
  
  // High-scoring game factor
  if (currentGoals > 2) {
    if (type === 'over') odds -= 50
    else odds += 50
  }
  
  // Derby factor (more goals)
  if (match.isDerby && type === 'over') odds -= 20
  
  return Math.max(105, Math.min(800, Math.round(odds)))
}

function calculateLiveBTTS(match: any, btts: boolean): number {
  const minute = match.minute || 1
  const homeGoals = match.homeScore || 0
  const awayGoals = match.awayScore || 0
  const bothScored = homeGoals > 0 && awayGoals > 0
  
  // If already decided
  if (btts && bothScored) return 100
  if (!btts && minute > 85 && !bothScored) return 110
  
  let baseOdds = btts ? 180 : 200
  
  if (btts) {
    // BTTS Yes odds
    if (bothScored) return 100 // Already happened
    if (homeGoals === 0 || awayGoals === 0) {
      baseOdds += (90 - minute) * 2 // Less time = harder
      if (minute > 70) baseOdds += 50
    }
  } else {
    // BTTS No odds
    if (bothScored) return 800 // Very unlikely
    if (minute > 60 && (homeGoals === 0 || awayGoals === 0)) {
      baseOdds -= 50 // More likely to stay BTTS No
    }
  }
  
  return Math.max(105, Math.min(800, baseOdds))
}