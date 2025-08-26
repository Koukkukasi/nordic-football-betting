// Free-to-Play Progression System with Two-Tier Betting
// Focus: Player ranking, leaderboard competition, and engagement

export interface PlayerRank {
  level: number
  title: string
  badge: string
  xpRequired: number
  leaderboardMultiplier: number // Points earned multiplier for leaderboard
  
  // Two-tier betting system
  standardBetting: {
    enabled: boolean
    maxBetsPerDay: number
    maxStake: number
    maxWinMultiplier: number // How much they can win relative to stake
  }
  
  premiumBetting: {
    enabled: boolean
    maxBetsPerDay: number
    maxStake: number
    maxWinMultiplier: number
    diamondCost: number // Diamonds needed per premium bet
  }
  
  // Progression rewards
  rankUpRewards: {
    betPoints: number
    diamonds: number
    trophies: number
    specialBadges?: string[]
  }
  
  // Features unlocked at this rank
  unlockedFeatures: string[]
}

// Player Ranking System (Focus on Competition)
export const PLAYER_RANKS: Record<number, PlayerRank> = {
  1: {
    level: 1,
    title: "Bronze Rookie",
    badge: "🥉",
    xpRequired: 0,
    leaderboardMultiplier: 1.0,
    
    standardBetting: {
      enabled: true,
      maxBetsPerDay: 10,
      maxStake: 100,
      maxWinMultiplier: 3
    },
    
    premiumBetting: {
      enabled: false,
      maxBetsPerDay: 0,
      maxStake: 0,
      maxWinMultiplier: 0,
      diamondCost: 0
    },
    
    rankUpRewards: {
      betPoints: 1000,
      diamonds: 5,
      trophies: 1
    },
    
    unlockedFeatures: ["Basic Betting", "Daily Challenges"]
  },
  
  2: {
    level: 2,
    title: "Bronze Player",
    badge: "🥉⭐",
    xpRequired: 100,
    leaderboardMultiplier: 1.1,
    
    standardBetting: {
      enabled: true,
      maxBetsPerDay: 15,
      maxStake: 200,
      maxWinMultiplier: 4
    },
    
    premiumBetting: {
      enabled: true, // Premium tier unlocks
      maxBetsPerDay: 3,
      maxStake: 500,
      maxWinMultiplier: 10,
      diamondCost: 2
    },
    
    rankUpRewards: {
      betPoints: 2000,
      diamonds: 10,
      trophies: 2
    },
    
    unlockedFeatures: ["Premium Bets", "Mini-Games"]
  },
  
  3: {
    level: 3,
    title: "Silver Contender",
    badge: "🥈",
    xpRequired: 300,
    leaderboardMultiplier: 1.25,
    
    standardBetting: {
      enabled: true,
      maxBetsPerDay: 20,
      maxStake: 300,
      maxWinMultiplier: 5
    },
    
    premiumBetting: {
      enabled: true,
      maxBetsPerDay: 5,
      maxStake: 1000,
      maxWinMultiplier: 15,
      diamondCost: 3
    },
    
    rankUpRewards: {
      betPoints: 3500,
      diamonds: 15,
      trophies: 3
    },
    
    unlockedFeatures: ["Live Betting", "Prediction Tournaments"]
  },
  
  4: {
    level: 4,
    title: "Silver Warrior",
    badge: "🥈⭐",
    xpRequired: 600,
    leaderboardMultiplier: 1.4,
    
    standardBetting: {
      enabled: true,
      maxBetsPerDay: 25,
      maxStake: 500,
      maxWinMultiplier: 6
    },
    
    premiumBetting: {
      enabled: true,
      maxBetsPerDay: 7,
      maxStake: 2000,
      maxWinMultiplier: 20,
      diamondCost: 4
    },
    
    rankUpRewards: {
      betPoints: 5000,
      diamonds: 20,
      trophies: 5,
      specialBadges: ["Derby Specialist"]
    },
    
    unlockedFeatures: ["Combo Bets", "Weekly Tournaments"]
  },
  
  5: {
    level: 5,
    title: "Gold Champion",
    badge: "🥇",
    xpRequired: 1000,
    leaderboardMultiplier: 1.6,
    
    standardBetting: {
      enabled: true,
      maxBetsPerDay: 30,
      maxStake: 750,
      maxWinMultiplier: 8
    },
    
    premiumBetting: {
      enabled: true,
      maxBetsPerDay: 10,
      maxStake: 3000,
      maxWinMultiplier: 30,
      diamondCost: 5
    },
    
    rankUpRewards: {
      betPoints: 7500,
      diamonds: 30,
      trophies: 8,
      specialBadges: ["Gold Standard"]
    },
    
    unlockedFeatures: ["VIP Mini-Games", "Season Pass"]
  },
  
  6: {
    level: 6,
    title: "Gold Master",
    badge: "🥇⭐",
    xpRequired: 1750,
    leaderboardMultiplier: 1.8,
    
    standardBetting: {
      enabled: true,
      maxBetsPerDay: 40,
      maxStake: 1000,
      maxWinMultiplier: 10
    },
    
    premiumBetting: {
      enabled: true,
      maxBetsPerDay: 15,
      maxStake: 5000,
      maxWinMultiplier: 40,
      diamondCost: 5
    },
    
    rankUpRewards: {
      betPoints: 10000,
      diamonds: 40,
      trophies: 12
    },
    
    unlockedFeatures: ["Elite Challenges", "Private Leagues"]
  },
  
  7: {
    level: 7,
    title: "Platinum Elite",
    badge: "💎",
    xpRequired: 3000,
    leaderboardMultiplier: 2.0,
    
    standardBetting: {
      enabled: true,
      maxBetsPerDay: 50,
      maxStake: 1500,
      maxWinMultiplier: 12
    },
    
    premiumBetting: {
      enabled: true,
      maxBetsPerDay: 20,
      maxStake: 7500,
      maxWinMultiplier: 50,
      diamondCost: 4 // Reduced cost for elite players
    },
    
    rankUpRewards: {
      betPoints: 15000,
      diamonds: 60,
      trophies: 20,
      specialBadges: ["Platinum Player"]
    },
    
    unlockedFeatures: ["Custom Tournaments", "AI Predictions"]
  },
  
  8: {
    level: 8,
    title: "Diamond Legend",
    badge: "💎⭐",
    xpRequired: 5000,
    leaderboardMultiplier: 2.5,
    
    standardBetting: {
      enabled: true,
      maxBetsPerDay: 75,
      maxStake: 2000,
      maxWinMultiplier: 15
    },
    
    premiumBetting: {
      enabled: true,
      maxBetsPerDay: 30,
      maxStake: 10000,
      maxWinMultiplier: 75,
      diamondCost: 3
    },
    
    rankUpRewards: {
      betPoints: 25000,
      diamonds: 100,
      trophies: 35
    },
    
    unlockedFeatures: ["Legend League", "Exclusive Events"]
  },
  
  9: {
    level: 9,
    title: "Nordic Master",
    badge: "👑",
    xpRequired: 8000,
    leaderboardMultiplier: 3.0,
    
    standardBetting: {
      enabled: true,
      maxBetsPerDay: 100,
      maxStake: 3000,
      maxWinMultiplier: 20
    },
    
    premiumBetting: {
      enabled: true,
      maxBetsPerDay: 50,
      maxStake: 15000,
      maxWinMultiplier: 100,
      diamondCost: 2
    },
    
    rankUpRewards: {
      betPoints: 40000,
      diamonds: 150,
      trophies: 50,
      specialBadges: ["Nordic Crown"]
    },
    
    unlockedFeatures: ["Master Tournaments", "Hall of Fame Access"]
  },
  
  10: {
    level: 10,
    title: "Ultimate Legend",
    badge: "🏆",
    xpRequired: 12500,
    leaderboardMultiplier: 4.0,
    
    standardBetting: {
      enabled: true,
      maxBetsPerDay: 999,
      maxStake: 5000,
      maxWinMultiplier: 30
    },
    
    premiumBetting: {
      enabled: true,
      maxBetsPerDay: 999,
      maxStake: 25000,
      maxWinMultiplier: 200,
      diamondCost: 1 // Minimal cost for legends
    },
    
    rankUpRewards: {
      betPoints: 100000,
      diamonds: 500,
      trophies: 100,
      specialBadges: ["Ultimate Legend", "Hall of Fame"]
    },
    
    unlockedFeatures: ["Unlimited Access", "Legend Status", "Custom Avatar"]
  }
}

