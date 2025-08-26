// VIP Membership System for Nordic Football Betting
// Ethical premium tier with valuable benefits, no pay-to-win mechanics

export type VipTier = 'FREE' | 'VIP_MONTHLY' | 'SEASON_PASS'

export interface VipBenefits {
  monthlyBetPoints: number
  monthlyDiamonds: number
  adRewardBonus: number // Percentage bonus on ad rewards
  dailyBonusMultiplier: number
  maxStakeMultiplier: number
  exclusiveBettingLimits: boolean
  prioritySupport: boolean
  exclusiveChallenges: boolean
  derbyMultiplier: number // Extra multiplier for derby matches
  cashOutBonus: number // Extra cash out percentage
  specialBadges: string[]
  description: string[]
}

// VIP tier benefits (generous value without pay-to-win)
export const VIP_TIER_BENEFITS: Record<VipTier, VipBenefits> = {
  FREE: {
    monthlyBetPoints: 0,
    monthlyDiamonds: 0,
    adRewardBonus: 0,
    dailyBonusMultiplier: 1.0,
    maxStakeMultiplier: 1.0,
    exclusiveBettingLimits: false,
    prioritySupport: false,
    exclusiveChallenges: false,
    derbyMultiplier: 1.0,
    cashOutBonus: 0,
    specialBadges: [],
    description: [
      'Full access to Nordic Football Betting',
      '10,000 BP + 50 diamonds starting bonus',
      'Complete daily challenges',
      'Earn diamonds from live betting'
    ]
  },
  VIP_MONTHLY: {
    monthlyBetPoints: 5000,
    monthlyDiamonds: 50,
    adRewardBonus: 25, // 25% more from ads
    dailyBonusMultiplier: 1.5,
    maxStakeMultiplier: 1.5,
    exclusiveBettingLimits: true,
    prioritySupport: true,
    exclusiveChallenges: false,
    derbyMultiplier: 1.2,
    cashOutBonus: 5, // 5% better cash out offers
    specialBadges: ['VIP Member'],
    description: [
      '5,000 BP monthly allowance',
      '50 diamonds monthly bonus',
      '+25% bonus on ad rewards',
      '+50% daily login bonus',
      'Higher betting limits',
      '+20% derby match rewards',
      'Better cash out offers',
      'VIP member badge',
      'Priority support'
    ]
  },
  SEASON_PASS: {
    monthlyBetPoints: 15000,
    monthlyDiamonds: 200,
    adRewardBonus: 50, // 50% more from ads
    dailyBonusMultiplier: 2.0,
    maxStakeMultiplier: 2.0,
    exclusiveBettingLimits: true,
    prioritySupport: true,
    exclusiveChallenges: true,
    derbyMultiplier: 1.5,
    cashOutBonus: 10, // 10% better cash out offers
    specialBadges: ['Season Pass', 'Elite Member'],
    description: [
      '15,000 BP monthly allowance',
      '200 diamonds monthly bonus',
      '+50% bonus on ad rewards',
      'Double daily login bonus',
      'Maximum betting limits',
      'Exclusive VIP challenges',
      '+50% derby match rewards',
      'Premium cash out offers',
      'Elite member badges',
      'Dedicated VIP support',
      'Special season rewards'
    ]
  }
}

// Check if user has active VIP subscription
export function isVipActive(vipStatus: VipTier, vipExpiresAt: Date | null): boolean {
  if (vipStatus === 'FREE') return false
  if (!vipExpiresAt) return false
  return new Date() < vipExpiresAt
}

// Get effective VIP tier (accounting for expiration)
export function getEffectiveVipTier(vipStatus: VipTier, vipExpiresAt: Date | null): VipTier {
  if (isVipActive(vipStatus, vipExpiresAt)) {
    return vipStatus
  }
  return 'FREE'
}

// Calculate VIP benefits for user
export function calculateVipBenefits(
  vipStatus: VipTier,
  vipExpiresAt: Date | null
): VipBenefits {
  const effectiveTier = getEffectiveVipTier(vipStatus, vipExpiresAt)
  return VIP_TIER_BENEFITS[effectiveTier]
}

