// Virtual Currency System for Nordic Football Betting
// Feature 1: 10,000 BetPoints starting bonus + 50 Diamonds

export interface VirtualCurrency {
  betPoints: number
  diamonds: number
}

export interface CurrencyTransaction {
  type: 'BET_PLACED' | 'BET_WON' | 'DIAMOND_SPENT' | 'DAILY_BONUS' | 'ACHIEVEMENT_REWARD' | 'LEVEL_UP'
  amount: number
  currency: 'BETPOINTS' | 'DIAMONDS'
  description: string
  timestamp: Date
}

export const STARTING_BONUS = {
  betPoints: 10000,
  diamonds: 50
}

export const LEVEL_REWARDS = {
  1: { betPoints: 0, diamonds: 0, maxStake: 50, maxActiveBets: 3 },
  2: { betPoints: 500, diamonds: 10, maxStake: 100, maxActiveBets: 4 },
  3: { betPoints: 1000, diamonds: 20, maxStake: 200, maxActiveBets: 5 },
  4: { betPoints: 1500, diamonds: 30, maxStake: 300, maxActiveBets: 6 },
  5: { betPoints: 2000, diamonds: 50, maxStake: 500, maxActiveBets: 7 },
  6: { betPoints: 3000, diamonds: 75, maxStake: 750, maxActiveBets: 8 },
  7: { betPoints: 4000, diamonds: 100, maxStake: 1000, maxActiveBets: 9 },
  8: { betPoints: 5000, diamonds: 150, maxStake: 1500, maxActiveBets: 10 },
  9: { betPoints: 7500, diamonds: 200, maxStake: 2000, maxActiveBets: 12 },
  10: { betPoints: 10000, diamonds: 300, maxStake: 5000, maxActiveBets: 15 }
}

export const XP_REQUIREMENTS = {
  1: 0,
  2: 100,
  3: 300,
  4: 600,
  5: 1000,
  6: 1500,
  7: 2500,
  8: 4000,
  9: 6000,
  10: 10000
}

// Enhanced XP calculation with detailed mechanics
export interface XPActionParams {
  action: string
  amount?: number
  odds?: number
  streak?: number
  isDerby?: boolean
  isLive?: boolean
  betType?: 'SINGLE' | 'PITKAVETO' | 'LIVE'
  selectionCount?: number
}