// Mini-Games Between Matches
export interface MiniGame {
  id: string
  name: string
  description: string
  type: 'INSTANT' | 'DAILY' | 'TOURNAMENT'
  cooldown: number // Minutes between plays
  cost: {
    currency: 'BETPOINTS' | 'DIAMONDS' | 'FREE'
    amount: number
  }
  rewards: {
    min: number
    max: number
    currency: 'BETPOINTS' | 'DIAMONDS' | 'XP'
  }
  requiredLevel: number
}

export const MINI_GAMES: MiniGame[] = [
  {
    id: 'penalty_shootout',
    name: 'Penalty Shootout',
    description: 'Score 5 penalties to win rewards!',
    type: 'INSTANT',
    cooldown: 30,
    cost: { currency: 'FREE', amount: 0 },
    rewards: { min: 50, max: 500, currency: 'BETPOINTS' },
    requiredLevel: 1
  },
  {
    id: 'match_predictor',
    name: 'Quick Predictor',
    description: 'Predict the outcome of a simulated match',
    type: 'INSTANT',
    cooldown: 15,
    cost: { currency: 'BETPOINTS', amount: 20 },
    rewards: { min: 30, max: 200, currency: 'BETPOINTS' },
    requiredLevel: 1
  },
  {
    id: 'team_builder',
    name: 'Dream Team Builder',
    description: 'Build the best Nordic XI and compete',
    type: 'DAILY',
    cooldown: 1440, // 24 hours
    cost: { currency: 'FREE', amount: 0 },
    rewards: { min: 500, max: 2000, currency: 'BETPOINTS' },
    requiredLevel: 2
  },
  {
    id: 'diamond_dash',
    name: 'Diamond Dash',
    description: 'Collect diamonds in a timed challenge',
    type: 'INSTANT',
    cooldown: 60,
    cost: { currency: 'BETPOINTS', amount: 100 },
    rewards: { min: 1, max: 5, currency: 'DIAMONDS' },
    requiredLevel: 3
  },
  {
    id: 'trivia_challenge',
    name: 'Nordic Football Trivia',
    description: 'Test your knowledge of Nordic football',
    type: 'DAILY',
    cooldown: 720, // 12 hours
    cost: { currency: 'FREE', amount: 0 },
    rewards: { min: 100, max: 1000, currency: 'XP' },
    requiredLevel: 1
  },
  {
    id: 'lucky_wheel',
    name: 'Fortune Wheel',
    description: 'Spin the wheel for random rewards',
    type: 'INSTANT',
    cooldown: 180, // 3 hours
    cost: { currency: 'DIAMONDS', amount: 1 },
    rewards: { min: 100, max: 5000, currency: 'BETPOINTS' },
    requiredLevel: 2
  },
  {
    id: 'league_predictor',
    name: 'Weekend League Challenge',
    description: 'Predict all weekend matches for mega rewards',
    type: 'TOURNAMENT',
    cooldown: 10080, // Weekly
    cost: { currency: 'BETPOINTS', amount: 500 },
    rewards: { min: 2000, max: 50000, currency: 'BETPOINTS' },
    requiredLevel: 4
  },
  {
    id: 'derby_duel',
    name: 'Derby Duel',
    description: 'Head-to-head predictions against other players',
    type: 'INSTANT',
    cooldown: 45,
    cost: { currency: 'BETPOINTS', amount: 50 },
    rewards: { min: 75, max: 150, currency: 'BETPOINTS' },
    requiredLevel: 3
  }
]

