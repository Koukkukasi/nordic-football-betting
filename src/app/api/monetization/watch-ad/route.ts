import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { 
  AdType, 
  canWatchAd, 
  simulateAdWatch, 
  calculateAdReward,
  checkDailyAdLimit 
} from '@/lib/ad-system'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { adType, action } = await request.json()

    // Validate ad type
    const validAdTypes: AdType[] = [
      'EMERGENCY_BETPOINTS',
      'DAILY_BONUS_BOOST', 
      'DIAMOND_BONUS',
      'WEEKEND_SPECIAL',
      'MATCH_DAY_BOOST'
    ]
    
    if (!validAdTypes.includes(adType)) {
      return NextResponse.json({ error: 'Invalid ad type' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Handle different actions
    switch (action) {
      case 'CHECK_AVAILABILITY':
        return handleCheckAvailability(user, adType)
      
      case 'START_WATCH':
        return handleStartWatch(user, adType)
      
      case 'CLAIM_REWARD':
        return handleClaimReward(user, adType, request)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Ad system error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleCheckAvailability(user: any, adType: AdType) {
  // Get last watched time for this ad type
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const lastWatched = await prisma.transaction.findFirst({
    where: {
      userId: user.id,
      type: 'AD_WATCH',
      reference: adType,
      createdAt: {
        gte: today
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Check daily limit
  const todayWatchCount = await prisma.transaction.count({
    where: {
      userId: user.id,
      type: 'AD_WATCH',
      reference: adType,
      createdAt: {
        gte: today
      }
    }
  })

  const withinDailyLimit = checkDailyAdLimit(adType, todayWatchCount)
  
  // Check if user can watch this ad
  const canWatch = canWatchAd(
    adType,
    lastWatched?.createdAt || null,
    user.betPoints,
    user.diamonds
  )

  // Calculate potential reward
  const reward = calculateAdReward(adType, user.level, false) // TODO: Check VIP status

  return NextResponse.json({
    canWatch: canWatch.canWatch && withinDailyLimit,
    reason: !withinDailyLimit ? 'DAILY_LIMIT_REACHED' : canWatch.reason,
    cooldownMinutes: canWatch.cooldownMinutes,
    reward,
    todayWatchCount,
    dailyLimit: require('@/lib/ad-system').DAILY_AD_LIMITS[adType]
  })
}

async function handleStartWatch(user: any, adType: AdType) {
  // Validate user can watch ad
  const checkResult = await handleCheckAvailability(user, adType)
  const availabilityData = await checkResult.json()
  
  if (!availabilityData.canWatch) {
    return NextResponse.json({ 
      error: 'Cannot watch ad at this time',
      reason: availabilityData.reason 
    }, { status: 400 })
  }

  // Simulate ad watching process
  const watchResult = await simulateAdWatch(adType)
  
  if (!watchResult.success) {
    return NextResponse.json({ 
      error: watchResult.error || 'Ad failed to load'
    }, { status: 400 })
  }

  // Create pending transaction (will be claimed when user confirms they watched the ad)
  const pendingTransaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      type: 'AD_WATCH_PENDING',
      amount: 0, // Will be set when claimed
      currency: 'BETPOINTS',
      description: `Pending ad watch reward: ${adType}`,
      reference: adType,
      balanceBefore: user.betPoints,
      balanceAfter: user.betPoints
    }
  })

  return NextResponse.json({
    success: true,
    watchId: pendingTransaction.id,
    message: 'Ad started successfully'
  })
}

async function handleClaimReward(user: any, adType: AdType, request: NextRequest) {
  const { watchId } = await request.json()
  
  if (!watchId) {
    return NextResponse.json({ error: 'Watch ID required' }, { status: 400 })
  }

  // Find pending transaction
  const pendingTransaction = await prisma.transaction.findFirst({
    where: {
      id: watchId,
      userId: user.id,
      type: 'AD_WATCH_PENDING',
      reference: adType
    }
  })

  if (!pendingTransaction) {
    return NextResponse.json({ error: 'Invalid or expired watch session' }, { status: 404 })
  }

  // Check if reward was already claimed (prevent double claiming)
  const alreadyClaimed = await prisma.transaction.findFirst({
    where: {
      userId: user.id,
      type: 'AD_WATCH',
      reference: `${adType}_${watchId}`
    }
  })

  if (alreadyClaimed) {
    return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 })
  }

  // Calculate reward
  const reward = calculateAdReward(adType, user.level, false) // TODO: Check VIP status

  // Update user balances and create reward transactions
  const updatedUser = await prisma.$transaction(async (tx) => {
    // Update user balances
    const user = await tx.user.update({
      where: { id: pendingTransaction.userId },
      data: {
        betPoints: {
          increment: reward.betPoints
        },
        diamonds: {
          increment: reward.diamonds
        }
      }
    })

    // Create BetPoints transaction if applicable
    if (reward.betPoints > 0) {
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'AD_WATCH',
          amount: reward.betPoints,
          currency: 'BETPOINTS',
          description: `Ad reward: ${reward.description}`,
          reference: `${adType}_${watchId}`,
          balanceBefore: user.betPoints - reward.betPoints,
          balanceAfter: user.betPoints
        }
      })
    }

    // Create Diamonds transaction if applicable
    if (reward.diamonds > 0) {
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'AD_WATCH',
          amount: reward.diamonds,
          currency: 'DIAMONDS',
          description: `Ad reward: ${reward.description}`,
          reference: `${adType}_${watchId}`,
          balanceBefore: user.diamonds - reward.diamonds,
          balanceAfter: user.diamonds
        }
      })
    }

    // Delete pending transaction
    await tx.transaction.delete({
      where: { id: pendingTransaction.id }
    })

    return user
  })

  // Create success notification
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'SYSTEM',
      title: 'Ad Reward Claimed!',
      message: `You earned ${reward.betPoints} BP${reward.diamonds > 0 ? ` and ${reward.diamonds} diamonds` : ''} for watching an ad.`,
      data: {
        adType,
        reward
      }
    }
  })

  return NextResponse.json({
    success: true,
    reward,
    newBalance: {
      betPoints: updatedUser.betPoints,
      diamonds: updatedUser.diamonds
    },
    message: `Reward claimed! +${reward.betPoints} BP${reward.diamonds > 0 ? `, +${reward.diamonds} 💎` : ''}`
  })
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get available ads for user
    const { getAvailableAds } = require('@/lib/ad-system')
    
    // Get last watched times for all ad types
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const recentWatches = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: 'AD_WATCH',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const lastWatchedTimes: Record<string, Date | null> = {
      EMERGENCY_BETPOINTS: null,
      DAILY_BONUS_BOOST: null,
      DIAMOND_BONUS: null,
      WEEKEND_SPECIAL: null,
      MATCH_DAY_BOOST: null
    }

    // Find most recent watch time for each ad type
    recentWatches.forEach(watch => {
      if (watch.reference && !lastWatchedTimes[watch.reference]) {
        lastWatchedTimes[watch.reference] = watch.createdAt
      }
    })

    const availableAds = getAvailableAds(
      user.betPoints,
      user.diamonds,
      lastWatchedTimes
    )

    return NextResponse.json({
      availableAds,
      userBalance: {
        betPoints: user.betPoints,
        diamonds: user.diamonds
      },
      todayWatchCounts: await getTodayWatchCounts(user.id)
    })

  } catch (error) {
    console.error('Get ads error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getTodayWatchCounts(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const adTypes = ['EMERGENCY_BETPOINTS', 'DAILY_BONUS_BOOST', 'DIAMOND_BONUS', 'WEEKEND_SPECIAL', 'MATCH_DAY_BOOST']
  const counts: Record<string, number> = {}

  for (const adType of adTypes) {
    const count = await prisma.transaction.count({
      where: {
        userId,
        type: 'AD_WATCH',
        reference: {
          startsWith: adType
        },
        createdAt: {
          gte: today
        }
      }
    })
    counts[adType] = count
  }

  return counts
}