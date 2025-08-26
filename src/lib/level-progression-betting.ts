// Enhanced Level Progression System with Betting Capabilities
// Controls how players unlock betting features as they level up

export interface LevelBettingCapabilities {
  level: number
  name: string
  xpRequired: number
  
  // Betting limits
  minStake: number
  maxStake: number
  maxDailyBets: number
  maxActiveBets: number
  maxDailyStake: number
  maxWeeklyStake: number
  
  // Bet types allowed
  allowSingleBets: boolean
  allowAccumulators: boolean
  allowLiveBetting: boolean
  allowSystemBets: boolean
  allowCashOut: boolean
  allowDiamondBoosts: boolean
  
  // Market access
  maxSelections: number
  maxOdds: number
  allowedMarkets: string[]
  maxPotentialWin: number
  
  // Special features
  features: {
    editBets: boolean
    partialCashOut: boolean
    betBuilder: boolean
    statistics: boolean
    autobet: boolean
    favoriteTeamBonus: boolean
  }
  
  // Rewards for reaching level
  levelUpRewards: {
    betPoints: number
    diamonds: number
    specialItems?: string[]
  }
  
  description: string
}

export const LEVEL_PROGRESSION: Record<number, LevelBettingCapabilities> = {
  1: {
    level: 1,
    name: "Rookie",
    xpRequired: 0,
    
    // Very limited betting for beginners
    minStake: 10,
    maxStake: 500,
    maxDailyBets: 5,
    maxActiveBets: 3,
    maxDailyStake: 2000,
    maxWeeklyStake: 10000,
    
    // Basic features only
    allowSingleBets: true,
    allowAccumulators: false,
    allowLiveBetting: false,
    allowSystemBets: false,
    allowCashOut: false,
    allowDiamondBoosts: false,
    
    // Limited markets
    maxSelections: 1,
    maxOdds: 5.0,
    allowedMarkets: ['1X2', 'OVER_UNDER_2_5'],
    maxPotentialWin: 5000,
    
    features: {
      editBets: false,
      partialCashOut: false,
      betBuilder: false,
      statistics: false,
      autobet: false,
      favoriteTeamBonus: false
    },
    
    levelUpRewards: {
      betPoints: 500,
      diamonds: 5
    },
    
    description: "Welcome! Start with simple match winner bets to learn the basics."
  },
  
  2: {
    level: 2,
    name: "Amateur",
    xpRequired: 100,
    
    minStake: 10,
    maxStake: 1000,
    maxDailyBets: 10,
    maxActiveBets: 5,
    maxDailyStake: 5000,
    maxWeeklyStake: 25000,
    
    allowSingleBets: true,
    allowAccumulators: true, // Unlock doubles
    allowLiveBetting: false,
    allowSystemBets: false,
    allowCashOut: false,
    allowDiamondBoosts: true, // First diamond feature
    
    maxSelections: 2,
    maxOdds: 10.0,
    allowedMarkets: ['1X2', 'OVER_UNDER_2_5', 'BOTH_TEAMS_TO_SCORE'],
    maxPotentialWin: 10000,
    
    features: {
      editBets: false,
      partialCashOut: false,
      betBuilder: false,
      statistics: false,
      autobet: false,
      favoriteTeamBonus: true // Can select favorite team
    },
    
    levelUpRewards: {
      betPoints: 1000,
      diamonds: 10
    },
    
    description: "Diamond boosts unlocked! Create double bets for higher rewards."
  },
  
  3: {
    level: 3,
    name: "Regular",
    xpRequired: 250,
    
    minStake: 10,
    maxStake: 2500,
    maxDailyBets: 15,
    maxActiveBets: 8,
    maxDailyStake: 10000,
    maxWeeklyStake: 50000,
    
    allowSingleBets: true,
    allowAccumulators: true,
    allowLiveBetting: true, // Major unlock
    allowSystemBets: false,
    allowCashOut: false,
    allowDiamondBoosts: true,
    
    maxSelections: 3,
    maxOdds: 25.0,
    allowedMarkets: ['1X2', 'OVER_UNDER_2_5', 'BOTH_TEAMS_TO_SCORE', 'DOUBLE_CHANCE'],
    maxPotentialWin: 25000,
    
    features: {
      editBets: true, // Can edit before match starts
      partialCashOut: false,
      betBuilder: false,
      statistics: true, // Basic stats
      autobet: false,
      favoriteTeamBonus: true
    },
    
    levelUpRewards: {
      betPoints: 2000,
      diamonds: 15
    },
    
    description: "Live betting unlocked! Bet during matches for dynamic odds."
  },
  
  4: {
    level: 4,
    name: "Semi-Pro",
    xpRequired: 500,
    
    minStake: 10,
    maxStake: 5000,
    maxDailyBets: 20,
    maxActiveBets: 10,
    maxDailyStake: 20000,
    maxWeeklyStake: 100000,
    
    allowSingleBets: true,
    allowAccumulators: true,
    allowLiveBetting: true,
    allowSystemBets: false,
    allowCashOut: true, // Cash out unlocked
    allowDiamondBoosts: true,
    
    maxSelections: 5,
    maxOdds: 50.0,
    allowedMarkets: ['1X2', 'OVER_UNDER_2_5', 'BOTH_TEAMS_TO_SCORE', 'DOUBLE_CHANCE', 'CORRECT_SCORE'],
    maxPotentialWin: 50000,
    
    features: {
      editBets: true,
      partialCashOut: false,
      betBuilder: false,
      statistics: true,
      autobet: false,
      favoriteTeamBonus: true
    },
    
    levelUpRewards: {
      betPoints: 3000,
      diamonds: 20
    },
    
    description: "Cash out feature enabled! Secure profits or minimize losses."
  },
  
  5: {
    level: 5,
    name: "Professional",
    xpRequired: 1000,
    
    minStake: 10,
    maxStake: 10000,
    maxDailyBets: 30,
    maxActiveBets: 15,
    maxDailyStake: 50000,
    maxWeeklyStake: 250000,
    
    allowSingleBets: true,
    allowAccumulators: true,
    allowLiveBetting: true,
    allowSystemBets: true, // System bets unlocked
    allowCashOut: true,
    allowDiamondBoosts: true,
    
    maxSelections: 8,
    maxOdds: 100.0,
    allowedMarkets: ['1X2', 'OVER_UNDER_2_5', 'BOTH_TEAMS_TO_SCORE', 'DOUBLE_CHANCE', 'CORRECT_SCORE', 'FIRST_GOAL_SCORER'],
    maxPotentialWin: 100000,
    
    features: {
      editBets: true,
      partialCashOut: true, // Partial cash out
      betBuilder: true, // Custom bet builder
      statistics: true,
      autobet: false,
      favoriteTeamBonus: true
    },
    
    levelUpRewards: {
      betPoints: 5000,
      diamonds: 30,
      specialItems: ['VIP_TOURNAMENT_ACCESS']
    },
    
    description: "System bets and bet builder unlocked! Create complex betting strategies."
  },
  
  6: {
    level: 6,
    name: "Expert",
    xpRequired: 2000,
    
    minStake: 10,
    maxStake: 15000,
    maxDailyBets: 40,
    maxActiveBets: 20,
    maxDailyStake: 75000,
    maxWeeklyStake: 400000,
    
    allowSingleBets: true,
    allowAccumulators: true,
    allowLiveBetting: true,
    allowSystemBets: true,
    allowCashOut: true,
    allowDiamondBoosts: true,
    
    maxSelections: 10,
    maxOdds: 200.0,
    allowedMarkets: ['ALL'], // All markets available
    maxPotentialWin: 200000,
    
    features: {
      editBets: true,
      partialCashOut: true,
      betBuilder: true,
      statistics: true,
      autobet: true, // Auto-betting strategies
      favoriteTeamBonus: true
    },
    
    levelUpRewards: {
      betPoints: 7500,
      diamonds: 40
    },
    
    description: "All markets unlocked! Use auto-betting for strategic play."
  },
  
  7: {
    level: 7,
    name: "Master",
    xpRequired: 3500,
    
    minStake: 10,
    maxStake: 25000,
    maxDailyBets: 50,
    maxActiveBets: 25,
    maxDailyStake: 100000,
    maxWeeklyStake: 600000,
    
    allowSingleBets: true,
    allowAccumulators: true,
    allowLiveBetting: true,
    allowSystemBets: true,
    allowCashOut: true,
    allowDiamondBoosts: true,
    
    maxSelections: 12,
    maxOdds: 500.0,
    allowedMarkets: ['ALL'],
    maxPotentialWin: 500000,
    
    features: {
      editBets: true,
      partialCashOut: true,
      betBuilder: true,
      statistics: true,
      autobet: true,
      favoriteTeamBonus: true
    },
    
    levelUpRewards: {
      betPoints: 10000,
      diamonds: 50,
      specialItems: ['PREMIUM_INSIGHTS']
    },
    
    description: "Master tier reached! Premium insights and enhanced limits."
  },
  
  8: {
    level: 8,
    name: "Champion",
    xpRequired: 5500,
    
    minStake: 10,
    maxStake: 40000,
    maxDailyBets: 75,
    maxActiveBets: 30,
    maxDailyStake: 150000,
    maxWeeklyStake: 900000,
    
    allowSingleBets: true,
    allowAccumulators: true,
    allowLiveBetting: true,
    allowSystemBets: true,
    allowCashOut: true,
    allowDiamondBoosts: true,
    
    maxSelections: 15,
    maxOdds: 1000.0,
    allowedMarkets: ['ALL'],
    maxPotentialWin: 1000000,
    
    features: {
      editBets: true,
      partialCashOut: true,
      betBuilder: true,
      statistics: true,
      autobet: true,
      favoriteTeamBonus: true
    },
    
    levelUpRewards: {
      betPoints: 15000,
      diamonds: 75,
      specialItems: ['ELITE_CHALLENGES']
    },
    
    description: "Champion status! Access elite challenges and tournaments."
  },
  
  9: {
    level: 9,
    name: "Elite",
    xpRequired: 8500,
    
    minStake: 10,
    maxStake: 60000,
    maxDailyBets: 100,
    maxActiveBets: 40,
    maxDailyStake: 250000,
    maxWeeklyStake: 1500000,
    
    allowSingleBets: true,
    allowAccumulators: true,
    allowLiveBetting: true,
    allowSystemBets: true,
    allowCashOut: true,
    allowDiamondBoosts: true,
    
    maxSelections: 20,
    maxOdds: 2000.0,
    allowedMarkets: ['ALL'],
    maxPotentialWin: 2000000,
    
    features: {
      editBets: true,
      partialCashOut: true,
      betBuilder: true,
      statistics: true,
      autobet: true,
      favoriteTeamBonus: true
    },
    
    levelUpRewards: {
      betPoints: 25000,
      diamonds: 100,
      specialItems: ['EXCLUSIVE_EVENTS']
    },
    
    description: "Elite tier! Exclusive events and massive betting limits."
  },
  
  10: {
    level: 10,
    name: "Legend",
    xpRequired: 12500,
    
    minStake: 10,
    maxStake: 100000,
    maxDailyBets: 200,
    maxActiveBets: 50,
    maxDailyStake: 500000,
    maxWeeklyStake: 3000000,
    
    allowSingleBets: true,
    allowAccumulators: true,
    allowLiveBetting: true,
    allowSystemBets: true,
    allowCashOut: true,
    allowDiamondBoosts: true,
    
    maxSelections: 25,
    maxOdds: 5000.0,
    allowedMarkets: ['ALL'],
    maxPotentialWin: 5000000,
    
    features: {
      editBets: true,
      partialCashOut: true,
      betBuilder: true,
      statistics: true,
      autobet: true,
      favoriteTeamBonus: true
    },
    
    levelUpRewards: {
      betPoints: 50000,
      diamonds: 200,
      specialItems: ['LEGEND_STATUS', 'LIFETIME_VIP']
    },
    
    description: "LEGEND STATUS ACHIEVED! Unlimited possibilities await."
  }
}

