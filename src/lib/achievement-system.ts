// Achievement System for Nordic Football Betting
// Comprehensive 12-achievement system across 5 categories

export interface AchievementReward {
  betPoints: number
  diamonds: number
  xp: number
}

export interface AchievementRequirement {
  type: string
  target: number
  conditions?: {
    minOdds?: number
    betType?: string
    isDerby?: boolean
    isLive?: boolean
    consecutive?: boolean
  }
}

export interface AchievementData {
  id: string
  name: string
  description: string
  category: 'BETTING' | 'WINNING' | 'LOYALTY' | 'SPECIAL' | 'SOCIAL'
  tier: 1 | 2 | 3 // Bronze=1, Silver=2, Gold=3
  requirement: AchievementRequirement
  reward: AchievementReward
  iconUrl: string
  isSecret?: boolean
}

// Complete Achievement Database
export const ACHIEVEMENTS: AchievementData[] = [
  // BETTING CATEGORY (3 achievements)
  {
    id: 'first_bet',
    name: 'Ensimmäinen Veto',
    description: 'Place your first bet on Nordic Football',
    category: 'BETTING',
    tier: 1,
    requirement: {
      type: 'BETS_PLACED',
      target: 1
    },
    reward: {
      betPoints: 500,
      diamonds: 10,
      xp: 50
    },
    iconUrl: '/achievements/first-bet.png'
  },
  {
    id: 'combo_master',
    name: 'Yhdistelmämestari',
    description: 'Place a successful 5+ selection combo bet',
    category: 'BETTING',
    tier: 2,
    requirement: {
      type: 'COMBO_BET_WON',
      target: 1,
      conditions: {
        betType: 'PITKAVETO',
        minOdds: 10.0
      }
    },
    reward: {
      betPoints: 2000,
      diamonds: 25,
      xp: 100
    },
    iconUrl: '/achievements/combo-master.png'
  },
  {
    id: 'high_roller',
    name: 'Korkean Panoksen Pelaaja',
    description: 'Place 50 bets with stakes over 1000 BP',
    category: 'BETTING',
    tier: 3,
    requirement: {
      type: 'HIGH_STAKE_BETS',
      target: 50,
      conditions: {
        minOdds: 1000 // Minimum stake in BP
      }
    },
    reward: {
      betPoints: 5000,
      diamonds: 50,
      xp: 200
    },
    iconUrl: '/achievements/high-roller.png'
  },

  // WINNING CATEGORY (3 achievements)
  {
    id: 'first_win',
    name: 'Ensimmäinen Voitto',
    description: 'Win your first bet',
    category: 'WINNING',
    tier: 1,
    requirement: {
      type: 'BETS_WON',
      target: 1
    },
    reward: {
      betPoints: 750,
      diamonds: 15,
      xp: 75
    },
    iconUrl: '/achievements/first-win.png'
  },
  {
    id: 'win_streak',
    name: 'Voittoputki',
    description: 'Win 5 bets in a row',
    category: 'WINNING',
    tier: 2,
    requirement: {
      type: 'WIN_STREAK',
      target: 5,
      conditions: {
        consecutive: true
      }
    },
    reward: {
      betPoints: 3000,
      diamonds: 30,
      xp: 150
    },
    iconUrl: '/achievements/win-streak.png'
  },
  {
    id: 'big_winner',
    name: 'Iso Voittaja',
    description: 'Win a single bet worth 10,000+ BP',
    category: 'WINNING',
    tier: 3,
    requirement: {
      type: 'BIG_WIN',
      target: 10000 // Minimum win amount in BP
    },
    reward: {
      betPoints: 7500,
      diamonds: 75,
      xp: 300
    },
    iconUrl: '/achievements/big-winner.png'
  },

  // LOYALTY CATEGORY (2 achievements)
  {
    id: 'daily_visitor',
    name: 'Päivittäinen Vierailija',
    description: 'Log in for 7 consecutive days',
    category: 'LOYALTY',
    tier: 2,
    requirement: {
      type: 'LOGIN_STREAK',
      target: 7,
      conditions: {
        consecutive: true
      }
    },
    reward: {
      betPoints: 1500,
      diamonds: 20,
      xp: 100
    },
    iconUrl: '/achievements/daily-visitor.png'
  },
  {
    id: 'veteran_player',
    name: 'Veteraanipelaaja',
    description: 'Reach level 10',
    category: 'LOYALTY',
    tier: 3,
    requirement: {
      type: 'LEVEL_REACHED',
      target: 10
    },
    reward: {
      betPoints: 10000,
      diamonds: 100,
      xp: 500
    },
    iconUrl: '/achievements/veteran-player.png'
  },

  // SPECIAL CATEGORY (2 achievements)
  {
    id: 'derby_specialist',
    name: 'Derby-asiantuntija',
    description: 'Win 10 derby matches',
    category: 'SPECIAL',
    tier: 2,
    requirement: {
      type: 'DERBY_WINS',
      target: 10,
      conditions: {
        isDerby: true
      }
    },
    reward: {
      betPoints: 4000,
      diamonds: 40,
      xp: 200
    },
    iconUrl: '/achievements/derby-specialist.png'
  },
  {
    id: 'live_legend',
    name: 'Live-legenda',
    description: 'Win 25 live bets',
    category: 'SPECIAL',
    tier: 3,
    requirement: {
      type: 'LIVE_WINS',
      target: 25,
      conditions: {
        isLive: true
      }
    },
    reward: {
      betPoints: 6000,
      diamonds: 60,
      xp: 250
    },
    iconUrl: '/achievements/live-legend.png'
  },

  // SOCIAL CATEGORY (2 achievements)
  {
    id: 'team_supporter',
    name: 'Joukkueen Kannattaja',
    description: 'Set a favorite team and bet on them 10 times',
    category: 'SOCIAL',
    tier: 1,
    requirement: {
      type: 'FAVORITE_TEAM_BETS',
      target: 10
    },
    reward: {
      betPoints: 1000,
      diamonds: 15,
      xp: 75
    },
    iconUrl: '/achievements/team-supporter.png'
  },
  {
    id: 'challenge_champion',
    name: 'Haastemestaari',
    description: 'Complete 20 daily challenges',
    category: 'SOCIAL',
    tier: 2,
    requirement: {
      type: 'CHALLENGES_COMPLETED',
      target: 20
    },
    reward: {
      betPoints: 2500,
      diamonds: 35,
      xp: 125
    },
    iconUrl: '/achievements/challenge-champion.png'
  }
]

