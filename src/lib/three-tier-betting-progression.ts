// Three-Tier Betting and XP Progression System
// Pitkäveto & Tulosveto (BetPoints) → XP → Level Up
// Live Betting (Diamonds) → Premium Experience

export interface BettingTier {
  id: string
  name: string
  currency: 'BETPOINTS' | 'DIAMONDS'
  xpMultiplier: number
  features: string[]
  levelRequired: number
}

export const BETTING_TIERS = {
  // TIER 1: Basic betting with BetPoints - Main progression path
  TULOSVETO: {
    id: 'tulosveto',
    name: 'Tulosveto (Match Result)',
    currency: 'BETPOINTS' as const,
    xpMultiplier: 1.0,
    features: [
      '1X2 betting',
      'Over/Under goals',
      'Both teams to score',
      'Simple and quick'
    ],
    levelRequired: 1
  },
  
  // TIER 2: Advanced betting with BetPoints - Enhanced progression
  PITKAVETO: {
    id: 'pitkaveto',
    name: 'Pitkäveto (Accumulator)',
    currency: 'BETPOINTS' as const,
    xpMultiplier: 1.5, // 50% more XP for complexity
    features: [
      'Multiple match combinations',
      'Higher potential returns',
      'Bonus for 3+ selections',
      'Strategic planning required'
    ],
    levelRequired: 2
  },
  
  // TIER 3: Premium live betting with Diamonds - Not for XP farming
  LIVE_BETTING: {
    id: 'live',
    name: 'Live Betting (Premium)',
    currency: 'DIAMONDS' as const,
    xpMultiplier: 0.5, // Less XP but better rewards
    features: [
      'Real-time odds',
      'Cash out option',
      'Diamond rewards on wins',
      'Exclusive live markets'
    ],
    levelRequired: 3
  }
}

// Player Level Progression Based on XP
export interface PlayerLevel {
  level: number
  rank: string
  badge: string
  xpRequired: number
  
  // Betting capabilities per tier
  tulosveto: {
    enabled: boolean
    maxDailyBets: number
    minStake: number
    maxStake: number
    maxDailySpend: number
  }
  
  pitkaveto: {
    enabled: boolean
    maxDailyBets: number
    minStake: number
    maxStake: number
    maxSelections: number
    selectionBonus: number // Percentage bonus for multiple selections
  }
  
  liveBetting: {
    enabled: boolean
    maxDailyBets: number
    diamondCostPerBet: number
    cashOutEnabled: boolean
    diamondRewardChance: number // Percentage chance to win diamonds
  }
  
  // Level rewards
  levelUpRewards: {
    betPoints: number
    diamonds: number
    unlockedFeatures: string[]
  }
  
  // Leaderboard benefits
  leaderboardMultiplier: number
  weeklyBonusMultiplier: number
}

