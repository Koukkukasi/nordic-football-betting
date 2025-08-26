// Purchase Incentive System - Ethical Conversion Optimization
// Shows value at the right time without being pushy or manipulative

import { VipTier } from './vip-system'
import { STRIPE_PRODUCTS, STRIPE_SUBSCRIPTIONS } from './stripe'

export interface PurchaseIncentive {
  id: string
  productId: keyof typeof STRIPE_PRODUCTS | keyof typeof STRIPE_SUBSCRIPTIONS
  trigger: IncentiveTrigger
  conditions: IncentiveConditions
  offer: IncentiveOffer
  presentation: IncentivePresentation
  timing: IncentiveTiming
  ethics: IncentiveEthics
}

export interface IncentiveTrigger {
  type: 'level_milestone' | 'engagement_high' | 'balance_pattern' | 'time_based' | 'achievement_unlock' | 'seasonal'
  value: any
  description: string
}

export interface IncentiveConditions {
  minLevel: number
  minDaysActive: number
  minTotalBets: number
  maxPurchases: number
  currentVipTier: VipTier[]
  winRateThreshold?: number
  engagementScore?: number
}

export interface IncentiveOffer {
  discount?: number // Percentage
  bonusItems?: {
    betPoints: number
    diamonds: number
    description: string
  }
  upgradeBonus?: {
    description: string
    value: string
  }
  timeLimit: number // Hours
}

export interface IncentivePresentation {
  title: string
  subtitle: string
  description: string[]
  callToAction: string
  style: 'subtle' | 'standard' | 'celebration'
  showTimer: boolean
}

export interface IncentiveTiming {
  cooldown: number // Hours between same incentive type
  maxDaily: number
  maxWeekly: number
  bestTimeOfDay?: number[] // Hours when user is most active
}

export interface IncentiveEthics {
  respectsUserChoice: boolean
  transparentAboutCost: boolean
  emphasizesValue: boolean
  neverManipulative: boolean
  easilyDismissible: boolean
}