// Helper functions
export function getLevelCapabilities(level: number): LevelBettingCapabilities {
  return LEVEL_PROGRESSION[level] || LEVEL_PROGRESSION[1]
}

export function getNextLevelRequirements(currentLevel: number): Partial<LevelBettingCapabilities> | null {
  if (currentLevel >= 10) return null
  return LEVEL_PROGRESSION[currentLevel + 1]
}

export function calculateLevelFromXP(xp: number): number {
  let level = 1
  for (let i = 10; i >= 1; i--) {
    if (xp >= LEVEL_PROGRESSION[i].xpRequired) {
      level = i
      break
    }
  }
  return level
}

export function getUnlockedFeatures(newLevel: number, oldLevel: number): string[] {
  const newCaps = LEVEL_PROGRESSION[newLevel]
  const oldCaps = LEVEL_PROGRESSION[oldLevel]
  const unlocked: string[] = []
  
  if (!oldCaps.allowAccumulators && newCaps.allowAccumulators) {
    unlocked.push('Accumulator Bets')
  }
  if (!oldCaps.allowLiveBetting && newCaps.allowLiveBetting) {
    unlocked.push('Live Betting')
  }
  if (!oldCaps.allowCashOut && newCaps.allowCashOut) {
    unlocked.push('Cash Out')
  }
  if (!oldCaps.allowSystemBets && newCaps.allowSystemBets) {
    unlocked.push('System Bets')
  }
  if (!oldCaps.allowDiamondBoosts && newCaps.allowDiamondBoosts) {
    unlocked.push('Diamond Boosts')
  }
  if (!oldCaps.features.betBuilder && newCaps.features.betBuilder) {
    unlocked.push('Bet Builder')
  }
  if (!oldCaps.features.autobet && newCaps.features.autobet) {
    unlocked.push('Auto-Betting')
  }
  if (!oldCaps.features.partialCashOut && newCaps.features.partialCashOut) {
    unlocked.push('Partial Cash Out')
  }
  
  return unlocked
}