export const PLAYER_LEVELS: Record<number, PlayerLevel> = {
  1: {
    level: 1,
    rank: "Aloittelija (Beginner)",
    badge: "🌱",
    xpRequired: 0,
    
    tulosveto: {
      enabled: true,
      maxDailyBets: 10,
      minStake: 10,
      maxStake: 100,
      maxDailySpend: 500
    },
    
    pitkaveto: {
      enabled: false, // Unlocks at level 2
      maxDailyBets: 0,
      minStake: 0,
      maxStake: 0,
      maxSelections: 0,
      selectionBonus: 0
    },
    
    liveBetting: {
      enabled: false, // Unlocks at level 3
      maxDailyBets: 0,
      diamondCostPerBet: 0,
      cashOutEnabled: false,
      diamondRewardChance: 0
    },
    
    levelUpRewards: {
      betPoints: 500,
      diamonds: 3,
      unlockedFeatures: ["Basic stats", "Daily challenges"]
    },
    
    leaderboardMultiplier: 1.0,
    weeklyBonusMultiplier: 1.0
  },
  
  2: {
    level: 2,
    rank: "Harrastaja (Amateur)",
    badge: "⚽",
    xpRequired: 100,
    
    tulosveto: {
      enabled: true,
      maxDailyBets: 15,
      minStake: 10,
      maxStake: 250,
      maxDailySpend: 1500
    },
    
    pitkaveto: {
      enabled: true, // UNLOCKED!
      maxDailyBets: 5,
      minStake: 20,
      maxStake: 200,
      maxSelections: 3,
      selectionBonus: 5 // 5% bonus for 3 selections
    },
    
    liveBetting: {
      enabled: false,
      maxDailyBets: 0,
      diamondCostPerBet: 0,
      cashOutEnabled: false,
      diamondRewardChance: 0
    },
    
    levelUpRewards: {
      betPoints: 1000,
      diamonds: 5,
      unlockedFeatures: ["Pitkäveto betting", "Team comparison"]
    },
    
    leaderboardMultiplier: 1.1,
    weeklyBonusMultiplier: 1.05
  },
  
  3: {
    level: 3,
    rank: "Pelaaja (Player)",
    badge: "🎯",
    xpRequired: 300,
    
    tulosveto: {
      enabled: true,
      maxDailyBets: 20,
      minStake: 10,
      maxStake: 500,
      maxDailySpend: 3000
    },
    
    pitkaveto: {
      enabled: true,
      maxDailyBets: 8,
      minStake: 20,
      maxStake: 400,
      maxSelections: 5,
      selectionBonus: 10 // 10% for 4+, 15% for 5
    },
    
    liveBetting: {
      enabled: true, // UNLOCKED!
      maxDailyBets: 3,
      diamondCostPerBet: 2,
      cashOutEnabled: false,
      diamondRewardChance: 20
    },
    
    levelUpRewards: {
      betPoints: 2000,
      diamonds: 10,
      unlockedFeatures: ["Live betting", "Head-to-head stats"]
    },
    
    leaderboardMultiplier: 1.2,
    weeklyBonusMultiplier: 1.1
  },
  
  4: {
    level: 4,
    rank: "Kokenut (Experienced)",
    badge: "⭐",
    xpRequired: 600,
    
    tulosveto: {
      enabled: true,
      maxDailyBets: 30,
      minStake: 10,
      maxStake: 1000,
      maxDailySpend: 5000
    },
    
    pitkaveto: {
      enabled: true,
      maxDailyBets: 10,
      minStake: 20,
      maxStake: 750,
      maxSelections: 8,
      selectionBonus: 20 // Up to 20% for 6+, 30% for 8
    },
    
    liveBetting: {
      enabled: true,
      maxDailyBets: 5,
      diamondCostPerBet: 2,
      cashOutEnabled: true, // Cash out unlocked!
      diamondRewardChance: 25
    },
    
    levelUpRewards: {
      betPoints: 3500,
      diamonds: 15,
      unlockedFeatures: ["Cash out", "Advanced statistics"]
    },
    
    leaderboardMultiplier: 1.35,
    weeklyBonusMultiplier: 1.15
  },
  
  5: {
    level: 5,
    rank: "Veteraani (Veteran)",
    badge: "🏅",
    xpRequired: 1000,
    
    tulosveto: {
      enabled: true,
      maxDailyBets: 40,
      minStake: 10,
      maxStake: 2000,
      maxDailySpend: 10000
    },
    
    pitkaveto: {
      enabled: true,
      maxDailyBets: 15,
      minStake: 20,
      maxStake: 1500,
      maxSelections: 10,
      selectionBonus: 40 // Up to 40% for 8+, 50% for 10
    },
    
    liveBetting: {
      enabled: true,
      maxDailyBets: 8,
      diamondCostPerBet: 1, // Reduced cost
      cashOutEnabled: true,
      diamondRewardChance: 30
    },
    
    levelUpRewards: {
      betPoints: 5000,
      diamonds: 25,
      unlockedFeatures: ["VIP tournaments", "Bet builder"]
    },
    
    leaderboardMultiplier: 1.5,
    weeklyBonusMultiplier: 1.2
  },
  
  6: {
    level: 6,
    rank: "Mestari (Master)",
    badge: "🌟",
    xpRequired: 2000,
    
    tulosveto: {
      enabled: true,
      maxDailyBets: 50,
      minStake: 10,
      maxStake: 3000,
      maxDailySpend: 20000
    },
    
    pitkaveto: {
      enabled: true,
      maxDailyBets: 20,
      minStake: 20,
      maxStake: 2500,
      maxSelections: 12,
      selectionBonus: 60 // Up to 60% for 10+, 75% for 12
    },
    
    liveBetting: {
      enabled: true,
      maxDailyBets: 12,
      diamondCostPerBet: 1,
      cashOutEnabled: true,
      diamondRewardChance: 35
    },
    
    levelUpRewards: {
      betPoints: 7500,
      diamonds: 40,
      unlockedFeatures: ["Elite challenges", "Custom leagues"]
    },
    
    leaderboardMultiplier: 1.75,
    weeklyBonusMultiplier: 1.3
  },
  
  7: {
    level: 7,
    rank: "Ammattilainen (Professional)",
    badge: "💫",
    xpRequired: 3500,
    
    tulosveto: {
      enabled: true,
      maxDailyBets: 75,
      minStake: 10,
      maxStake: 5000,
      maxDailySpend: 30000
    },
    
    pitkaveto: {
      enabled: true,
      maxDailyBets: 25,
      minStake: 20,
      maxStake: 4000,
      maxSelections: 15,
      selectionBonus: 80 // Up to 80% for 12+, 100% for 15
    },
    
    liveBetting: {
      enabled: true,
      maxDailyBets: 15,
      diamondCostPerBet: 1,
      cashOutEnabled: true,
      diamondRewardChance: 40
    },
    
    levelUpRewards: {
      betPoints: 10000,
      diamonds: 60,
      unlockedFeatures: ["Pro analytics", "AI predictions"]
    },
    
    leaderboardMultiplier: 2.0,
    weeklyBonusMultiplier: 1.4
  },
  
  8: {
    level: 8,
    rank: "Eliitti (Elite)",
    badge: "🔥",
    xpRequired: 5500,
    
    tulosveto: {
      enabled: true,
      maxDailyBets: 100,
      minStake: 10,
      maxStake: 7500,
      maxDailySpend: 50000
    },
    
    pitkaveto: {
      enabled: true,
      maxDailyBets: 30,
      minStake: 20,
      maxStake: 6000,
      maxSelections: 20,
      selectionBonus: 120 // Up to 120% for 15+, 150% for 20
    },
    
    liveBetting: {
      enabled: true,
      maxDailyBets: 20,
      diamondCostPerBet: 0, // FREE live betting!
      cashOutEnabled: true,
      diamondRewardChance: 50
    },
    
    levelUpRewards: {
      betPoints: 15000,
      diamonds: 100,
      unlockedFeatures: ["Free live betting", "Elite league"]
    },
    
    leaderboardMultiplier: 2.5,
    weeklyBonusMultiplier: 1.5
  },
  
  9: {
    level: 9,
    rank: "Mestari (Champion)",
    badge: "👑",
    xpRequired: 8500,
    
    tulosveto: {
      enabled: true,
      maxDailyBets: 150,
      minStake: 10,
      maxStake: 10000,
      maxDailySpend: 100000
    },
    
    pitkaveto: {
      enabled: true,
      maxDailyBets: 40,
      minStake: 20,
      maxStake: 8000,
      maxSelections: 25,
      selectionBonus: 175 // Up to 175% for 20+, 200% for 25
    },
    
    liveBetting: {
      enabled: true,
      maxDailyBets: 30,
      diamondCostPerBet: 0,
      cashOutEnabled: true,
      diamondRewardChance: 60
    },
    
    levelUpRewards: {
      betPoints: 25000,
      diamonds: 200,
      unlockedFeatures: ["Champion status", "Exclusive events"]
    },
    
    leaderboardMultiplier: 3.0,
    weeklyBonusMultiplier: 1.75
  },
  
  10: {
    level: 10,
    rank: "Legenda (Legend)",
    badge: "🏆",
    xpRequired: 12500,
    
    tulosveto: {
      enabled: true,
      maxDailyBets: 999,
      minStake: 10,
      maxStake: 25000,
      maxDailySpend: 999999
    },
    
    pitkaveto: {
      enabled: true,
      maxDailyBets: 999,
      minStake: 20,
      maxStake: 20000,
      maxSelections: 30,
      selectionBonus: 250 // Up to 250% bonus!
    },
    
    liveBetting: {
      enabled: true,
      maxDailyBets: 999,
      diamondCostPerBet: 0,
      cashOutEnabled: true,
      diamondRewardChance: 75
    },
    
    levelUpRewards: {
      betPoints: 50000,
      diamonds: 500,
      unlockedFeatures: ["Legend status", "Lifetime VIP", "Custom avatar"]
    },
    
    leaderboardMultiplier: 4.0,
    weeklyBonusMultiplier: 2.0
  }
}

