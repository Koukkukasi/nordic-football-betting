import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/leaderboard - Get various leaderboards
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'level'
    const limit = parseInt(searchParams.get('limit') || '10')
    const userId = searchParams.get('userId') // To show user's position

    let leaderboard: any[] = []
    let userPosition = null

    switch (type) {
      case 'level':
        leaderboard = await getLevelLeaderboard(limit)
        if (userId) {
          userPosition = await getUserLevelPosition(userId)
        }
        break
        
      case 'xp':
        leaderboard = await getXPLeaderboard(limit)
        if (userId) {
          userPosition = await getUserXPPosition(userId)
        }
        break
        
      case 'wins':
        leaderboard = await getWinsLeaderboard(limit)
        if (userId) {
          userPosition = await getUserWinsPosition(userId)
        }
        break
        
      case 'winnings':
        leaderboard = await getWinningsLeaderboard(limit)
        if (userId) {
          userPosition = await getUserWinningsPosition(userId)
        }
        break
        
      case 'streak':
        leaderboard = await getStreakLeaderboard(limit)
        if (userId) {
          userPosition = await getUserStreakPosition(userId)
        }
        break
        
      case 'achievements':
        leaderboard = await getAchievementsLeaderboard(limit)
        if (userId) {
          userPosition = await getUserAchievementsPosition(userId)
        }
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid leaderboard type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: {
        type,
        leaderboard,
        userPosition,
        totalUsers: await prisma.user.count()
      }
    })

  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Level-based leaderboard
async function getLevelLeaderboard(limit: number) {
  return await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      level: true,
      xp: true,
      profileAvatar: true,
      createdAt: true
    },
    orderBy: [
      { level: 'desc' },
      { xp: 'desc' },
      { createdAt: 'asc' } // Earlier users ranked higher if tied
    ],
    take: limit
  })
}

// XP-based leaderboard
async function getXPLeaderboard(limit: number) {
  return await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      level: true,
      xp: true,
      profileAvatar: true,
      createdAt: true
    },
    orderBy: [
      { xp: 'desc' },
      { level: 'desc' },
      { createdAt: 'asc' }
    ],
    take: limit
  })
}

// Wins-based leaderboard
async function getWinsLeaderboard(limit: number) {
  return await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      level: true,
      totalWins: true,
      totalBets: true,
      profileAvatar: true,
      createdAt: true
    },
    orderBy: [
      { totalWins: 'desc' },
      { totalBets: 'asc' }, // Prefer users with fewer bets if wins are tied
      { createdAt: 'asc' }
    ],
    take: limit
  })
}

// Winnings-based leaderboard
async function getWinningsLeaderboard(limit: number) {
  return await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      level: true,
      totalWon: true,
      totalStaked: true,
      profileAvatar: true,
      createdAt: true
    },
    orderBy: [
      { totalWon: 'desc' },
      { level: 'desc' },
      { createdAt: 'asc' }
    ],
    take: limit
  })
}

// Win streak leaderboard
async function getStreakLeaderboard(limit: number) {
  return await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      level: true,
      bestStreak: true,
      currentStreak: true,
      profileAvatar: true,
      createdAt: true
    },
    orderBy: [
      { bestStreak: 'desc' },
      { currentStreak: 'desc' },
      { level: 'desc' },
      { createdAt: 'asc' }
    ],
    take: limit
  })
}

