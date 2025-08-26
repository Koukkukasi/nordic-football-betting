import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/live-betting/cash-out - Calculate current cash-out value for a live bet
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const betId = searchParams.get('betId')
    const userId = searchParams.get('userId')
    
    if (!betId) {
      return NextResponse.json(
        { success: false, error: 'betId required' },
        { status: 400 }
      )
    }

    // Get the live bet with match and user details
    const liveBet = await prisma.liveBet.findUnique({
      where: { id: betId },
      include: {
        user: true,
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
            odds: {
              where: { market: 'MATCH_RESULT' }
            }
          }
        }
      }
    })

    if (!liveBet) {
      return NextResponse.json(
        { success: false, error: 'Live bet not found' },
        { status: 404 }
      )
    }

    // Check if user owns the bet
    if (userId && liveBet.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if bet is eligible for cash-out
    const eligibility = checkCashOutEligibility(liveBet)
    if (!eligibility.eligible) {
      return NextResponse.json({
        success: false,
        error: eligibility.reason,
        eligible: false,
        liveBet: {
          id: liveBet.id,
          status: liveBet.status,
          stake: liveBet.stake,
          potentialWin: liveBet.potentialWin
        }
      })
    }

    // Calculate current cash-out value
    const cashOutCalculation = await calculateCashOutValue(liveBet)

    return NextResponse.json({
      success: true,
      eligible: true,
      liveBet: {
        id: liveBet.id,
        market: liveBet.market,
        selection: liveBet.selection,
        originalOdds: liveBet.odds,
        stake: liveBet.stake,
        potentialWin: liveBet.potentialWin,
        placedAtMinute: liveBet.placedAtMinute,
        matchScore: (liveBet as any).matchScore || null
      },
      cashOut: cashOutCalculation,
      match: {
        id: liveBet.match.id,
        homeTeam: liveBet.match.homeTeam.name,
        awayTeam: liveBet.match.awayTeam.name,
        minute: liveBet.match.minute,
        homeScore: liveBet.match.homeScore,
        awayScore: liveBet.match.awayScore,
        status: liveBet.match.status
      },
      lastCalculated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error calculating cash-out value:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to calculate cash-out value' },
      { status: 500 }
    )
  }
}

// POST /api/live-betting/cash-out - Execute cash-out for a live bet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { betId, userId, confirmValue } = body

    if (!betId || !userId) {
      return NextResponse.json(
        { success: false, error: 'betId and userId required' },
        { status: 400 }
      )
    }

    // Get the live bet with all details
    const liveBet = await prisma.liveBet.findUnique({
      where: { id: betId },
      include: {
        user: true,
        match: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }
      }
    })

    if (!liveBet) {
      return NextResponse.json(
        { success: false, error: 'Live bet not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (liveBet.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check eligibility again
    const eligibility = checkCashOutEligibility(liveBet)
    if (!eligibility.eligible) {
      return NextResponse.json(
        { success: false, error: eligibility.reason },
        { status: 400 }
      )
    }

    // Calculate final cash-out value
    const cashOutCalculation = await calculateCashOutValue(liveBet)

    // Optional: Verify with user's confirmed value (within 5% tolerance)
    if (confirmValue && Math.abs(cashOutCalculation.value - confirmValue) > confirmValue * 0.05) {
      return NextResponse.json(
        { success: false, error: 'Cash-out value has changed, please confirm new amount' },
        { status: 409 }
      )
    }

    // Execute the cash-out in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the bet status
      const updatedBet = await tx.liveBet.update({
        where: { id: betId },
        data: {
          status: 'CASHED_OUT',
          cashedOut: true,
          settledAt: new Date(),
          winAmount: cashOutCalculation.value
        }
      })

      // Update user balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          betPoints: liveBet.user.betPoints + cashOutCalculation.value
        }
      })

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: 'CASH_OUT',
          amount: cashOutCalculation.value,
          currency: 'BETPOINTS',
          description: `Cash-out: ${liveBet.match.homeTeam.name} vs ${liveBet.match.awayTeam.name}`,
          reference: betId,
          balanceBefore: liveBet.user.betPoints,
          balanceAfter: liveBet.user.betPoints + cashOutCalculation.value
        }
      })

      // Create notification
      const notification = await tx.notification.create({
        data: {
          userId,
          type: 'BET_SETTLED',
          title: 'Bet Cashed Out Successfully! 💰',
          message: `You cashed out for ${cashOutCalculation.value} BP (${cashOutCalculation.profitLoss >= 0 ? 'profit' : 'loss'}: ${Math.abs(cashOutCalculation.profitLoss)} BP)`,
          data: {
            betId,
            cashOutValue: cashOutCalculation.value,
            originalStake: liveBet.stake,
            profitLoss: cashOutCalculation.profitLoss
          }
        }
      })

      return {
        bet: updatedBet,
        user: updatedUser,
        transaction,
        notification
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Cash-out executed successfully',
      cashOut: {
        value: cashOutCalculation.value,
        profitLoss: cashOutCalculation.profitLoss,
        profitPercentage: cashOutCalculation.profitPercentage,
        originalStake: liveBet.stake,
        executedAt: new Date().toISOString()
      },
      newBalance: result.user.betPoints,
      transactionId: result.transaction.id
    })

  } catch (error) {
    console.error('Error executing cash-out:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to execute cash-out' },
      { status: 500 }
    )
  }
}

