import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'

// Request password reset
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
    
    // Don't reveal if user exists or not for security
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      })
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetExpiry
      }
    })
    
    // TODO: Send password reset email
    console.log('Password reset token for', user.email, ':', resetToken)
    const resetLink = `http://localhost:3001/auth/reset-password?token=${resetToken}&email=${email}`
    console.log('Reset link:', resetLink)
    
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.'
    })
    
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}

// Reset password with token
const resetPasswordSchema = z.object({
  token: z.string(),
  email: z.string().email(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)
    
    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        email: validatedData.email.toLowerCase(),
        passwordResetToken: validatedData.token,
        passwordResetExpiry: {
          gt: new Date()
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(validatedData.password, 12)
    
    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
        // Track password change
        lastPasswordChange: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    })
    
  } catch (error) {
    console.error('Password reset error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}