// Ethical purchase incentives that respect the player
export const PURCHASE_INCENTIVES: Record<string, PurchaseIncentive> = {
  FIRST_TIME_BUYER: {
    id: 'first_time_buyer',
    productId: 'STARTER_PACK',
    trigger: {
      type: 'engagement_high',
      value: { minLevel: 5, minStreak: 7 },
      description: 'New player showing high engagement'
    },
    conditions: {
      minLevel: 5,
      minDaysActive: 7,
      minTotalBets: 25,
      maxPurchases: 0,
      currentVipTier: ['FREE']
    },
    offer: {
      discount: 25,
      bonusItems: {
        betPoints: 1000,
        diamonds: 25,
        description: 'First-time buyer bonus'
      },
      timeLimit: 168 // 7 days
    },
    presentation: {
      title: 'Welcome to VIP Rewards!',
      subtitle: '25% off your first purchase',
      description: [
        'Thank you for being an active player!',
        'Your first purchase includes bonus currency',
        'Support the game and get great value'
      ],
      callToAction: 'Claim Welcome Offer',
      style: 'celebration',
      showTimer: false
    },
    timing: {
      cooldown: 336, // 14 days
      maxDaily: 1,
      maxWeekly: 1
    },
    ethics: {
      respectsUserChoice: true,
      transparentAboutCost: true,
      emphasizesValue: true,
      neverManipulative: true,
      easilyDismissible: true
    }
  },

  LEVEL_MILESTONE: {
    id: 'level_milestone',
    productId: 'PLAYER_PACK',
    trigger: {
      type: 'level_milestone',
      value: [5, 7, 10],
      description: 'Player reached significant level'
    },
    conditions: {
      minLevel: 5,
      minDaysActive: 10,
      minTotalBets: 50,
      maxPurchases: 1,
      currentVipTier: ['FREE']
    },
    offer: {
      discount: 15,
      bonusItems: {
        betPoints: 2000,
        diamonds: 40,
        description: 'Level achievement bonus'
      },
      timeLimit: 72 // 3 days
    },
    presentation: {
      title: 'Level Up Achievement!',
      subtitle: 'Celebrate with VIP rewards',
      description: [
        'Congratulations on your progress!',
        'VIP membership matches your dedication',
        'Monthly bonuses and exclusive benefits'
      ],
      callToAction: 'Upgrade to VIP',
      style: 'celebration',
      showTimer: true
    },
    timing: {
      cooldown: 168, // 7 days
      maxDaily: 1,
      maxWeekly: 2
    },
    ethics: {
      respectsUserChoice: true,
      transparentAboutCost: true,
      emphasizesValue: true,
      neverManipulative: true,
      easilyDismissible: true
    }
  },

  LOYAL_PLAYER: {
    id: 'loyal_player',
    productId: 'VIP_MONTHLY',
    trigger: {
      type: 'engagement_high',
      value: { minStreak: 14, winRate: 0.4 },
      description: 'Loyal player with good performance'
    },
    conditions: {
      minLevel: 6,
      minDaysActive: 21,
      minTotalBets: 100,
      maxPurchases: 0,
      currentVipTier: ['FREE'],
      winRateThreshold: 0.35
    },
    offer: {
      bonusItems: {
        betPoints: 3000,
        diamonds: 60,
        description: 'Loyalty recognition bonus'
      },
      upgradeBonus: {
        description: 'Double first month bonus',
        value: '2x monthly rewards'
      },
      timeLimit: 120 // 5 days
    },
    presentation: {
      title: 'Loyal Player Recognition',
      subtitle: 'Your dedication deserves VIP treatment',
      description: [
        'You\'ve been consistently active and successful',
        'VIP membership provides ongoing value for players like you',
        'Monthly allowances and enhanced rewards'
      ],
      callToAction: 'Join VIP',
      style: 'standard',
      showTimer: false
    },
    timing: {
      cooldown: 504, // 21 days
      maxDaily: 1,
      maxWeekly: 1
    },
    ethics: {
      respectsUserChoice: true,
      transparentAboutCost: true,
      emphasizesValue: true,
      neverManipulative: true,
      easilyDismissible: true
    }
  },

  SEASONAL_SPECIAL: {
    id: 'seasonal_special',
    productId: 'SEASON_PASS',
    trigger: {
      type: 'seasonal',
      value: 'new_season',
      description: 'New football season starting'
    },
    conditions: {
      minLevel: 8,
      minDaysActive: 30,
      minTotalBets: 200,
      maxPurchases: 2,
      currentVipTier: ['FREE', 'VIP_MONTHLY']
    },
    offer: {
      discount: 20,
      bonusItems: {
        betPoints: 5000,
        diamonds: 100,
        description: 'Season launch bonus'
      },
      timeLimit: 240 // 10 days
    },
    presentation: {
      title: 'New Season, New Rewards!',
      subtitle: 'Season Pass with launch bonus',
      description: [
        'The new football season is here!',
        'Season Pass unlocks exclusive challenges and rewards',
        'Limited-time launch bonus included'
      ],
      callToAction: 'Get Season Pass',
      style: 'celebration',
      showTimer: true
    },
    timing: {
      cooldown: 2160, // 90 days (seasonal)
      maxDaily: 1,
      maxWeekly: 1
    },
    ethics: {
      respectsUserChoice: true,
      transparentAboutCost: true,
      emphasizesValue: true,
      neverManipulative: true,
      easilyDismissible: true
    }
  },

  WIN_STREAK_CELEBRATION: {
    id: 'win_streak',
    productId: 'PRO_PACK',
    trigger: {
      type: 'achievement_unlock',
      value: 'win_streak_10',
      description: 'Player achieved 10-win streak'
    },
    conditions: {
      minLevel: 6,
      minDaysActive: 14,
      minTotalBets: 75,
      maxPurchases: 1,
      currentVipTier: ['FREE'],
      winRateThreshold: 0.5
    },
    offer: {
      discount: 30,
      bonusItems: {
        betPoints: 2500,
        diamonds: 75,
        description: 'Win streak celebration bonus'
      },
      timeLimit: 48 // 2 days
    },
    presentation: {
      title: 'Incredible Win Streak!',
      subtitle: 'Celebrate your success',
      description: [
        'Your 10-win streak is amazing!',
        'Pro Pack provides the resources to keep winning',
        'Special discount for your achievement'
      ],
      callToAction: 'Celebrate with Pro Pack',
      style: 'celebration',
      showTimer: true
    },
    timing: {
      cooldown: 336, // 14 days
      maxDaily: 1,
      maxWeekly: 1
    },
    ethics: {
      respectsUserChoice: true,
      transparentAboutCost: true,
      emphasizesValue: true,
      neverManipulative: true,
      easilyDismissible: true
    }
  }
}