export function validateBetAgainstLevel(
  level: number,
  betType: string,
  stake: number,
  selections: number,
  totalOdds: number
): { valid: boolean; error?: string } {
  const caps = LEVEL_PROGRESSION[level]
  
  if (stake < caps.minStake) {
    return { valid: false, error: `Minimum stake is ${caps.minStake} BP (Level ${level})` }
  }
  
  if (stake > caps.maxStake) {
    return { valid: false, error: `Maximum stake is ${caps.maxStake} BP at Level ${level}` }
  }
  
  if (selections > caps.maxSelections) {
    return { valid: false, error: `Maximum ${caps.maxSelections} selections allowed at Level ${level}` }
  }
  
  if (totalOdds > caps.maxOdds) {
    return { valid: false, error: `Maximum odds ${caps.maxOdds} at Level ${level}` }
  }
  
  const potentialWin = stake * totalOdds
  if (potentialWin > caps.maxPotentialWin) {
    return { valid: false, error: `Maximum potential win is ${caps.maxPotentialWin} BP at Level ${level}` }
  }
  
  if (betType === 'ACCUMULATOR' && !caps.allowAccumulators) {
    return { valid: false, error: `Accumulator bets unlock at Level 2` }
  }
  
  if (betType === 'LIVE' && !caps.allowLiveBetting) {
    return { valid: false, error: `Live betting unlocks at Level 3` }
  }
  
  if (betType === 'SYSTEM' && !caps.allowSystemBets) {
    return { valid: false, error: `System bets unlock at Level 5` }
  }
  
  return { valid: true }
}

// Get progression summary for UI
export function getProgressionSummary(currentLevel: number, currentXP: number) {
  const current = LEVEL_PROGRESSION[currentLevel]
  const next = currentLevel < 10 ? LEVEL_PROGRESSION[currentLevel + 1] : null
  
  const xpToNext = next ? next.xpRequired - currentXP : 0
  const progressPercent = next 
    ? ((currentXP - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100
    : 100
  
  return {
    currentLevel: {
      level: current.level,
      name: current.name,
      maxStake: current.maxStake,
      maxDailyBets: current.maxDailyBets,
      features: Object.entries(current.features)
        .filter(([_, enabled]) => enabled)
        .map(([feature]) => feature)
    },
    nextLevel: next ? {
      level: next.level,
      name: next.name,
      xpRequired: xpToNext,
      unlocks: getUnlockedFeatures(next.level, current.level),
      rewards: next.levelUpRewards
    } : null,
    progress: {
      currentXP,
      progressPercent: Math.min(progressPercent, 100),
      xpToNext
    }
  }
}