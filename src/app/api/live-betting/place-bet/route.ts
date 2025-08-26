import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { matchId, market, selection, odds, stake, enhancedOdds } = body

    // Validate required fields
    if (!matchId || !market || !selection || !odds || !stake) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
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

    // Get match to verify it's live and not too late
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { homeTeam: true, awayTeam: true }
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

    // Prevent late betting exploitation
    if (match.minute && match.minute >= 75) {
      return NextResponse.json(
        { success: false, error: 'Betting closed after 75th minute' },
        { status: 400 }
      )
    }

    // Check user has enough bet points
    if (user.betPoints < stake) {
      return NextResponse.json(
        { success: false, error: 'Insufficient bet points' },
        { status: 400 }
      )
    }

    // Calculate potential win and diamond reward
    const finalOdds = enhancedOdds || odds
    const potentialWin = Math.round(stake * (finalOdds / 100))
    const diamondReward = calculateLiveDiamondReward(finalOdds, match.isDerby)

    // Create live bet
    const liveBet = await prisma.liveBet.create({
      data: {
        userId: user.id,
        matchId: match.id,
        market,
        selection,
        odds: odds / 100, // Convert to decimal
        stake,
        potentialWin,
        placedAtMinute: match.minute || 0
      }
    })

    // Update user balance and stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        betPoints: user.betPoints - stake,
        totalBets: user.totalBets + 1,
        totalStaked: user.totalStaked + stake
      }
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'BET_PLACED',
        amount: stake,
        currency: 'BETPOINTS',
        description: `Live bet: ${match.homeTeam.name} vs ${match.awayTeam.name} - ${market}`,
        reference: liveBet.id,
        balanceBefore: user.betPoints,
        balanceAfter: user.betPoints - stake
      }
    })

    // Schedule cash-out value updates
    await updateCashOutValue(liveBet.id)

    return NextResponse.json({
      success: true,
      bet: {
        id: liveBet.id,
        market,
        selection,
        odds: finalOdds / 100,
        stake,
        potentialWin,
        diamondReward,
        placedAtMinute: match.minute,
        cashOutAvailable: true
      },
      userBalance: user.betPoints - stake
    })

  } catch (error) {
    console.error('Error placing live bet:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to place bet' },
      { status: 500 }
    )
  }
}

function calculateLiveDiamondReward(odds: number, isDerby: boolean): number {
  const decimalOdds = odds / 100
  let diamonds = 1
  
  if (decimalOdds >= 5.0) diamonds = 8
  else if (decimalOdds >= 4.0) diamonds = 6
  else if (decimalOdds >= 3.0) diamonds = 4
  else if (decimalOdds >= 2.0) diamonds = 3
  else diamonds = 2
  
  // 2x multiplier for live betting
  diamonds *= 2
  
  // Additional 3x for derby matches (total 6x for live derby)
  if (isDerby) diamonds *= 3
  
  return diamonds
}

async function updateCashOutValue(betId: string): Promise<void> {
  // This function will be called periodically to update cash-out values
  // Implementation would involve checking current match state and calculating new value
  try {
    const liveBet = await prisma.liveBet.findUnique({
      where: { id: betId },
      include: { match: true }
    })

    if (!liveBet || !liveBet.cashOutAvailable || liveBet.cashedOut) {
      return
    }

    // Calculate current cash-out value based on match progression
    const currentValue = calculateCurrentCashOutValue(liveBet)
    
    await prisma.liveBet.update({
      where: { id: betId },
      data: { 
        cashOutValue: currentValue,
        // Disable cash-out in final 10 minutes or if losing heavily
        cashOutAvailable: liveBet.match.minute ? liveBet.match.minute < 80 : true
      }
    })
  } catch (error) {
    console.error('Error updating cash-out value:', error)
  }
}

function calculateCurrentCashOutValue(liveBet: any): number {
  // Simplified cash-out calculation
  // In reality, this would consider current match state, odds movement, probability
  const timeFactor = liveBet.match.minute ? (90 - liveBet.match.minute) / 90 : 1
  const baseCashOut = liveBet.stake * 0.85 // 85% of stake as base
  
  return Math.round(baseCashOut * timeFactor)
}