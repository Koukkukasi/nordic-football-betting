import { environmentSchema, EnvironmentData } from '../validation/schemas'
import { generateJWTSecret, generateSecureToken } from './encryption'
import { z } from 'zod'

/**
 * Validates environment variables on startup
 */
export function validateEnvironment(): EnvironmentData {
  try {
    const env = {
      NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      DATABASE_URL: process.env.DATABASE_URL,
      DIRECT_URL: process.env.DIRECT_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY
    }

    const result = environmentSchema.safeParse(env)

    if (!result.success) {
      console.error('Environment validation failed:')
      result.error.errors.forEach(error => {
        console.error(`  ${error.path.join('.')}: ${error.message}`)
      })
      throw new Error('Invalid environment configuration')
    }

    return result.data
  } catch (error) {
    console.error('Environment validation error:', error)
    throw error
  }
}

/**
 * Checks for insecure environment configurations
 */
export function checkSecurityConfiguration(): SecurityCheck[] {
  const warnings: SecurityCheck[] = []
  const errors: SecurityCheck[] = []

  // Check for development secrets in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXTAUTH_SECRET === 'your-secret-key-here' || 
        !process.env.NEXTAUTH_SECRET || 
        process.env.NEXTAUTH_SECRET.length < 32) {
      errors.push({
        type: 'error',
        category: 'authentication',
        message: 'NEXTAUTH_SECRET is not set to a secure value in production',
        recommendation: 'Generate a secure random secret with at least 32 characters'
      })
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      errors.push({
        type: 'error',
        category: 'payment',
        message: 'STRIPE_WEBHOOK_SECRET is not configured',
        recommendation: 'Configure webhook secret from Stripe dashboard'
      })
    }

    if (process.env.ADMIN_PASSWORD === 'your-admin-password-here') {
      errors.push({
        type: 'error',
        category: 'authentication',
        message: 'Default admin password is still in use',
        recommendation: 'Change the default admin password immediately'
      })
    }
  }

  // Check database URL security
  if (process.env.DATABASE_URL?.includes('localhost') && process.env.NODE_ENV === 'production') {
    warnings.push({
      type: 'warning',
      category: 'database',
      message: 'Using localhost database in production',
      recommendation: 'Use a proper production database service'
    })
  }

  // Check for missing encryption key
  if (!process.env.ENCRYPTION_KEY) {
    warnings.push({
      type: 'warning',
      category: 'encryption',
      message: 'ENCRYPTION_KEY not set, using generated key',
      recommendation: 'Set a permanent encryption key for data consistency'
    })
  }

  // Check CORS configuration
  if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_URL) {
    errors.push({
      type: 'error',
      category: 'cors',
      message: 'NEXTAUTH_URL not configured for production',
      recommendation: 'Set NEXTAUTH_URL to your production domain'
    })
  }

  // Check for exposed secrets in environment
  const exposedSecrets = checkExposedSecrets()
  errors.push(...exposedSecrets)

  return [...errors, ...warnings]
}

/**
 * Generates secure environment variables
 */
export function generateSecureEnvironment(): Partial<EnvironmentData> {
  return {
    NEXTAUTH_SECRET: generateJWTSecret(),
    ENCRYPTION_KEY: generateSecureToken(32) // 32 bytes = 64 hex chars
  }
}

/**
 * Checks for accidentally exposed secrets
 */
function checkExposedSecrets(): SecurityCheck[] {
  const checks: SecurityCheck[] = []

  // Check if any secret values are exposed in client-side environment
  const clientEnvVars = Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
  
  const sensitivePatterns = [
    /secret/i,
    /key.*private/i,
    /password/i,
    /token.*secret/i,
    /webhook.*secret/i
  ]

  clientEnvVars.forEach(envVar => {
    if (sensitivePatterns.some(pattern => pattern.test(envVar))) {
      checks.push({
        type: 'error',
        category: 'exposure',
        message: `Potentially sensitive environment variable exposed to client: ${envVar}`,
        recommendation: 'Remove NEXT_PUBLIC_ prefix from sensitive environment variables'
      })
    }
  })

  // Check for common insecure values
  const insecureValues = [
    'password',
    '123456',
    'secret',
    'changeme',
    'admin',
    'test',
    'development'
  ]

  Object.entries(process.env).forEach(([key, value]) => {
    if (value && insecureValues.includes(value.toLowerCase())) {
      checks.push({
        type: 'error',
        category: 'weak_secret',
        message: `Weak or default value detected for ${key}`,
        recommendation: 'Use a strong, randomly generated value'
      })
    }
  })

  return checks
}