// Check if a live bet is eligible for cash-out
function checkCashOutEligibility(liveBet: any) {
  // Check bet status
  if (liveBet.status !== 'PENDING') {
    return {
      eligible: false,
      reason: 'Bet is already settled or cashed out'
    }
  }

  // Check if already cashed out
  if (liveBet.cashedOut) {
    return {
      eligible: false,
      reason: 'Bet has already been cashed out'
    }
  }

  // Check match status
  if (liveBet.match.status !== 'LIVE') {
    return {
      eligible: false,
      reason: 'Match is not currently live'
    }
  }

  // Check time restrictions
  const currentMinute = liveBet.match.minute || 0
  if (currentMinute < 5) {
    return {
      eligible: false,
      reason: 'Cash-out not available in first 5 minutes'
    }
  }

  if (currentMinute >= 75) {
    return {
      eligible: false,
      reason: 'Cash-out not available after 75th minute'
    }
  }

  // Check if bet has been running for at least 2 minutes
  const betRunningTime = currentMinute - liveBet.placedAtMinute
  if (betRunningTime < 2) {
    return {
      eligible: false,
      reason: 'Cash-out available 2 minutes after bet placement'
    }
  }

  return {
    eligible: true,
    reason: null
  }
}

// Calculate current cash-out value based on match state and time
async function calculateCashOutValue(liveBet: any) {
  const match = liveBet.match
  const currentMinute = match.minute || 0
  const homeScore = match.homeScore || 0
  const awayScore = match.awayScore || 0
  
  // Get current live odds for comparison
  const currentOdds = await getCurrentLiveOdds(liveBet.market, liveBet.selection, match)
  
  // Calculate probability shift
  const originalOdds = liveBet.enhancedOdds || liveBet.odds
  const probabilityShift = calculateProbabilityShift(originalOdds, currentOdds, liveBet.market, liveBet.selection, match)
  
  // Base cash-out calculation
  let cashOutValue = liveBet.stake * probabilityShift
  
  // Apply cash-out margin (house edge) - 15% for live bets
  const margin = 0.15
  cashOutValue = cashOutValue * (1 - margin)
  
  // Time decay factor (bet becomes less valuable over time)
  const timeDecay = calculateTimeDecay(liveBet.placedAtMinute, currentMinute)
  cashOutValue = cashOutValue * timeDecay
  
  // Market-specific adjustments
  cashOutValue = applyMarketAdjustments(cashOutValue, liveBet, match)
  
  // Ensure minimum cash-out value (never less than 10% of stake)
  const minCashOut = liveBet.stake * 0.1
  cashOutValue = Math.max(minCashOut, cashOutValue)
  
  // Round to nearest integer
  cashOutValue = Math.round(cashOutValue)
  
  // Calculate profit/loss
  const profitLoss = cashOutValue - liveBet.stake
  const profitPercentage = (profitLoss / liveBet.stake) * 100
  
  return {
    value: cashOutValue,
    profitLoss: profitLoss,
    profitPercentage: Math.round(profitPercentage * 100) / 100,
    factors: {
      originalOdds: liveBet.odds,
      currentOdds: currentOdds,
      probabilityShift: Math.round(probabilityShift * 100) / 100,
      timeDecay: Math.round(timeDecay * 100) / 100,
      margin: margin,
      betRunningTime: currentMinute - liveBet.placedAtMinute
    }
  }
}