// Achievement progress tracking
export function checkAchievementProgress(
  achievement: AchievementData,
  userStats: {
    totalBets: number
    totalWins: number
    totalWon: number
    biggestWin: number
    currentStreak: number
    bestStreak: number
    level: number
    loginStreak?: number
    derbyWins?: number
    liveWins?: number
    favoriteTeamBets?: number
    challengesCompleted?: number
    highStakeBets?: number
    comboWins?: number
  }
): { progress: number; isCompleted: boolean } {
  const { requirement } = achievement
  let progress = 0

  switch (requirement.type) {
    case 'BETS_PLACED':
      progress = userStats.totalBets
      break
    case 'BETS_WON':
      progress = userStats.totalWins
      break
    case 'WIN_STREAK':
      progress = userStats.currentStreak
      break
    case 'BIG_WIN':
      progress = userStats.biggestWin
      break
    case 'LEVEL_REACHED':
      progress = userStats.level
      break
    case 'LOGIN_STREAK':
      progress = userStats.loginStreak || 0
      break
    case 'DERBY_WINS':
      progress = userStats.derbyWins || 0
      break
    case 'LIVE_WINS':
      progress = userStats.liveWins || 0
      break
    case 'FAVORITE_TEAM_BETS':
      progress = userStats.favoriteTeamBets || 0
      break
    case 'CHALLENGES_COMPLETED':
      progress = userStats.challengesCompleted || 0
      break
    case 'HIGH_STAKE_BETS':
      progress = userStats.highStakeBets || 0
      break
    case 'COMBO_BET_WON':
      progress = userStats.comboWins || 0
      break
    default:
      progress = 0
  }

  return {
    progress: Math.min(progress, requirement.target),
    isCompleted: progress >= requirement.target
  }
}

// Get achievements by category
export function getAchievementsByCategory(category: string): AchievementData[] {
  return ACHIEVEMENTS.filter(achievement => achievement.category === category)
}

// Get achievements by tier
export function getAchievementsByTier(tier: 1 | 2 | 3): AchievementData[] {
  return ACHIEVEMENTS.filter(achievement => achievement.tier === tier)
}

// Calculate total possible rewards
export function getTotalPossibleRewards(): AchievementReward {
  return ACHIEVEMENTS.reduce((total, achievement) => ({
    betPoints: total.betPoints + achievement.reward.betPoints,
    diamonds: total.diamonds + achievement.reward.diamonds,
    xp: total.xp + achievement.reward.xp
  }), { betPoints: 0, diamonds: 0, xp: 0 })
}

// Get next achievement to unlock
export function getNextAchievement(userStats: any): AchievementData | null {
  const incompleteAchievements = ACHIEVEMENTS.filter(achievement => {
    const progress = checkAchievementProgress(achievement, userStats)
    return !progress.isCompleted
  })

  if (incompleteAchievements.length === 0) return null

  // Sort by progress percentage (closest to completion first)
  return incompleteAchievements.sort((a, b) => {
    const progressA = checkAchievementProgress(a, userStats)
    const progressB = checkAchievementProgress(b, userStats)
    
    const percentageA = (progressA.progress / a.requirement.target) * 100
    const percentageB = (progressB.progress / b.requirement.target) * 100
    
    return percentageB - percentageA
  })[0]
}

// Achievement notification data
export interface AchievementNotification {
  achievement: AchievementData
  newlyUnlocked: boolean
  progress: number
  reward: AchievementReward
}

// Tier names and colors for UI
export const TIER_DATA = {
  1: { name: 'Bronze', color: '#CD7F32', icon: '🥉' },
  2: { name: 'Silver', color: '#C0C0C0', icon: '🥈' },
  3: { name: 'Gold', color: '#FFD700', icon: '🥇' }
}

// Category data for UI
export const CATEGORY_DATA = {
  BETTING: { name: 'Vedonlyönti', icon: '🎯', color: '#3B82F6' },
  WINNING: { name: 'Voittaminen', icon: '🏆', color: '#10B981' },
  LOYALTY: { name: 'Uskollisuus', icon: '⭐', color: '#F59E0B' },
  SPECIAL: { name: 'Erikois', icon: '💎', color: '#8B5CF6' },
  SOCIAL: { name: 'Sosiaalinen', icon: '👥', color: '#EF4444' }
}