export function calculateXP(params: XPActionParams): number {
  const { action, amount = 0, odds = 1.0, streak = 0, isDerby = false, isLive = false, betType, selectionCount = 1 } = params
  
  let baseXP = 0
  
  switch (action) {
    case 'BET_PLACED':
      baseXP = 5
      // Bonus XP based on odds (higher risk = more XP)
      if (odds >= 2.0) baseXP += 5
      if (odds >= 3.0) baseXP += 10
      if (odds >= 5.0) baseXP += 15
      break
      
    case 'BET_WON':
      baseXP = 15 + Math.floor(amount / 100) // Base + win amount bonus
      // Odds-based win bonus
      if (odds >= 2.0) baseXP += 10
      if (odds >= 3.0) baseXP += 20
      if (odds >= 5.0) baseXP += 35
      if (odds >= 10.0) baseXP += 50
      break
      
    case 'LIVE_BET_PLACED':
      baseXP = 10
      // Higher XP for live betting risk
      if (odds >= 2.0) baseXP += 8
      if (odds >= 3.0) baseXP += 15
      break
      
    case 'LIVE_BET_WON':
      baseXP = 25 + Math.floor(amount / 100)
      // Live win bonuses
      if (odds >= 2.0) baseXP += 15
      if (odds >= 3.0) baseXP += 30
      if (odds >= 5.0) baseXP += 50
      break
      
    case 'PITKAVETO_PLACED':
      baseXP = 10 + (selectionCount * 3) // More selections = more XP
      // Combo multiplier bonus
      if (selectionCount >= 3) baseXP += 10
      if (selectionCount >= 5) baseXP += 20
      if (selectionCount >= 8) baseXP += 35
      break
      
    case 'PITKAVETO_WON':
      baseXP = 30 + (selectionCount * 5) + Math.floor(amount / 100)
      // Massive combo win bonuses
      if (selectionCount >= 3) baseXP += 25
      if (selectionCount >= 5) baseXP += 50
      if (selectionCount >= 8) baseXP += 100
      if (odds >= 10.0) baseXP += 75
      if (odds >= 50.0) baseXP += 200
      break
      
    case 'ACHIEVEMENT_UNLOCKED':
      return 50 // Fixed XP for achievements
      
    case 'DAILY_LOGIN':
      baseXP = 10
      // Streak bonus
      if (streak >= 3) baseXP += 5
      if (streak >= 7) baseXP += 10
      if (streak >= 14) baseXP += 20
      if (streak >= 30) baseXP += 30
      break
      
    case 'CHALLENGE_COMPLETED':
      return 25 // Fixed XP for challenges
      
    case 'FIRST_BET_OF_DAY':
      return 15
      
    case 'WEEKEND_WARRIOR':
      return 20 // Weekend betting bonus
      
    default:
      return 0
  }
  
  // Apply multipliers
  let multiplier = 1.0
  
  // Derby match multiplier
  if (isDerby) {
    multiplier += 0.5 // 50% more XP for derby matches
  }
  
  // Live betting multiplier
  if (isLive) {
    multiplier += 0.3 // 30% more XP for live bets
  }
  
  // Win streak multiplier
  if (action.includes('WON') && streak > 0) {
    const streakBonus = Math.min(streak * 0.1, 1.0) // Max 100% bonus at 10-win streak
    multiplier += streakBonus
  }
  
  return Math.floor(baseXP * multiplier)
}

// Check if user should level up
export function checkLevelUp(currentXP: number, currentLevel: number): number | null {
  for (let level = currentLevel + 1; level <= 10; level++) {
    if (currentXP >= XP_REQUIREMENTS[level as keyof typeof XP_REQUIREMENTS]) {
      return level
    }
  }
  return null
}

// Format currency display
export function formatCurrency(amount: number, type: 'BETPOINTS' | 'DIAMONDS'): string {
  if (type === 'BETPOINTS') {
    return `${amount.toLocaleString()} BP`
  }
  return `💎 ${amount}`
}

// Validate transaction
export function validateTransaction(
  currentBalance: number,
  amount: number,
  type: 'SPEND' | 'EARN'
): boolean {
  if (type === 'SPEND') {
    return currentBalance >= amount
  }
  return true
}

// Enhanced daily bonus calculation with streak rewards
export function calculateDailyBonus(loginStreak: number): VirtualCurrency & { xp: number } {
  const baseBonus = 100
  const streakMultiplier = Math.min(loginStreak, 30) // Cap at 30 days
  
  // Progressive bonus structure
  let bonusMultiplier = 1
  if (loginStreak >= 7) bonusMultiplier = 1.5   // 50% bonus after week
  if (loginStreak >= 14) bonusMultiplier = 2.0  // 100% bonus after 2 weeks
  if (loginStreak >= 21) bonusMultiplier = 2.5  // 150% bonus after 3 weeks
  if (loginStreak >= 30) bonusMultiplier = 3.0  // 200% bonus after month
  
  const betPoints = Math.floor(baseBonus * bonusMultiplier * Math.min(streakMultiplier, 10))
  const diamonds = Math.floor(streakMultiplier / 3) * 2 // 2 diamonds every 3 days
  const xp = 10 + (loginStreak >= 7 ? 15 : 0) + (loginStreak >= 14 ? 20 : 0) // XP bonus for streaks
  
  return {
    betPoints,
    diamonds,
    xp
  }
}

// Login streak management
export interface LoginStreakData {
  currentStreak: number
  longestStreak: number
  lastLoginDate: string
  isConsecutive: boolean
  bonusMultiplier: number
  nextMilestone: number
}