// XP Calculation System
export class XPProgressionSystem {
  // Base XP values for different actions
  static readonly XP_VALUES = {
    // Tulosveto (Basic betting)
    TULOSVETO_PLACED: 5,
    TULOSVETO_WON: 15,
    TULOSVETO_HIGH_ODDS_WON: 25, // Odds > 3.0
    
    // Pitkäveto (Accumulator - Main XP source)
    PITKAVETO_PLACED: 10,
    PITKAVETO_WON_3_SELECTIONS: 30,
    PITKAVETO_WON_5_SELECTIONS: 50,
    PITKAVETO_WON_8_SELECTIONS: 100,
    PITKAVETO_WON_10_PLUS: 200,
    
    // Live betting (Less XP, more rewards)
    LIVE_BET_PLACED: 3,
    LIVE_BET_WON: 10,
    LIVE_CASHOUT: 5,
    
    // Engagement activities
    DAILY_LOGIN: 5,
    VIEW_STANDINGS: 2,
    COMPLETE_CHALLENGE: 20,
    WIN_MINI_GAME: 15,
    DERBY_BET: 30,
    PERFECT_WEEK: 100 // All bets won in a week
  }
  
  static calculateBettingXP(
    betType: 'TULOSVETO' | 'PITKAVETO' | 'LIVE',
    outcome: 'PLACED' | 'WON' | 'LOST',
    details: {
      selections?: number
      odds?: number
      stake?: number
      isDerby?: boolean
      isFirstOfDay?: boolean
    }
  ): number {
    let baseXP = 0
    
    // Calculate base XP
    if (betType === 'TULOSVETO') {
      if (outcome === 'PLACED') {
        baseXP = this.XP_VALUES.TULOSVETO_PLACED
      } else if (outcome === 'WON') {
        baseXP = details.odds && details.odds > 3.0 
          ? this.XP_VALUES.TULOSVETO_HIGH_ODDS_WON
          : this.XP_VALUES.TULOSVETO_WON
      }
    } else if (betType === 'PITKAVETO') {
      if (outcome === 'PLACED') {
        baseXP = this.XP_VALUES.PITKAVETO_PLACED
      } else if (outcome === 'WON') {
        const selections = details.selections || 0
        if (selections >= 10) baseXP = this.XP_VALUES.PITKAVETO_WON_10_PLUS
        else if (selections >= 8) baseXP = this.XP_VALUES.PITKAVETO_WON_8_SELECTIONS
        else if (selections >= 5) baseXP = this.XP_VALUES.PITKAVETO_WON_5_SELECTIONS
        else if (selections >= 3) baseXP = this.XP_VALUES.PITKAVETO_WON_3_SELECTIONS
      }
    } else if (betType === 'LIVE') {
      if (outcome === 'PLACED') {
        baseXP = this.XP_VALUES.LIVE_BET_PLACED
      } else if (outcome === 'WON') {
        baseXP = this.XP_VALUES.LIVE_BET_WON
      }
    }
    
    // Apply multipliers
    let multiplier = 1.0
    
    if (details.isDerby) {
      multiplier *= 2.0 // Double XP for derby matches
    }
    
    if (details.isFirstOfDay) {
      multiplier *= 1.5 // 50% bonus for first bet of the day
    }
    
    // Weekend bonus
    const now = new Date()
    if (now.getDay() === 0 || now.getDay() === 6) {
      multiplier *= 1.2 // 20% weekend bonus
    }
    
    return Math.floor(baseXP * multiplier)
  }
  
