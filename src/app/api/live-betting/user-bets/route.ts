import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

const prisma = new PrismaClient()

// GET /api/live-betting/user-bets - Get user's live bets
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's live bets
    const liveBets = await prisma.liveBet.findMany({
      where: { userId: user.id },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
            league: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 bets
    })

    // Format bets for frontend
    const formattedBets = liveBets.map(bet => ({
      id: bet.id,
      market: bet.market,
      selection: bet.selection,
      odds: bet.odds,
      stake: bet.stake,
      potentialWin: bet.potentialWin,
      status: bet.status,
      placedAtMinute: bet.placedAtMinute,
      
      // Cash-out info (using safe access for optional fields)
      cashedOut: (bet as any).cashedOut || false,
      
      // Settlement info
      settledAt: bet.settledAt,
      winAmount: (bet as any).winAmount || null,
      
      // Match info
      match: {
        id: bet.match.id,
        homeTeam: {
          name: bet.match.homeTeam.name,
          city: bet.match.homeTeam.city,
          logoUrl: bet.match.homeTeam.logoUrl
        },
        awayTeam: {
          name: bet.match.awayTeam.name,
          city: bet.match.awayTeam.city,
          logoUrl: bet.match.awayTeam.logoUrl
        },
        league: {
          name: bet.match.league.name,
          country: bet.match.league.country
        },
        startTime: bet.match.startTime,
        status: bet.match.status,
        minute: bet.match.minute,
        homeScore: bet.match.homeScore,
        awayScore: bet.match.awayScore,
        isDerby: bet.match.isDerby
      },
      
      createdAt: bet.createdAt,
      
      // Helper properties for UI
      isLive: bet.match.status === 'LIVE',
      canCashOut: bet.cashOutAvailable && bet.status === 'PENDING' && bet.match.status === 'LIVE',
      statusColor: getStatusColor(bet.status),
      resultText: getResultText(bet, bet.match)
    }))

    // Separate by status for easier frontend handling
    const activeBets = formattedBets.filter(bet => bet.status === 'PENDING')
    const settledBets = formattedBets.filter(bet => bet.status !== 'PENDING')

    return NextResponse.json({
      success: true,
      activeBets,
      settledBets,
      totalActive: activeBets.length,
      totalSettled: settledBets.length,
      // Summary stats
      stats: {
        totalStaked: liveBets.reduce((sum, bet) => sum + bet.stake, 0),
        totalWon: liveBets.reduce((sum, bet) => sum + (bet.winAmount || 0), 0),
        totalDiamondsEarned: liveBets.reduce((sum, bet) => sum + (((bet as any).diamondAwarded) ? ((bet as any).diamondReward || 0) : 0), 0),
        cashOutsUsed: liveBets.filter(bet => (bet as any).cashedOut).length
      }
    })

  } catch (error) {
    console.error('Error fetching user live bets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bets' },
      { status: 500 }
    )
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'PENDING': return 'blue'
    case 'WON': return 'green'
    case 'LOST': return 'red'
    case 'CASHED_OUT': return 'orange'
    case 'VOID': return 'gray'
    default: return 'gray'
  }
}

function getResultText(bet: any, match: any): string {
  if (bet.status === 'PENDING') {
    if (match.status === 'LIVE') {
      return `Live - ${match.minute}'`
    }
    return 'Pending'
  }
  
  if (bet.status === 'CASHED_OUT') {
    return `Cashed out for ${bet.winAmount} BP`
  }
  
  if (bet.status === 'WON') {
    return `Won ${bet.winAmount} BP + ${bet.diamondReward}💎`
  }
  
  if (bet.status === 'LOST') {
    return 'Lost'
  }
  
  return bet.status
}