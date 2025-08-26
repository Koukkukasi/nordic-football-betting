import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { headers } from 'next/headers'

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting: requests per minute
  rateLimit: {
    api: 60,        // General API endpoints
    auth: 10,       // Authentication endpoints
    betting: 30,    // Betting endpoints
    payment: 5,     // Payment endpoints
    admin: 20       // Admin endpoints
  },
  // CORS settings
  corsOrigins: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  // Security headers
  securityHeaders: {
    'X-DNS-Prefetch-Control': 'off',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-XSS-Protection': '1; mode=block'
  }
}

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/api/live-betting',
  '/api/challenges',
  '/api/daily-bonus',
  '/api/leaderboard',
  '/api/matches',
  '/api/monetization',
  '/api/progression',
  '/api/stripe'
]

// Admin routes that require admin privileges
const ADMIN_ROUTES = [
  '/api/admin'
]

// Rate limiting categories
const RATE_LIMIT_CATEGORIES = {
  '/api/auth': 'auth',
  '/api/live-betting': 'betting',
  '/api/stripe': 'payment',
  '/api/admin': 'admin'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Skip middleware for NextAuth routes
  if (pathname.startsWith('/api/auth/')) {
    return response
  }

  // Add security headers to all responses
  Object.entries(SECURITY_CONFIG.securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    
    // Check if origin is allowed
    if (origin && SECURITY_CONFIG.corsOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400')

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers })
    }

    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request)
    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          retryAfter: rateLimitResult.retryAfter 
        }),
        { 
          status: 429, 
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': rateLimitResult.retryAfter.toString()
          }
        }
      )
    }

    // Check if route requires authentication
    const requiresAuth = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
    const requiresAdmin = ADMIN_ROUTES.some(route => pathname.startsWith(route))

    // Get token for all API routes to enable logging
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (requiresAuth || requiresAdmin) {

      if (!token) {
        return new NextResponse(
          JSON.stringify({ error: 'Authentication required' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      // Check admin privileges
      if (requiresAdmin) {
        // In production, check user role from database
        // For now, we'll use a simple admin email check
        const isAdmin = token.email === process.env.ADMIN_EMAIL
        if (!isAdmin) {
          return new NextResponse(
            JSON.stringify({ error: 'Admin privileges required' }),
            { 
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        }
      }

      // Add user context to request headers for API routes
      response.headers.set('X-User-Id', token.id as string)
      response.headers.set('X-User-Email', token.email as string)
    }

    // Log security events
    await logSecurityEvent(request, {
      type: 'api_access',
      authenticated: !!token,
      admin: requiresAdmin,
      userAgent: request.headers.get('user-agent') || 'unknown'
    })
  }

  // Content Security Policy for pages
  if (!pathname.startsWith('/api/')) {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ].join('; ')

    response.headers.set('Content-Security-Policy', csp)
  }

  return response
}

async function applyRateLimit(request: NextRequest): Promise<{
  allowed: boolean
  retryAfter: number
}> {
  const ip = getClientIP(request)
  const pathname = request.nextUrl.pathname

  // Determine rate limit category
  let category = 'api'
  for (const [route, cat] of Object.entries(RATE_LIMIT_CATEGORIES)) {
    if (pathname.startsWith(route)) {
      category = cat
      break
    }
  }

  const limit = SECURITY_CONFIG.rateLimit[category as keyof typeof SECURITY_CONFIG.rateLimit]
  const key = `${ip}:${category}`
  const now = Date.now()
  const resetTime = Math.floor(now / 60000) * 60000 + 60000 // Next minute

  const current = rateLimitStore.get(key)

  if (!current || current.resetTime <= now) {
    // Reset or initialize
    rateLimitStore.set(key, { count: 1, resetTime })
    return { allowed: true, retryAfter: 0 }
  }

  if (current.count >= limit) {
    const retryAfter = Math.ceil((current.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }

  // Increment count
  current.count++
  rateLimitStore.set(key, current)

  return { allowed: true, retryAfter: 0 }
}

function getClientIP(request: NextRequest): string {
  // Check various headers for client IP
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')

  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  if (xRealIP) {
    return xRealIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Fallback when IP cannot be determined
  return 'unknown'
}

async function logSecurityEvent(request: NextRequest, event: {
  type: string
  authenticated: boolean
  admin: boolean
  userAgent: string
}) {
  // In production, log to a proper logging service
  if (process.env.NODE_ENV === 'development') {
    console.log('Security Event:', {
      timestamp: new Date().toISOString(),
      ip: getClientIP(request),
      pathname: request.nextUrl.pathname,
      method: request.method,
      ...event
    })
  }

  // TODO: Implement proper audit logging to database or external service
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}