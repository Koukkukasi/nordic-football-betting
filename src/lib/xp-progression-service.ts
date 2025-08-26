// Enhanced XP and Progression Service for Nordic Football Betting
// Advanced XP mechanics with multipliers, bonuses, and sophisticated tracking

import { calculateXP, checkLevelUp, XP_REQUIREMENTS, LEVEL_REWARDS, XPActionParams } from './currency-system'
import { ACHIEVEMENTS, checkAchievementProgress } from './achievement-system'
import { findUserWithRetry, updateUserBalanceSafely } from './auth-utils'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface XPAction {
  type: XPActionType
  baseXP: number
  multiplier?: number
  bonusXP?: number
  description: string
}

export enum XPActionType {
  BET_PLACED = 'BET_PLACED',
  BET_WON = 'BET_WON',
  LIVE_BET_PLACED = 'LIVE_BET_PLACED', 
  LIVE_BET_WON = 'LIVE_BET_WON',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  DAILY_LOGIN = 'DAILY_LOGIN',
  CHALLENGE_COMPLETED = 'CHALLENGE_COMPLETED',
  DERBY_BET_PLACED = 'DERBY_BET_PLACED',
  DERBY_BET_WON = 'DERBY_BET_WON',
  FIRST_BET_OF_DAY = 'FIRST_BET_OF_DAY',
  HIGH_ODDS_BET = 'HIGH_ODDS_BET',
  WEEKEND_BONUS = 'WEEKEND_BONUS',
  LOYALTY_BONUS = 'LOYALTY_BONUS',
  PERFECT_PREDICTION = 'PERFECT_PREDICTION'
}

export interface LevelUpResult {
  newLevel: number
  previousLevel: number
  rewards: {
    betPoints: number
    diamonds: number
    maxStake: number
    maxActiveBets: number
  }
  unlockedFeatures: string[]
}

export interface XPMultiplier {
  name: string
  multiplier: number
  condition: string
  active: boolean
}

// Enhanced XP Calculation with Dynamic Multipliers
export class XPService {
  
  static async awardXP(
    userId: string, 
    action: XPActionType, 
    context?: any
  ): Promise<{ xpGained: number; levelUp?: LevelUpResult; achievements?: any[] }> {
    
    console.log('[XP_SERVICE] Awarding XP for user:', { userId, action, context })
    
    const user = await findUserWithRetry(userId, 'id', 3, 200)
    if (!user) {
      console.error('[XP_SERVICE] User not found:', userId)
      throw new Error('User not found')
    }
    
    console.log('[XP_SERVICE] User found:', { id: user.id, level: user.level, xp: user.xp })

    // Convert action to XPActionParams format for the currency system
    const xpParams: XPActionParams = {
      action: this.mapActionToParams(action),
      amount: context?.stake || context?.winAmount || 0,
      odds: context?.odds || 1.0,
      streak: context?.streak || 0,
      isDerby: context?.isDerby || false,
      isLive: context?.isLive || false,
      betType: context?.betType || 'SINGLE',
      selectionCount: context?.selectionCount || 1
    }

    // Use the existing currency system XP calculation
    let baseXP = calculateXP(xpParams)
    
    // Apply additional multipliers
    const multipliers = await this.getActiveMultipliers(userId, action, context)
    const totalMultiplier = multipliers.reduce((total, m) => total * m.multiplier, 1)
    
    // Calculate bonus XP
    const bonusXP = await this.calculateBonusXP(userId, action, context)
    
    // Final XP calculation
    const finalXP = Math.floor((baseXP * totalMultiplier) + bonusXP)
    
    console.log('[XP_SERVICE] XP calculation complete:', {
      baseXP,
      totalMultiplier,
      bonusXP,
      finalXP,
      currentXP: user.xp,
      newTotalXP: user.xp + finalXP
    })
    
    // Update user XP using safe balance update
    const updatedUser = await updateUserBalanceSafely(
      userId,
      { xp: finalXP },
      `XP gained: ${this.getActionDescription(action, context)}`
    )

    // Check for level up
    const levelUpResult = await this.checkAndProcessLevelUp(userId, updatedUser.xp, user.level)
    
    // Check for new achievements
    const newAchievements = await this.checkNewAchievements(userId, action, context)
    
    // Create XP transaction record
    await prisma.transaction.create({
      data: {
        userId,
        type: 'ACHIEVEMENT_REWARD', // Use for XP tracking
        amount: finalXP,
        currency: 'BETPOINTS', // Temporary - track XP as betpoints
        description: `XP gained: ${this.getActionDescription(action, context)}`,
        reference: `xp_${action.toLowerCase()}`,
        balanceBefore: user.xp,
        balanceAfter: user.xp + finalXP
      }
    })

    return {
      xpGained: finalXP,
      levelUp: levelUpResult || undefined,
      achievements: newAchievements
    }
  }

