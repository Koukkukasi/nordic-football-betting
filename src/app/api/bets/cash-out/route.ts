import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

// Calculate cash out value for a bet
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { betId, action } = await request.json()
    
    if (!betId) {
      return NextResponse.json(
        { error: 'Bet ID required' },
        { status: 400 }
      )
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, vipStatus: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Get bet with selections
    const bet = await prisma.bet.findFirst({
      where: {
        id: betId,
        userId: user.id,
        status: 'PENDING'
      },
      include: {
        selections: {
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true,
                odds: true
              }
            }
          }
        }
      }
    })
    
    if (!bet) {
      return NextResponse.json(
        { error: 'Bet not found or already settled' },
        { status: 404 }
      )
    }
    
    // Calculate cash out value
    const cashOutData = calculateCashOutValue(bet, user.vipStatus)
    
    if (!cashOutData.available) {
      return NextResponse.json(
        { error: cashOutData.reason || 'Cash out not available' },
        { status: 400 }
      )
    }
    
    // If action is 'check', just return the value
    if (action === 'check') {
      return NextResponse.json({
        success: true,
        available: true,
        cashOutValue: cashOutData.value,
        stake: bet.stake,
        potentialWin: bet.potentialWin,
        profit: cashOutData.value - bet.stake,
        profitPercentage: ((cashOutData.value - bet.stake) / bet.stake) * 100
      })
    }
    
    // If action is 'confirm', process the cash out
    if (action === 'confirm') {
      // Process cash out transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update bet status
        const updatedBet = await tx.bet.update({
          where: { id: betId },
          data: {
            status: 'CASHED_OUT',
            winAmount: cashOutData.value,
            settledAt: new Date()
          }
        })
        
        // Credit user balance
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            betPoints: { increment: cashOutData.value }
          }
        })
        
        // Create transaction record
        await tx.transaction.create({
          data: {
            userId: user.id,
            type: 'CASH_OUT',
            amount: cashOutData.value,
            currency: 'BETPOINTS',
            description: `Cash out for bet ${betId}`,
            reference: betId,
            balanceBefore: updatedUser.betPoints - cashOutData.value,
            balanceAfter: updatedUser.betPoints
          }
        })
        
        // Update user stats
        await tx.userStats.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            totalCashOuts: 1,
            totalCashOutAmount: cashOutData.value
          },
          update: {
            totalCashOuts: { increment: 1 },
            totalCashOutAmount: { increment: cashOutData.value }
          }
        })
        
        // Check for cash out achievement
        await checkCashOutAchievements(tx, user.id, cashOutData.value, bet.stake)
        
        return {
          bet: updatedBet,
          newBalance: updatedUser.betPoints
        }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Cash out successful',
        cashOutValue: cashOutData.value,
        newBalance: result.newBalance,
        profit: cashOutData.value - bet.stake
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action. Use "check" or "confirm"' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Cash out error:', error)
    return NextResponse.json(
      { error: 'Failed to process cash out' },
      { status: 500 }
    )
  }
}

// GET cash out availability for all user's bets
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, vipStatus: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Get all pending bets
    const bets = await prisma.bet.findMany({
      where: {
        userId: user.id,
        status: 'PENDING'
      },
      include: {
        selections: {
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true,
                odds: true
              }
            }
          }
        }
      }
    })
    
    // Calculate cash out values for each bet
    const cashOutOptions = bets.map(bet => {
      const cashOutData = calculateCashOutValue(bet, user.vipStatus)
      
      return {
        betId: bet.id,
        stake: bet.stake,
        potentialWin: bet.potentialWin,
        available: cashOutData.available,
        cashOutValue: cashOutData.value,
        profit: cashOutData.available ? cashOutData.value - bet.stake : 0,
        reason: cashOutData.reason,
        selections: bet.selections.map(sel => ({
          match: `${sel.match.homeTeam.name} vs ${sel.match.awayTeam.name}`,
          selection: sel.selection,
          status: sel.match.status,
          score: sel.match.status === 'LIVE' || sel.match.status === 'FINISHED' ? 
            `${sel.match.homeScore}-${sel.match.awayScore}` : null
        }))
      }
    }).filter(option => option.available) // Only return available cash outs
    
    return NextResponse.json({
      success: true,
      cashOutOptions,
      totalAvailable: cashOutOptions.length,
      totalValue: cashOutOptions.reduce((sum, opt) => sum + opt.cashOutValue, 0)
    })
    
  } catch (error) {
    console.error('Get cash out options error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cash out options' },
      { status: 500 }
    )
  }
}

