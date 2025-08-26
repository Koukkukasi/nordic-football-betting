// Optional Advertisement System for Nordic Football Betting
// Ethical F2P monetization - ads only when player chooses to watch them

export interface AdReward {
  betPoints: number
  diamonds: number
  description: string
  cooldown: number // minutes
}

export interface AdWatchData {
  userId: string
  adType: AdType
  watchedAt: Date
  rewardClaimed: boolean
  reward: AdReward
}

export type AdType = 
  | 'EMERGENCY_BETPOINTS'
  | 'DAILY_BONUS_BOOST'
  | 'DIAMOND_BONUS'
  | 'WEEKEND_SPECIAL'
  | 'MATCH_DAY_BOOST'

// Ad rewards - generous but balanced
export const AD_REWARDS: Record<AdType, AdReward> = {
  EMERGENCY_BETPOINTS: {
    betPoints: 500,
    diamonds: 0,
    description: 'Emergency BetPoints when you run low',
    cooldown: 60 // 1 hour
  },
  DAILY_BONUS_BOOST: {
    betPoints: 300,
    diamonds: 5,
    description: 'Boost your daily login bonus',
    cooldown: 240 // 4 hours
  },
  DIAMOND_BONUS: {
    betPoints: 0,
    diamonds: 15,
    description: 'Extra diamonds for odds boosts',
    cooldown: 120 // 2 hours
  },
  WEEKEND_SPECIAL: {
    betPoints: 750,
    diamonds: 10,
    description: 'Weekend warrior bonus',
    cooldown: 360 // 6 hours
  },
  MATCH_DAY_BOOST: {
    betPoints: 400,
    diamonds: 8,
    description: 'Big match day boost',
    cooldown: 180 // 3 hours
  }
}

// Check if user is eligible for emergency ads (low balance)
export function isEligibleForEmergencyAd(betPoints: number, diamonds: number): boolean {
  return betPoints < 100 // Critical low balance
}

// Check if user can watch a specific ad type
export function canWatchAd(
  adType: AdType,
  lastWatched: Date | null,
  betPoints: number,
  diamonds: number
): { canWatch: boolean; reason?: string; cooldownMinutes?: number } {
  const reward = AD_REWARDS[adType]
  
  // Check cooldown
  if (lastWatched) {
    const minutesSinceWatch = Math.floor(
      (Date.now() - lastWatched.getTime()) / (1000 * 60)
    )
    if (minutesSinceWatch < reward.cooldown) {
      return {
        canWatch: false,
        reason: 'COOLDOWN',
        cooldownMinutes: reward.cooldown - minutesSinceWatch
      }
    }
  }
  
  // Check eligibility based on ad type
  switch (adType) {
    case 'EMERGENCY_BETPOINTS':
      if (betPoints >= 500) {
        return {
          canWatch: false,
          reason: 'NOT_NEEDED',
        }
      }
      break
      
    case 'DIAMOND_BONUS':
      if (diamonds >= 100) {
        return {
          canWatch: false,
          reason: 'NOT_NEEDED',
        }
      }
      break
      
    case 'WEEKEND_SPECIAL':
      const isWeekend = [5, 6, 0].includes(new Date().getDay())
      if (!isWeekend) {
        return {
          canWatch: false,
          reason: 'NOT_WEEKEND',
        }
      }
      break
  }
  
  return { canWatch: true }
}

