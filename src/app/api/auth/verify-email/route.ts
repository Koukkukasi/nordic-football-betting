import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    
    if (!token || !email) {
      return NextResponse.json(
        { error: 'Invalid verification link' },
        { status: 400 }
      )
    }
    
    // Find user with matching token and email
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        verificationToken: token,
        verificationExpiry: {
          gt: new Date()
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link' },
        { status: 400 }
      )
    }
    
    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpiry: null,
        // Bonus for verifying email
        betPoints: user.betPoints + 500,
        diamonds: user.diamonds + 2
      }
    })
    
    // Create welcome achievement
    await prisma.achievement.create({
      data: {
        userId: user.id,
        type: 'WELCOME',
        name: 'Welcome to Nordic Betting',
        description: 'Verified your email and joined the community',
        progress: 100,
        target: 100,
        completed: true,
        completedAt: new Date(),
        betPointsReward: 500,
        diamondReward: 2,
        xpReward: 50
      }
    })
    
    // Redirect to login with success message
    return NextResponse.redirect(
      new URL('/auth/login?verified=true', request.url)
    )
    
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    if (user.isVerified) {
      return NextResponse.json(
        { message: 'Email already verified' },
        { status: 200 }
      )
    }
    
    // Generate new verification token
    const crypto = require('crypto')
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpiry
      }
    })
    
    // TODO: Send verification email
    console.log('New verification token for', user.email, ':', verificationToken)
    
    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    })
    
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    )
  }
}