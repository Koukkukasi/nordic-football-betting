// Simplified Level Progression System
// ALL game modes available from Level 1
// Leveling up increases: stake limits, simultaneous bets, and rewards

export interface LevelProgression {
  level: number
  title: string
  badge: string
  xpRequired: number
  
  // Universal betting limits (applies to ALL game modes)
  bettingLimits: {
    minStake: number
    maxStake: number
    maxSimultaneousBets: number  // How many active bets at once
    maxDailyBets: number
    maxDailySpend: number
  }
  
  // Live betting specific
  liveBetting: {
    maxSimultaneousBets: number  // Live bets running at same time
    diamondCostPerBet: number    // Cost in diamonds
    cashOutAvailable: boolean
    diamondWinChance: number     // % chance to win diamonds on successful bet
  }
  
  // Pitkäveto specific bonuses
  pitkavetoBonuses: {
    maxSelections: number         // How many matches in one accumulator
    selectionBonus: number        // % bonus for multiple selections
  }
  
  // Level rewards
  levelUpRewards: {
    betPoints: number
    diamonds: number
    specialBadge?: string
  }
  
  // Multipliers
  xpMultiplier: number           // XP earned multiplier
  leaderboardMultiplier: number  // Leaderboard points multiplier
}

export const LEVEL_SYSTEM: Record<number, LevelProgression> = {
  1: {
    level: 1,
    title: "Rookie",
    badge: "🌱",
    xpRequired: 0,
    
    bettingLimits: {
      minStake: 10,
      maxStake: 100,
      maxSimultaneousBets: 3,      // Can only have 3 bets running
      maxDailyBets: 20,
      maxDailySpend: 1000
    },
    
    liveBetting: {
      maxSimultaneousBets: 1,      // Only 1 live bet at a time
      diamondCostPerBet: 3,
      cashOutAvailable: false,
      diamondWinChance: 10
    },
    
    pitkavetoBonuses: {
      maxSelections: 3,             // Start with 2-3 game parlays
      selectionBonus: 5             // 5% bonus for 3 selections
    },
    
    levelUpRewards: {
      betPoints: 500,
      diamonds: 5
    },
    
    xpMultiplier: 1.0,
    leaderboardMultiplier: 1.0
  },
  
  2: {
    level: 2,
    title: "Amateur",
    badge: "⚽",
    xpRequired: 100,
    
    bettingLimits: {
      minStake: 10,
      maxStake: 250,               // 2.5x increase
      maxSimultaneousBets: 5,      // Can have 5 bets running
      maxDailyBets: 30,
      maxDailySpend: 2500
    },
    
    liveBetting: {
      maxSimultaneousBets: 2,      // 2 live bets simultaneously
      diamondCostPerBet: 3,
      cashOutAvailable: false,
      diamondWinChance: 15
    },
    
    pitkavetoBonuses: {
      maxSelections: 4,             // Can do 4-game parlays
      selectionBonus: 10            // 10% bonus for 3+ selections
    },
    
    levelUpRewards: {
      betPoints: 1000,
      diamonds: 8
    },
    
    xpMultiplier: 1.1,
    leaderboardMultiplier: 1.1
  },
  
  3: {
    level: 3,
    title: "Regular",
    badge: "🎯",
    xpRequired: 300,
    
    bettingLimits: {
      minStake: 10,
      maxStake: 500,
      maxSimultaneousBets: 8,      // 8 bets at once
      maxDailyBets: 40,
      maxDailySpend: 5000
    },
    
    liveBetting: {
      maxSimultaneousBets: 3,
      diamondCostPerBet: 2,        // Cheaper diamonds
      cashOutAvailable: true,      // Cash out unlocked!
      diamondWinChance: 20
    },
    
    pitkavetoBonuses: {
      maxSelections: 5,             // Up to 5-game parlays
      selectionBonus: 15
    },
    
    levelUpRewards: {
      betPoints: 2000,
      diamonds: 12
    },
    
    xpMultiplier: 1.2,
    leaderboardMultiplier: 1.25
  },
  
  4: {
    level: 4,
    title: "Experienced",
    badge: "⭐",
    xpRequired: 600,
    
    bettingLimits: {
      minStake: 10,
      maxStake: 1000,
      maxSimultaneousBets: 12,
      maxDailyBets: 50,
      maxDailySpend: 10000
    },
    
    liveBetting: {
      maxSimultaneousBets: 4,
      diamondCostPerBet: 2,
      cashOutAvailable: true,
      diamondWinChance: 25
    },
    
    pitkavetoBonuses: {
      maxSelections: 6,             // 6-game parlays
      selectionBonus: 20           // 20% bonus for big accumulators
    },
    
    levelUpRewards: {
      betPoints: 3500,
      diamonds: 18
    },
    
    xpMultiplier: 1.3,
    leaderboardMultiplier: 1.4
  },
  
  5: {
    level: 5,
    title: "Veteran",
    badge: "🏅",
    xpRequired: 1000,
    
    bettingLimits: {
      minStake: 10,
      maxStake: 2000,
      maxSimultaneousBets: 15,
      maxDailyBets: 75,
      maxDailySpend: 20000
    },
    
    liveBetting: {
      maxSimultaneousBets: 5,
      diamondCostPerBet: 1,        // Half price diamonds
      cashOutAvailable: true,
      diamondWinChance: 30
    },
    
    pitkavetoBonuses: {
      maxSelections: 8,             // 8-game parlays
      selectionBonus: 30
    },
    
    levelUpRewards: {
      betPoints: 5000,
      diamonds: 25,
      specialBadge: "Veteran Player"
    },
    
    xpMultiplier: 1.5,
    leaderboardMultiplier: 1.6
  },
  
  6: {
    level: 6,
    title: "Professional",
    badge: "💫",
    xpRequired: 2000,
    
    bettingLimits: {
      minStake: 10,
      maxStake: 3500,
      maxSimultaneousBets: 20,
      maxDailyBets: 100,
      maxDailySpend: 35000
    },
    
    liveBetting: {
      maxSimultaneousBets: 7,
      diamondCostPerBet: 1,
      cashOutAvailable: true,
      diamondWinChance: 35
    },
    
    pitkavetoBonuses: {
      maxSelections: 10,            // 10-game parlays
      selectionBonus: 40
    },
    
    levelUpRewards: {
      betPoints: 7500,
      diamonds: 35
    },
    
    xpMultiplier: 1.6,
    leaderboardMultiplier: 1.8
  },
  
  7: {
    level: 7,
    title: "Expert",
    badge: "🌟",
    xpRequired: 3500,
    
    bettingLimits: {
      minStake: 10,
      maxStake: 5000,
      maxSimultaneousBets: 25,
      maxDailyBets: 150,
      maxDailySpend: 50000
    },
    
    liveBetting: {
      maxSimultaneousBets: 10,
      diamondCostPerBet: 1,
      cashOutAvailable: true,
      diamondWinChance: 40
    },
    
    pitkavetoBonuses: {
      maxSelections: 12,            // 12-game parlays
      selectionBonus: 50
    },
    
    levelUpRewards: {
      betPoints: 10000,
      diamonds: 50
    },
    
    xpMultiplier: 1.8,
    leaderboardMultiplier: 2.0
  },
  
  8: {
    level: 8,
    title: "Master",
    badge: "🔥",
    xpRequired: 5500,
    
    bettingLimits: {
      minStake: 10,
      maxStake: 7500,
      maxSimultaneousBets: 30,
      maxDailyBets: 200,
      maxDailySpend: 75000
    },
    
    liveBetting: {
      maxSimultaneousBets: 8,       // 8 live bets max
      diamondCostPerBet: 1,         // Still costs diamonds
      cashOutAvailable: true,
      diamondWinChance: 50
    },
    
    pitkavetoBonuses: {
      maxSelections: 15,            // 15-game parlays max
      selectionBonus: 75
    },
    
    levelUpRewards: {
      betPoints: 15000,
      diamonds: 75,
      specialBadge: "Master Bettor"
    },
    
    xpMultiplier: 2.0,
    leaderboardMultiplier: 2.5
  },
  
  9: {
    level: 9,
    title: "Champion",
    badge: "👑",
    xpRequired: 8500,
    
    bettingLimits: {
      minStake: 10,
      maxStake: 10000,
      maxSimultaneousBets: 40,
      maxDailyBets: 300,
      maxDailySpend: 100000
    },
    
    liveBetting: {
      maxSimultaneousBets: 10,      // 10 live bets max
      diamondCostPerBet: 1,         // Still costs diamonds
      cashOutAvailable: true,
      diamondWinChance: 60
    },
    
    pitkavetoBonuses: {
      maxSelections: 18,            // 18-game parlays
      selectionBonus: 100         // Double your odds!
    },
    
    levelUpRewards: {
      betPoints: 25000,
      diamonds: 150
    },
    
    xpMultiplier: 2.5,
    leaderboardMultiplier: 3.0
  },
  
  10: {
    level: 10,
    title: "Legend",
    badge: "🏆",
    xpRequired: 12500,
    
    bettingLimits: {
      minStake: 10,
      maxStake: 25000,
      maxSimultaneousBets: 20,     // 20 active bets max
      maxDailyBets: 100,
      maxDailySpend: 250000
    },
    
    liveBetting: {
      maxSimultaneousBets: 12,      // 12 live bets max
      diamondCostPerBet: 1,         // Still costs diamonds
      cashOutAvailable: true,
      diamondWinChance: 75
    },
    
    pitkavetoBonuses: {
      maxSelections: 20,            // 20-game parlays max
      selectionBonus: 150          // Massive bonus!
    },
    
    levelUpRewards: {
      betPoints: 50000,
      diamonds: 500,
      specialBadge: "Living Legend"
    },
    
    xpMultiplier: 3.0,
    leaderboardMultiplier: 4.0
  }
}