// Achievements-based leaderboard
async function getAchievementsLeaderboard(limit: number) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      level: true,
      profileAvatar: true,
      createdAt: true,
      achievements: {
        where: {
          completed: true
        },
        include: {
          achievement: {
            select: {
              tier: true
            }
          }
        }
      }
    }
  })

  // Calculate achievement scores (weighted by tier)
  const usersWithScores = users.map(user => {
    const completedAchievements = user.achievements.length
    const achievementScore = user.achievements.reduce((score, ua) => {
      // Tier 3 (Gold) = 5 points, Tier 2 (Silver) = 3 points, Tier 1 (Bronze) = 1 point
      const points = ua.achievement.tier === 3 ? 5 : ua.achievement.tier === 2 ? 3 : 1
      return score + points
    }, 0)

    return {
      id: user.id,
      username: user.username,
      level: user.level,
      profileAvatar: user.profileAvatar,
      createdAt: user.createdAt,
      completedAchievements,
      achievementScore
    }
  })

  // Sort by achievement score
  return usersWithScores
    .sort((a, b) => {
      if (b.achievementScore !== a.achievementScore) {
        return b.achievementScore - a.achievementScore
      }
      if (b.completedAchievements !== a.completedAchievements) {
        return b.completedAchievements - a.completedAchievements
      }
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
    .slice(0, limit)
}

// Position finder functions
async function getUserLevelPosition(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { level: true, xp: true, createdAt: true }
  })

  if (!user) return null

  const higherUsers = await prisma.user.count({
    where: {
      OR: [
        { level: { gt: user.level } },
        {
          AND: [
            { level: user.level },
            { xp: { gt: user.xp } }
          ]
        },
        {
          AND: [
            { level: user.level },
            { xp: user.xp },
            { createdAt: { lt: user.createdAt } }
          ]
        }
      ]
    }
  })

  return higherUsers + 1
}

async function getUserXPPosition(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true, createdAt: true }
  })

  if (!user) return null

  const higherUsers = await prisma.user.count({
    where: {
      OR: [
        { xp: { gt: user.xp } },
        {
          AND: [
            { xp: user.xp },
            { level: { gt: user.level } }
          ]
        },
        {
          AND: [
            { xp: user.xp },
            { level: user.level },
            { createdAt: { lt: user.createdAt } }
          ]
        }
      ]
    }
  })

  return higherUsers + 1
}

async function getUserWinsPosition(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalWins: true, totalBets: true, createdAt: true }
  })

  if (!user) return null

  const higherUsers = await prisma.user.count({
    where: {
      OR: [
        { totalWins: { gt: user.totalWins } },
        {
          AND: [
            { totalWins: user.totalWins },
            { totalBets: { lt: user.totalBets } }
          ]
        },
        {
          AND: [
            { totalWins: user.totalWins },
            { totalBets: user.totalBets },
            { createdAt: { lt: user.createdAt } }
          ]
        }
      ]
    }
  })

  return higherUsers + 1
}

async function getUserWinningsPosition(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalWon: true, level: true, createdAt: true }
  })

  if (!user) return null

  const higherUsers = await prisma.user.count({
    where: {
      OR: [
        { totalWon: { gt: user.totalWon } },
        {
          AND: [
            { totalWon: user.totalWon },
            { level: { gt: user.level } }
          ]
        },
        {
          AND: [
            { totalWon: user.totalWon },
            { level: user.level },
            { createdAt: { lt: user.createdAt } }
          ]
        }
      ]
    }
  })

  return higherUsers + 1
}

async function getUserStreakPosition(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { bestStreak: true, currentStreak: true, level: true, createdAt: true }
  })

  if (!user) return null

  const higherUsers = await prisma.user.count({
    where: {
      OR: [
        { bestStreak: { gt: user.bestStreak } },
        {
          AND: [
            { bestStreak: user.bestStreak },
            { currentStreak: { gt: user.currentStreak } }
          ]
        },
        {
          AND: [
            { bestStreak: user.bestStreak },
            { currentStreak: user.currentStreak },
            { level: { gt: user.level } }
          ]
        },
        {
          AND: [
            { bestStreak: user.bestStreak },
            { currentStreak: user.currentStreak },
            { level: user.level },
            { createdAt: { lt: user.createdAt } }
          ]
        }
      ]
    }
  })

  return higherUsers + 1
}

async function getUserAchievementsPosition(userId: string) {
  // This is complex, so we'll calculate it by getting all users and sorting
  const allUsers = await getAchievementsLeaderboard(1000) // Get many users
  const userIndex = allUsers.findIndex(u => u.id === userId)
  return userIndex >= 0 ? userIndex + 1 : null
}