// Get available ads for user
export function getAvailableAds(
  betPoints: number,
  diamonds: number,
  lastWatchedTimes: Record<AdType, Date | null>
): Array<{ adType: AdType; reward: AdReward; priority: 'high' | 'medium' | 'low' }> {
  const available: Array<{ adType: AdType; reward: AdReward; priority: 'high' | 'medium' | 'low' }> = []
  
  // Emergency ads (high priority)
  if (isEligibleForEmergencyAd(betPoints, diamonds)) {
    const emergencyCheck = canWatchAd('EMERGENCY_BETPOINTS', lastWatchedTimes.EMERGENCY_BETPOINTS, betPoints, diamonds)
    if (emergencyCheck.canWatch) {
      available.push({
        adType: 'EMERGENCY_BETPOINTS',
        reward: AD_REWARDS.EMERGENCY_BETPOINTS,
        priority: 'high'
      })
    }
  }
  
  // Regular bonus ads (medium priority)
  const regularAds: AdType[] = ['DAILY_BONUS_BOOST', 'DIAMOND_BONUS', 'MATCH_DAY_BOOST']
  
  for (const adType of regularAds) {
    const check = canWatchAd(adType, lastWatchedTimes[adType], betPoints, diamonds)
    if (check.canWatch) {
      available.push({
        adType,
        reward: AD_REWARDS[adType],
        priority: 'medium'
      })
    }
  }
  
  // Weekend special (low priority unless weekend)
  const weekendCheck = canWatchAd('WEEKEND_SPECIAL', lastWatchedTimes.WEEKEND_SPECIAL, betPoints, diamonds)
  if (weekendCheck.canWatch) {
    available.push({
      adType: 'WEEKEND_SPECIAL',
      reward: AD_REWARDS.WEEKEND_SPECIAL,
      priority: 'low'
    })
  }
  
  // Sort by priority
  return available.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

// Simulate ad watching (in real implementation, this would integrate with ad provider)
export function simulateAdWatch(adType: AdType): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    // Simulate ad loading and watching process
    setTimeout(() => {
      // 95% success rate (simulating occasional ad loading failures)
      const success = Math.random() > 0.05
      
      if (success) {
        resolve({ success: true })
      } else {
        resolve({ 
          success: false, 
          error: 'Ad failed to load. Please try again in a few minutes.' 
        })
      }
    }, 1000) // 1 second simulate ad loading
  })
}

// Calculate ad watch reward with bonuses
export function calculateAdReward(
  adType: AdType,
  userLevel: number,
  vipStatus: boolean = false
): AdReward {
  const baseReward = AD_REWARDS[adType]
  
  // Level bonus (5% per level up to 50%)
  const levelMultiplier = 1 + Math.min(userLevel - 1, 10) * 0.05
  
  // VIP bonus (25% more rewards)
  const vipMultiplier = vipStatus ? 1.25 : 1
  
  const totalMultiplier = levelMultiplier * vipMultiplier
  
  return {
    betPoints: Math.floor(baseReward.betPoints * totalMultiplier),
    diamonds: Math.floor(baseReward.diamonds * totalMultiplier),
    description: baseReward.description + (vipStatus ? ' (VIP Bonus)' : ''),
    cooldown: baseReward.cooldown
  }
}

// Get user-friendly messages
export function getAdStatusMessage(
  adType: AdType,
  canWatchResult: ReturnType<typeof canWatchAd>
): string {
  if (canWatchResult.canWatch) {
    const reward = AD_REWARDS[adType]
    if (reward.betPoints > 0 && reward.diamonds > 0) {
      return `Watch an ad to earn ${reward.betPoints} BP + ${reward.diamonds} diamonds`
    } else if (reward.betPoints > 0) {
      return `Watch an ad to earn ${reward.betPoints} BP`
    } else {
      return `Watch an ad to earn ${reward.diamonds} diamonds`
    }
  }
  
  switch (canWatchResult.reason) {
    case 'COOLDOWN':
      return `Available in ${canWatchResult.cooldownMinutes} minutes`
    case 'NOT_NEEDED':
      return 'You have enough currency right now'
    case 'NOT_WEEKEND':
      return 'Available on weekends only'
    default:
      return 'Not available right now'
  }
}

// Daily ad limits (prevent abuse)
export const DAILY_AD_LIMITS = {
  EMERGENCY_BETPOINTS: 3, // Max 3 emergency ads per day
  DAILY_BONUS_BOOST: 2,   // Max 2 bonus boosts per day
  DIAMOND_BONUS: 4,       // Max 4 diamond ads per day
  WEEKEND_SPECIAL: 2,     // Max 2 weekend specials per day
  MATCH_DAY_BOOST: 3      // Max 3 match day boosts per day
}

// Check daily limits
export function checkDailyAdLimit(
  adType: AdType,
  todayWatchCount: number
): boolean {
  return todayWatchCount < DAILY_AD_LIMITS[adType]
}

// Get encouraging messages for ad watching
export const AD_ENCOURAGEMENT_MESSAGES = [
  "Support the game while earning rewards!",
  "A quick ad helps keep Nordic betting free!",
  "Watch and earn - no pressure!",
  "Optional ads, maximum rewards!",
  "Help us improve while you earn!"
]

export function getRandomEncouragementMessage(): string {
  return AD_ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * AD_ENCOURAGEMENT_MESSAGES.length)]
}