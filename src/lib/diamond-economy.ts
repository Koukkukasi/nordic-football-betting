// Diamond Economy System
// Feature 3: Earn from live bets, use for odds boosts (up to 3x)

export interface DiamondTransaction {
  id: string
  userId: string
  amount: number
  type: 'EARNED' | 'SPENT'
  source: DiamondSource
  description: string
  timestamp: Date
}

export type DiamondSource = 
  | 'LIVE_BET_PLACED'
  | 'LIVE_BET_WON'
  | 'ACHIEVEMENT'
  | 'DAILY_LOGIN'
  | 'LEVEL_UP'
  | 'CHALLENGE_COMPLETE'
  | 'ODDS_BOOST'
  | 'SPECIAL_OFFER'
  | 'DERBY_BONUS'
  | 'STREAK_BONUS'

// Diamond earning rates
export const DIAMOND_EARN_RATES = {
  LIVE_BET_PLACED: {
    base: 1,
    chance: 0.3, // 30% chance to earn on placement
    description: 'Live bet activity bonus'
  },
  LIVE_BET_WON: {
    base: 2,
    multiplier: (odds: number) => Math.floor(odds / 200), // Extra diamonds for high odds wins
    description: 'Live bet win reward'
  },
  ACHIEVEMENT_BRONZE: 10,
  ACHIEVEMENT_SILVER: 25,
  ACHIEVEMENT_GOLD: 50,
  DAILY_LOGIN: {
    day1to7: 1,
    day8to14: 2,
    day15to30: 3,
    day30plus: 5
  },
  LEVEL_UP: (level: number) => level * 10,
  CHALLENGE_DAILY: 5,
  CHALLENGE_WEEKLY: 20,
  DERBY_WIN: 15,
  STREAK_5_WINS: 10,
  STREAK_10_WINS: 25
}

// Diamond boost options for odds enhancement
export const DIAMOND_BOOST_OPTIONS = {
  SMALL: {
    cost: 10,
    multiplier: 1.5,
    name: '1.5× Odds Boost',
    description: 'Boost your odds by 50%',
    color: '#3b82f6' // Blue
  },
  MEDIUM: {
    cost: 25,
    multiplier: 2.0,
    name: '2× Odds Boost',
    description: 'Double your odds',
    color: '#8b5cf6' // Purple
  },
  LARGE: {
    cost: 50,
    multiplier: 3.0,
    name: '3× Odds Boost',
    description: 'Triple your odds - Maximum boost!',
    color: '#f59e0b' // Amber
  }
}

// Calculate diamonds earned from live bet
export function calculateLiveBetDiamonds(
  betPlaced: boolean,
  betWon: boolean,
  odds?: number,
  isDoubleTime: boolean = false
): number {
  let diamonds = 0
  
  // Placement bonus (random chance)
  if (betPlaced && Math.random() < DIAMOND_EARN_RATES.LIVE_BET_PLACED.chance) {
    diamonds += DIAMOND_EARN_RATES.LIVE_BET_PLACED.base
  }
  
  // Win bonus
  if (betWon && odds) {
    diamonds += DIAMOND_EARN_RATES.LIVE_BET_WON.base
    diamonds += DIAMOND_EARN_RATES.LIVE_BET_WON.multiplier(odds)
  }
  
  // Double diamonds during special times (Feature 5 enhancement)
  if (isDoubleTime) {
    diamonds *= 2
  }
  
  return diamonds
}

// Calculate daily login diamonds
export function calculateDailyLoginDiamonds(consecutiveDays: number): number {
  if (consecutiveDays <= 7) return DIAMOND_EARN_RATES.DAILY_LOGIN.day1to7
  if (consecutiveDays <= 14) return DIAMOND_EARN_RATES.DAILY_LOGIN.day8to14
  if (consecutiveDays <= 30) return DIAMOND_EARN_RATES.DAILY_LOGIN.day15to30
  return DIAMOND_EARN_RATES.DAILY_LOGIN.day30plus
}

// Check if user can afford a boost
export function canAffordBoost(
  userDiamonds: number, 
  boostType: keyof typeof DIAMOND_BOOST_OPTIONS
): boolean {
  return userDiamonds >= DIAMOND_BOOST_OPTIONS[boostType].cost
}

