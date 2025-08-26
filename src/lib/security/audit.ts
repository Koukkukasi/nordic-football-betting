import { PrismaClient } from '@prisma/client'
import { headers } from 'next/headers'
import { getServerSession } from 'next-auth'
import { SecurityEventData } from '../validation/schemas'
import { maskSensitiveData } from './encryption'

const prisma = new PrismaClient()

export interface AuditEvent {
  type: 'authentication' | 'authorization' | 'data_access' | 'payment' | 'admin_action' | 'security_violation'
  action: string
  userId?: string
  ip?: string
  userAgent?: string
  resource?: string
  details?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  outcome: 'success' | 'failure' | 'blocked'
}

/**
 * Logs security events to database and external systems
 */
export async function logSecurityEvent(event: AuditEvent): Promise<void> {
  try {
    const timestamp = new Date()
    
    // Log to database
    await prisma.auditLog.create({
      data: {
        type: event.type,
        action: event.action,
        userId: event.userId,
        ip: event.ip || 'unknown',
        userAgent: event.userAgent,
        resource: event.resource,
        details: event.details ? JSON.stringify(maskSensitiveData(event.details)) : null,
        severity: event.severity,
        outcome: event.outcome,
        timestamp
      }
    })

    // Log critical events immediately to external monitoring
    if (event.severity === 'critical') {
      await alertExternalSystems(event)
    }

    // Console logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUDIT] ${timestamp.toISOString()}`, {
        type: event.type,
        action: event.action,
        severity: event.severity,
        outcome: event.outcome,
        details: maskSensitiveData(event.details || {})
      })
    }

  } catch (error) {
    console.error('Failed to log security event:', error)
    
    // Fallback logging to file system or external service
    await fallbackLogging(event, error)
  }
}

/**
 * Logs authentication events
 */
export async function logAuthEvent(
  action: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'password_reset' | 'account_locked',
  userId?: string,
  details?: Record<string, any>
): Promise<void> {
  const headersList = headers()
  const ip = getClientIP(headersList)
  const userAgent = headersList.get('user-agent')

  await logSecurityEvent({
    type: 'authentication',
    action,
    userId,
    ip,
    userAgent,
    details,
    severity: action.includes('failure') || action.includes('locked') ? 'medium' : 'low',
    outcome: action.includes('success') ? 'success' : action.includes('failure') ? 'failure' : 'success'
  })
}

/**
 * Logs betting-related events
 */
export async function logBettingEvent(
  action: 'bet_placed' | 'bet_cancelled' | 'cash_out' | 'odds_manipulation' | 'suspicious_betting',
  userId: string,
  details?: Record<string, any>
): Promise<void> {
  const headersList = headers()
  const ip = getClientIP(headersList)

  await logSecurityEvent({
    type: 'data_access',
    action,
    userId,
    ip,
    resource: 'betting_system',
    details,
    severity: action.includes('suspicious') || action.includes('manipulation') ? 'high' : 'low',
    outcome: action.includes('suspicious') ? 'blocked' : 'success'
  })
}

/**
 * Logs payment events
 */
export async function logPaymentEvent(
  action: 'payment_attempt' | 'payment_success' | 'payment_failure' | 'refund' | 'chargeback' | 'fraud_detected',
  userId?: string,
  details?: Record<string, any>
): Promise<void> {
  const headersList = headers()
  const ip = getClientIP(headersList)

  await logSecurityEvent({
    type: 'payment',
    action,
    userId,
    ip,
    resource: 'payment_system',
    details: maskSensitiveData(details || {}),
    severity: action.includes('fraud') ? 'critical' : action.includes('failure') ? 'medium' : 'low',
    outcome: action.includes('success') ? 'success' : action.includes('fraud') ? 'blocked' : 'failure'
  })
}

/**
 * Logs admin actions
 */
export async function logAdminAction(
  action: string,
  adminUserId: string,
  targetResource?: string,
  details?: Record<string, any>
): Promise<void> {
  const headersList = headers()
  const ip = getClientIP(headersList)

  await logSecurityEvent({
    type: 'admin_action',
    action,
    userId: adminUserId,
    ip,
    resource: targetResource,
    details,
    severity: 'medium',
    outcome: 'success'
  })
}

/**
 * Logs security violations
 */
export async function logSecurityViolation(
  violation: 'rate_limit_exceeded' | 'unauthorized_access' | 'sql_injection_attempt' | 'xss_attempt' | 'csrf_token_invalid',
  details?: Record<string, any>
): Promise<void> {
  const headersList = headers()
  const ip = getClientIP(headersList)
  const userAgent = headersList.get('user-agent')

  const session = await getServerSession()
  const userId = session?.user?.id

  await logSecurityEvent({
    type: 'security_violation',
    action: violation,
    userId,
    ip,
    userAgent,
    details,
    severity: violation.includes('injection') || violation.includes('xss') ? 'critical' : 'high',
    outcome: 'blocked'
  })

  // Auto-block IP for critical violations
  if (violation.includes('injection') || violation.includes('xss')) {
    await blockSuspiciousIP(ip)
  }
}

/**
 * Tracks failed login attempts and implements account lockout
 */