// XP System - How players level up
export class XPSystem {
  static readonly XP_REWARDS = {
    // Tulosveto (Single bets)
    SINGLE_BET_PLACED: 5,
    SINGLE_BET_WON: 15,
    SINGLE_HIGH_ODDS_WON: 30,      // Odds > 3.0
    
    // Pitkäveto (Accumulators) - Best XP source
    ACCUMULATOR_PLACED: 10,
    ACCUMULATOR_WON_3: 40,
    ACCUMULATOR_WON_5: 75,
    ACCUMULATOR_WON_10: 150,
    ACCUMULATOR_WON_15: 300,
    ACCUMULATOR_WON_20_PLUS: 500,
    
    // Live betting
    LIVE_BET_PLACED: 7,
    LIVE_BET_WON: 20,
    LIVE_CASHOUT_PROFIT: 10,
    
    // Engagement
    DAILY_LOGIN: 10,
    FIRST_BET_OF_DAY: 15,
    COMPLETE_CHALLENGE: 25,
    WIN_MINI_GAME: 20,
    VIEW_STANDINGS: 2,
    MAKE_PREDICTION: 5,
    
    // Special bonuses
    DERBY_BET_WON: 50,
    PERFECT_DAY: 100,              // All bets won in a day
    WIN_STREAK_5: 75,
    WIN_STREAK_10: 200
  }
  
