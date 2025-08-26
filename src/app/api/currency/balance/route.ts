import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

// GET user's currency balances
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        betPoints: true,
        diamonds: true,
        level: true,
        xp: true,
        vipStatus: true,
        vipExpiresAt: true,
        emergencyGrantsUsed: true,
        lastAdWatch: true,
        totalBets: true,
        totalWins: true,
        totalStaked: true,
        totalWon: true,
        biggestWin: true,
        currentStreak: true,
        bestStreak: true
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Calculate next level XP requirement
    const nextLevelXp = calculateNextLevelXp(user.level)
    const xpProgress = (user.xp / nextLevelXp) * 100
    
    // Check if eligible for emergency grant
    const canUseEmergencyGrant = user.betPoints < 100 && user.emergencyGrantsUsed < 3
    
    // Check if can watch ad (once per hour)
    const canWatchAd = !user.lastAdWatch || 
      new Date().getTime() - new Date(user.lastAdWatch).getTime() > 3600000
    
    return NextResponse.json({
      success: true,
      balance: {
        betPoints: user.betPoints,
        diamonds: user.diamonds
      },
      progression: {
        level: user.level,
        xp: user.xp,
        nextLevelXp,
        xpProgress
      },
      vip: {
        status: user.vipStatus,
        expiresAt: user.vipExpiresAt,
        benefits: getVipBenefits(user.vipStatus)
      },
      stats: {
        totalBets: user.totalBets,
        totalWins: user.totalWins,
        totalStaked: user.totalStaked,
        totalWon: user.totalWon,
        profit: user.totalWon - user.totalStaked,
        biggestWin: user.biggestWin,
        currentStreak: user.currentStreak,
        bestStreak: user.bestStreak
      },
      options: {
        canUseEmergencyGrant,
        emergencyGrantsRemaining: 3 - user.emergencyGrantsUsed,
        canWatchAd,
        nextAdAvailable: user.lastAdWatch ? 
          new Date(new Date(user.lastAdWatch).getTime() + 3600000) : null
      }
    })
    
  } catch (error) {
    console.error('Get balance error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    )
  }
}

// POST - Add currency (rewards, bonuses, etc)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { type, amount, currency = 'BETPOINTS', reason } = await request.json()
    
    if (!type || !amount) {
      return NextResponse.json(
        { error: 'Type and amount required' },
        { status: 400 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        betPoints: true,
        diamonds: true,
        level: true,
        xp: true
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Process based on type
    let updateData: any = {}
    let transactionType = 'DAILY_BONUS'
    let description = reason || 'Currency added'
    
    switch (type) {
      case 'DAILY_BONUS':
        // Daily login bonus
        const lastBonus = await prisma.transaction.findFirst({
          where: {
            userId: user.id,
            type: 'DAILY_BONUS',
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        })
        
        if (lastBonus) {
          return NextResponse.json(
            { error: 'Daily bonus already claimed today' },
            { status: 400 }
          )
        }
        
        updateData.betPoints = { increment: 500 }
        updateData.xp = { increment: 50 }
        transactionType = 'DAILY_BONUS'
        description = 'Daily login bonus'
        break
        
      case 'LEVEL_UP':
        // Level up reward
        const levelReward = user.level * 1000
        const diamondReward = Math.floor(user.level / 5) * 5
        
        updateData.betPoints = { increment: levelReward }
        updateData.diamonds = { increment: diamondReward }
        updateData.level = { increment: 1 }
        updateData.xp = 0 // Reset XP
        transactionType = 'LEVEL_UP_BONUS'
        description = `Level ${user.level + 1} reward`
        break
        
      case 'ACHIEVEMENT':
        // Achievement reward
        updateData[currency === 'DIAMONDS' ? 'diamonds' : 'betPoints'] = { increment: amount }
        updateData.xp = { increment: Math.floor(amount / 10) }
        transactionType = 'ACHIEVEMENT_REWARD'
        description = reason || 'Achievement completed'
        break
        
      case 'CHALLENGE':
        // Challenge reward
        updateData[currency === 'DIAMONDS' ? 'diamonds' : 'betPoints'] = { increment: amount }
        updateData.xp = { increment: Math.floor(amount / 20) }
        transactionType = 'CHALLENGE_REWARD'
        description = reason || 'Challenge completed'
        break
        
      case 'PURCHASE':
        // In-app purchase (would integrate with payment provider)
        updateData[currency === 'DIAMONDS' ? 'diamonds' : 'betPoints'] = { increment: amount }
        transactionType = 'PURCHASE'
        description = reason || 'Purchase completed'
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid transaction type' },
          { status: 400 }
        )
    }
    
    // Execute transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: updateData
      })
      
      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: transactionType,
          amount: currency === 'DIAMONDS' ? amount : amount,
          currency,
          description,
          balanceBefore: currency === 'DIAMONDS' ? user.diamonds : user.betPoints,
          balanceAfter: currency === 'DIAMONDS' ? updatedUser.diamonds : updatedUser.betPoints
        }
      })
      
      // Check if leveled up
      if (updatedUser.xp >= calculateNextLevelXp(updatedUser.level)) {
        // Trigger level up
        await tx.user.update({
          where: { id: user.id },
          data: {
            level: { increment: 1 },
            xp: 0,
            betPoints: { increment: updatedUser.level * 1000 }
          }
        })
        
        // Create level up notification
        await tx.notification.create({
          data: {
            userId: user.id,
            type: 'LEVEL_UP',
            title: 'Level Up!',
            message: `Congratulations! You've reached level ${updatedUser.level + 1}`,
            data: JSON.stringify({
              newLevel: updatedUser.level + 1,
              rewards: {
                betPoints: updatedUser.level * 1000,
                diamonds: Math.floor(updatedUser.level / 5) * 5
              }
            })
          }
        })
      }
      
      return updatedUser
    })
    
    return NextResponse.json({
      success: true,
      balance: {
        betPoints: result.betPoints,
        diamonds: result.diamonds
      },
      progression: {
        level: result.level,
        xp: result.xp
      }
    })
    
  } catch (error) {
    console.error('Add currency error:', error)
    return NextResponse.json(
      { error: 'Failed to add currency' },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateNextLevelXp(level: number): number {
  // XP required increases with each level
  return 1000 + (level * 500)
}

function getVipBenefits(vipStatus: string) {
  const benefits: Record<string, any> = {
    FREE: {
      dailyBonus: 500,
      oddsBoost: 0,
      cashOutBoost: 0,
      exclusiveMatches: false,
      prioritySupport: false
    },
    VIP_MONTHLY: {
      dailyBonus: 1500,
      oddsBoost: 10, // 10% boost
      cashOutBoost: 5, // 5% better cash out
      exclusiveMatches: true,
      prioritySupport: true,
      monthlyDiamonds: 50
    },
    SEASON_PASS: {
      dailyBonus: 3000,
      oddsBoost: 20, // 20% boost
      cashOutBoost: 10, // 10% better cash out
      exclusiveMatches: true,
      prioritySupport: true,
      weeklyDiamonds: 25,
      exclusiveChallenges: true,
      doubleXp: true
    }
  }
  
  return benefits[vipStatus] || benefits.FREE
}