/**
 * Validates runtime environment security
 */
export function validateRuntimeSecurity(): RuntimeSecurityCheck {
  const checks: RuntimeSecurityCheck = {
    https: false,
    secureHeaders: false,
    rateLimit: false,
    authentication: false,
    csrf: false,
    warnings: []
  }

  // Check HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXTAUTH_URL?.startsWith('https://')) {
      checks.warnings.push('HTTPS not enforced in production environment')
    } else {
      checks.https = true
    }
  }

  // Check authentication configuration
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length >= 32) {
    checks.authentication = true
  }

  // Additional runtime checks would be performed here
  // These would typically be done by the middleware

  return checks
}

/**
 * Creates a security configuration checklist
 */
export function createSecurityChecklist(): SecurityChecklist {
  const env = process.env.NODE_ENV

  return {
    environment: env || 'unknown',
    items: [
      {
        category: 'Authentication',
        items: [
          { 
            name: 'Secure NEXTAUTH_SECRET', 
            required: true, 
            completed: !!(process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length >= 32),
            description: 'JWT secret key with at least 32 characters'
          },
          { 
            name: 'Admin credentials changed', 
            required: true, 
            completed: process.env.ADMIN_PASSWORD !== 'your-admin-password-here',
            description: 'Default admin password has been changed'
          },
          { 
            name: 'Session configuration', 
            required: true, 
            completed: !!process.env.NEXTAUTH_URL,
            description: 'NextAuth URL properly configured'
          }
        ]
      },
      {
        category: 'Database',
        items: [
          { 
            name: 'Database URL configured', 
            required: true, 
            completed: !!process.env.DATABASE_URL,
            description: 'Primary database connection string'
          },
          { 
            name: 'Direct URL configured', 
            required: true, 
            completed: !!process.env.DIRECT_URL,
            description: 'Direct database connection for migrations'
          },
          { 
            name: 'Production database', 
            required: env === 'production', 
            completed: env !== 'production' || !process.env.DATABASE_URL?.includes('localhost'),
            description: 'Using production database service'
          }
        ]
      },
      {
        category: 'Payment Security',
        items: [
          { 
            name: 'Stripe secret key', 
            required: true, 
            completed: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')),
            description: 'Valid Stripe secret key configured'
          },
          { 
            name: 'Webhook secret', 
            required: true, 
            completed: !!(process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')),
            description: 'Stripe webhook signature verification'
          }
        ]
      },
      {
        category: 'Data Protection',
        items: [
          { 
            name: 'Encryption key', 
            required: false, 
            completed: !!(process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length >= 64),
            description: 'Encryption key for sensitive data'
          },
          { 
            name: 'Supabase configuration', 
            required: true, 
            completed: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
            description: 'Supabase connection properly configured'
          }
        ]
      },
      {
        category: 'Production Security',
        items: [
          { 
            name: 'HTTPS enforced', 
            required: env === 'production', 
            completed: env !== 'production' || (process.env.NEXTAUTH_URL?.startsWith('https://') ?? false),
            description: 'All connections use HTTPS'
          },
          { 
            name: 'No exposed secrets', 
            required: true, 
            completed: checkExposedSecrets().length === 0,
            description: 'No sensitive data in client environment'
          }
        ]
      }
    ]
  }
}


/**
 * Rotates environment secrets (use with caution)
 */
export async function rotateSecrets(): Promise<SecretRotationResult> {
  console.warn('Secret rotation is a sensitive operation. Ensure you have backups.')
  
  const newSecrets = generateSecureEnvironment()
  
  return {
    rotated: Object.keys(newSecrets),
    newValues: newSecrets,
    warning: 'Update your deployment with these new values and restart the application'
  }
}

// Type definitions
export interface SecurityCheck {
  type: 'warning' | 'error'
  category: 'authentication' | 'database' | 'payment' | 'encryption' | 'cors' | 'exposure' | 'weak_secret'
  message: string
  recommendation: string
}

export interface RuntimeSecurityCheck {
  https: boolean
  secureHeaders: boolean
  rateLimit: boolean
  authentication: boolean
  csrf: boolean
  warnings: string[]
}

export interface SecurityChecklist {
  environment: string
  items: Array<{
    category: string
    items: Array<{
      name: string
      required: boolean
      completed: boolean
      description: string
    }>
  }>
}

export interface SecretRotationResult {
  rotated: string[]
  newValues: Partial<EnvironmentData>
  warning: string
}