// XP Service for Nordic Football Betting
// Handles all XP operations, level-ups, achievements, and database updates

import { prisma } from '@/lib/prisma'
import { calculateXP, checkLevelUp, LEVEL_REWARDS, XPActionParams } from './currency-system'
import { checkAchievementProgress, ACHIEVEMENTS, AchievementData } from './achievement-system'
import { updateChallengeProgress, checkChallengeCompletion } from './challenge-system'

export interface XPGainResult {
  xpGained: number
  newXP: number
  levelUp?: {
    oldLevel: number
    newLevel: number
    rewards: typeof LEVEL_REWARDS[keyof typeof LEVEL_REWARDS]
  }
  achievementsUnlocked?: AchievementData[]
  challengesCompleted?: string[]
}

export interface UserStatsSnapshot {
  totalBets: number
  totalWins: number
  totalWon: number
  biggestWin: number
  currentStreak: number
  bestStreak: number
  level: number
  xp: number
  loginStreak: number
  // Extended stats for achievements
  derbyWins: number
  liveWins: number
  favoriteTeamBets: number
  challengesCompleted: number
  highStakeBets: number
  comboWins: number
}

export class XPService {
  /**
   * Award XP to a user and handle all side effects
   */
  static async awardXP(
    userId: string,
    xpParams: XPActionParams,
    actionContext?: {
      betId?: string
      matchId?: string
      winAmount?: number
      isStreak?: boolean
    }
  ): Promise<XPGainResult> {
    const xpGained = calculateXP(xpParams)
    
    if (xpGained === 0) {
      return {
        xpGained: 0,
        newXP: 0
      }
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        achievements: {
          include: {
            achievement: true
          }
        },
        challengeProgress: {
          where: {
            challenge: {
              isActive: true,
              endDate: {
                gte: new Date()
              }
            }
          },
          include: {
            challenge: true
          }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const newXP = user.xp + xpGained
    const currentLevel = user.level
    const newLevel = checkLevelUp(newXP, currentLevel)

    const result: XPGainResult = {
      xpGained,
      newXP
    }

    // Start transaction for all updates
    await prisma.$transaction(async (tx) => {
      // Update user XP
      const updateData: any = {
        xp: newXP
      }

      // Handle level up
      if (newLevel && newLevel > currentLevel) {
        updateData.level = newLevel
        const levelRewards = LEVEL_REWARDS[newLevel as keyof typeof LEVEL_REWARDS]
        
        updateData.betPoints = {
          increment: levelRewards.betPoints
        }
        updateData.diamonds = {
          increment: levelRewards.diamonds
        }

        result.levelUp = {
          oldLevel: currentLevel,
          newLevel,
          rewards: levelRewards
        }

        // Create level up transaction record
        await tx.transaction.create({
          data: {
            userId,
            type: 'LEVEL_UP_BONUS',
            amount: levelRewards.betPoints,
            currency: 'BETPOINTS',
            description: `Level ${newLevel} bonus`,
            reference: `level_${newLevel}`,
            balanceBefore: user.betPoints,
            balanceAfter: user.betPoints + levelRewards.betPoints
          }
        })

        // Create notification for level up
        await tx.notification.create({
          data: {
            userId,
            type: 'LEVEL_UP',
            title: `Taso ${newLevel} saavutettu!`,
            message: `Onneksi olkoon! Sait ${levelRewards.betPoints} BP ja ${levelRewards.diamonds} timanttia!`,
            data: {
              oldLevel: currentLevel,
              newLevel,
              rewards: levelRewards
            }
          }
        })
      }

      // Update user stats based on action
      await this.updateUserStats(tx, userId, xpParams, actionContext)

      // Update user with new XP and potential level
      await tx.user.update({
        where: { id: userId },
        data: updateData
      })

      // Check for new achievements
      const userStats = await this.getUserStats(tx, userId)
      const newAchievements = await this.checkAndUnlockAchievements(tx, userId, userStats)
      result.achievementsUnlocked = newAchievements

      // Update challenge progress
      const completedChallenges = await this.updateChallengeProgress(tx, userId, xpParams, actionContext)
      result.challengesCompleted = completedChallenges
    })

    return result
  }

  /**
   * Update user stats based on action
   */
  private static async updateUserStats(
    tx: any,
    userId: string,
    xpParams: XPActionParams,
    actionContext?: any
  ): Promise<void> {
    const updates: any = {}

    switch (xpParams.action) {
      case 'BET_PLACED':
        updates.totalBets = { increment: 1 }
        if (xpParams.amount) {
          updates.totalStaked = { increment: xpParams.amount }
        }
        
        // Check for high stake bet
        if (xpParams.amount && xpParams.amount >= 500) {
          // This would need to be tracked separately for achievements
        }
        break

      case 'BET_WON':
      case 'LIVE_BET_WON':
      case 'PITKAVETO_WON':
        updates.totalWins = { increment: 1 }
        if (actionContext?.winAmount) {
          updates.totalWon = { increment: actionContext.winAmount }
          updates.biggestWin = {
            set: Math.max(await this.getCurrentBiggestWin(tx, userId), actionContext.winAmount)
          }
        }
        
        // Handle win streaks
        if (actionContext?.isStreak) {
          updates.currentStreak = { increment: 1 }
        } else {
          updates.currentStreak = 1
        }
        break

      case 'BET_LOST':
        updates.currentStreak = 0
        break

      case 'DAILY_LOGIN':
        if (xpParams.streak) {
          updates.lastLoginAt = new Date()
          // Login streak is handled separately in login logic
        }
        break
    }

    if (Object.keys(updates).length > 0) {
      await tx.user.update({
        where: { id: userId },
        data: updates
      })
    }
  }

  /**
   * Get current user stats for achievement checking
   */
  private static async getUserStats(tx: any, userId: string): Promise<UserStatsSnapshot> {
    const user = await tx.user.findUnique({
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

    if (!user) {
      throw new Error('User not found')
    }

    // These would need to be calculated from related tables or cached
    const extendedStats = {
      loginStreak: 0, // Calculate from login history
      derbyWins: 0,   // Calculate from bet wins where match.isDerby = true
      liveWins: 0,    // Calculate from live bet wins
      favoriteTeamBets: 0, // Calculate from bets on favorite team
      challengesCompleted: 0, // Count from UserChallengeProgress
      highStakeBets: 0, // Count bets with stake >= 500
      comboWins: 0     // Count PITKAVETO wins with 5+ selections
    }

    return {
      ...user,
      ...extendedStats
    }
  }

  /**
   * Check and unlock new achievements
   */
  private static async checkAndUnlockAchievements(
    tx: any,
    userId: string,
    userStats: UserStatsSnapshot
  ): Promise<AchievementData[]> {
    const newlyUnlocked: AchievementData[] = []

    for (const achievement of ACHIEVEMENTS) {
      // Check if user already has this achievement
      const existing = await tx.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id
          }
        }
      })

      if (!existing) {
        // Create new achievement progress entry
        const progress = checkAchievementProgress(achievement, userStats)
        
        await tx.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            progress: progress.progress,
            completed: progress.isCompleted,
            completedAt: progress.isCompleted ? new Date() : null
          }
        })

