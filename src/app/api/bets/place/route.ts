import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for bet placement
const placeBetSchema = z.object({
  betType: z.enum(['SINGLE', 'PITKAVETO', 'LIVE']),
  stake: z.number().min(10).max(100000),
  useDiamondBoost: z.boolean().optional(),
  selections: z.array(z.object({
    matchId: z.string(),
    market: z.string(),
    selection: z.string(), // HOME, DRAW, AWAY, OVER, UNDER, YES, NO
    odds: z.number().min(100).max(10000),
    useEnhancedOdds: z.boolean().optional()
  })).min(1).max(20)
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Get user with balance
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        betPoints: true,
        diamonds: true,
        vipStatus: true,
        level: true
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Parse and validate request
    const body = await request.json()
    const validatedData = placeBetSchema.parse(body)
    
    // Check balance
    if (user.betPoints < validatedData.stake) {
      return NextResponse.json(
        { error: 'Insufficient BetPoints', required: validatedData.stake, available: user.betPoints },
        { status: 400 }
      )
    }
    
    // Check diamond boost
    let diamondBoostMultiplier = 1
    let diamondsUsed = 0
    
    if (validatedData.useDiamondBoost) {
      const diamondCost = Math.ceil(validatedData.stake / 1000) // 1 diamond per 1000 BetPoints
      
      if (user.diamonds < diamondCost) {
        return NextResponse.json(
          { error: 'Insufficient diamonds for boost', required: diamondCost, available: user.diamonds },
          { status: 400 }
        )
      }
      
      diamondsUsed = diamondCost
      diamondBoostMultiplier = 1.15 // 15% odds boost
    }
    
    // Validate matches and odds
    const matchIds = validatedData.selections.map(s => s.matchId)
    const matches = await prisma.match.findMany({
      where: { id: { in: matchIds } },
      include: {
        odds: true,
        homeTeam: true,
        awayTeam: true
      }
    })
    
    if (matches.length !== matchIds.length) {
      return NextResponse.json(
        { error: 'Invalid match selection' },
        { status: 400 }
      )
    }
    
    // Check if matches are valid for betting
    for (const match of matches) {
      if (validatedData.betType !== 'LIVE' && match.status !== 'SCHEDULED') {
        return NextResponse.json(
          { error: `Match ${match.homeTeam.name} vs ${match.awayTeam.name} is not available for pre-match betting` },
          { status: 400 }
        )
      }
      
      if (validatedData.betType === 'LIVE' && match.status !== 'LIVE') {
        return NextResponse.json(
          { error: `Match ${match.homeTeam.name} vs ${match.awayTeam.name} is not live` },
          { status: 400 }
        )
      }
    }
    
    // Calculate total odds
    let totalOdds = 1
    const processedSelections = []
    
    for (const selection of validatedData.selections) {
      const match = matches.find(m => m.id === selection.matchId)
      const matchOdds = match?.odds.find(o => o.market === 'MATCH_RESULT')
      
      if (!matchOdds) {
        return NextResponse.json(
          { error: `Odds not available for match ${selection.matchId}` },
          { status: 400 }
        )
      }
      
      // Get the actual odds value
      let oddsValue = selection.odds / 100 // Convert from integer to decimal
      
      // Apply enhanced odds if eligible
      if (selection.useEnhancedOdds && user.vipStatus !== 'FREE') {
        oddsValue *= 1.5 // 50% boost for enhanced odds
      }
      
      // Apply diamond boost
      oddsValue *= diamondBoostMultiplier
      
      totalOdds *= oddsValue
      
      processedSelections.push({
        ...selection,
        finalOdds: oddsValue
      })
    }
    
    // Calculate potential win
    const potentialWin = Math.round(validatedData.stake * totalOdds)
    
    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create bet
      const bet = await tx.bet.create({
        data: {
          userId: user.id,
          betType: validatedData.betType,
          stake: validatedData.stake,
          totalOdds,
          potentialWin,
          diamondBoost: validatedData.useDiamondBoost || false,
          diamondsUsed,
          status: 'PENDING'
        }
      })
      
      // Create selections
      for (const selection of processedSelections) {
        await tx.betSelection.create({
          data: {
            betId: bet.id,
            matchId: selection.matchId,
            market: selection.market,
            selection: selection.selection,
            odds: selection.finalOdds
          }
        })
      }
      
      // Deduct stake and diamonds
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          betPoints: { decrement: validatedData.stake },
          diamonds: { decrement: diamondsUsed },
          totalBets: { increment: 1 },
          totalStaked: { increment: validatedData.stake }
        }
      })
      
      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'BET_PLACED',
          amount: -validatedData.stake,
          currency: 'BETPOINTS',
          description: `Placed ${validatedData.betType} bet`,
          reference: bet.id,
          balanceBefore: user.betPoints,
          balanceAfter: updatedUser.betPoints
        }
      })
      
      // If diamonds were used, create diamond transaction
      if (diamondsUsed > 0) {
        await tx.transaction.create({
          data: {
            userId: user.id,
            type: 'BET_PLACED',
            amount: -diamondsUsed,
            currency: 'DIAMONDS',
            description: 'Diamond boost activated',
            reference: bet.id,
            balanceBefore: user.diamonds,
            balanceAfter: updatedUser.diamonds
          }
        })
      }
      
      // Check for achievements
      await checkBettingAchievements(tx, user.id, bet)
      
      return {
        bet,
        newBalance: updatedUser.betPoints,
        newDiamonds: updatedUser.diamonds
      }
    })
    
    return NextResponse.json({
      success: true,
      bet: {
        id: result.bet.id,
        stake: result.bet.stake,
        totalOdds: result.bet.totalOdds,
        potentialWin: result.bet.potentialWin,
        diamondBoost: result.bet.diamondBoost
      },
      balance: {
        betPoints: result.newBalance,
        diamonds: result.newDiamonds
      }
    })
    
  } catch (error) {
    console.error('Place bet error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid bet data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to place bet' },
      { status: 500 }
    )
  }
}

// Check and award betting achievements
async function checkBettingAchievements(tx: any, userId: string, bet: any) {
  try {
    // Get user stats
    const stats = await tx.userStats.findUnique({
      where: { userId }
    })
    
    if (!stats) {
      // Create stats if not exists
      await tx.userStats.create({
        data: { userId }
      })
    }
    
    // Check for first bet achievement
    const userBetCount = await tx.bet.count({
      where: { userId }
    })
    
    if (userBetCount === 1) {
      // Award first bet achievement
      const achievement = await tx.achievement.findFirst({
        where: { name: 'First Bet' }
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
          
          // Award achievement rewards
          const rewards = achievement.reward as any
          if (rewards?.betPoints) {
            await tx.user.update({
              where: { id: userId },
              data: {
                betPoints: { increment: rewards.betPoints },
                xp: { increment: rewards.xp || 0 }
              }
            })
          }
        }
      }
    }
    
    // Check for high roller achievement (bet over 5000)
    if (bet.stake >= 5000) {
      const achievement = await tx.achievement.findFirst({
        where: { name: 'High Roller' }
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
    
    // Check for accumulator achievement (5+ selections)
    const selectionCount = await tx.betSelection.count({
      where: { betId: bet.id }
    })
    
    if (selectionCount >= 5) {
      const achievement = await tx.achievement.findFirst({
        where: { name: 'Accumulator Master' }
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
    // Don't fail the bet if achievement check fails
  }
}