// Apply diamond boost to odds
export function applyDiamondBoost(
  originalOdds: number,
  boostType: keyof typeof DIAMOND_BOOST_OPTIONS
): {
  boostedOdds: number
  cost: number
  multiplier: number
} {
  const boost = DIAMOND_BOOST_OPTIONS[boostType]
  return {
    boostedOdds: Math.round(originalOdds * boost.multiplier),
    cost: boost.cost,
    multiplier: boost.multiplier
  }
}

// Special diamond earning events
export const DIAMOND_EVENTS = {
  DOUBLE_DIAMOND_WEEKEND: {
    active: (date: Date) => [5, 6, 0].includes(date.getDay()),
    multiplier: 2,
    description: 'Double diamonds on weekends!'
  },
  LIVE_BETTING_RUSH: {
    active: (date: Date) => date.getHours() >= 18 && date.getHours() <= 22,
    multiplier: 2,
    description: 'Double diamonds on live bets 6-10 PM!'
  },
  DERBY_DAY: {
    multiplier: 3,
    description: 'Triple diamonds on derby matches!'
  }
}

// Check active diamond events
export function getActiveDiamondEvents(date: Date = new Date()): string[] {
  const active: string[] = []
  
  if (DIAMOND_EVENTS.DOUBLE_DIAMOND_WEEKEND.active(date)) {
    active.push('DOUBLE_DIAMOND_WEEKEND')
  }
  
  if (DIAMOND_EVENTS.LIVE_BETTING_RUSH.active(date)) {
    active.push('LIVE_BETTING_RUSH')
  }
  
  return active
}

// Diamond spending options beyond odds boosts
export const DIAMOND_SHOP = {
  EXTRA_BET_SLOT: {
    cost: 100,
    duration: '24 hours',
    description: 'Get 1 extra active bet slot for 24 hours'
  },
  STAKE_LIMIT_BOOST: {
    cost: 150,
    multiplier: 2,
    duration: '24 hours',
    description: 'Double your maximum stake for 24 hours'
  },
  XP_BOOST: {
    cost: 50,
    multiplier: 2,
    duration: '1 hour',
    description: 'Double XP gains for 1 hour'
  },
  INSURANCE: {
    cost: 75,
    coverage: 0.5,
    description: 'Get 50% back if your next bet loses'
  }
}

// Diamond balance warnings and tips
export function getDiamondTips(balance: number): string[] {
  const tips: string[] = []
  
  if (balance < 10) {
    tips.push('💎 Low on diamonds! Place live bets to earn more.')
  }
  
  if (balance >= 50) {
    tips.push('💎 You can afford a 3× odds boost!')
  }
  
  if (balance >= 100) {
    tips.push('💎 Check the diamond shop for special perks!')
  }
  
  const now = new Date()
  if (DIAMOND_EVENTS.DOUBLE_DIAMOND_WEEKEND.active(now)) {
    tips.push('🎉 Double Diamond Weekend is active!')
  }
  
  if (DIAMOND_EVENTS.LIVE_BETTING_RUSH.active(now)) {
    tips.push('⚡ Live Betting Rush Hour - Double diamonds on live bets!')
  }
  
  return tips
}

// Track diamond efficiency (how well user uses diamonds)
export function calculateDiamondEfficiency(
  totalEarned: number,
  totalSpent: number,
  boostsWon: number,
  boostsLost: number
): {
  efficiency: number
  rating: string
  tips: string[]
} {
  if (totalSpent === 0) {
    return {
      efficiency: 0,
      rating: 'Saver',
      tips: ['Start using your diamonds for odds boosts!']
    }
  }
  
  const winRate = boostsWon / (boostsWon + boostsLost)
  const efficiency = winRate * (totalEarned / totalSpent)
  
  let rating: string
  let tips: string[] = []
  
  if (efficiency >= 2) {
    rating = 'Diamond Master'
    tips.push('Excellent diamond usage! Keep it up!')
  } else if (efficiency >= 1.5) {
    rating = 'Smart Spender'
    tips.push('Good diamond management!')
  } else if (efficiency >= 1) {
    rating = 'Break Even'
    tips.push('Try using boosts on safer bets')
  } else {
    rating = 'Risk Taker'
    tips.push('Consider saving diamonds for better opportunities')
  }
  
  return { efficiency, rating, tips }
}