        if (progress.isCompleted) {
          newlyUnlocked.push(achievement)
          
          // Award achievement rewards
          await tx.user.update({
            where: { id: userId },
            data: {
              betPoints: { increment: achievement.reward.betPoints },
              diamonds: { increment: achievement.reward.diamonds },
              xp: { increment: achievement.reward.xp }
            }
          })

          // Create achievement notification
          await tx.notification.create({
            data: {
              userId,
              type: 'ACHIEVEMENT_UNLOCKED',
              title: `Saavutus avattu: ${achievement.name}`,
              message: achievement.description,
              data: {
                achievement: achievement,
                reward: achievement.reward
              }
            }
          })

          // Create transaction record
          await tx.transaction.create({
            data: {
              userId,
              type: 'ACHIEVEMENT_REWARD',
              amount: achievement.reward.betPoints,
              currency: 'BETPOINTS',
              description: `Achievement: ${achievement.name}`,
              reference: achievement.id,
              balanceBefore: userStats.totalWon, // This should be current balance
              balanceAfter: userStats.totalWon + achievement.reward.betPoints
            }
          })
        }
      } else if (!existing.completed) {
        // Update existing achievement progress
        const progress = checkAchievementProgress(achievement, userStats)
        
        if (progress.isCompleted && !existing.completed) {
          await tx.userAchievement.update({
            where: { id: existing.id },
            data: {
              progress: progress.progress,
              completed: true,
              completedAt: new Date()
            }
          })

          newlyUnlocked.push(achievement)
          // Award rewards (same as above)
        } else {
          await tx.userAchievement.update({
            where: { id: existing.id },
            data: {
              progress: progress.progress
            }
          })
        }
      }
    }

    return newlyUnlocked
  }

  /**
   * Update challenge progress
   */
  private static async updateChallengeProgress(
    tx: any,
    userId: string,
    xpParams: XPActionParams,
    actionContext?: any
  ): Promise<string[]> {
    const completedChallenges: string[] = []

    // Get active challenges for user
    const activeChallenges = await tx.challengeProgress.findMany({
      where: {
        userId,
        completed: false,
        challenge: {
          isActive: true,
          endDate: {
            gte: new Date()
          }
        }
      },
      include: {
        challenge: true
      }
    })

    for (const challengeProgress of activeChallenges) {
      const challenge = challengeProgress.challenge
      const userAction = {
        ...xpParams,
        ...actionContext,
        won: xpParams.action.includes('WON')
      }

      const newProgress = updateChallengeProgress(
        challenge.requirement.type,
        userAction,
        challengeProgress.progress
      )

      if (newProgress !== challengeProgress.progress) {
        const isCompleted = checkChallengeCompletion(
          { ...challenge, requirement: challenge.requirement as any },
          newProgress
        )

        await tx.challengeProgress.update({
          where: { id: challengeProgress.id },
          data: {
            progress: newProgress,
            completed: isCompleted,
            completedAt: isCompleted ? new Date() : null
          }
        })

        if (isCompleted && !challengeProgress.completed) {
          completedChallenges.push(challenge.id)

          // Award challenge rewards
          const reward = challenge.reward as any
          await tx.user.update({
            where: { id: userId },
            data: {
              betPoints: { increment: reward.betPoints },
              diamonds: { increment: reward.diamonds },
              xp: { increment: reward.xp }
            }
          })

          // Create challenge completion notification
          await tx.notification.create({
            data: {
              userId,
              type: 'CHALLENGE_COMPLETED',
              title: `Haaste suoritettu: ${challenge.name}`,
              message: challenge.description,
              data: {
                challenge: challenge,
                reward: reward
              }
            }
          })
        }
      }
    }

    return completedChallenges
  }

  /**
   * Get current biggest win for comparison
   */
  private static async getCurrentBiggestWin(tx: any, userId: string): Promise<number> {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { biggestWin: true }
    })
    return user?.biggestWin || 0
  }

  /**
   * Handle daily login XP and streak
   */
  static async handleDailyLogin(userId: string): Promise<XPGainResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const now = new Date()
    const lastLogin = user.lastLoginAt
    const isConsecutiveDay = lastLogin && 
      Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)) === 1

    const loginStreak = isConsecutiveDay ? (user.currentStreak || 0) + 1 : 1

    return this.awardXP(userId, {
      action: 'DAILY_LOGIN',
      streak: loginStreak
    })
  }

  /**
   * Get user progression summary
   */
  static async getUserProgression(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        achievements: {
          include: {
            achievement: true
          }
        },
        challengeProgress: {
          where: {
            challenge: {
              isActive: true,
              endDate: {
                gte: new Date()
              }
            }
          },
          include: {
            challenge: true
          }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const currentLevel = user.level
    const currentXP = user.xp
    const nextLevel = currentLevel < 10 ? currentLevel + 1 : null
    const nextLevelXP = nextLevel ? LEVEL_REWARDS[nextLevel as keyof typeof LEVEL_REWARDS] : null

    return {
      level: currentLevel,
      xp: currentXP,
      nextLevel,
      nextLevelXP,
      achievements: user.achievements,
      activeChallenges: user.challengeProgress,
      stats: {
        totalBets: user.totalBets,
        totalWins: user.totalWins,
        totalWon: user.totalWon,
        biggestWin: user.biggestWin,
        currentStreak: user.currentStreak,
        bestStreak: user.bestStreak
      }
    }
  }
}