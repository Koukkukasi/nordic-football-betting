import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { XPService, XPActionType } from '@/lib/xp-progression-service'
import { withAuth, getAuthenticatedUser } from '@/lib/auth-utils'

const prisma = new PrismaClient()

// GET /api/progression/xp - Get user's XP progress
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      console.log('[XP_API] Getting XP progress for user:', user.id)

      // Get user progression data using authenticated user
      const progress = await XPService.getUserProgress(user.id)
      
      if (!progress) {
        console.log('[XP_API] No progress found for user:', user.id)
        return NextResponse.json(
          { error: 'User progress not found' },
          { status: 404 }
        )
      }

      console.log('[XP_API] XP progress retrieved successfully:', {
        userId: user.id,
        level: progress.level,
        totalXP: progress.totalXP
      })

      return NextResponse.json({
        success: true,
        data: progress
      })

    } catch (error) {
      console.error('[XP_API] Error fetching XP progress:', error)
      return NextResponse.json(
        { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      )
    }
  })
}

// POST /api/progression/xp - Award XP for actions
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json()
      const { action, context } = body

      console.log('[XP_API] Awarding XP for user:', {
        userId: user.id,
        action,
        context
      })

      if (!action) {
        return NextResponse.json(
          { error: 'Action is required' },
          { status: 400 }
        )
      }

      // Validate action type
      if (!Object.values(XPActionType).includes(action)) {
        return NextResponse.json(
          { error: 'Invalid action type', validActions: Object.values(XPActionType) },
          { status: 400 }
        )
      }

      // Award XP using authenticated user ID
      const result = await XPService.awardXP(user.id, action as XPActionType, context)

      console.log('[XP_API] XP awarded successfully:', {
        userId: user.id,
        action,
        xpGained: result.xpGained,
        levelUp: result.levelUp
      })

      return NextResponse.json({
        success: true,
        data: result
      })

    } catch (error) {
      console.error('[XP_API] Error awarding XP:', error)
      return NextResponse.json(
        { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      )
    }
  })
}

// Helper function to get XP leaderboard
async function getXPLeaderboard(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')

    const leaderboard = await XPService.getXPLeaderboard(limit)

    return NextResponse.json({
      success: true,
      data: leaderboard
    })

  } catch (error) {
    console.error('Error fetching XP leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}