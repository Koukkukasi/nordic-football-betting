// Enhanced Auth Utilities for Nordic Football Betting
// Fixes foreign key constraint issues and provides robust user session management

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient, User } from '@prisma/client'

const prisma = new PrismaClient()

export interface AuthSession {
  user: {
    id: string
    email: string
    name: string
  }
}

export interface AuthenticatedUser {
  id: string
  email: string
  username: string
  betPoints: number
  diamonds: number
  level: number
  xp: number
}

// Enhanced logging for auth operations
const logAuthOperation = (operation: string, details: any, level: 'info' | 'warn' | 'error' = 'info') => {
  const timestamp = new Date().toISOString()
  const logData = {
    timestamp,
    operation,
    details,
    level
  }
  
  if (level === 'error') {
    console.error('[AUTH_ERROR]', JSON.stringify(logData, null, 2))
  } else if (level === 'warn') {
    console.warn('[AUTH_WARN]', JSON.stringify(logData, null, 2))
  } else {
    console.log('[AUTH_INFO]', JSON.stringify(logData, null, 2))
  }
}

// User lookup with retry mechanism
export async function findUserWithRetry(
  identifier: string, 
  identifierType: 'id' | 'email' = 'id', 
  maxRetries: number = 3,
  retryDelay: number = 100
): Promise<User | null> {
  
  logAuthOperation('user_lookup_start', {
    identifier,
    identifierType,
    maxRetries
  })

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const whereClause = identifierType === 'id' 
        ? { id: identifier }
        : { email: identifier.toLowerCase() }

      const user = await prisma.user.findUnique({
        where: whereClause
      })

      if (user) {
        logAuthOperation('user_lookup_success', {
          identifier,
          userId: user.id,
          attempt,
          username: user.username
        })
        return user
      } else {
        logAuthOperation('user_not_found', {
          identifier,
          identifierType,
          attempt
        }, 'warn')
      }

    } catch (error) {
      logAuthOperation('user_lookup_error', {
        identifier,
        identifierType,
        attempt,
        error: error instanceof Error ? error.message : String(error)
      }, 'error')

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error
      }

      // Wait before retry
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }

  return null
}

// Enhanced user creation with transaction safety
export async function createUserSafely(userData: {
  email: string
  username: string
  passwordHash: string
}): Promise<User> {
  
  logAuthOperation('user_creation_start', {
    email: userData.email,
    username: userData.username
  })

  return await prisma.$transaction(async (tx) => {
    // Check if user already exists
    const existingUser = await tx.user.findFirst({
      where: {
        OR: [
          { email: userData.email.toLowerCase() },
          { username: userData.username }
        ]
      }
    })

    if (existingUser) {
      logAuthOperation('user_creation_conflict', {
        email: userData.email,
        username: userData.username,
        existingUserId: existingUser.id
      }, 'warn')
      return existingUser
    }

    // Create new user
    const newUser = await tx.user.create({
      data: {
        email: userData.email.toLowerCase(),
        username: userData.username,
        passwordHash: userData.passwordHash,
        betPoints: 10000,
        diamonds: 50,
        level: 1,
        xp: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Create welcome notification
    await tx.notification.create({
      data: {
        userId: newUser.id,
        type: 'SYSTEM',
        title: 'Tervetuloa Nordic Football Bettingiin!',
        message: 'Aloitit 10,000 BetPointilla ja 50 timantilla. Onnea veikkauksiin!',
        data: {
          welcomeBonus: {
            betPoints: 10000,
            diamonds: 50
          }
        }
      }
    })

    // Create initial transaction record
    await tx.transaction.create({
      data: {
        userId: newUser.id,
        type: 'DAILY_BONUS',
        amount: 10000,
        currency: 'BETPOINTS',
        description: 'Welcome bonus',
        balanceBefore: 0,
        balanceAfter: 10000
      }
    })

    logAuthOperation('user_creation_success', {
      email: newUser.email,
      username: newUser.username,
      userId: newUser.id
    })

    return newUser
  }, {
    maxWait: 5000, // 5 seconds
    timeout: 10000, // 10 seconds
  })
}

// Get authenticated user with comprehensive error handling
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Import auth options dynamically to avoid circular dependency
    const { authOptions } = await import('@/lib/auth-options')
    const session = await getServerSession(authOptions) as AuthSession | null

    if (!session?.user) {
      logAuthOperation('no_session', { url: request.url }, 'warn')
      return null
    }

    logAuthOperation('session_found', {
      sessionUserId: session.user.id,
      sessionEmail: session.user.email,
      url: request.url
    })

    // Handle demo users differently
    if (session.user.id.startsWith('demo-user')) {
      logAuthOperation('demo_user_session', {
        sessionUserId: session.user.id,
        email: session.user.email
      })

      // Try to find or create demo user in database
      let user = await findUserWithRetry(session.user.email, 'email')
      
      if (!user) {
        // Create demo user
        user = await createUserSafely({
          email: session.user.email,
          username: session.user.email.split('@')[0],
          passwordHash: 'demo-hash' // Demo users don't need real password hash
        })
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        betPoints: user.betPoints,
        diamonds: user.diamonds,
        level: user.level,
        xp: user.xp
      }
    }

    // Regular user lookup
    const user = await findUserWithRetry(session.user.id, 'id')
    
    if (!user) {
      // Try by email as fallback
      const userByEmail = await findUserWithRetry(session.user.email, 'email')
      if (userByEmail) {
        logAuthOperation('user_found_by_email_fallback', {
          sessionUserId: session.user.id,
          actualUserId: userByEmail.id,
          email: session.user.email
        }, 'warn')
        
        return {
          id: userByEmail.id,
          email: userByEmail.email,
          username: userByEmail.username,
          betPoints: userByEmail.betPoints,
          diamonds: userByEmail.diamonds,
          level: userByEmail.level,
          xp: userByEmail.xp
        }
      }

      logAuthOperation('user_not_found_after_fallback', {
        sessionUserId: session.user.id,
        sessionEmail: session.user.email
      }, 'error')
      return null
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      betPoints: user.betPoints,
      diamonds: user.diamonds,
      level: user.level,
      xp: user.xp
    }

  } catch (error) {
    logAuthOperation('get_authenticated_user_error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url
    }, 'error')
    return null
  }
}

