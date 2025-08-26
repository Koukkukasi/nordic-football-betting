import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { triggerEmergencyIntervention, assessEconomyHealth } from '@/lib/monetization-manager'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { reason } = await request.json()

    // Validate reason
    const validReasons = ['critical_balance', 'retention_risk', 'first_time_help']
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 })
    }

    // Get user with all relevant data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        bets: {
          take: 100,
          orderBy: { createdAt: 'desc' }
        },
        transactions: {
          where: { type: 'EMERGENCY_GRANT' as any },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build user profile for assessment
    const userProfile = {
      userId: user.id,
      betPoints: user.betPoints,
      diamonds: user.diamonds,
      level: user.level,
      vipTier: (user as any).vipStatus || null,
      vipExpiresAt: (user as any).vipExpiresAt || null,
      totalBets: (user as any).totalBets || 0,
      totalWins: (user as any).totalWins || 0,
      winRate: ((user as any).totalBets || 0) > 0 ? ((user as any).totalWins || 0) / ((user as any).totalBets || 1) : 0,
      avgStakeSize: calculateAvgStakeSize(user.bets),
      daysActive: calculateDaysActive(user.createdAt),
      loginStreak: user.currentStreak,
      lastLogin: user.lastLoginAt || user.createdAt,
      totalPurchases: 0, // TODO: Calculate from Stripe data
      lifetimeValue: 0,
      adWatchesToday: await getAdWatchesToday(user.id),
      emergencyGrantsUsed: 0, // Fixed default
      lastEmergencyGrant: getLastEmergencyGrant(user.transactions),
      challengesCompleted: await getChallengesCompleted(user.id),
      achievementsUnlocked: await getAchievementsCount(user.id),
      socialShares: 0,
      sessionLengthAvg: 30 // Default estimate
    }

    // Assess if emergency intervention is appropriate
    const intervention = triggerEmergencyIntervention(userProfile, reason)

    if (!intervention) {
      return NextResponse.json({
        granted: false,
        reason: 'Emergency grant not available',
        nextAvailable: getNextAvailableTime(userProfile)
      })
    }

    // Apply emergency grant
    const result = await prisma.$transaction(async (tx) => {
      // Update user balances
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          betPoints: {
            increment: intervention.amount.betPoints
          },
          diamonds: {
            increment: intervention.amount.diamonds
          }
        }
      })

      // Create transaction records
      if (intervention.amount.betPoints > 0) {
        await tx.transaction.create({
          data: {
            userId: user.id,
            type: 'EMERGENCY_GRANT' as any,
            amount: intervention.amount.betPoints,
            currency: 'BETPOINTS',
            description: intervention.reason,
            reference: reason,
            balanceBefore: user.betPoints,
            balanceAfter: updatedUser.betPoints
          }
        })
      }

      if (intervention.amount.diamonds > 0) {
        await tx.transaction.create({
          data: {
            userId: user.id,
            type: 'EMERGENCY_GRANT' as any,
            amount: intervention.amount.diamonds,
            currency: 'DIAMONDS',
            description: intervention.reason,
            reference: reason,
            balanceBefore: user.diamonds,
            balanceAfter: updatedUser.diamonds
          }
        })
      }

      // Create notification
      await tx.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM',
          title: 'Emergency Grant Received!',
          message: `We've added ${intervention.amount.betPoints} BP${intervention.amount.diamonds > 0 ? ` and ${intervention.amount.diamonds} diamonds` : ''} to help you continue playing.`,
          data: {
            grantType: reason,
            amount: intervention.amount
          }
        }
      })

      return updatedUser
    })

    return NextResponse.json({
      granted: true,
      reason: intervention.reason,
      amount: intervention.amount,
      newBalance: {
        betPoints: result.betPoints,
        diamonds: result.diamonds
      },
      grantsRemaining: 3, // Fixed grants remaining
      message: getGrantMessage(reason, intervention.amount)
    })

  } catch (error) {
    console.error('Emergency grant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        transactions: {
          where: { type: 'EMERGENCY_GRANT' as any },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const lastEmergencyGrant = getLastEmergencyGrant(user.transactions)
    const userProfile = {
      userId: user.id,
      betPoints: user.betPoints,
      diamonds: user.diamonds,
      level: user.level,
      vipTier: (user as any).vipStatus || null,
      vipExpiresAt: (user as any).vipExpiresAt || null,
      totalBets: (user as any).totalBets || 0,
      totalWins: (user as any).totalWins || 0,
      winRate: ((user as any).totalBets || 0) > 0 ? ((user as any).totalWins || 0) / ((user as any).totalBets || 1) : 0,
      avgStakeSize: 100, // Default
      daysActive: calculateDaysActive(user.createdAt),
      loginStreak: user.currentStreak,
      lastLogin: user.lastLoginAt || user.createdAt,
      totalPurchases: 0,
      lifetimeValue: 0,
      adWatchesToday: await getAdWatchesToday(user.id),
      emergencyGrantsUsed: 0, // Fixed default
      lastEmergencyGrant,
      challengesCompleted: 0,
      achievementsUnlocked: 0,
      socialShares: 0,
      sessionLengthAvg: 30
    }

    // Check eligibility for each type of emergency grant
    const eligibility = {
      critical_balance: triggerEmergencyIntervention(userProfile, 'critical_balance') !== null,
      first_time_help: triggerEmergencyIntervention(userProfile, 'first_time_help') !== null,
      retention_risk: triggerEmergencyIntervention(userProfile, 'retention_risk') !== null
    }

    // Assess economy health
    const economyHealth = assessEconomyHealth(userProfile)

    return NextResponse.json({
      currentBalance: {
        betPoints: user.betPoints,
        diamonds: user.diamonds
      },
      emergencyGrantsUsed: 0, // Fixed default
      maxEmergencyGrants: 3,
      grantsRemaining: 3, // Fixed grants remaining
      eligibility,
      economyHealth,
      nextAvailable: getNextAvailableTime(userProfile),
      recommendations: getEmergencyRecommendations(userProfile)
    })

  } catch (error) {
    console.error('Get emergency grant status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateAvgStakeSize(bets: any[]): number {
  if (bets.length === 0) return 100
  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0)
  return Math.floor(totalStake / bets.length)
}

function calculateDaysActive(createdAt: Date): number {
  const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
  return daysSinceCreation + 1 // Include creation day
}

function getLastEmergencyGrant(transactions: any[]): Date | null {
  const emergencyGrant = transactions.find(t => t.type === 'EMERGENCY_GRANT' as any)
  return emergencyGrant ? emergencyGrant.createdAt : null
}

function getNextAvailableTime(profile: any): string | null {
  if (!profile.lastEmergencyGrant) return null
  
  const nextAvailable = new Date(profile.lastEmergencyGrant.getTime() + 24 * 60 * 60 * 1000)
  if (nextAvailable > new Date()) {
    return nextAvailable.toISOString()
  }
  return null
}

async function getAdWatchesToday(userId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const count = await prisma.transaction.count({
    where: {
      userId,
      type: 'AD_WATCH',
      createdAt: {
        gte: today
      }
    }
  })
  
  return count
}

async function getChallengesCompleted(userId: string): Promise<number> {
  const count = await prisma.challengeProgress.count({
    where: {
      userId,
      completed: true
    }
  })
  
  return count
}

async function getAchievementsCount(userId: string): Promise<number> {
  const count = await prisma.userAchievement.count({
    where: {
      userId,
      completed: true
    }
  })
  
  return count
}

function getGrantMessage(reason: string, amount: { betPoints: number; diamonds: number }): string {
  const bpText = amount.betPoints > 0 ? `${amount.betPoints} BetPoints` : ''
  const diamondText = amount.diamonds > 0 ? `${amount.diamonds} diamonds` : ''
  const amountText = [bpText, diamondText].filter(Boolean).join(' and ')

  switch (reason) {
    case 'critical_balance':
      return `Emergency grant of ${amountText} added to help you continue playing. Remember, you can also watch ads for more currency!`
    
    case 'first_time_help':
      return `Welcome bonus of ${amountText} added to help you get started. Don't forget to check out the daily challenges!`
    
    case 'retention_risk':
      return `Welcome back! We've added ${amountText} to celebrate your return. We missed having you around!`
    
    default:
      return `${amountText} has been added to your account.`
  }
}

function getEmergencyRecommendations(profile: any): string[] {
  const recommendations: string[] = []

  if (profile.betPoints < 500) {
    recommendations.push('Consider watching ads for bonus BetPoints')
    recommendations.push('Complete daily challenges for consistent income')
  }

  if (profile.diamonds < 20) {
    recommendations.push('Place live bets to earn diamond rewards')
  }

  if (profile.loginStreak < 3) {
    recommendations.push('Build up your login streak for growing daily bonuses')
  }

  if (profile.winRate < 0.3 && profile.totalBets > 10) {
    recommendations.push('Try lower-risk bets to improve your success rate')
    recommendations.push('Consider using diamond boosts on safer selections')
  }

  return recommendations
}