  static calculateXP(
    action: string,
    level: number,
    details?: any
  ): number {
    const baseXP = this.XP_REWARDS[action as keyof typeof this.XP_REWARDS] || 0
    const levelData = LEVEL_SYSTEM[level]
    
    // Apply level multiplier
    let finalXP = baseXP * levelData.xpMultiplier
    
    // Weekend bonus
    const now = new Date()
    if (now.getDay() === 0 || now.getDay() === 6) {
      finalXP *= 1.2
    }
    
    // Derby bonus
    if (details?.isDerby) {
      finalXP *= 2.0
    }
    
    return Math.floor(finalXP)
  }
}

// Betting validation
export function canPlaceBet(
  userLevel: number,
  betType: 'SINGLE' | 'ACCUMULATOR' | 'LIVE',
  stake: number,
  currentActiveBets: number,
  currentLiveBets: number,
  selections?: number,
  userDiamonds?: number
): { allowed: boolean; reason?: string } {
  
  const level = LEVEL_SYSTEM[userLevel]
  
  // Check stake limits (same for all bet types)
  if (stake < level.bettingLimits.minStake) {
    return { allowed: false, reason: `Minimum stake is ${level.bettingLimits.minStake} BP` }
  }
  
  if (stake > level.bettingLimits.maxStake) {
    return { allowed: false, reason: `Maximum stake at Level ${userLevel} is ${level.bettingLimits.maxStake} BP` }
  }
  
  // Check simultaneous bets
  if (betType === 'LIVE') {
    if (currentLiveBets >= level.liveBetting.maxSimultaneousBets) {
      return { 
        allowed: false, 
        reason: `You can only have ${level.liveBetting.maxSimultaneousBets} live bets at Level ${userLevel}` 
      }
    }
    
    // Check diamond cost
    if (level.liveBetting.diamondCostPerBet > 0) {
      if (!userDiamonds || userDiamonds < level.liveBetting.diamondCostPerBet) {
        return { 
          allowed: false, 
          reason: `Need ${level.liveBetting.diamondCostPerBet} diamonds for live betting` 
        }
      }
    }
  } else {
    if (currentActiveBets >= level.bettingLimits.maxSimultaneousBets) {
      return { 
        allowed: false, 
        reason: `You can only have ${level.bettingLimits.maxSimultaneousBets} active bets at Level ${userLevel}` 
      }
    }
  }
  
  // Check accumulator selections
  if (betType === 'ACCUMULATOR' && selections) {
    if (selections > level.pitkavetoBonuses.maxSelections) {
      return { 
        allowed: false, 
        reason: `Maximum ${level.pitkavetoBonuses.maxSelections} selections at Level ${userLevel}` 
      }
    }
  }
  
  return { allowed: true }
}

