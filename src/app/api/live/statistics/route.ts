import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { matchSimulatorManager } from '@/lib/live-match-simulation'

// GET live betting statistics for a match or all live matches
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const matchId = searchParams.get('matchId')
    const type = searchParams.get('type') || 'overview' // overview, distribution, trends, players
    
    if (matchId) {
      // Get statistics for specific match
      const stats = await getMatchStatistics(matchId, type)
      return NextResponse.json(stats)
    } else {
      // Get statistics for all live matches
      const stats = await getAllLiveStatistics()
      return NextResponse.json(stats)
    }
    
  } catch (error) {
    console.error('Get live statistics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

// Get detailed statistics for a specific match
async function getMatchStatistics(matchId: string, type: string) {
  // Get match details
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
      odds: true
    }
  })
  
  if (!match) {
    throw new Error('Match not found')
  }
  
  // Get live state if available
  const simulator = matchSimulatorManager.getSimulator(matchId)
  const liveState = simulator?.getState()
  
  // Base statistics
  const baseStats = {
    matchId,
    status: match.status,
    minute: liveState?.minute || match.minute || 0,
    teams: {
      home: match.homeTeam.name,
      away: match.awayTeam.name
    },
    score: {
      home: liveState?.homeScore ?? match.homeScore ?? 0,
      away: liveState?.awayScore ?? match.awayScore ?? 0
    }
  }
  
  switch (type) {
    case 'distribution':
      return {
        ...baseStats,
        ...await getBettingDistribution(matchId)
      }
      
    case 'trends':
      return {
        ...baseStats,
        ...await getBettingTrends(matchId)
      }
      
    case 'players':
      return {
        ...baseStats,
        ...await getTopBettors(matchId)
      }
      
    case 'live':
      return {
        ...baseStats,
        ...await getLiveMatchStats(matchId, liveState)
      }
      
    default: // overview
      return {
        ...baseStats,
        betting: await getBettingOverview(matchId),
        match: liveState ? {
          possession: {
            home: liveState.homeStats.possession,
            away: liveState.awayStats.possession
          },
          shots: {
            home: liveState.homeStats.shots,
            away: liveState.awayStats.shots
          },
          shotsOnTarget: {
            home: liveState.homeStats.shotsOnTarget,
            away: liveState.awayStats.shotsOnTarget
          },
          corners: {
            home: liveState.homeStats.corners,
            away: liveState.awayStats.corners
          },
          cards: {
            home: {
              yellow: liveState.homeStats.yellowCards,
              red: liveState.homeStats.redCards
            },
            away: {
              yellow: liveState.awayStats.yellowCards,
              red: liveState.awayStats.redCards
            }
          },
          momentum: liveState.momentum
        } : null
      }
  }
}

// Get betting distribution for a match
async function getBettingDistribution(matchId: string) {
  // Get all bets on this match
  const selections = await prisma.betSelection.findMany({
    where: {
      matchId,
      bet: {
        status: { in: ['PENDING', 'WON', 'LOST'] }
      }
    },
    include: {
      bet: true
    }
  })
  
  // Calculate distribution by market and selection
  const distribution: Record<string, any> = {}
  
  selections.forEach(sel => {
    if (!distribution[sel.market]) {
      distribution[sel.market] = {
        total: 0,
        totalStake: 0,
        selections: {}
      }
    }
    
    if (!distribution[sel.market].selections[sel.selection]) {
      distribution[sel.market].selections[sel.selection] = {
        count: 0,
        stake: 0,
        percentage: 0
      }
    }
    
    distribution[sel.market].total++
    distribution[sel.market].totalStake += sel.bet.stake
    distribution[sel.market].selections[sel.selection].count++
    distribution[sel.market].selections[sel.selection].stake += sel.bet.stake
  })
  
  // Calculate percentages
  Object.keys(distribution).forEach(market => {
    const marketData = distribution[market]
    Object.keys(marketData.selections).forEach(selection => {
      marketData.selections[selection].percentage = 
        (marketData.selections[selection].stake / marketData.totalStake) * 100
    })
  })
  
  // Get most popular bet
  let mostPopular = { market: '', selection: '', count: 0 }
  Object.keys(distribution).forEach(market => {
    Object.keys(distribution[market].selections).forEach(selection => {
      if (distribution[market].selections[selection].count > mostPopular.count) {
        mostPopular = {
          market,
          selection,
          count: distribution[market].selections[selection].count
        }
      }
    })
  })
  
  return {
    distribution,
    mostPopular,
    totalBets: selections.length,
    totalStake: selections.reduce((sum, sel) => sum + sel.bet.stake, 0)
  }
}

