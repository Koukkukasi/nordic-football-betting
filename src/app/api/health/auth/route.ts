// Auth Health Check API for Nordic Football Betting
// Tests the enhanced auth system and database connectivity

import { NextRequest, NextResponse } from 'next/server'
import { checkAuthHealth, getAuthenticatedUser } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    console.log('[AUTH_HEALTH] Starting auth health check')

    // Run basic health checks
    const healthStatus = await checkAuthHealth()

    // Try to get authenticated user if session exists
    let sessionTest = null
    try {
      const user = await getAuthenticatedUser(request)
      sessionTest = {
        hasSession: !!user,
        userId: user?.id || null,
        email: user?.email || null
      }
    } catch (error) {
      sessionTest = {
        hasSession: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      auth: {
        database: healthStatus.database,
        session: healthStatus.session,
        errors: healthStatus.errors
      },
      sessionTest,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
        nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing',
        nextAuthUrl: process.env.NEXTAUTH_URL || 'not set'
      }
    }

    console.log('[AUTH_HEALTH] Health check complete:', response)

    return NextResponse.json(response)

  } catch (error) {
    console.error('[AUTH_HEALTH] Health check failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// POST endpoint to test auth with sample data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testUserId } = body

    console.log('[AUTH_HEALTH] Testing auth with user ID:', testUserId)

    if (testUserId) {
      // Test user lookup directly
      const { findUserWithRetry } = await import('@/lib/auth-utils')
      const user = await findUserWithRetry(testUserId, 'id', 3, 200)
      
      return NextResponse.json({
        success: true,
        test: 'user_lookup',
        result: {
          found: !!user,
          userId: user?.id || null,
          email: user?.email || null,
          username: user?.username || null,
          betPoints: user?.betPoints || null
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: 'No testUserId provided'
    }, { status: 400 })

  } catch (error) {
    console.error('[AUTH_HEALTH] Auth test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}