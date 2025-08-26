import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// GET user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        isVerified: true,
        role: true,
        balance: true,
        betPoints: true,
        diamonds: true,
        level: true,
        experience: true,
        totalBets: true,
        wonBets: true,
        lostBets: true,
        totalWagered: true,
        totalWon: true,
        streak: true,
        avatar: true,
        bio: true,
        country: true,
        favoriteTeam: true,
        notificationPreferences: true,
        privacySettings: true,
        stats: {
          select: {
            dailyLoginStreak: true,
            maxWinStreak: true,
            maxOddsWon: true,
            totalProfit: true,
            favoriteTeam: true,
            favoriteMarket: true,
            lastActive: true,
          }
        },
        achievements: {
          where: { completed: true },
          select: {
            id: true,
            type: true,
            name: true,
            description: true,
            completedAt: true,
            betPointsReward: true,
            diamondReward: true,
            xpReward: true,
          },
          orderBy: { completedAt: 'desc' },
          take: 10
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(user)
    
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// Update user profile
const updateProfileSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  bio: z.string().max(500).optional(),
  country: z.string().max(2).optional(), // ISO country code
  favoriteTeam: z.string().optional(),
  avatar: z.string().url().optional(),
  notificationPreferences: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional(),
    promotions: z.boolean().optional(),
    betUpdates: z.boolean().optional(),
    weeklyReport: z.boolean().optional(),
  }).optional(),
  privacySettings: z.object({
    showProfile: z.boolean().optional(),
    showStats: z.boolean().optional(),
    showBets: z.boolean().optional(),
    allowFriendRequests: z.boolean().optional(),
  }).optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)
    
    // Check username uniqueness if changed
    if (validatedData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: validatedData.username,
          NOT: { email: session.user.email }
        }
      })
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        )
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...validatedData,
        notificationPreferences: validatedData.notificationPreferences 
          ? JSON.stringify(validatedData.notificationPreferences)
          : undefined,
        privacySettings: validatedData.privacySettings
          ? JSON.stringify(validatedData.privacySettings)
          : undefined,
      },
      select: {
        id: true,
        username: true,
        bio: true,
        country: true,
        favoriteTeam: true,
        avatar: true,
        notificationPreferences: true,
        privacySettings: true,
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    })
    
  } catch (error) {
    console.error('Update profile error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// Change password
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { currentPassword, newPassword } = await request.json()
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Both current and new passwords are required' },
        { status: 400 }
      )
    }
    
    // Validate new password
    const passwordSchema = z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
    
    try {
      passwordSchema.parse(newPassword)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.errors[0].message },
          { status: 400 }
        )
      }
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }
    
    // Hash and update new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12)
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        lastPasswordChange: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })
    
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}

// Delete account
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required to delete account' },
        { status: 400 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 400 }
      )
    }
    
    // Soft delete or anonymize user data
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: `deleted_${user.id}@deleted.com`,
        username: `deleted_${user.id}`,
        passwordHash: '',
        isDeleted: true,
        deletedAt: new Date(),
        // Clear personal data
        bio: null,
        avatar: null,
        country: null,
        favoriteTeam: null,
        notificationPreferences: null,
        privacySettings: null,
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    })
    
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}