// Check if user qualifies for a purchase incentive
export function checkPurchaseIncentiveEligibility(
  incentiveId: string,
  userProfile: {
    level: number
    daysActive: number
    totalBets: number
    totalPurchases: number
    vipTier: VipTier
    winRate: number
    currentStreak: number
    lastIncentiveShown?: Date
    engagementScore?: number
  }
): { eligible: boolean; reason?: string } {
  const incentive = PURCHASE_INCENTIVES[incentiveId]
  if (!incentive) {
    return { eligible: false, reason: 'Incentive not found' }
  }

  const conditions = incentive.conditions

  // Check basic conditions
  if (userProfile.level < conditions.minLevel) {
    return { eligible: false, reason: 'Level too low' }
  }

  if (userProfile.daysActive < conditions.minDaysActive) {
    return { eligible: false, reason: 'Not active long enough' }
  }

  if (userProfile.totalBets < conditions.minTotalBets) {
    return { eligible: false, reason: 'Not enough betting activity' }
  }

  if (userProfile.totalPurchases > conditions.maxPurchases) {
    return { eligible: false, reason: 'Too many previous purchases' }
  }

  if (!conditions.currentVipTier.includes(userProfile.vipTier)) {
    return { eligible: false, reason: 'VIP tier not eligible' }
  }

  // Check optional thresholds
  if (conditions.winRateThreshold && userProfile.winRate < conditions.winRateThreshold) {
    return { eligible: false, reason: 'Win rate below threshold' }
  }

  if (conditions.engagementScore && (userProfile.engagementScore || 0) < conditions.engagementScore) {
    return { eligible: false, reason: 'Engagement score too low' }
  }

  // Check cooldown
  if (userProfile.lastIncentiveShown) {
    const hoursSinceLastShown = (Date.now() - userProfile.lastIncentiveShown.getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastShown < incentive.timing.cooldown) {
      return { eligible: false, reason: 'Still in cooldown period' }
    }
  }

  return { eligible: true }
}