// Leaderboard System
export interface LeaderboardEntry {
  userId: string
  username: string
  rank: PlayerRank
  score: number
  weeklyPoints: number
  monthlyPoints: number
  trophies: number
  winStreak: number
}

export class LeaderboardSystem {
  // Calculate points for leaderboard
  static calculatePoints(
    betOutcome: 'WIN' | 'LOSS',
    stake: number,
    odds: number,
    playerLevel: number,
    isPremiumBet: boolean
  ): number {
    const rank = PLAYER_RANKS[playerLevel]
    let basePoints = 0
    
    if (betOutcome === 'WIN') {
      basePoints = stake * odds * 0.1 // Base calculation
      if (isPremiumBet) {
        basePoints *= 2 // Premium bets worth double points
      }
      basePoints *= rank.leaderboardMultiplier
    } else {
      basePoints = stake * 0.01 // Small consolation points for participation
    }
    
    return Math.floor(basePoints)
  }
  
  // Get player's current tier (Standard or Premium)
  static getBettingTier(
    playerLevel: number,
    diamonds: number,
    betType: 'STANDARD' | 'PREMIUM'
  ): { canBet: boolean; reason?: string } {
    const rank = PLAYER_RANKS[playerLevel]
    
    if (betType === 'STANDARD') {
      return { canBet: rank.standardBetting.enabled }
    }
    
    if (betType === 'PREMIUM') {
      if (!rank.premiumBetting.enabled) {
        return { canBet: false, reason: `Premium betting unlocks at Level 2` }
      }
      if (diamonds < rank.premiumBetting.diamondCost) {
        return { canBet: false, reason: `Need ${rank.premiumBetting.diamondCost} diamonds` }
      }
      return { canBet: true }
    }
    
    return { canBet: false }
  }
}

