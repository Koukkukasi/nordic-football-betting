// Comprehensive Achievement System for Nordic Football Betting
// 12 achievements across 5 categories with Bronze/Silver/Gold tiers

export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  tier: AchievementTier
  requirement: AchievementRequirement
  reward: AchievementReward
  iconUrl: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export enum AchievementCategory {
  BETTING = 'BETTING',
  WINNING = 'WINNING', 
  LOYALTY = 'LOYALTY',
  SPECIAL = 'SPECIAL',
  SOCIAL = 'SOCIAL'
}

export enum AchievementTier {
  BRONZE = 1,
  SILVER = 2,
  GOLD = 3
}

export interface AchievementRequirement {
  type: string
  target: number
  conditions?: Record<string, any>
}

export interface AchievementReward {
  betPoints: number
  diamonds: number
  xp: number
  title?: string
}

export interface UserAchievementProgress {
  achievementId: string
  progress: number
  completed: boolean
  completedAt?: Date
}

// Complete Achievement Database
export const ACHIEVEMENTS: Achievement[] = [
  // BETTING CATEGORY
  {
    id: 'betting_bronze',
    name: 'Ensimmäinen Veto',
    description: 'Aseta ensimmäinen vetosi',
    category: AchievementCategory.BETTING,
    tier: AchievementTier.BRONZE,
    requirement: { type: 'BETS_PLACED', target: 1 },
    reward: { betPoints: 500, diamonds: 5, xp: 100 },
    iconUrl: '/achievements/first-bet.png',
    rarity: 'common'
  },
  {
    id: 'betting_silver',
    name: 'Kokenut Veikkaaja',
    description: 'Aseta 50 vetoa',
    category: AchievementCategory.BETTING,
    tier: AchievementTier.SILVER,
    requirement: { type: 'BETS_PLACED', target: 50 },
    reward: { betPoints: 2000, diamonds: 20, xp: 500 },
    iconUrl: '/achievements/experienced-bettor.png',
    rarity: 'rare'
  },
  {
    id: 'betting_gold',
    name: 'Vetoammattilainen',
    description: 'Aseta 200 vetoa',
    category: AchievementCategory.BETTING,
    tier: AchievementTier.GOLD,
    requirement: { type: 'BETS_PLACED', target: 200 },
    reward: { betPoints: 5000, diamonds: 50, xp: 1000, title: 'Vetoammattilainen' },
    iconUrl: '/achievements/betting-pro.png',
    rarity: 'epic'
  },

  // WINNING CATEGORY
  {
    id: 'winning_bronze',
    name: 'Ensimmäinen Voitto',
    description: 'Voita ensimmäinen vetosi',
    category: AchievementCategory.WINNING,
    tier: AchievementTier.BRONZE,
    requirement: { type: 'BETS_WON', target: 1 },
    reward: { betPoints: 1000, diamonds: 10, xp: 200 },
    iconUrl: '/achievements/first-win.png',
    rarity: 'common'
  },
  {
    id: 'winning_silver',
    name: 'Voittoputki',
    description: 'Voita 5 vetoa peräkkäin',
    category: AchievementCategory.WINNING,
    tier: AchievementTier.SILVER,
    requirement: { type: 'WIN_STREAK', target: 5 },
    reward: { betPoints: 3000, diamonds: 30, xp: 750 },
    iconUrl: '/achievements/win-streak.png',
    rarity: 'rare'
  },
  {
    id: 'winning_gold',
    name: 'Kultainen Veikkaaja',
    description: 'Voita 50 vetoa yhteensä',
    category: AchievementCategory.WINNING,
    tier: AchievementTier.GOLD,
    requirement: { type: 'TOTAL_WINS', target: 50 },
    reward: { betPoints: 7500, diamonds: 75, xp: 1500, title: 'Kultainen Veikkaaja' },
    iconUrl: '/achievements/golden-bettor.png',
    rarity: 'epic'
  },

  // LOYALTY CATEGORY
  {
    id: 'loyalty_bronze',
    name: 'Päivittäinen Pelaaja',
    description: 'Kirjaudu sisään 7 päivää peräkkäin',
    category: AchievementCategory.LOYALTY,
    tier: AchievementTier.BRONZE,
    requirement: { type: 'LOGIN_STREAK', target: 7 },
    reward: { betPoints: 1500, diamonds: 15, xp: 300 },
    iconUrl: '/achievements/daily-player.png',
    rarity: 'common'
  },
  {
    id: 'loyalty_silver',
    name: 'Uskollinen Fani',
    description: 'Kirjaudu sisään 30 päivää peräkkäin',
    category: AchievementCategory.LOYALTY,
    tier: AchievementTier.SILVER,
    requirement: { type: 'LOGIN_STREAK', target: 30 },
    reward: { betPoints: 5000, diamonds: 50, xp: 1000 },
    iconUrl: '/achievements/loyal-fan.png',
    rarity: 'rare'
  },
  {
    id: 'loyalty_gold',
    name: 'Liigan Legenda',
    description: 'Pelaa 100 päivää yhteensä',
    category: AchievementCategory.LOYALTY,
    tier: AchievementTier.GOLD,
    requirement: { type: 'TOTAL_DAYS_PLAYED', target: 100 },
    reward: { betPoints: 15000, diamonds: 150, xp: 2500, title: 'Liigan Legenda' },
    iconUrl: '/achievements/league-legend.png',
    rarity: 'legendary'
  },

  // SPECIAL CATEGORY
  {
    id: 'special_derby',
    name: 'Derby-asiantuntija',
    description: 'Voita 5 derby-vetoa',
    category: AchievementCategory.SPECIAL,
    tier: AchievementTier.SILVER,
    requirement: { type: 'DERBY_WINS', target: 5 },
    reward: { betPoints: 4000, diamonds: 40, xp: 800 },
    iconUrl: '/achievements/derby-expert.png',
    rarity: 'rare'
  },
  {
    id: 'special_live',
    name: 'Live-mestari',
    description: 'Voita 20 live-vetoa',
    category: AchievementCategory.SPECIAL,
    tier: AchievementTier.GOLD,
    requirement: { type: 'LIVE_WINS', target: 20 },
    reward: { betPoints: 6000, diamonds: 60, xp: 1200, title: 'Live-mestari' },
    iconUrl: '/achievements/live-master.png',
    rarity: 'epic'
  },

  // SOCIAL CATEGORY  
  {
    id: 'social_challenge',
    name: 'Haasteiden Mestari',
    description: 'Suorita 10 päivittäistä haastetta',
    category: AchievementCategory.SOCIAL,
    tier: AchievementTier.SILVER,
    requirement: { type: 'CHALLENGES_COMPLETED', target: 10 },
    reward: { betPoints: 3500, diamonds: 35, xp: 700 },
    iconUrl: '/achievements/challenge-master.png',
    rarity: 'rare'
  }
]