// Get betting trends over time
async function getBettingTrends(matchId: string) {
  // Get bets grouped by time intervals
  const now = new Date()
  const intervals = [
    { label: 'Last 5 min', minutes: 5 },
    { label: 'Last 15 min', minutes: 15 },
    { label: 'Last 30 min', minutes: 30 },
    { label: 'Last hour', minutes: 60 }
  ]
  
  const trends = await Promise.all(intervals.map(async interval => {
    const since = new Date(now.getTime() - interval.minutes * 60000)
    
    const bets = await prisma.bet.count({
      where: {
        selections: {
          some: { matchId }
        },
        createdAt: { gte: since }
      }
    })
    
    const stake = await prisma.bet.aggregate({
      where: {
        selections: {
          some: { matchId }
        },
        createdAt: { gte: since }
      },
      _sum: { stake: true }
    })
    
    return {
      ...interval,
      bets,
      stake: stake._sum.stake || 0
    }
  }))
  
  // Get betting velocity (bets per minute in last 5 minutes)
  const velocity = trends[0].bets / 5
  
  // Get momentum (increase/decrease in betting)
  const momentum = trends.length > 1 ? 
    ((trends[0].bets / 5) - (trends[1].bets / 15)) / (trends[1].bets / 15) * 100 : 0
  
  return {
    trends,
    velocity,
    momentum,
    trending: momentum > 20 // Trending if > 20% increase
  }
}

// Get top bettors for a match
async function getTopBettors(matchId: string) {
  // Get top 10 bettors by stake
  const topByStake = await prisma.bet.findMany({
    where: {
      selections: {
        some: { matchId }
      }
    },
    orderBy: { stake: 'desc' },
    take: 10,
    include: {
      user: {
        select: {
          username: true,
          level: true,
          vipStatus: true
        }
      },
      selections: {
        where: { matchId }
      }
    }
  })
  
  // Get top 10 bettors by potential win
  const topByWin = await prisma.bet.findMany({
    where: {
      selections: {
        some: { matchId }
      }
    },
    orderBy: { potentialWin: 'desc' },
    take: 10,
    include: {
      user: {
        select: {
          username: true,
          level: true,
          vipStatus: true
        }
      },
      selections: {
        where: { matchId }
      }
    }
  })
  
  // Format player data
  const formatPlayers = (bets: any[]) => bets.map(bet => ({
    username: bet.user.username,
    level: bet.user.level,
    vipStatus: bet.user.vipStatus,
    stake: bet.stake,
    potentialWin: bet.potentialWin,
    odds: bet.totalOdds,
    selection: bet.selections[0]?.selection,
    market: bet.selections[0]?.market
  }))
  
  return {
    topByStake: formatPlayers(topByStake),
    topByWin: formatPlayers(topByWin),
    vipBettors: topByStake.filter(b => b.user.vipStatus !== 'FREE').length,
    highRollers: topByStake.filter(b => b.stake >= 5000).length
  }
}

// Get live match statistics
async function getLiveMatchStats(matchId: string, liveState: any) {
  if (!liveState) {
    return { message: 'Match not live' }
  }
  
  // Calculate advanced statistics
  const stats = {
    matchStats: {
      possession: {
        home: liveState.homeStats.possession,
        away: liveState.awayStats.possession
      },
      expectedGoals: {
        home: calculateXG(liveState.homeStats),
        away: calculateXG(liveState.awayStats)
      },
      pressure: {
        home: liveState.momentum.home,
        away: liveState.momentum.away
      },
      dangerousAttacks: {
        home: liveState.homeStats.shotsOnTarget + liveState.homeStats.corners / 2,
        away: liveState.awayStats.shotsOnTarget + liveState.awayStats.corners / 2
      }
    },
    lastFiveMinutes: {
      events: liveState.events.filter((e: any) => e.minute > liveState.minute - 5),
      shots: {
        home: liveState.events.filter((e: any) => 
          e.minute > liveState.minute - 5 && e.type === 'SHOT' && e.team === 'HOME'
        ).length,
        away: liveState.events.filter((e: any) => 
          e.minute > liveState.minute - 5 && e.type === 'SHOT' && e.team === 'AWAY'
        ).length
      }
    },
    projections: {
      finalScore: projectFinalScore(liveState),
      totalGoals: projectTotalGoals(liveState),
      nextGoalTeam: liveState.momentum.home > liveState.momentum.away ? 'HOME' : 'AWAY',
      nextGoalProbability: Math.max(liveState.momentum.home, liveState.momentum.away) / 100
    }
  }
  
  return stats
}