// Calculate cash out value based on current match situation
function calculateCashOutValue(bet: any, vipStatus: string) {
  // Check if any selection has already lost
  for (const selection of bet.selections) {
    if (selection.result === 'LOST') {
      return {
        available: false,
        value: 0,
        reason: 'Bet has already lost'
      }
    }
  }
  
  // Check if all selections have won
  const allWon = bet.selections.every((sel: any) => sel.result === 'WON')
  if (allWon) {
    return {
      available: false,
      value: 0,
      reason: 'Bet has already won - awaiting settlement'
    }
  }
  
  // Calculate probability based on current match situations
  let totalProbability = 1
  let hasLiveMatch = false
  
  for (const selection of bet.selections) {
    const match = selection.match
    
    if (match.status === 'FINISHED') {
      // Check result
      if (selection.result === 'WON') {
        continue // Already won, probability = 1
      } else {
        return {
          available: false,
          value: 0,
          reason: 'Selection has lost'
        }
      }
    } else if (match.status === 'LIVE') {
      hasLiveMatch = true
      const probability = calculateSelectionProbability(selection, match)
      totalProbability *= probability
    } else if (match.status === 'SCHEDULED') {
      // For scheduled matches, use original odds to estimate probability
      const impliedProbability = 1 / (selection.odds || 2)
      totalProbability *= impliedProbability
    }
  }
  
  // Cash out only available if at least one match is live
  if (!hasLiveMatch && bet.betType !== 'PITKAVETO') {
    return {
      available: false,
      value: 0,
      reason: 'Cash out available only for live matches'
    }
  }
  
  // Calculate base cash out value
  const potentialWin = bet.potentialWin
  let cashOutValue = bet.stake + (potentialWin - bet.stake) * totalProbability
  
  // Apply margin (house keeps 5-10%)
  const margin = vipStatus === 'SEASON_PASS' ? 0.95 : 
                 vipStatus === 'VIP_MONTHLY' ? 0.92 : 0.90
  cashOutValue *= margin
  
  // Round to nearest integer
  cashOutValue = Math.round(cashOutValue)
  
  // Don't offer cash out if value is too low
  if (cashOutValue < bet.stake * 0.3) {
    return {
      available: false,
      value: 0,
      reason: 'Cash out value too low'
    }
  }
  
  return {
    available: true,
    value: cashOutValue,
    probability: totalProbability
  }
}

// Calculate probability of selection winning based on current match state
function calculateSelectionProbability(selection: any, match: any) {
  const minute = match.minute || 0
  const minutesRemaining = Math.max(0, 90 - minute)
  const homeScore = match.homeScore || 0
  const awayScore = match.awayScore || 0
  const scoreDiff = homeScore - awayScore
  
  // Time factor (probability changes less as match progresses)
  const timeFactor = minutesRemaining / 90
  
  // Calculate based on selection type and current score
  if (selection.market === 'MATCH_RESULT') {
    if (selection.selection === 'HOME') {
      if (scoreDiff > 0) {
        // Home winning
        return 0.85 - (timeFactor * 0.2) + (scoreDiff * 0.05)
      } else if (scoreDiff === 0) {
        // Draw
        return 0.35 + (timeFactor * 0.15)
      } else {
        // Home losing
        return 0.15 + (timeFactor * 0.25) - (Math.abs(scoreDiff) * 0.05)
      }
    } else if (selection.selection === 'AWAY') {
      if (scoreDiff < 0) {
        // Away winning
        return 0.85 - (timeFactor * 0.2) + (Math.abs(scoreDiff) * 0.05)
      } else if (scoreDiff === 0) {
        // Draw
        return 0.35 + (timeFactor * 0.15)
      } else {
        // Away losing
        return 0.15 + (timeFactor * 0.25) - (scoreDiff * 0.05)
      }
    } else if (selection.selection === 'DRAW') {
      if (scoreDiff === 0) {
        // Currently draw
        return 0.65 - (timeFactor * 0.3)
      } else if (Math.abs(scoreDiff) === 1) {
        // One goal difference
        return 0.25 + (timeFactor * 0.2)
      } else {
        // Multiple goals difference
        return 0.1 + (timeFactor * 0.15) - (Math.abs(scoreDiff) * 0.03)
      }
    }
  } else if (selection.market === 'OVER_UNDER') {
    const totalGoals = homeScore + awayScore
    const goalsPerMinute = minute > 0 ? totalGoals / minute : 0
    const projectedGoals = goalsPerMinute * 90
    
    if (selection.selection === 'OVER') {
      if (totalGoals > 2.5) return 1 // Already won
      return Math.min(0.95, projectedGoals / 3)
    } else {
      if (minute >= 90 && totalGoals <= 2.5) return 1 // Already won
      return Math.max(0.05, 1 - (projectedGoals / 3))
    }
  } else if (selection.market === 'BTTS') {
    const homeScoredBTTS = homeScore > 0
    const awayScoredBTTS = awayScore > 0
    
    if (selection.selection === 'YES') {
      if (homeScoredBTTS && awayScoredBTTS) return 1 // Already won
      if (!homeScoredBTTS && !awayScoredBTTS) return 0.3 + (timeFactor * 0.4)
      return 0.5 + (timeFactor * 0.2) // One team scored
    } else {
      if (minute >= 90 && !(homeScoredBTTS && awayScoredBTTS)) return 1
      if (homeScoredBTTS && awayScoredBTTS) return 0 // Already lost
      if (!homeScoredBTTS && !awayScoredBTTS) return 0.7 - (timeFactor * 0.4)
      return 0.5 - (timeFactor * 0.2) // One team scored
    }
  }
  
  // Default probability
  return 0.5
}

// Check and award cash out related achievements
async function checkCashOutAchievements(tx: any, userId: string, cashOutValue: number, stake: number) {
  try {
    // First cash out achievement
    const cashOutCount = await tx.bet.count({
      where: {
        userId,
        status: 'CASHED_OUT'
      }
    })
    
    if (cashOutCount === 1) {
      const achievement = await tx.achievement.findFirst({
        where: { name: 'Smart Exit' }
      })
      
      if (achievement) {
        const existing = await tx.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id
            }
          }
        })
        
        if (!existing) {
          await tx.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
              completed: true,
              completedAt: new Date()
            }
          })
        }
      }
    }
    
    // Profit cash out achievement (cash out with profit)
    if (cashOutValue > stake * 1.5) {
      const achievement = await tx.achievement.findFirst({
        where: { name: 'Profit Taker' }
      })
      
      if (achievement) {
        const existing = await tx.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id
            }
          }
        })
        
        if (!existing) {
          await tx.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
              completed: true,
              completedAt: new Date()
            }
          })
        }
      }
    }
  } catch (error) {
    console.error('Achievement check error:', error)
  }
}