// Get current live odds for the bet's market and selection
async function getCurrentLiveOdds(market: string, selection: string, match: any): Promise<number> {
  const minute = match.minute || 0
  const homeScore = match.homeScore || 0
  const awayScore = match.awayScore || 0
  const scoreDiff = homeScore - awayScore
  
  switch (market) {
    case 'match_result':
      return calculateCurrentMatchResultOdds(selection, scoreDiff, minute)
    
    case 'total_goals':
      return calculateCurrentTotalGoalsOdds(selection, homeScore + awayScore, minute)
    
    case 'next_goal':
      return calculateCurrentNextGoalOdds(selection, scoreDiff, minute)
    
    case 'btts':
      return calculateCurrentBTTSOdds(selection, homeScore, awayScore, minute)
    
    default:
      return 200 // Default fallback odds
  }
}

// Calculate current match result odds
function calculateCurrentMatchResultOdds(selection: string, scoreDiff: number, minute: number): number {
  const timeRemaining = Math.max(0, 90 - minute)
  
  switch (selection) {
    case 'HOME':
      if (scoreDiff > 0) {
        // Home is winning
        return Math.max(110, 200 - (scoreDiff * 40) - (timeRemaining * 2))
      } else if (scoreDiff < 0) {
        // Home is losing
        return Math.min(1000, 400 + (Math.abs(scoreDiff) * 80) + (timeRemaining * 5))
      } else {
        // Draw
        return 280 - (timeRemaining * 2)
      }
      
    case 'AWAY':
      if (scoreDiff < 0) {
        // Away is winning
        return Math.max(110, 250 + (scoreDiff * 40) - (timeRemaining * 2))
      } else if (scoreDiff > 0) {
        // Away is losing
        return Math.min(1000, 500 + (scoreDiff * 80) + (timeRemaining * 5))
      } else {
        // Draw
        return 320 - (timeRemaining * 2)
      }
      
    case 'DRAW':
      if (scoreDiff === 0) {
        return minute > 80 ? Math.max(250, 400 - (90 - minute) * 10) : 350
      } else {
        return Math.min(800, 400 + (Math.abs(scoreDiff) * 60))
      }
      
    default:
      return 300
  }
}

// Calculate current total goals odds
function calculateCurrentTotalGoalsOdds(selection: string, currentGoals: number, minute: number): number {
  const timeRemaining = Math.max(0, 90 - minute)
  
  if (selection.includes('over')) {
    const threshold = parseFloat(selection.split('_')[1]) + 0.5
    if (currentGoals > threshold) return 100 // Already won
    
    const goalsNeeded = threshold - currentGoals
    return Math.max(110, 200 + (goalsNeeded * 80) + ((90 - timeRemaining) * 3))
  } else {
    const threshold = parseFloat(selection.split('_')[1]) + 0.5
    if (currentGoals <= threshold) {
      return minute > 85 ? 110 : Math.max(110, 180 - (timeRemaining * 2))
    }
    return 1000 // Already lost
  }
}

// Calculate current next goal odds
function calculateCurrentNextGoalOdds(selection: string, scoreDiff: number, minute: number): number {
  let baseOdds = 300
  
  if (selection === 'HOME') {
    if (scoreDiff < 0) baseOdds -= 80 // Trailing team more likely
    if (scoreDiff > 0) baseOdds += 60 // Leading team less likely
  } else if (selection === 'AWAY') {
    if (scoreDiff > 0) baseOdds -= 80
    if (scoreDiff < 0) baseOdds += 60
  } else { // NONE
    baseOdds = 400
    if (minute > 80) baseOdds -= 100
  }
  
  if (minute > 75) baseOdds += 100
  
  return Math.max(150, baseOdds)
}

