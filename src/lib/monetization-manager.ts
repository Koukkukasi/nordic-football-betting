// Monetization Manager - Ethical F2P Economy Balancing System
// Ensures generous free experience while providing optional value

import { VipTier } from './vip-system'
import { AdType } from './ad-system'

export interface UserEconomyProfile {
  userId: string
  betPoints: number
  diamonds: number
  level: number
  vipTier: VipTier
  vipExpiresAt: Date | null
  
  // Behavioral metrics
  totalBets: number
  totalWins: number
  winRate: number
  avgStakeSize: number
  daysActive: number
  loginStreak: number
  lastLogin: Date
  
  // Monetization metrics
  totalPurchases: number
  lifetimeValue: number
  adWatchesToday: number
  emergencyGrantsUsed: number
  lastEmergencyGrant: Date | null
  
  // Engagement metrics
  challengesCompleted: number
  achievementsUnlocked: number
  socialShares: number
  sessionLengthAvg: number
}

export interface EconomyHealthCheck {
  currencyStatus: 'healthy' | 'low' | 'critical'
  recommendations: EconomyRecommendation[]
  emergencyActions: EmergencyAction[]
  purchaseIncentives: PurchaseIncentive[]
  retentionRisk: 'low' | 'medium' | 'high'
}

export interface EconomyRecommendation {
  type: 'ad_opportunity' | 'daily_bonus' | 'challenge_focus' | 'vip_suggestion'
  priority: 'low' | 'medium' | 'high'
  title: string
  description: string
  actionData?: any
}

export interface EmergencyAction {
  type: 'emergency_grant' | 'free_diamonds' | 'bonus_offer'
  triggered: boolean
  reason: string
  amount: { betPoints: number; diamonds: number }
  cooldown: number // hours
}

export interface PurchaseIncentive {
  productId: string
  trigger: string
  discount?: number
  bonusItems?: { betPoints: number; diamonds: number }
  validUntil: Date
  priority: 'low' | 'medium' | 'high'
}

// Economy health assessment
export function assessEconomyHealth(profile: UserEconomyProfile): EconomyHealthCheck {
  const recommendations: EconomyRecommendation[] = []
  const emergencyActions: EmergencyAction[] = []
  const purchaseIncentives: PurchaseIncentive[] = []
  
  // Currency status assessment
  let currencyStatus: 'healthy' | 'low' | 'critical'
  
  if (profile.betPoints < 50) {
    currencyStatus = 'critical'
  } else if (profile.betPoints < 500) {
    currencyStatus = 'low'
  } else {
    currencyStatus = 'healthy'
  }
  
  // Generate recommendations based on currency status
  if (currencyStatus === 'critical') {
    // Emergency recommendations
    recommendations.push({
      type: 'ad_opportunity',
      priority: 'high',
      title: 'Watch an Ad for Emergency BP',
      description: 'Get 500 BetPoints instantly by watching a short ad',
      actionData: { adType: 'EMERGENCY_BETPOINTS' }
    })
    
    // Emergency grant if user hasn't used too many
    if (profile.emergencyGrantsUsed < 3) {
      emergencyActions.push({
        type: 'emergency_grant',
        triggered: true,
        reason: 'Critical low balance - first time user help',
        amount: { betPoints: 1000, diamonds: 10 },
        cooldown: 24
      })
    }
  }
  
  if (currencyStatus === 'low') {
    recommendations.push({
      type: 'challenge_focus',
      priority: 'medium',
      title: 'Complete Daily Challenges',
      description: 'Earn up to 1500 BP from today\'s challenges',
    })
    
    recommendations.push({
      type: 'daily_bonus',
      priority: 'medium',
      title: 'Login Streak Bonus',
      description: `Keep your ${profile.loginStreak}-day streak going for bonus rewards!`,
    })
  }
  
  // VIP suggestions (non-pushy)
  if (shouldSuggestVip(profile)) {
    const vipSuggestion = generateVipSuggestion(profile)
    if (vipSuggestion) {
      recommendations.push(vipSuggestion)
    }
  }
  
  // Purchase incentives (only for engaged users)
  if (shouldOfferPurchaseIncentive(profile)) {
    const incentive = generatePurchaseIncentive(profile)
    if (incentive) {
      purchaseIncentives.push(incentive)
    }
  }
  
  // Retention risk assessment
  const retentionRisk = assessRetentionRisk(profile)
  
  return {
    currencyStatus,
    recommendations: recommendations.slice(0, 3), // Limit to prevent overwhelm
    emergencyActions,
    purchaseIncentives,
    retentionRisk
  }
}

// Check if user should see VIP suggestion
function shouldSuggestVip(profile: UserEconomyProfile): boolean {
  // Only suggest VIP to engaged free users
  if (profile.vipTier !== 'FREE') return false
  if (profile.daysActive < 7) return false
  if (profile.totalBets < 20) return false
  
  // Don't suggest too frequently
  const daysSinceLastLogin = Math.floor((Date.now() - profile.lastLogin.getTime()) / (1000 * 60 * 60 * 24))
  if (daysSinceLastLogin > 3) return false
  
  return true
}