  private static mapActionToParams(action: XPActionType): string {
    switch (action) {
      case XPActionType.BET_PLACED: return 'BET_PLACED'
      case XPActionType.BET_WON: return 'BET_WON'
      case XPActionType.LIVE_BET_PLACED: return 'LIVE_BET_PLACED'
      case XPActionType.LIVE_BET_WON: return 'LIVE_BET_WON'
      case XPActionType.DERBY_BET_PLACED: return 'BET_PLACED'
      case XPActionType.DERBY_BET_WON: return 'BET_WON'
      case XPActionType.DAILY_LOGIN: return 'DAILY_LOGIN'
      case XPActionType.CHALLENGE_COMPLETED: return 'CHALLENGE_COMPLETED'
      case XPActionType.ACHIEVEMENT_UNLOCKED: return 'ACHIEVEMENT_UNLOCKED'
      case XPActionType.FIRST_BET_OF_DAY: return 'FIRST_BET_OF_DAY'
      case XPActionType.WEEKEND_BONUS: return 'WEEKEND_WARRIOR'
      default: return 'BET_PLACED'
    }
  }

  private static async checkNewAchievements(
    userId: string, 
    action: XPActionType, 
    context?: any
  ): Promise<any[]> {
    const newAchievements: any[] = []
    
    // Get user stats for achievement checking
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalBets: true,
        totalWins: true,
        totalWon: true,
        biggestWin: true,
        currentStreak: true,
        bestStreak: true,
        level: true,
        xp: true
      }
    })

    if (!user) return newAchievements

    // Create extended stats object for achievement checking
    const userStats = {
      ...user,
      loginStreak: context?.loginStreak || 0,
      derbyWins: 0, // Would need to calculate from database
      liveWins: 0,  // Would need to calculate from database
      favoriteTeamBets: 0,
      challengesCompleted: 0,
      highStakeBets: 0,
      comboWins: 0
    }

    // Check all achievements for progress
    for (const achievement of ACHIEVEMENTS) {
      // Check if user already has this achievement
      const existingAchievement = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id
          }
        }
      })

      if (!existingAchievement || !existingAchievement.completed) {
        const progress = checkAchievementProgress(achievement, userStats)
        
        if (progress.isCompleted && (!existingAchievement || !existingAchievement.completed)) {
          // Award achievement
          await prisma.userAchievement.upsert({
            where: {
              userId_achievementId: {
                userId,
                achievementId: achievement.id
              }
            },
            create: {
              userId,
              achievementId: achievement.id,
              progress: progress.progress,
              completed: true,
              completedAt: new Date()
            },
            update: {
              progress: progress.progress,
              completed: true,
              completedAt: new Date()
            }
          })

          // Award achievement rewards
          await prisma.user.update({
            where: { id: userId },
            data: {
              betPoints: { increment: achievement.reward.betPoints },
              diamonds: { increment: achievement.reward.diamonds },
              xp: { increment: achievement.reward.xp }
            }
          })

          // Create achievement notification
          await prisma.notification.create({
            data: {
              userId,
              type: 'ACHIEVEMENT_UNLOCKED',
              title: `Saavutus avattu: ${achievement.name}`,
              message: achievement.description,
              data: {
                achievement,
                reward: achievement.reward
              }
            }
          })

          newAchievements.push(achievement)
        }
      }
    }

    return newAchievements
  }

  private static async getActiveMultipliers(
    userId: string, 
    action: XPActionType, 
    context?: any
  ): Promise<XPMultiplier[]> {
    const multipliers: XPMultiplier[] = []

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return multipliers

    // Weekend multiplier
    const now = new Date()
    const isWeekend = now.getDay() === 0 || now.getDay() === 6
    if (isWeekend) {
      multipliers.push({
        name: 'Weekend Boost',
        multiplier: 1.5,
        condition: 'Active on weekends',
        active: true
      })
    }

    // Login streak multiplier
    const loginStreak = await this.getCurrentLoginStreak(userId)
    if (loginStreak >= 7) {
      multipliers.push({
        name: 'Loyalty Multiplier',
        multiplier: 1.2 + Math.min(loginStreak / 50, 0.3), // Up to 1.5x for 15+ day streak
        condition: `${loginStreak} day login streak`,
        active: true
      })
    }

    // Level-based multiplier
    if (user.level >= 5) {
      multipliers.push({
        name: 'Veteran Bonus',
        multiplier: 1 + (user.level - 4) * 0.1, // 1.1x at level 5, up to 1.7x at level 10
        condition: `Level ${user.level} veteran`,
        active: true
      })
    }

    // Derby match multiplier
    if (context?.isDerby && (action === XPActionType.BET_PLACED || action === XPActionType.BET_WON)) {
      multipliers.push({
        name: 'Derby Excitement',
        multiplier: 2.0,
        condition: 'Derby match bonus',
        active: true
      })
    }

    // High odds multiplier
    if (context?.odds >= 5.0) {
      multipliers.push({
        name: 'High Risk Bonus',
        multiplier: 1.5,
        condition: 'Odds 5.0+ bonus',
        active: true
      })
    }

    return multipliers
  }

  private static async calculateBonusXP(
    userId: string, 
    action: XPActionType, 
    context?: any
  ): Promise<number> {
    let bonusXP = 0

    // First bet of the day bonus
    if (action === XPActionType.BET_PLACED) {
      const isFirstBetToday = await this.isFirstBetToday(userId)
      if (isFirstBetToday) {
        bonusXP += 25
      }
    }

    // Comeback bonus (betting after a loss)
    if (action === XPActionType.BET_PLACED) {
      const lastBetWasLoss = await this.wasLastBetALoss(userId)
      if (lastBetWasLoss) {
        bonusXP += 15
      }
    }

    // Perfect timing bonus (betting close to match start)
    if (context?.minutesToKickoff && context.minutesToKickoff <= 15) {
      bonusXP += 10
    }

    return bonusXP
  }

  private static async checkAndProcessLevelUp(
    userId: string, 
    newXP: number, 
    currentLevel: number
  ): Promise<LevelUpResult | null> {
    const newLevel = checkLevelUp(newXP, currentLevel)
    
    if (!newLevel) return null

    // Update user level
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel }
    })

    // Get level rewards
    const rewards = LEVEL_REWARDS[newLevel as keyof typeof LEVEL_REWARDS]
    
    // Award level-up rewards
    await prisma.user.update({
      where: { id: userId },
      data: {
        betPoints: { increment: rewards.betPoints },
        diamonds: { increment: rewards.diamonds }
      }
    })

    // Create reward transaction
    if (rewards.betPoints > 0) {
      await prisma.transaction.create({
        data: {
          userId,
          type: 'LEVEL_UP_BONUS',
          amount: rewards.betPoints,
          currency: 'BETPOINTS',
          description: `Level ${newLevel} reward: ${rewards.betPoints} BetPoints`,
          balanceBefore: 0, // We'll calculate this properly in implementation
          balanceAfter: 0
        }
      })
    }

    if (rewards.diamonds > 0) {
      await prisma.transaction.create({
        data: {
          userId,
          type: 'LEVEL_UP_BONUS', 
          amount: rewards.diamonds,
          currency: 'DIAMONDS',
          description: `Level ${newLevel} reward: ${rewards.diamonds} Diamonds`,
          balanceBefore: 0,
          balanceAfter: 0
        }
      })
    }

    // Create level-up notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'LEVEL_UP',
        title: `Taso ${newLevel} saavutettu!`,
        message: `Onneksi olkoon! Saavutit tason ${newLevel} ja ansaitsit ${rewards.betPoints} BetPointsia ja ${rewards.diamonds} timanttia!`,
        data: {
          newLevel,
          rewards,
          unlockedFeatures: this.getUnlockedFeatures(newLevel)
        }
      }
    })

    return {
      newLevel,
      previousLevel: currentLevel,
      rewards,
      unlockedFeatures: this.getUnlockedFeatures(newLevel)
    }
  }

  private static getUnlockedFeatures(level: number): string[] {
    const features: string[] = []
    
    if (level === 2) features.push('Diamond Boosts')
    if (level === 3) features.push('Live Betting')
    if (level === 4) features.push('Cash Out Feature')
    if (level === 5) features.push('VIP Tournaments')
    if (level === 6) features.push('Advanced Statistics')
    if (level === 7) features.push('Custom Bet Builder')
    if (level === 8) features.push('Premium Insights')
    if (level === 9) features.push('Elite Challenges')
    if (level === 10) features.push('Legend Status')
    
    return features
  }

  // Helper methods
  private static async getCurrentLoginStreak(userId: string): Promise<number> {
    // Implementation would track consecutive login days
    // For now, return a placeholder
    return 1
  }

  private static async isFirstBetToday(userId: string): Promise<boolean> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todaysBets = await prisma.bet.count({
      where: {
        userId,
        createdAt: { gte: today }
      }
    })
    
    return todaysBets === 1 // This is the first bet (assuming this method is called after bet creation)
  }

  private static async wasLastBetALoss(userId: string): Promise<boolean> {
    const lastBet = await prisma.bet.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: 1 // Skip the current bet
    })
    
    return lastBet?.status === 'LOST'
  }

  private static getActionDescription(action: XPActionType, context?: any): string {
    switch (action) {
      case XPActionType.BET_PLACED:
        return `Placed bet with ${context?.stake || 0} BP stake`
      case XPActionType.BET_WON:
        return `Won bet for ${context?.winAmount || 0} BP`
      case XPActionType.LIVE_BET_PLACED:
        return `Placed live bet during match`
      case XPActionType.DERBY_BET_PLACED:
        return `Placed derby bet`
      case XPActionType.DAILY_LOGIN:
        return `Daily login bonus`
      case XPActionType.CHALLENGE_COMPLETED:
        return `Completed daily challenge`
      default:
        return `XP action: ${action}`
    }
  }

  // Public methods for XP queries
  static async getUserProgress(userId: string) {
    console.log('[XP_SERVICE] Getting user progress for:', userId)
    
    const user = await findUserWithRetry(userId, 'id', 3, 200)
    if (!user) {
      console.error('[XP_SERVICE] User not found for progress:', userId)
      return null
    }
    
    console.log('[XP_SERVICE] User found for progress:', { id: user.id, level: user.level, xp: user.xp })

    const currentLevelXP = XP_REQUIREMENTS[user.level as keyof typeof XP_REQUIREMENTS] || 0
    const nextLevelXP = XP_REQUIREMENTS[(user.level + 1) as keyof typeof XP_REQUIREMENTS] || 999999
    const progressXP = user.xp - currentLevelXP
    const requiredXP = nextLevelXP - currentLevelXP

    return {
      level: user.level,
      totalXP: user.xp,
      currentLevelProgress: progressXP,
      nextLevelRequirement: requiredXP,
      progressPercentage: Math.min((progressXP / requiredXP) * 100, 100),
      nextLevelRewards: LEVEL_REWARDS[(user.level + 1) as keyof typeof LEVEL_REWARDS]
    }
  }

  static async getXPLeaderboard(limit: number = 10) {
    return await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        level: true,
        xp: true,
        profileAvatar: true
      },
      orderBy: [
        { level: 'desc' },
        { xp: 'desc' }
      ],
      take: limit
    })
  }
}