export function calculateLoginStreak(
  lastLoginAt: Date | null,
  currentStreak: number = 0,
  longestStreak: number = 0
): LoginStreakData {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  if (!lastLoginAt) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, longestStreak),
      lastLoginDate: today,
      isConsecutive: false,
      bonusMultiplier: 1,
      nextMilestone: 7
    }
  }
  
  const lastLoginDate = lastLoginAt.toISOString().split('T')[0]
  const daysDifference = Math.floor(
    (now.getTime() - lastLoginAt.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  let newStreak = currentStreak
  let isConsecutive = false
  
  if (lastLoginDate === today) {
    // Same day login, no change
    return {
      currentStreak,
      longestStreak,
      lastLoginDate: today,
      isConsecutive: false,
      bonusMultiplier: getBonusMultiplier(currentStreak),
      nextMilestone: getNextMilestone(currentStreak)
    }
  } else if (daysDifference === 1) {
    // Consecutive day
    newStreak = currentStreak + 1
    isConsecutive = true
  } else {
    // Streak broken
    newStreak = 1
    isConsecutive = false
  }
  
  return {
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, longestStreak),
    lastLoginDate: today,
    isConsecutive,
    bonusMultiplier: getBonusMultiplier(newStreak),
    nextMilestone: getNextMilestone(newStreak)
  }
}

function getBonusMultiplier(streak: number): number {
  if (streak >= 30) return 3.0
  if (streak >= 21) return 2.5
  if (streak >= 14) return 2.0
  if (streak >= 7) return 1.5
  return 1.0
}

function getNextMilestone(streak: number): number {
  if (streak < 7) return 7
  if (streak < 14) return 14
  if (streak < 21) return 21
  if (streak < 30) return 30
  return 30 // Max milestone
}

// Streak milestone rewards
export const STREAK_MILESTONES = {
  7: { betPoints: 1000, diamonds: 20, xp: 100, title: 'Viikon veteraani' },
  14: { betPoints: 2500, diamonds: 50, xp: 250, title: 'Kahden viikon mestari' },
  21: { betPoints: 5000, diamonds: 100, xp: 500, title: 'Kolmen viikon sankari' },
  30: { betPoints: 10000, diamonds: 200, xp: 1000, title: 'Kuukauden legenda' }
}

export function getStreakMilestoneReward(streak: number) {
  return STREAK_MILESTONES[streak as keyof typeof STREAK_MILESTONES] || null
}

// Diamond boost multipliers for Feature 3
export const DIAMOND_BOOSTS = {
  SMALL: { cost: 10, multiplier: 1.5, name: '1.5× Boost' },
  MEDIUM: { cost: 25, multiplier: 2.0, name: '2× Boost' },
  LARGE: { cost: 50, multiplier: 3.0, name: '3× Boost' }
}

// Get available boosts based on diamond balance
export function getAvailableBoosts(diamonds: number) {
  return Object.entries(DIAMOND_BOOSTS)
    .filter(([_, boost]) => boost.cost <= diamonds)
    .map(([key, boost]) => ({ key, ...boost }))
}

// Calculate boosted odds
export function applyDiamondBoost(originalOdds: number, boostKey: keyof typeof DIAMOND_BOOSTS): number {
  const boost = DIAMOND_BOOSTS[boostKey]
  return Math.round(originalOdds * boost.multiplier)
}

// Low balance warnings
export function checkLowBalance(betPoints: number, diamonds: number) {
  const warnings = []
  
  if (betPoints < 100) {
    warnings.push({
      type: 'LOW_BETPOINTS',
      message: 'Your BetPoints are running low! Watch an ad for bonus points or wait for daily bonus.',
      critical: betPoints === 0
    })
  }
  
  if (diamonds < 10) {
    warnings.push({
      type: 'LOW_DIAMONDS',
      message: 'Running low on diamonds! Earn more by placing live bets.',
      critical: diamonds === 0
    })
  }
  
  return warnings
}