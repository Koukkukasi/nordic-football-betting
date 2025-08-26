import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateDailyChallenges, CHALLENGE_TEMPLATES } from '@/lib/challenge-system'

const prisma = new PrismaClient()

// GET /api/challenges/daily - Get user's active daily challenges
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

    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Find today's challenges
    let todaysChallenges = await prisma.challenge.findMany({
      where: {
        startDate: {
          gte: today,
          lt: tomorrow
        },
        isDaily: true,
        isActive: true
      }
    })

    // If no challenges exist for today, generate them
    if (todaysChallenges.length === 0) {
      await generateTodaysChallenges()
      todaysChallenges = await prisma.challenge.findMany({
        where: {
          startDate: {
            gte: today,
            lt: tomorrow
          },
          isDaily: true,
          isActive: true
        }
      })
    }

    // Get user's progress on these challenges
    const challengesWithProgress = await Promise.all(
      todaysChallenges.map(async (challenge) => {
        const progress = await prisma.challengeProgress.findUnique({
          where: {
            userId_challengeId: {
              userId,
              challengeId: challenge.id
            }
          }
        })

        return {
          ...challenge,
          progress: progress?.progress || 0,
          completed: progress?.completed || false,
          claimedAt: progress?.claimedAt || null
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: challengesWithProgress
    })

  } catch (error) {
    console.error('Error fetching daily challenges:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/challenges/daily - Generate new daily challenges (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminKey, date } = body

    // Simple admin authentication (you should use proper auth)
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const targetDate = date ? new Date(date) : new Date()
    const result = await generateTodaysChallenges(targetDate)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error generating daily challenges:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to generate today's challenges
async function generateTodaysChallenges(date: Date = new Date()) {
  const today = new Date(date)
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Check if challenges already exist for today
  const existingChallenges = await prisma.challenge.findMany({
    where: {
      startDate: {
        gte: today,
        lt: tomorrow
      },
      isDaily: true
    }
  })

  if (existingChallenges.length > 0) {
    return { message: 'Challenges already exist for this date', challenges: existingChallenges }
  }

  // Get sample user level for challenge generation (you might want to make this more sophisticated)
  const avgUserLevel = await prisma.user.aggregate({
    _avg: {
      level: true
    }
  })

  const userLevel = Math.floor(avgUserLevel._avg.level || 3)

  // Check for special conditions
  const availableMatches = {
    isDerbyDay: Math.random() < 0.2, // 20% chance of derby day
    availableLeagues: ['Veikkausliiga', 'Ykkösliiga', 'Ykkönen'],
    liveMatchesCount: Math.floor(Math.random() * 5) + 1
  }

  // Generate challenges using the challenge system
  const selectedTemplates = generateDailyChallenges(today, userLevel, availableMatches)

  // Create challenges in database
  const createdChallenges = await Promise.all(
    selectedTemplates.map(async (template) => {
      const endDate = new Date(tomorrow)
      endDate.setHours(23, 59, 59, 999)

      return await prisma.challenge.create({
        data: {
          id: `daily_${today.toISOString().split('T')[0]}_${template.id}`,
          name: template.name,
          description: template.description,
          startDate: today,
          endDate: endDate,
          requirement: template.requirement as any,
          reward: template.reward as any,
          isDaily: true,
          isActive: true
        }
      })
    })
  )

  console.log(`Generated ${createdChallenges.length} daily challenges for ${today.toDateString()}`)
  
  return {
    message: 'Daily challenges generated successfully',
    challenges: createdChallenges
  }
}