// Get level benefits summary
export function getLevelBenefits(level: number) {
  const current = LEVEL_SYSTEM[level]
  const next = LEVEL_SYSTEM[level + 1]
  
  return {
    current: {
      title: current.title,
      maxStake: current.bettingLimits.maxStake,
      simultaneousBets: current.bettingLimits.maxSimultaneousBets,
      liveBets: current.liveBetting.maxSimultaneousBets,
      diamondCost: current.liveBetting.diamondCostPerBet,
      xpBonus: `${(current.xpMultiplier - 1) * 100}%`,
      leaderboardBonus: `${(current.leaderboardMultiplier - 1) * 100}%`
    },
    nextLevel: next ? {
      title: next.title,
      maxStake: next.bettingLimits.maxStake,
      simultaneousBets: next.bettingLimits.maxSimultaneousBets,
      liveBets: next.liveBetting.maxSimultaneousBets,
      improvements: [
        `Max stake: ${current.bettingLimits.maxStake} → ${next.bettingLimits.maxStake} BP`,
        `Active bets: ${current.bettingLimits.maxSimultaneousBets} → ${next.bettingLimits.maxSimultaneousBets}`,
        `Live bets: ${current.liveBetting.maxSimultaneousBets} → ${next.liveBetting.maxSimultaneousBets}`,
        current.liveBetting.diamondCostPerBet > next.liveBetting.diamondCostPerBet 
          ? `Diamond cost: ${current.liveBetting.diamondCostPerBet} → ${next.liveBetting.diamondCostPerBet}` : null
      ].filter(Boolean)
    } : null
  }
}