import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

// GET user's bet history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // PENDING, WON, LOST, VOID, CASHED_OUT
    const betType = searchParams.get('betType') // SINGLE, PITKAVETO, LIVE
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Build where clause
    const where: any = { userId: user.id }
    
    if (status) {
      where.status = status
    }
    
    if (betType) {
      where.betType = betType
    }
    
    // Get bets with all details
    const bets = await prisma.bet.findMany({
      where,
      include: {
        selections: {
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true,
                league: true
              }
            }
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: offset,
      take: limit
    })
    
    // Get total count
    const total = await prisma.bet.count({ where })
    
    // Calculate statistics
    const stats = await prisma.bet.aggregate({
      where: { userId: user.id },
      _sum: {
        stake: true,
        winAmount: true
      },
      _count: {
        _all: true
      }
    })
    
    const wonBets = await prisma.bet.count({
      where: { userId: user.id, status: 'WON' }
    })
    
    const lostBets = await prisma.bet.count({
      where: { userId: user.id, status: 'LOST' }
    })
    
    // Format bets
    const formattedBets = bets.map(bet => ({
      id: bet.id,
      betType: bet.betType,
      stake: bet.stake,
      totalOdds: bet.totalOdds,
      potentialWin: bet.potentialWin,
      status: bet.status,
      winAmount: bet.winAmount,
      diamondBoost: bet.diamondBoost,
      diamondsUsed: bet.diamondsUsed,
      createdAt: bet.createdAt,
      settledAt: bet.settledAt,
      selections: bet.selections.map(sel => ({
        id: sel.id,
        market: sel.market,
        selection: sel.selection,
        odds: sel.odds,
        result: sel.result,
        match: {
          id: sel.match.id,
          homeTeam: sel.match.homeTeam.name,
          awayTeam: sel.match.awayTeam.name,
          league: sel.match.league.name,
          startTime: sel.match.startTime,
          status: sel.match.status,
          score: sel.match.homeScore !== null ? {
            home: sel.match.homeScore,
            away: sel.match.awayScore
          } : null
        }
      }))
    }))
    
    return NextResponse.json({
      success: true,
      bets: formattedBets,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      stats: {
        totalBets: stats._count._all,
        totalStaked: stats._sum.stake || 0,
        totalWon: stats._sum.winAmount || 0,
        profit: (stats._sum.winAmount || 0) - (stats._sum.stake || 0),
        wonBets,
        lostBets,
        winRate: stats._count._all > 0 ? (wonBets / stats._count._all) * 100 : 0
      }
    })
    
  } catch (error) {
    console.error('Get bet history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bet history' },
      { status: 500 }
    )
  }
}

// GET single bet details
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { betId } = await request.json()
    
    if (!betId) {
      return NextResponse.json(
        { error: 'Bet ID required' },
        { status: 400 }
      )
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Get bet with full details
    const bet = await prisma.bet.findFirst({
      where: {
        id: betId,
        userId: user.id // Ensure user owns this bet
      },
      include: {
        selections: {
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true,
                league: true,
                events: {
                  orderBy: { minute: 'asc' }
                }
              }
            }
          }
        }
      }
    })
    
    if (!bet) {
      return NextResponse.json(
        { error: 'Bet not found' },
        { status: 404 }
      )
    }
    
    // Format bet details
    const formattedBet = {
      id: bet.id,
      betType: bet.betType,
      stake: bet.stake,
      totalOdds: bet.totalOdds,
      potentialWin: bet.potentialWin,
      status: bet.status,
      winAmount: bet.winAmount,
      diamondBoost: bet.diamondBoost,
      diamondsUsed: bet.diamondsUsed,
      createdAt: bet.createdAt,
      settledAt: bet.settledAt,
      selections: bet.selections.map(sel => ({
        id: sel.id,
        market: sel.market,
        selection: sel.selection,
        odds: sel.odds,
        result: sel.result,
        match: {
          id: sel.match.id,
          homeTeam: {
            name: sel.match.homeTeam.name,
            shortName: sel.match.homeTeam.shortName,
            logoUrl: sel.match.homeTeam.logoUrl
          },
          awayTeam: {
            name: sel.match.awayTeam.name,
            shortName: sel.match.awayTeam.shortName,
            logoUrl: sel.match.awayTeam.logoUrl
          },
          league: {
            name: sel.match.league.name,
            country: sel.match.league.country
          },
          startTime: sel.match.startTime,
          status: sel.match.status,
          score: sel.match.homeScore !== null ? {
            home: sel.match.homeScore,
            away: sel.match.awayScore
          } : null,
          events: sel.match.events.map(event => ({
            minute: event.minute,
            type: event.eventType,
            team: event.team,
            player: event.player
          }))
        }
      }))
    }
    
    return NextResponse.json({
      success: true,
      bet: formattedBet
    })
    
  } catch (error) {
    console.error('Get bet details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bet details' },
      { status: 500 }
    )
  }
}