import { NextResponse } from 'next/server'
import { logSecurityEvent } from './audit'
import { maskSensitiveData } from './encryption'

export interface SafeError {
  message: string
  code?: string
  statusCode: number
  timestamp: string
  requestId?: string
}

export interface ErrorContext {
  userId?: string
  ip?: string
  userAgent?: string
  endpoint?: string
  method?: string
  requestId?: string
}

/**
 * Sanitizes error messages to prevent information disclosure
 */
export function sanitizeErrorMessage(error: any, context?: ErrorContext): SafeError {
  const timestamp = new Date().toISOString()
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Default safe error
  let safeError: SafeError = {
    message: 'An unexpected error occurred',
    statusCode: 500,
    timestamp,
    requestId: context?.requestId || generateRequestId()
  }

  // Handle known error types
  if (error instanceof Error) {
    switch (error.name) {
      case 'ValidationError':
        safeError = {
          message: 'Invalid input provided',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          timestamp,
          requestId: context?.requestId
        }
        break

      case 'UnauthorizedError':
      case 'AuthenticationError':
        safeError = {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
          statusCode: 401,
          timestamp,
          requestId: context?.requestId
        }
        break

      case 'ForbiddenError':
      case 'AuthorizationError':
        safeError = {
          message: 'Access denied',
          code: 'FORBIDDEN',
          statusCode: 403,
          timestamp,
          requestId: context?.requestId
        }
        break

      case 'NotFoundError':
        safeError = {
          message: 'Resource not found',
          code: 'NOT_FOUND',
          statusCode: 404,
          timestamp,
          requestId: context?.requestId
        }
        break

      case 'RateLimitError':
        safeError = {
          message: 'Too many requests',
          code: 'RATE_LIMITED',
          statusCode: 429,
          timestamp,
          requestId: context?.requestId
        }
        break

      case 'PaymentError':
        safeError = {
          message: 'Payment processing failed',
          code: 'PAYMENT_ERROR',
          statusCode: 402,
          timestamp,
          requestId: context?.requestId
        }
        break

      case 'DatabaseError':
      case 'PrismaClientKnownRequestError':
        safeError = {
          message: 'Database operation failed',
          code: 'DATABASE_ERROR',
          statusCode: 500,
          timestamp,
          requestId: context?.requestId
        }
        break

      case 'NetworkError':
      case 'TimeoutError':
        safeError = {
          message: 'Service temporarily unavailable',
          code: 'SERVICE_UNAVAILABLE',
          statusCode: 503,
          timestamp,
          requestId: context?.requestId
        }
        break

      default:
        // For unknown errors, use generic message
        if (isDevelopment) {
          safeError.message = `Development: ${error.message}`
        }
    }
  }

  // Handle specific error messages that are safe to expose
  const safeMessages = [
    'Invalid email or password',
    'Account is locked',
    'Session expired',
    'Insufficient balance',
    'Bet amount too low',
    'Bet amount too high',
    'Match not available for betting',
    'Invalid bet selection',
    'Cash out not available'
  ]

  if (error.message && safeMessages.some(safe => error.message.includes(safe))) {
    safeError.message = error.message
  }

  // Log the actual error internally
  logInternalError(error, safeError, context)

  return safeError
}

/**
 * Creates a safe error response for API endpoints
 */
export function createErrorResponse(error: any, context?: ErrorContext): NextResponse {
  const safeError = sanitizeErrorMessage(error, context)
  
  return NextResponse.json(
    {
      error: safeError.message,
      code: safeError.code,
      timestamp: safeError.timestamp,
      requestId: safeError.requestId
    },
    { status: safeError.statusCode }
  )
}

/**
 * Logs internal errors for debugging while exposing safe messages to users
 */
async function logInternalError(
  originalError: any, 
  safeError: SafeError, 
  context?: ErrorContext
): Promise<void> {
  try {
    // Create error details for internal logging
    const errorDetails = {
      originalMessage: originalError?.message || 'Unknown error',
      originalStack: originalError?.stack,
      originalName: originalError?.name,
      safeMessage: safeError.message,
      statusCode: safeError.statusCode,
      context: maskSensitiveData(context || {}),
      timestamp: safeError.timestamp,
      requestId: safeError.requestId
    }

    // Log to security audit system
    await logSecurityEvent({
      type: 'security_violation',
      action: 'error_occurred',
      userId: context?.userId,
      ip: context?.ip,
      userAgent: context?.userAgent,
      resource: context?.endpoint,
      details: errorDetails,
      severity: determineSeverity(originalError, safeError.statusCode),
      outcome: 'failure'
    })

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Internal Error:', errorDetails)
    }

  } catch (loggingError) {
    // Fallback logging if audit system fails
    console.error('Failed to log error:', loggingError)
    console.error('Original error:', originalError)
  }
}