// Achievement Progress Tracking
export class AchievementTracker {
  static checkProgress(userId: string, action: string, data?: any): Promise<Achievement[]> {
    // This will be implemented to check user actions against achievement requirements
    // Returns array of newly unlocked achievements
    return Promise.resolve([])
  }

  static async updateProgress(
    userId: string, 
    achievementId: string, 
    increment: number = 1
  ): Promise<UserAchievementProgress> {
    // Update user's progress toward an achievement
    // Implementation will use Prisma to update database
    return {
      achievementId,
      progress: 0,
      completed: false
    }
  }

  static async getProgress(userId: string): Promise<UserAchievementProgress[]> {
    // Get all achievement progress for a user
    return []
  }

  static async unlockAchievement(
    userId: string, 
    achievementId: string
  ): Promise<Achievement | null> {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
    if (!achievement) return null

    // Mark as completed and award rewards
    // Implementation will:
    // 1. Update UserAchievement table
    // 2. Award rewards (betPoints, diamonds, XP)
    // 3. Create notification
    // 4. Add transaction record

    return achievement
  }
}

// Achievement Validation
export function validateAchievementRequirement(
  requirement: AchievementRequirement,
  userStats: any
): { isCompleted: boolean; progress: number } {
  switch (requirement.type) {
    case 'BETS_PLACED':
      return {
        isCompleted: userStats.totalBets >= requirement.target,
        progress: Math.min(userStats.totalBets, requirement.target)
      }
    
    case 'BETS_WON':
    case 'TOTAL_WINS':
      return {
        isCompleted: userStats.totalWins >= requirement.target,
        progress: Math.min(userStats.totalWins, requirement.target)
      }
    
    case 'WIN_STREAK':
      return {
        isCompleted: userStats.currentStreak >= requirement.target,
        progress: Math.min(userStats.currentStreak, requirement.target)
      }
    
    case 'LOGIN_STREAK':
      return {
        isCompleted: userStats.loginStreak >= requirement.target,
        progress: Math.min(userStats.loginStreak, requirement.target)
      }
    
    case 'TOTAL_DAYS_PLAYED':
      return {
        isCompleted: userStats.totalDaysPlayed >= requirement.target,
        progress: Math.min(userStats.totalDaysPlayed, requirement.target)
      }
    
    case 'DERBY_WINS':
      return {
        isCompleted: userStats.derbyWins >= requirement.target,
        progress: Math.min(userStats.derbyWins, requirement.target)
      }
    
    case 'LIVE_WINS':
      return {
        isCompleted: userStats.liveWins >= requirement.target,
        progress: Math.min(userStats.liveWins, requirement.target)
      }
    
    case 'CHALLENGES_COMPLETED':
      return {
        isCompleted: userStats.challengesCompleted >= requirement.target,
        progress: Math.min(userStats.challengesCompleted, requirement.target)
      }
    
    default:
      return { isCompleted: false, progress: 0 }
  }
}

// Achievement Categories Helper
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => achievement.category === category)
}

// Achievement Tier Helper
export function getAchievementsByTier(tier: AchievementTier): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => achievement.tier === tier)
}

// Reward Calculation
export function calculateTotalRewards(achievements: Achievement[]): AchievementReward {
  return achievements.reduce(
    (total, achievement) => ({
      betPoints: total.betPoints + achievement.reward.betPoints,
      diamonds: total.diamonds + achievement.reward.diamonds,
      xp: total.xp + achievement.reward.xp
    }),
    { betPoints: 0, diamonds: 0, xp: 0 }
  )
}

// Achievement Rarity Colors
export const RARITY_COLORS = {
  common: '#9CA3AF',    // Gray
  rare: '#3B82F6',      // Blue  
  epic: '#8B5CF6',      // Purple
  legendary: '#F59E0B'  // Amber
}

// Achievement Progress Percentage
export function getProgressPercentage(progress: number, target: number): number {
  return Math.min((progress / target) * 100, 100)
}