// Get betting overview
async function getBettingOverview(matchId: string) {
  const totalBets = await prisma.bet.count({
    where: {
      selections: {
        some: { matchId }
      }
    }
  })
  
  const totalStake = await prisma.bet.aggregate({
    where: {
      selections: {
        some: { matchId }
      }
    },
    _sum: { stake: true }
  })
  
  const liveBets = await prisma.bet.count({
    where: {
      betType: 'LIVE',
      selections: {
        some: { matchId }
      }
    }
  })
  
  const cashOuts = await prisma.bet.count({
    where: {
      status: 'CASHED_OUT',
      selections: {
        some: { matchId }
      }
    }
  })
  
  const avgStake = totalBets > 0 ? (totalStake._sum.stake || 0) / totalBets : 0
  
  return {
    totalBets,
    totalStake: totalStake._sum.stake || 0,
    avgStake: Math.round(avgStake),
    liveBets,
    cashOuts,
    livePercentage: totalBets > 0 ? (liveBets / totalBets) * 100 : 0
  }
}

// Get statistics for all live matches
async function getAllLiveStatistics() {
  const liveMatches = await prisma.match.findMany({
    where: { status: 'LIVE' },
    include: {
      homeTeam: true,
      awayTeam: true,
      _count: {
        select: {
          selections: true
        }
      }
    }
  })
  
  const totalLiveBets = await prisma.bet.count({
    where: {
      betType: 'LIVE',
      status: 'PENDING'
    }
  })
  
  const totalLiveStake = await prisma.bet.aggregate({
    where: {
      betType: 'LIVE',
      status: 'PENDING'
    },
    _sum: { stake: true }
  })
  
  const activeCashOuts = await prisma.bet.count({
    where: {
      status: 'PENDING',
      selections: {
        some: {
          match: {
            status: 'LIVE'
          }
        }
      }
    }
  })
  
  // Get most popular live match
  const mostPopular = liveMatches.reduce((prev, current) => 
    (prev._count.selections > current._count.selections) ? prev : current
  , liveMatches[0])
  
  return {
    success: true,
    liveMatches: liveMatches.length,
    totalLiveBets,
    totalLiveStake: totalLiveStake._sum.stake || 0,
    activeCashOuts,
    matches: liveMatches.map(match => ({
      id: match.id,
      teams: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      minute: match.minute,
      score: `${match.homeScore}-${match.awayScore}`,
      totalBets: match._count.selections,
      trending: match.id === mostPopular?.id
    })),
    mostPopularMatch: mostPopular ? {
      id: mostPopular.id,
      teams: `${mostPopular.homeTeam.name} vs ${mostPopular.awayTeam.name}`,
      totalBets: mostPopular._count.selections
    } : null
  }
}

// Helper functions

function calculateXG(stats: any): number {
  // Simple xG calculation based on shots and shot quality
  const shotsValue = stats.shots * 0.1
  const shotsOnTargetValue = stats.shotsOnTarget * 0.25
  const cornersValue = stats.corners * 0.03
  
  return Math.round((shotsValue + shotsOnTargetValue + cornersValue) * 100) / 100
}

function projectFinalScore(liveState: any) {
  const minutesPlayed = liveState.minute
  const minutesRemaining = 90 - minutesPlayed
  
  if (minutesPlayed === 0) {
    return { home: 1, away: 1 } // Default prediction
  }
  
  const goalsPerMinuteHome = liveState.homeScore / minutesPlayed
  const goalsPerMinuteAway = liveState.awayScore / minutesPlayed
  
  const projectedHome = liveState.homeScore + (goalsPerMinuteHome * minutesRemaining * 0.8)
  const projectedAway = liveState.awayScore + (goalsPerMinuteAway * minutesRemaining * 0.8)
  
  return {
    home: Math.round(projectedHome),
    away: Math.round(projectedAway)
  }
}

function projectTotalGoals(liveState: any) {
  const currentTotal = liveState.homeScore + liveState.awayScore
  const minutesPlayed = liveState.minute
  const minutesRemaining = 90 - minutesPlayed
  
  if (minutesPlayed === 0) return 2.5
  
  const goalsPerMinute = currentTotal / minutesPlayed
  const projectedTotal = currentTotal + (goalsPerMinute * minutesRemaining * 0.7)
  
  return Math.round(projectedTotal * 10) / 10
}