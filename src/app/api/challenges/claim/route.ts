import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { XPService, XPActionType } from '@/lib/xp-progression-service'

const prisma = new PrismaClient()

// POST /api/challenges/claim - Claim challenge rewards
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, challengeId } = body

    if (!userId || !challengeId) {
      return NextResponse.json(
        { error: 'User ID and challenge ID are required' },
        { status: 400 }
      )
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get the challenge
      const challenge = await tx.challenge.findUnique({
        where: { id: challengeId }
      })

      if (!challenge) {
        throw new Error('Challenge not found')
      }

      // Get user's progress on this challenge
      const progress = await tx.challengeProgress.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId
          }
        }
      })

      if (!progress) {
        throw new Error('No progress found for this challenge')
      }

      if (!progress.completed) {
        throw new Error('Challenge is not completed yet')
      }

      if (progress.claimedAt) {
        throw new Error('Rewards already claimed')
      }

      // Check if challenge is still active
      if (!challenge.isActive || new Date() > challenge.endDate) {
        throw new Error('Challenge is no longer active')
      }

      // Parse reward data
      const reward = challenge.reward as any

      // Get current user balance for transaction records
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { betPoints: true, diamonds: true, xp: true }
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Award rewards
      await tx.user.update({
        where: { id: userId },
        data: {
          betPoints: { increment: reward.betPoints || 0 },
          diamonds: { increment: reward.diamonds || 0 },
          xp: { increment: reward.xp || 0 }
        }
      })

      // Create transaction records
      if (reward.betPoints > 0) {
        await tx.transaction.create({
          data: {
            userId,
            type: 'CHALLENGE_REWARD',
            amount: reward.betPoints,
            currency: 'BETPOINTS',
            description: `Challenge completed: ${challenge.name}`,
            reference: challengeId,
            balanceBefore: user.betPoints,
            balanceAfter: user.betPoints + reward.betPoints
          }
        })
      }

      if (reward.diamonds > 0) {
        await tx.transaction.create({
          data: {
            userId,
            type: 'CHALLENGE_REWARD',
            amount: reward.diamonds,
            currency: 'DIAMONDS',
            description: `Challenge completed: ${challenge.name}`,
            reference: challengeId,
            balanceBefore: user.diamonds,
            balanceAfter: user.diamonds + reward.diamonds
          }
        })
      }

      // Update progress to mark as claimed
      const updatedProgress = await tx.challengeProgress.update({
        where: { id: progress.id },
        data: {
          claimedAt: new Date()
        }
      })

      // Create notification
      await tx.notification.create({
        data: {
          userId,
          type: 'CHALLENGE_COMPLETED',
          title: `Haaste suoritettu: ${challenge.name}`,
          message: `Onneksi olkoon! Ansaitsit ${reward.betPoints || 0} BP, ${reward.diamonds || 0} timanttia ja ${reward.xp || 0} XP!`,
          data: {
            challenge,
            reward
          }
        }
      })

      return {
        challenge,
        reward,
        newBalances: {
          betPoints: user.betPoints + (reward.betPoints || 0),
          diamonds: user.diamonds + (reward.diamonds || 0),
          xp: user.xp + (reward.xp || 0)
        }
      }
    })

    // Award XP for challenge completion (outside transaction to avoid circular dependency)
    if (result.reward.xp > 0) {
      try {
        await XPService.awardXP(userId, XPActionType.CHALLENGE_COMPLETED, {
          challengeReward: result.reward,
          challengeName: result.challenge.name
        })
      } catch (xpError) {
        console.error('Error awarding XP for challenge completion:', xpError)
        // Don't fail the entire operation if XP award fails
      }
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error claiming challenge reward:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// GET /api/challenges/claim - Get claimable challenges for user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get completed but unclaimed challenges
    const claimableChallenges = await prisma.challengeProgress.findMany({
      where: {
        userId,
        completed: true,
        claimedAt: null,
        challenge: {
          isActive: true,
          endDate: {
            gte: new Date()
          }
        }
      },
      include: {
        challenge: true
      }
    })

    return NextResponse.json({
      success: true,
      data: claimableChallenges
    })

  } catch (error) {
    console.error('Error fetching claimable challenges:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}