/**
 * Determines error severity based on error type and status code
 */
function determineSeverity(error: any, statusCode: number): 'low' | 'medium' | 'high' | 'critical' {
  // Critical errors
  if (statusCode >= 500 || error?.name === 'DatabaseError') {
    return 'critical'
  }

  // High severity errors
  if (statusCode === 401 || statusCode === 403 || error?.name === 'SecurityError') {
    return 'high'
  }

  // Medium severity errors
  if (statusCode >= 400 || error?.name === 'ValidationError') {
    return 'medium'
  }

  // Low severity
  return 'low'
}

/**
 * Generates a unique request ID for error tracking
 */
function generateRequestId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2)
  return `req_${timestamp}_${random}`
}

/**
 * Wraps API route handlers with error handling
 */
export function withErrorHandling(
  handler: (request: Request, context?: any) => Promise<Response | NextResponse>
) {
  return async (request: Request, context?: any) => {
    const requestId = generateRequestId()
    const errorContext: ErrorContext = {
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      endpoint: new URL(request.url).pathname,
      method: request.method,
      requestId
    }

    try {
      // Add request ID to response headers
      const response = await handler(request, { ...context, requestId })
      
      if (response instanceof NextResponse) {
        response.headers.set('X-Request-Id', requestId)
      }
      
      return response
    } catch (error) {
      return createErrorResponse(error, errorContext)
    }
  }
}

/**
 * Custom error classes for better error handling
 */
export class BettingError extends Error {
  statusCode: number
  code: string

  constructor(message: string, statusCode: number = 400, code: string = 'BETTING_ERROR') {
    super(message)
    this.name = 'BettingError'
    this.statusCode = statusCode
    this.code = code
  }
}

export class PaymentError extends Error {
  statusCode: number
  code: string

  constructor(message: string, statusCode: number = 402, code: string = 'PAYMENT_ERROR') {
    super(message)
    this.name = 'PaymentError'
    this.statusCode = statusCode
    this.code = code
  }
}

export class SecurityError extends Error {
  statusCode: number
  code: string

  constructor(message: string, statusCode: number = 403, code: string = 'SECURITY_ERROR') {
    super(message)
    this.name = 'SecurityError'
    this.statusCode = statusCode
    this.code = code
  }
}

export class RateLimitError extends Error {
  statusCode: number = 429
  code: string = 'RATE_LIMITED'
  retryAfter?: number

  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super(message)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

/**
 * Validates and throws appropriate errors for betting operations
 */
export function validateBettingOperation(
  operation: 'place_bet' | 'cash_out' | 'view_bets',
  data?: any
): void {
  switch (operation) {
    case 'place_bet':
      if (!data?.stake || data.stake < 1) {
        throw new BettingError('Minimum bet amount is 1 bet point')
      }
      if (data.stake > 10000) {
        throw new BettingError('Maximum bet amount is 10,000 bet points')
      }
      if (!data?.odds || data.odds < 100) {
        throw new BettingError('Invalid odds provided')
      }
      break

    case 'cash_out':
      if (!data?.betId) {
        throw new BettingError('Bet ID is required for cash out')
      }
      break

    default:
      // Generic validation passed
      break
  }
}

/**
 * Global error boundary for unhandled errors
 */
export class GlobalErrorHandler {
  static async handleUnhandledError(error: any, context?: ErrorContext): Promise<void> {
    const safeError = sanitizeErrorMessage(error, context)
    
    // Log critical unhandled errors
    await logSecurityEvent({
      type: 'security_violation',
      action: 'unhandled_error',
      userId: context?.userId,
      ip: context?.ip,
      details: {
        error: error?.message || 'Unknown error',
        stack: error?.stack,
        context: maskSensitiveData(context || {})
      },
      severity: 'critical',
      outcome: 'failure'
    })

    // In production, you might want to send alerts to monitoring services
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send alert to monitoring service (e.g., Sentry, DataDog)
      console.error('CRITICAL UNHANDLED ERROR:', safeError)
    }
  }
}

// Set up global error handlers
if (typeof window === 'undefined') {
  // Server-side error handling
  process.on('unhandledRejection', (reason, promise) => {
    GlobalErrorHandler.handleUnhandledError(reason, {
      endpoint: 'unhandledRejection',
      method: 'PROMISE'
    })
  })

  process.on('uncaughtException', (error) => {
    GlobalErrorHandler.handleUnhandledError(error, {
      endpoint: 'uncaughtException',
      method: 'EXCEPTION'
    })
    // Exit after logging to prevent unstable state
    process.exit(1)
  })
}