// Middleware for API routes that require authentication
export async function withAuth<T>(
  request: NextRequest,
  handler: (user: AuthenticatedUser, request: NextRequest) => Promise<T>
): Promise<T | Response> {
  
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    logAuthOperation('auth_required_failed', {
      url: request.url,
      method: request.method
    }, 'warn')
    
    return new Response(
      JSON.stringify({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        details: 'Please log in to access this resource'
      }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  logAuthOperation('auth_success', {
    userId: user.id,
    username: user.username,
    url: request.url,
    method: request.method
  })

  return await handler(user, request)
}

// Update user balance safely with transaction
export async function updateUserBalanceSafely(
  userId: string,
  changes: {
    betPoints?: number
    diamonds?: number
    xp?: number
  },
  description?: string
): Promise<User> {
  
  logAuthOperation('balance_update_start', {
    userId,
    changes,
    description
  })

  return await prisma.$transaction(async (tx) => {
    // Get current user
    const currentUser = await tx.user.findUnique({
      where: { id: userId }
    })

    if (!currentUser) {
      throw new Error('User not found for balance update')
    }

    // Calculate new balances
    const newBetPoints = currentUser.betPoints + (changes.betPoints || 0)
    const newDiamonds = currentUser.diamonds + (changes.diamonds || 0)
    const newXP = currentUser.xp + (changes.xp || 0)

    // Ensure non-negative balances
    if (newBetPoints < 0 || newDiamonds < 0 || newXP < 0) {
      throw new Error('Insufficient balance for operation')
    }

    // Update user
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        betPoints: newBetPoints,
        diamonds: newDiamonds,
        xp: newXP,
        updatedAt: new Date()
      }
    })

    // Create transaction records for each currency change
    if (changes.betPoints && changes.betPoints !== 0) {
      await tx.transaction.create({
        data: {
          userId,
          type: changes.betPoints > 0 ? 'BET_WON' : 'BET_PLACED',
          amount: Math.abs(changes.betPoints),
          currency: 'BETPOINTS',
          description: description || 'Balance adjustment',
          balanceBefore: currentUser.betPoints,
          balanceAfter: newBetPoints
        }
      })
    }

    if (changes.diamonds && changes.diamonds !== 0) {
      await tx.transaction.create({
        data: {
          userId,
          type: changes.diamonds > 0 ? 'ACHIEVEMENT_REWARD' : 'DIAMOND_PURCHASE',
          amount: Math.abs(changes.diamonds),
          currency: 'DIAMONDS',
          description: description || 'Diamond adjustment',
          balanceBefore: currentUser.diamonds,
          balanceAfter: newDiamonds
        }
      })
    }

    logAuthOperation('balance_update_success', {
      userId,
      changes,
      newBalances: {
        betPoints: newBetPoints,
        diamonds: newDiamonds,
        xp: newXP
      }
    })

    return updatedUser
  })
}

// Health check for auth system
export async function checkAuthHealth(): Promise<{
  database: boolean
  session: boolean
  errors: string[]
}> {
  const errors: string[] = []
  let databaseOk = false
  let sessionOk = false

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    databaseOk = true
  } catch (error) {
    errors.push(`Database connection failed: ${error instanceof Error ? error.message : String(error)}`)
  }

  try {
    // Test session system (this would need to be implemented based on your NextAuth setup)
    sessionOk = true // Placeholder
  } catch (error) {
    errors.push(`Session system failed: ${error instanceof Error ? error.message : String(error)}`)
  }

  logAuthOperation('auth_health_check', {
    database: databaseOk,
    session: sessionOk,
    errors
  })

  return {
    database: databaseOk,
    session: sessionOk,
    errors
  }
}