// Apply VIP multipliers to rewards
export function applyVipBonus(
  baseAmount: number,
  vipTier: VipTier,
  bonusType: 'ad_reward' | 'daily_bonus' | 'derby_multiplier' | 'cash_out'
): number {
  const benefits = VIP_TIER_BENEFITS[vipTier]
  
  switch (bonusType) {
    case 'ad_reward':
      return Math.floor(baseAmount * (1 + benefits.adRewardBonus / 100))
    
    case 'daily_bonus':
      return Math.floor(baseAmount * benefits.dailyBonusMultiplier)
    
    case 'derby_multiplier':
      return Math.floor(baseAmount * benefits.derbyMultiplier)
    
    case 'cash_out':
      return Math.floor(baseAmount * (1 + benefits.cashOutBonus / 100))
    
    default:
      return baseAmount
  }
}

// Calculate VIP monthly allowance
export function calculateMonthlyAllowance(vipTier: VipTier): {
  betPoints: number
  diamonds: number
  description: string
} {
  const benefits = VIP_TIER_BENEFITS[vipTier]
  
  return {
    betPoints: benefits.monthlyBetPoints,
    diamonds: benefits.monthlyDiamonds,
    description: `${vipTier} monthly allowance`
  }
}

// Check if user should receive monthly allowance
export function shouldReceiveMonthlyAllowance(
  vipStatus: VipTier,
  vipExpiresAt: Date | null,
  lastAllowanceDate: Date | null
): boolean {
  if (!isVipActive(vipStatus, vipExpiresAt)) return false
  
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  
  if (!lastAllowanceDate) return true
  
  return lastAllowanceDate < currentMonthStart
}

// Get VIP exclusive betting limits
export function getVipBettingLimits(vipTier: VipTier): {
  maxStakeMultiplier: number
  maxActiveBets: number
  exclusiveMarkets: boolean
} {
  const benefits = VIP_TIER_BENEFITS[vipTier]
  
  return {
    maxStakeMultiplier: benefits.maxStakeMultiplier,
    maxActiveBets: vipTier === 'SEASON_PASS' ? 20 : vipTier === 'VIP_MONTHLY' ? 15 : 10,
    exclusiveMarkets: benefits.exclusiveBettingLimits
  }
}

// VIP exclusive challenges
export const VIP_EXCLUSIVE_CHALLENGES = [
  {
    id: 'vip_derby_master',
    name: 'Derby Master',
    description: 'Win 5 derby match bets in a month',
    requirement: { type: 'WIN_DERBY_BETS', count: 5 },
    reward: { betPoints: 5000, diamonds: 100, xp: 1000 },
    vipTierRequired: 'SEASON_PASS' as VipTier
  },
  {
    id: 'vip_high_roller',
    name: 'VIP High Roller',
    description: 'Place 10 bets with stakes over 1000 BP',
    requirement: { type: 'HIGH_STAKES_BETS', count: 10, minStake: 1000 },
    reward: { betPoints: 3000, diamonds: 75, xp: 750 },
    vipTierRequired: 'VIP_MONTHLY' as VipTier
  },
  {
    id: 'vip_live_legend',
    name: 'Live Betting Legend',
    description: 'Win 15 live bets in a week',
    requirement: { type: 'WIN_LIVE_BETS', count: 15, timeFrame: 'WEEK' },
    reward: { betPoints: 7500, diamonds: 150, xp: 1500 },
    vipTierRequired: 'SEASON_PASS' as VipTier
  }
]

// Check if user has access to VIP challenge
export function hasVipChallengeAccess(
  userVipTier: VipTier,
  challengeVipTier: VipTier,
  vipExpiresAt: Date | null
): boolean {
  if (!isVipActive(userVipTier, vipExpiresAt)) return false
  
  const tierOrder = { 'FREE': 0, 'VIP_MONTHLY': 1, 'SEASON_PASS': 2 }
  return tierOrder[userVipTier] >= tierOrder[challengeVipTier]
}