export async function trackFailedLogin(email: string, ip: string): Promise<boolean> {
  const now = new Date()
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

  try {
    // Count recent failed attempts for this email
    const emailFailures = await prisma.auditLog.count({
      where: {
        action: 'login_failure',
        details: {
          path: ['email'],
          equals: email
        },
        timestamp: {
          gte: fiveMinutesAgo
        }
      }
    })

    // Count recent failed attempts from this IP
    const ipFailures = await prisma.auditLog.count({
      where: {
        action: 'login_failure',
        ip,
        timestamp: {
          gte: fiveMinutesAgo
        }
      }
    })

    // Lock account if too many failures
    const shouldLock = emailFailures >= 5 || ipFailures >= 10

    if (shouldLock) {
      await logAuthEvent('account_locked', undefined, {
        email,
        ip,
        emailFailures,
        ipFailures
      })

      // Create lockout record
      await prisma.accountLockout.upsert({
        where: { email },
        create: {
          email,
          lockedUntil: new Date(now.getTime() + 15 * 60 * 1000), // 15 minutes
          attempts: emailFailures + 1
        },
        update: {
          lockedUntil: new Date(now.getTime() + 15 * 60 * 1000),
          attempts: {
            increment: 1
          }
        }
      })
    }

    return shouldLock

  } catch (error) {
    console.error('Error tracking failed login:', error)
    return false
  }
}

/**
 * Checks if account is currently locked
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  try {
    const lockout = await prisma.accountLockout.findUnique({
      where: { email }
    })

    if (!lockout) return false

    // Check if lockout has expired
    if (lockout.lockedUntil < new Date()) {
      // Remove expired lockout
      await prisma.accountLockout.delete({
        where: { email }
      })
      return false
    }

    return true

  } catch (error) {
    console.error('Error checking account lock:', error)
    return false
  }
}

/**
 * Blocks suspicious IP addresses
 */
async function blockSuspiciousIP(ip: string): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.blockedIP.upsert({
      where: { ip },
      create: {
        ip,
        reason: 'Security violation detected',
        expiresAt
      },
      update: {
        expiresAt,
        reason: 'Repeated security violations'
      }
    })

  } catch (error) {
    console.error('Error blocking IP:', error)
  }
}

/**
 * Checks if IP is blocked
 */
export async function isIPBlocked(ip: string): Promise<boolean> {
  try {
    const blocked = await prisma.blockedIP.findUnique({
      where: { ip }
    })

    if (!blocked) return false

    // Check if block has expired
    if (blocked.expiresAt < new Date()) {
      await prisma.blockedIP.delete({
        where: { ip }
      })
      return false
    }

    return true

  } catch (error) {
    console.error('Error checking IP block:', error)
    return false
  }
}

/**
 * Generates security reports
 */
export async function generateSecurityReport(
  startDate: Date,
  endDate: Date
): Promise<SecurityReport> {
  try {
    const events = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    const report: SecurityReport = {
      period: { start: startDate, end: endDate },
      summary: {
        totalEvents: events.length,
        criticalEvents: events.filter(e => e.severity === 'critical').length,
        highEvents: events.filter(e => e.severity === 'high').length,
        failedLogins: events.filter(e => e.action === 'login_failure').length,
        blockedAttempts: events.filter(e => e.outcome === 'blocked').length
      },
      topViolations: getTopViolations(events),
      suspiciousIPs: await getSuspiciousIPs(startDate, endDate),
      recommendations: generateSecurityRecommendations(events)
    }

    return report

  } catch (error) {
    console.error('Error generating security report:', error)
    throw new Error('Failed to generate security report')
  }
}

function getClientIP(headersList: Headers): string {
  return headersList.get('x-forwarded-for')?.split(',')[0] ||
         headersList.get('x-real-ip') ||
         headersList.get('cf-connecting-ip') ||
         'unknown'
}

async function alertExternalSystems(event: AuditEvent): Promise<void> {
  // TODO: Implement alerts to external monitoring systems
  // Examples: Slack, Discord, email alerts, SIEM systems
  console.error('CRITICAL SECURITY EVENT:', event)
}

async function fallbackLogging(event: AuditEvent, error: any): Promise<void> {
  // TODO: Implement fallback logging to file system or external service
  console.error('Audit logging failed:', error, event)
}

function getTopViolations(events: any[]): Array<{ type: string; count: number }> {
  const violations = events
    .filter(e => e.type === 'security_violation')
    .reduce((acc, event) => {
      acc[event.action] = (acc[event.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  return Object.entries(violations)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

async function getSuspiciousIPs(startDate: Date, endDate: Date): Promise<string[]> {
  const suspiciousEvents = await prisma.auditLog.groupBy({
    by: ['ip'],
    where: {
      timestamp: {
        gte: startDate,
        lte: endDate
      },
      OR: [
        { severity: 'critical' },
        { outcome: 'blocked' },
        { action: 'login_failure' }
      ]
    },
    _count: {
      ip: true
    },
    having: {
      ip: {
        _count: {
          gt: 5 // More than 5 suspicious events
        }
      }
    }
  })

  return suspiciousEvents.map(event => event.ip)
}

function generateSecurityRecommendations(events: any[]): string[] {
  const recommendations: string[] = []
  
  const failedLogins = events.filter(e => e.action === 'login_failure').length
  if (failedLogins > 100) {
    recommendations.push('High number of failed login attempts detected. Consider implementing CAPTCHA.')
  }

  const criticalEvents = events.filter(e => e.severity === 'critical').length
  if (criticalEvents > 0) {
    recommendations.push('Critical security events detected. Review and address immediately.')
  }

  const uniqueIPs = new Set(events.map(e => e.ip)).size
  if (uniqueIPs > events.length * 0.8) {
    recommendations.push('High IP diversity suggests potential bot activity. Consider rate limiting.')
  }

  return recommendations
}

export interface SecurityReport {
  period: { start: Date; end: Date }
  summary: {
    totalEvents: number
    criticalEvents: number
    highEvents: number
    failedLogins: number
    blockedAttempts: number
  }
  topViolations: Array<{ type: string; count: number }>
  suspiciousIPs: string[]
  recommendations: string[]
}