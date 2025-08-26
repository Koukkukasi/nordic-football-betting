import { z } from 'zod'

// Base validation helpers
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>\"'&]/g, (match) => {
    const entityMap: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    }
    return entityMap[match] || match
  })
}

// Common field validations
const positiveNumber = z.number().positive()
const nonNegativeNumber = z.number().nonnegative()
const safeString = z.string().min(1).max(1000).transform(sanitizeString)
const email = z.string().email().max(320)
const uuid = z.string().uuid()

// Authentication schemas
export const loginSchema = z.object({
  email: email,
  password: z.string().min(8).max(128),
  rememberMe: z.boolean().optional().default(false)
})

export const registerSchema = z.object({
  email: email,
  password: z.string().min(8).max(128).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  ),
  username: z.string().min(3).max(50).regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores, and hyphens'
  ).transform(sanitizeString),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  age: z.number().min(18, 'You must be at least 18 years old to register')
})

// Betting schemas
export const placeBetSchema = z.object({
  matchId: uuid,
  market: z.enum(['match_result', 'both_teams_score', 'total_goals', 'asian_handicap', 'correct_score']),
  selection: safeString.max(100),
  odds: z.number().positive().min(100).max(10000), // Stored as integers (100 = 1.00)
  stake: z.number().positive().min(1).max(10000),
  enhancedOdds: z.number().positive().min(100).max(15000).optional(),
  diamondBoost: z.boolean().optional().default(false)
})

export const liveBetSchema = z.object({
  matchId: uuid,
  market: z.enum(['match_result', 'next_goal', 'total_goals', 'both_teams_score', 'correct_score']),
  selection: safeString.max(100),
  odds: z.number().positive().min(100).max(10000),
  stake: z.number().positive().min(1).max(10000),
  enhancedOdds: z.number().positive().min(100).max(15000).optional(),
  placedAtMinute: z.number().nonnegative().max(90).optional()
})

export const cashOutSchema = z.object({
  betId: uuid,
  amount: z.number().positive().min(1)
})

// Payment schemas
export const stripeCheckoutSchema = z.object({
  priceId: z.string().startsWith('price_'),
  userId: uuid,
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
})

export const stripeWebhookSchema = z.object({
  id: z.string(),
  object: z.literal('event'),
  type: z.string(),
  data: z.object({
    object: z.record(z.any())
  }),
  created: z.number(),
  livemode: z.boolean(),
  api_version: z.string()
})

// User management schemas
export const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores, and hyphens'
  ).transform(sanitizeString).optional(),
  favoriteTeam: uuid.optional(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean()
  }).optional(),
  language: z.enum(['fi', 'sv', 'en']).optional(),
  timezone: z.string().max(50).optional()
})

// Admin schemas
export const adminActionSchema = z.object({
  action: z.enum(['generate_content', 'reset_matches', 'update_odds', 'manage_users', 'system_config']),
  parameters: z.record(z.any()).optional(),
  reason: safeString.min(10).max(500)
})

export const userModerationSchema = z.object({
  userId: uuid,
  action: z.enum(['suspend', 'ban', 'warn', 'restrict', 'unrestrict']),
  duration: z.number().positive().optional(), // Duration in hours
  reason: safeString.min(10).max(500)
})

// Challenge and progression schemas
export const claimRewardSchema = z.object({
  rewardId: uuid,
  type: z.enum(['daily_bonus', 'achievement', 'challenge', 'level_up']),
  expectedAmount: z.number().positive().optional()
})

export const watchAdSchema = z.object({
  adId: safeString.max(100),
  duration: z.number().positive().min(15).max(60),
  rewardType: z.enum(['betpoints', 'diamonds', 'xp'])
})

// Leaderboard schemas
export const leaderboardQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'all_time']).default('weekly'),
  limit: z.number().positive().max(100).default(50),
  offset: z.number().nonnegative().default(0),
  type: z.enum(['winnings', 'bets_placed', 'win_rate', 'streak']).default('winnings')
})

// Match and odds schemas
export const matchQuerySchema = z.object({
  league: z.string().max(100).optional(),
  status: z.enum(['scheduled', 'live', 'finished']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.number().positive().max(100).default(20),
  offset: z.number().nonnegative().default(0)
})

export const oddsUpdateSchema = z.object({
  matchId: uuid,
  market: z.string().max(100),
  odds: z.record(z.number().positive().min(100).max(10000)),
  timestamp: z.number().positive()
})

// Validation middleware helper
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: Request): Promise<{ success: true; data: T } | { success: false; errors: string[] }> => {
    try {
      let body: any
      
      if (request.method !== 'GET') {
        try {
          body = await request.json()
        } catch (error) {
          return {
            success: false,
            errors: ['Invalid JSON in request body']
          }
        }
      } else {
        const url = new URL(request.url)
        body = Object.fromEntries(url.searchParams)
      }

      const result = await schema.safeParseAsync(body)
      
      if (!result.success) {
        return {
          success: false,
          errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        }
      }

      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      return {
        success: false,
        errors: ['Validation error occurred']
      }
    }
  }
}

// Rate limiting validation
export const rateLimitInfoSchema = z.object({
  ip: z.string().ip(),
  userId: uuid.optional(),
  endpoint: z.string().max(200),
  timestamp: z.number().positive()
})

// Security event schemas
export const securityEventSchema = z.object({
  type: z.enum([
    'failed_login',
    'suspicious_activity', 
    'rate_limit_exceeded',
    'unauthorized_access',
    'data_breach_attempt',
    'admin_action'
  ]),
  userId: uuid.optional(),
  ip: z.string().max(45), // IPv6 max length
  userAgent: z.string().max(500).optional(),
  details: z.record(z.any()).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  timestamp: z.number().positive()
})

// Environment validation schema
export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(100),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  ADMIN_EMAIL: z.string().email().optional(),
  ENCRYPTION_KEY: z.string().length(64).optional() // 32 bytes hex encoded
})

export type LoginData = z.infer<typeof loginSchema>
export type RegisterData = z.infer<typeof registerSchema>
export type PlaceBetData = z.infer<typeof placeBetSchema>
export type LiveBetData = z.infer<typeof liveBetSchema>
export type CashOutData = z.infer<typeof cashOutSchema>
export type StripeCheckoutData = z.infer<typeof stripeCheckoutSchema>
export type UpdateProfileData = z.infer<typeof updateProfileSchema>
export type AdminActionData = z.infer<typeof adminActionSchema>
export type SecurityEventData = z.infer<typeof securityEventSchema>
export type EnvironmentData = z.infer<typeof environmentSchema>