// Get available purchase incentives for user
export function getAvailablePurchaseIncentives(
  userProfile: {
    level: number
    daysActive: number
    totalBets: number
    totalPurchases: number
    vipTier: VipTier
    winRate: number
    currentStreak: number
    recentAchievements: string[]
    lastIncentiveShown?: Date
    engagementScore?: number
  }
): Array<{
  incentive: PurchaseIncentive
  priority: 'low' | 'medium' | 'high'
  triggeredBy: string
}> {
  const available: Array<{
    incentive: PurchaseIncentive
    priority: 'low' | 'medium' | 'high'
    triggeredBy: string
  }> = []

  // Check each incentive
  for (const [id, incentive] of Object.entries(PURCHASE_INCENTIVES)) {
    const eligibility = checkPurchaseIncentiveEligibility(id, userProfile)
    
    if (eligibility.eligible) {
      let priority: 'low' | 'medium' | 'high' = 'low'
      let triggeredBy = ''

      // Determine priority and trigger
      switch (incentive.trigger.type) {
        case 'engagement_high':
          if (userProfile.currentStreak >= 7) {
            priority = 'medium'
            triggeredBy = `${userProfile.currentStreak}-day streak`
          }
          break

        case 'level_milestone':
          if (incentive.trigger.value.includes(userProfile.level)) {
            priority = 'high'
            triggeredBy = `Reached level ${userProfile.level}`
          }
          break

        case 'achievement_unlock':
          if (userProfile.recentAchievements.includes(incentive.trigger.value)) {
            priority = 'high'
            triggeredBy = `Unlocked ${incentive.trigger.value}`
          }
          break

        case 'seasonal':
          priority = 'medium'
          triggeredBy = 'Seasonal event'
          break
      }

      if (triggeredBy) {
        available.push({
          incentive,
          priority,
          triggeredBy
        })
      }
    }
  }

  // Sort by priority (high first)
  return available.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

// Calculate actual value of incentive offer
export function calculateIncentiveValue(
  incentive: PurchaseIncentive
): {
  originalPrice: number
  finalPrice: number
  savings: number
  bonusValue: number
  totalValue: number
} {
  // Get base product price
  const isSubscription = Object.keys(STRIPE_SUBSCRIPTIONS).includes(incentive.productId)
  const productData = isSubscription 
    ? STRIPE_SUBSCRIPTIONS[incentive.productId as keyof typeof STRIPE_SUBSCRIPTIONS]
    : STRIPE_PRODUCTS[incentive.productId as keyof typeof STRIPE_PRODUCTS]

  const originalPrice = productData.price
  const discount = incentive.offer.discount || 0
  const finalPrice = Math.floor(originalPrice * (1 - discount / 100))
  const savings = originalPrice - finalPrice

  // Calculate bonus value (BetPoints = €0.001, Diamonds = €0.01 roughly)
  let bonusValue = 0
  if (incentive.offer.bonusItems) {
    bonusValue = incentive.offer.bonusItems.betPoints * 0.001 + incentive.offer.bonusItems.diamonds * 0.01
  }

  const totalValue = savings + bonusValue

  return {
    originalPrice,
    finalPrice,
    savings,
    bonusValue: Math.floor(bonusValue * 100), // Convert to cents
    totalValue: Math.floor(totalValue * 100)
  }
}

// Format incentive presentation for UI
export function formatIncentivePresentation(
  incentive: PurchaseIncentive,
  triggeredBy: string
): {
  title: string
  subtitle: string
  description: string[]
  callToAction: string
  urgency?: string
  value: string
  ethics: string[]
} {
  const valueCalc = calculateIncentiveValue(incentive)
  
  let urgency: string | undefined
  if (incentive.presentation.showTimer) {
    const hours = incentive.offer.timeLimit
    if (hours <= 24) {
      urgency = `${hours} hour${hours === 1 ? '' : 's'} remaining`
    } else {
      const days = Math.floor(hours / 24)
      urgency = `${days} day${days === 1 ? '' : 's'} remaining`
    }
  }

  const valueString = `Save €${(valueCalc.savings / 100).toFixed(2)}${
    valueCalc.bonusValue > 0 ? ` + €${(valueCalc.bonusValue / 100).toFixed(2)} bonus` : ''
  }`

  const ethicsPoints = [
    'Optional purchase - never required',
    'Fair pricing with genuine value',
    'Easy to dismiss and review later',
    'No pressure or artificial scarcity',
    'Supports continued game development'
  ]

  return {
    title: incentive.presentation.title,
    subtitle: incentive.presentation.subtitle,
    description: [...incentive.presentation.description, `Triggered by: ${triggeredBy}`],
    callToAction: incentive.presentation.callToAction,
    urgency,
    value: valueString,
    ethics: ethicsPoints
  }
}

// Track incentive interactions (for optimization)
export interface IncentiveInteraction {
  userId: string
  incentiveId: string
  action: 'shown' | 'clicked' | 'dismissed' | 'purchased' | 'expired'
  timestamp: Date
  context: {
    userLevel: number
    triggeredBy: string
    sessionLength: number
  }
}

// Ethical guidelines for incentive system
export const INCENTIVE_ETHICS = {
  RESPECT_USER_CHOICE: 'Never pressure or manipulate users into purchases',
  TRANSPARENT_VALUE: 'Always clearly show what user gets for their money',
  FAIR_PRICING: 'Prices should reflect genuine value, not exploit psychology',
  EASY_DISMISSAL: 'Users can easily dismiss and review offers later',
  NO_FOMO: 'Avoid artificial scarcity or fear-of-missing-out tactics',
  SUPPORT_MESSAGE: 'Frame as supporting game development, not just buying items',
  GENUINE_CELEBRATION: 'Only trigger on real achievements, not manufactured milestones',
  COOLDOWN_RESPECT: 'Respect user dismissals with appropriate cooldown periods'
}

// Validate incentive meets ethical standards
export function validateIncentiveEthics(incentive: PurchaseIncentive): {
  passes: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Check ethics properties
  if (!incentive.ethics.respectsUserChoice) {
    issues.push('Must respect user choice')
  }
  if (!incentive.ethics.transparentAboutCost) {
    issues.push('Must be transparent about costs')
  }
  if (!incentive.ethics.neverManipulative) {
    issues.push('Must never be manipulative')
  }
  if (!incentive.ethics.easilyDismissible) {
    issues.push('Must be easily dismissible')
  }

  // Check timing constraints
  if (incentive.timing.maxDaily > 2) {
    issues.push('Too frequent - max 2 per day')
  }
  if (incentive.timing.cooldown < 24) {
    issues.push('Cooldown too short - minimum 24 hours')
  }

  return {
    passes: issues.length === 0,
    issues
  }
}