// Generate contextual VIP suggestion
function generateVipSuggestion(profile: UserEconomyProfile): EconomyRecommendation | null {
  // High-activity user
  if (profile.totalBets > 100 && profile.winRate > 0.4) {
    return {
      type: 'vip_suggestion',
      priority: 'low',
      title: 'VIP Membership Available',
      description: 'Your betting skill deserves VIP rewards - monthly bonuses and better ad rewards!',
      actionData: { suggestedTier: 'VIP_MONTHLY' }
    }
  }
  
  // Regular player with good engagement
  if (profile.loginStreak >= 7 && profile.challengesCompleted > 10) {
    return {
      type: 'vip_suggestion',
      priority: 'low',
      title: 'Loyal Player Benefits',
      description: 'VIP membership rewards loyal players like you with exclusive bonuses',
      actionData: { suggestedTier: 'VIP_MONTHLY' }
    }
  }
  
  return null
}

// Check if user should see purchase incentive
function shouldOfferPurchaseIncentive(profile: UserEconomyProfile): boolean {
  // Only for engaged users
  if (profile.daysActive < 14) return false
  if (profile.totalBets < 50) return false
  
  // Not too frequently for free users
  if (profile.vipTier === 'FREE' && profile.totalPurchases === 0) {
    // First-time purchase offer only for very engaged users
    return profile.level >= 5 && profile.loginStreak >= 10
  }
  
  // Existing VIP customers - occasional offers
  if (profile.totalPurchases > 0) {
    const daysSinceLastLogin = Math.floor((Date.now() - profile.lastLogin.getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceLastLogin < 2 && Math.random() < 0.1 // 10% chance for active customers
  }
  
  return false
}

// Generate purchase incentive
function generatePurchaseIncentive(profile: UserEconomyProfile): PurchaseIncentive | null {
  // First-time buyer incentive
  if (profile.totalPurchases === 0) {
    return {
      productId: 'STARTER_PACK',
      trigger: 'first_time_buyer',
      discount: 20, // 20% off first purchase
      bonusItems: { betPoints: 1000, diamonds: 20 },
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      priority: 'low'
    }
  }
  
  // VIP renewal incentive
  if (profile.vipTier !== 'FREE' && profile.vipExpiresAt) {
    const daysUntilExpiry = Math.ceil((profile.vipExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysUntilExpiry <= 3) {
      return {
        productId: profile.vipTier,
        trigger: 'vip_renewal',
        bonusItems: { betPoints: 2000, diamonds: 50 },
        validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        priority: 'medium'
      }
    }
  }
  
  return null
}

// Assess user retention risk
function assessRetentionRisk(profile: UserEconomyProfile): 'low' | 'medium' | 'high' {
  const daysSinceLastLogin = Math.floor((Date.now() - profile.lastLogin.getTime()) / (1000 * 60 * 60 * 24))
  
  // High risk indicators
  if (daysSinceLastLogin > 7) return 'high'
  if (profile.betPoints < 100 && profile.emergencyGrantsUsed >= 3) return 'high'
  if (profile.winRate < 0.2 && profile.totalBets > 50) return 'high'
  
  // Medium risk indicators
  if (daysSinceLastLogin > 3) return 'medium'
  if (profile.loginStreak === 0 && profile.daysActive > 7) return 'medium'
  if (profile.sessionLengthAvg < 5 && profile.daysActive > 14) return 'medium'
  
  return 'low'
}

// Currency sink recommendations (prevent inflation)
export function recommendCurrencySinks(profile: UserEconomyProfile): Array<{
  type: 'diamond_shop' | 'betting_boost' | 'cosmetic' | 'challenge_unlock'
  title: string
  description: string
  cost: { betPoints?: number; diamonds?: number }
  value: string
}> {
  const sinks: Array<{
    type: 'diamond_shop' | 'betting_boost' | 'cosmetic' | 'challenge_unlock'
    title: string
    description: string
    cost: { betPoints?: number; diamonds?: number }
    value: string
  }> = []

  // High balance users - offer premium sinks
  if (profile.betPoints > 20000) {
    sinks.push({
      type: 'betting_boost',
      title: 'Double XP Hour',
      description: 'Get 2x XP from all bets for 1 hour',
      cost: { betPoints: 5000 },
      value: 'Faster progression'
    })
  }
  
  if (profile.diamonds > 100) {
    sinks.push({
      type: 'diamond_shop',
      title: 'Extra Bet Slot',
      description: 'Get an extra active bet slot for 24 hours',
      cost: { diamonds: 100 },
      value: 'More betting opportunities'
    })
  }
  
  // Mid-tier sinks
  if (profile.betPoints > 5000) {
    sinks.push({
      type: 'cosmetic',
      title: 'Custom Profile Badge',
      description: 'Unlock exclusive profile customization',
      cost: { betPoints: 2500 },
      value: 'Personalization'
    })
  }
  
  return sinks
}

// Emergency intervention system
export function triggerEmergencyIntervention(
  profile: UserEconomyProfile,
  reason: 'critical_balance' | 'retention_risk' | 'first_time_help'
): EmergencyAction | null {
  // Rate limiting - max 1 emergency per 24 hours
  if (profile.lastEmergencyGrant) {
    const hoursSinceLastGrant = (Date.now() - profile.lastEmergencyGrant.getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastGrant < 24) return null
  }
  
  // Max 3 emergency grants total
  if (profile.emergencyGrantsUsed >= 3) return null
  
  switch (reason) {
    case 'critical_balance':
      return {
        type: 'emergency_grant',
        triggered: true,
        reason: 'Emergency currency grant for critical low balance',
        amount: { betPoints: 1000, diamonds: 20 },
        cooldown: 24
      }
      
    case 'first_time_help':
      if (profile.daysActive <= 3) {
        return {
          type: 'emergency_grant',
          triggered: true,
          reason: 'New player assistance grant',
          amount: { betPoints: 1500, diamonds: 30 },
          cooldown: 72
        }
      }
      break
      
    case 'retention_risk':
      if (assessRetentionRisk(profile) === 'high') {
        return {
          type: 'bonus_offer',
          triggered: true,
          reason: 'Welcome back bonus to retain player',
          amount: { betPoints: 2000, diamonds: 50 },
          cooldown: 48
        }
      }
      break
  }
  
  return null
}

// Balance optimization suggestions
export function optimizeUserBalance(profile: UserEconomyProfile): {
  targetBalance: { betPoints: number; diamonds: number }
  adjustmentActions: string[]
  healthScore: number // 0-100
} {
  // Target balance based on user level and activity
  const baseTarget = 2000 + (profile.level * 500)
  const activityMultiplier = Math.min(profile.daysActive / 30, 2) // Cap at 2x
  
  const targetBalance = {
    betPoints: Math.floor(baseTarget * activityMultiplier),
    diamonds: 30 + (profile.level * 5)
  }
  
  const adjustmentActions: string[] = []
  
  // If significantly under target, suggest earning methods
  if (profile.betPoints < targetBalance.betPoints * 0.5) {
    adjustmentActions.push('Complete daily challenges for consistent BP income')
    adjustmentActions.push('Consider watching ads for emergency BP')
    if (profile.loginStreak < 7) {
      adjustmentActions.push('Build up login streak for growing daily bonuses')
    }
  }
  
  if (profile.diamonds < targetBalance.diamonds * 0.5) {
    adjustmentActions.push('Place live bets to earn diamond rewards')
    adjustmentActions.push('Watch diamond bonus ads when available')
  }
  
  // If significantly over target, suggest sinks
  if (profile.betPoints > targetBalance.betPoints * 2) {
    adjustmentActions.push('Consider using betting boosts for better odds')
    adjustmentActions.push('Try higher-stakes bets for bigger potential wins')
  }
  
  // Health score calculation (0-100)
  const bpRatio = Math.min(profile.betPoints / targetBalance.betPoints, 2)
  const diamondRatio = Math.min(profile.diamonds / targetBalance.diamonds, 2)
  const healthScore = Math.floor(((bpRatio + diamondRatio) / 2) * 50)
  
  return {
    targetBalance,
    adjustmentActions,
    healthScore: Math.min(healthScore, 100)
  }
}

// Monetization event triggers (ethical and player-friendly)
export const MONETIZATION_EVENTS = {
  // Level milestones
  LEVEL_5_REACHED: {
    trigger: 'level_up',
    level: 5,
    message: 'Congratulations on reaching level 5! VIP membership unlocks even more rewards.',
    action: 'show_vip_info',
    priority: 'low'
  },
  
  // High engagement
  WEEK_STREAK: {
    trigger: 'login_streak',
    days: 7,
    message: 'Your dedication is impressive! VIP members get bonus streak rewards.',
    action: 'show_vip_benefits',
    priority: 'low'
  },
  
  // Success celebration
  BIG_WIN: {
    trigger: 'bet_won',
    multiplier: 10, // 10x stake win
    message: 'Amazing win! Consider VIP for monthly allowances to bet bigger.',
    action: 'congratulate_and_suggest',
    priority: 'low'
  },
  
  // Seasonal events
  WEEKEND_SPECIAL: {
    trigger: 'weekend',
    message: 'Weekend Special: Extra rewards on all ad watches!',
    action: 'promote_ads',
    priority: 'medium'
  }
}

// Check if monetization event should trigger
export function checkMonetizationEventTrigger(
  eventType: keyof typeof MONETIZATION_EVENTS,
  profile: UserEconomyProfile,
  eventData?: any
): boolean {
  const event = MONETIZATION_EVENTS[eventType]
  
  // Don't trigger for VIP users on VIP-related events
  if (event.action.includes('vip') && profile.vipTier !== 'FREE') {
    return false
  }
  
  // Don't trigger too frequently
  const hoursActive = profile.daysActive * 24
  if (hoursActive < 24) return false // At least 1 day active
  
  return true
}