// VIP upgrade incentives (ethical triggers)
export function getVipUpgradeIncentives(
  currentTier: VipTier,
  userStats: {
    totalBets: number
    level: number
    longestStreak: number
    monthlySpending: number // Virtual currency spending
  }
): Array<{
  trigger: string
  message: string
  targetTier: VipTier
  priority: 'low' | 'medium' | 'high'
}> {
  const incentives: Array<{
    trigger: string
    message: string
    targetTier: VipTier
    priority: 'low' | 'medium' | 'high'
  }> = []

  if (currentTier === 'FREE') {
    // High-value user reaching limits
    if (userStats.totalBets > 100 && userStats.level >= 5) {
      incentives.push({
        trigger: 'ACTIVE_USER',
        message: 'You\'re an active bettor! VIP membership gives you monthly bonuses and better rewards.',
        targetTier: 'VIP_MONTHLY',
        priority: 'medium'
      })
    }

    // User showing engagement
    if (userStats.longestStreak >= 7) {
      incentives.push({
        trigger: 'LOYAL_USER',
        message: 'Your dedication is impressive! VIP members get extra daily bonuses and exclusive challenges.',
        targetTier: 'VIP_MONTHLY',
        priority: 'low'
      })
    }

    // High virtual currency usage (but not pushy)
    if (userStats.monthlySpending > 5000) {
      incentives.push({
        trigger: 'HIGH_ACTIVITY',
        message: 'Consider VIP membership for monthly allowances and ad reward bonuses.',
        targetTier: 'VIP_MONTHLY',
        priority: 'low'
      })
    }
  }

  if (currentTier === 'VIP_MONTHLY') {
    // Suggest season pass for very active users
    if (userStats.totalBets > 500 && userStats.level >= 8) {
      incentives.push({
        trigger: 'POWER_USER',
        message: 'Season Pass unlocks exclusive challenges and maximum rewards for dedicated players.',
        targetTier: 'SEASON_PASS',
        priority: 'low'
      })
    }
  }

  return incentives
}

// VIP retention rewards (keep existing subscribers happy)
export function getVipRetentionRewards(
  vipTier: VipTier,
  subscriptionMonths: number
): Array<{
  months: number
  reward: {
    betPoints: number
    diamonds: number
    description: string
  }
}> {
  const baseRewards = [
    { 
      months: 3, 
      reward: { betPoints: 2000, diamonds: 50, description: '3-month loyalty bonus' }
    },
    { 
      months: 6, 
      reward: { betPoints: 5000, diamonds: 100, description: '6-month veteran reward' }
    },
    { 
      months: 12, 
      reward: { betPoints: 12000, diamonds: 250, description: '1-year champion bonus' }
    }
  ]

  // Scale rewards based on VIP tier
  const multiplier = vipTier === 'SEASON_PASS' ? 2 : 1.5

  return baseRewards.map(reward => ({
    ...reward,
    reward: {
      ...reward.reward,
      betPoints: Math.floor(reward.reward.betPoints * multiplier),
      diamonds: Math.floor(reward.reward.diamonds * multiplier)
    }
  }))
}

// Check for VIP expiration warning
export function getVipExpirationWarning(
  vipStatus: VipTier,
  vipExpiresAt: Date | null
): {
  showWarning: boolean
  daysUntilExpiry: number
  message: string
} | null {
  if (!vipExpiresAt || vipStatus === 'FREE') return null

  const now = new Date()
  const daysUntilExpiry = Math.ceil((vipExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
    return {
      showWarning: true,
      daysUntilExpiry,
      message: `Your ${vipStatus} subscription expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}. Renew to keep your benefits!`
    }
  }

  if (daysUntilExpiry <= 0) {
    return {
      showWarning: true,
      daysUntilExpiry: 0,
      message: `Your ${vipStatus} subscription has expired. Your benefits have been paused until renewal.`
    }
  }

  return null
}

// Format VIP tier display name
export function formatVipTierName(vipTier: VipTier): string {
  switch (vipTier) {
    case 'FREE':
      return 'Free Player'
    case 'VIP_MONTHLY':
      return 'VIP Member'
    case 'SEASON_PASS':
      return 'Season Pass Elite'
    default:
      return 'Free Player'
  }
}

// Get VIP badge emoji/icon
export function getVipBadge(vipTier: VipTier): string {
  switch (vipTier) {
    case 'VIP_MONTHLY':
      return '👑'
    case 'SEASON_PASS':
      return '🏆'
    default:
      return ''
  }
}