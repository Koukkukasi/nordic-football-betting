import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createUserSafely } from '@/lib/auth-utils'
import { z } from 'zod'

// Validation schema - simplified for demo/F2P version
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 10)
    
    // Create user using the auth-utils function
    const user = await createUserSafely({
      email: validatedData.email.toLowerCase(),
      username: validatedData.username,
      passwordHash,
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful! You can now log in.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    // Check for unique constraint violations
    if (error instanceof Error) {
      if (error.message.includes('existingUserId')) {
        return NextResponse.json(
          { error: 'An account with this email or username already exists' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}