  static getProgressToNextLevel(currentXP: number, currentLevel: number): {
    percentage: number
    xpNeeded: number
    nextLevelReward: any
  } {
    const current = PLAYER_LEVELS[currentLevel]
    const next = PLAYER_LEVELS[currentLevel + 1]
    
    if (!next) {
      return {
        percentage: 100,
        xpNeeded: 0,
        nextLevelReward: null
      }
    }
    
    const xpInLevel = currentXP - current.xpRequired
    const xpForNext = next.xpRequired - current.xpRequired
    
    return {
      percentage: Math.min(100, (xpInLevel / xpForNext) * 100),
      xpNeeded: Math.max(0, next.xpRequired - currentXP),
      nextLevelReward: next.levelUpRewards
    }
  }
}

// Validate betting based on tier and level
export function validateBetting(
  playerLevel: number,
  betType: 'TULOSVETO' | 'PITKAVETO' | 'LIVE',
  stake: number,
  selections?: number,
  playerDiamonds?: number
): { valid: boolean; error?: string } {
  const level = PLAYER_LEVELS[playerLevel]
  
  if (betType === 'TULOSVETO') {
    if (!level.tulosveto.enabled) {
      return { valid: false, error: 'Tulosveto not available at your level' }
    }
    if (stake < level.tulosveto.minStake) {
      return { valid: false, error: `Minimum stake: ${level.tulosveto.minStake} BP` }
    }
    if (stake > level.tulosveto.maxStake) {
      return { valid: false, error: `Maximum stake: ${level.tulosveto.maxStake} BP` }
    }
  } else if (betType === 'PITKAVETO') {
    if (!level.pitkaveto.enabled) {
      return { valid: false, error: 'Pitkäveto unlocks at Level 2' }
    }
    if (stake < level.pitkaveto.minStake) {
      return { valid: false, error: `Minimum stake: ${level.pitkaveto.minStake} BP` }
    }
    if (stake > level.pitkaveto.maxStake) {
      return { valid: false, error: `Maximum stake: ${level.pitkaveto.maxStake} BP` }
    }
    if (selections && selections > level.pitkaveto.maxSelections) {
      return { valid: false, error: `Maximum ${level.pitkaveto.maxSelections} selections` }
    }
  } else if (betType === 'LIVE') {
    if (!level.liveBetting.enabled) {
      return { valid: false, error: 'Live betting unlocks at Level 3' }
    }
    if (playerDiamonds !== undefined && playerDiamonds < level.liveBetting.diamondCostPerBet) {
      return { valid: false, error: `Need ${level.liveBetting.diamondCostPerBet} diamonds` }
    }
  }
  
  return { valid: true }
}