// XP and Progression Calculations
export class ProgressionSystem {
  static readonly XP_ACTIONS = {
    STANDARD_BET_WIN: 10,
    STANDARD_BET_LOSS: 2,
    PREMIUM_BET_WIN: 25,
    PREMIUM_BET_LOSS: 5,
    MINI_GAME_WIN: 15,
    DAILY_LOGIN: 5,
    CHALLENGE_COMPLETE: 20,
    DERBY_BET: 30,
    PERFECT_PREDICTION: 50,
    TOURNAMENT_PARTICIPATION: 40,
    LEADERBOARD_TOP_10: 100,
    LEADERBOARD_TOP_3: 250,
    LEADERBOARD_WINNER: 500
  }
  
  static calculateXPGain(action: keyof typeof ProgressionSystem.XP_ACTIONS): number {
    return this.XP_ACTIONS[action] || 0
  }
  
  static getProgressToNextLevel(currentXP: number, currentLevel: number): {
    current: number
    required: number
    percentage: number
    xpNeeded: number
  } {
    const currentRank = PLAYER_RANKS[currentLevel]
    const nextRank = PLAYER_RANKS[currentLevel + 1]
    
    if (!nextRank) {
      return {
        current: currentXP,
        required: currentRank.xpRequired,
        percentage: 100,
        xpNeeded: 0
      }
    }
    
    const xpInCurrentLevel = currentXP - currentRank.xpRequired
    const xpRequiredForNext = nextRank.xpRequired - currentRank.xpRequired
    const percentage = (xpInCurrentLevel / xpRequiredForNext) * 100
    
    return {
      current: currentXP,
      required: nextRank.xpRequired,
      percentage: Math.min(percentage, 100),
      xpNeeded: Math.max(0, nextRank.xpRequired - currentXP)
    }
  }
}

// Daily/Weekly Challenges for Engagement
export interface Challenge {
  id: string
  name: string
  description: string
  type: 'DAILY' | 'WEEKLY'
  requirements: {
    action: string
    target: number
    current?: number
  }
  rewards: {
    xp: number
    betPoints: number
    diamonds?: number
  }
  requiredLevel: number
}

export const DAILY_CHALLENGES: Challenge[] = [
  {
    id: 'daily_wins_3',
    name: 'Triple Winner',
    description: 'Win 3 bets today',
    type: 'DAILY',
    requirements: { action: 'WIN_BETS', target: 3 },
    rewards: { xp: 50, betPoints: 300 },
    requiredLevel: 1
  },
  {
    id: 'premium_bet',
    name: 'Premium Player',
    description: 'Place 1 premium bet',
    type: 'DAILY',
    requirements: { action: 'PREMIUM_BET', target: 1 },
    rewards: { xp: 30, betPoints: 200, diamonds: 1 },
    requiredLevel: 2
  },
  {
    id: 'mini_game_master',
    name: 'Game Master',
    description: 'Play 3 different mini-games',
    type: 'DAILY',
    requirements: { action: 'PLAY_MINI_GAMES', target: 3 },
    rewards: { xp: 40, betPoints: 250 },
    requiredLevel: 1
  }
]