// Calculate current BTTS odds
function calculateCurrentBTTSOdds(selection: string, homeScore: number, awayScore: number, minute: number): number {
  const bothScored = homeScore > 0 && awayScore > 0
  
  if (selection === 'YES') {
    if (bothScored) return 100
    const timeRemaining = Math.max(0, 90 - minute)
    return Math.max(120, 200 + (90 - timeRemaining) * 4)
  } else {
    if (bothScored) return 1000
    return minute > 80 ? 110 : 180
  }
}

// Calculate probability shift based on odds movement
function calculateProbabilityShift(originalOdds: number, currentOdds: number, market: string, selection: string, match: any): number {
  // Convert odds to implied probabilities
  const originalProb = 100 / originalOdds
  const currentProb = 100 / currentOdds
  
  // Calculate the ratio of probability change
  const probabilityRatio = currentProb / originalProb
  
  // For cash-out, we're essentially buying back the bet at current probability
  // If probability increased (odds decreased), cash-out value goes up
  // If probability decreased (odds increased), cash-out value goes down
  
  return Math.max(0.1, Math.min(2.0, probabilityRatio))
}

// Calculate time decay factor
function calculateTimeDecay(placedAtMinute: number, currentMinute: number): number {
  const betDuration = currentMinute - placedAtMinute
  
  // Gentle time decay - bet value decreases slightly over time due to uncertainty
  // But not too harsh for live betting
  const decayRate = 0.005 // 0.5% per minute
  const timeDecay = Math.max(0.7, 1 - (betDuration * decayRate))
  
  return timeDecay
}

// Apply market-specific adjustments
function applyMarketAdjustments(cashOutValue: number, liveBet: any, match: any): number {
  let adjustedValue = cashOutValue
  
  // Market-specific factors
  switch (liveBet.market) {
    case 'match_result':
      // More stable market, less adjustment needed
      break
      
    case 'next_goal':
      // Volatile market, slightly lower cash-out values
      adjustedValue *= 0.95
      break
      
    case 'total_goals':
      // Depends on current score vs threshold
      const currentGoals = (match.homeScore || 0) + (match.awayScore || 0)
      if (currentGoals > 2) adjustedValue *= 1.05 // High-scoring game
      break
      
    case 'btts':
      // Early or late in match affects value
      if (match.minute > 70) adjustedValue *= 0.9
      break
  }
  
  // Derby matches are more unpredictable
  if (match.isDerby) {
    adjustedValue *= 0.95
  }
  
  return adjustedValue
}

// Helper function to get cash-out values for all user's active live bets
async function getAllCashOutValues(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId required' },
        { status: 400 }
      )
    }

    // Get all active live bets for user
    const liveBets = await prisma.liveBet.findMany({
      where: {
        userId,
        status: 'PENDING',
        cashedOut: false
      },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }
      }
    })

    const cashOutValues = []
    
    for (const bet of liveBets) {
      const eligibility = checkCashOutEligibility(bet)
      
      if (eligibility.eligible) {
        const cashOutCalc = await calculateCashOutValue(bet)
        cashOutValues.push({
          betId: bet.id,
          market: bet.market,
          selection: bet.selection,
          stake: bet.stake,
          potentialWin: bet.potentialWin,
          cashOut: cashOutCalc,
          match: {
            id: bet.match.id,
            homeTeam: bet.match.homeTeam.name,
            awayTeam: bet.match.awayTeam.name,
            minute: bet.match.minute,
            homeScore: bet.match.homeScore,
            awayScore: bet.match.awayScore
          }
        })
      } else {
        cashOutValues.push({
          betId: bet.id,
          market: bet.market,
          selection: bet.selection,
          stake: bet.stake,
          potentialWin: bet.potentialWin,
          cashOut: { eligible: false, reason: eligibility.reason },
          match: {
            id: bet.match.id,
            homeTeam: bet.match.homeTeam.name,
            awayTeam: bet.match.awayTeam.name,
            minute: bet.match.minute,
            homeScore: bet.match.homeScore,
            awayScore: bet.match.awayScore
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      cashOutValues,
      count: cashOutValues.length,
      lastCalculated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error getting all cash-out values:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get cash-out values' },
      { status: 500 }
    )
  }
}