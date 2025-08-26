// Daily Login System for Nordic Football Betting
// Progressive reward system with 7-day cycles and milestone bonuses

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface DailyLoginBonus {
  day: number
  betPoints: number
  diamonds: number
  xp: number
  specialReward?: {
    type: 'ODDS_BOOST' | 'FREE_BET' | 'DIAMOND_MULTIPLIER' | 'XP_BOOST'
    value: number
    duration: number // hours
  }
  isWeeklyBonus?: boolean
}

export interface LoginStreakData {
  currentStreak: number
  longestStreak: number
  lastLoginDate: string
  todaysClaimed: boolean
  nextBonus: DailyLoginBonus
  weekProgress: number // 1-7
  canClaimBonus: boolean
  timeUntilReset: number // milliseconds
}

// 7-day progressive login bonus cycle
export const DAILY_LOGIN_REWARDS: DailyLoginBonus[] = [
  {
    day: 1,
    betPoints: 100,
    diamonds: 2,
    xp: 25
  },
  {
    day: 2,
    betPoints: 150,
    diamonds: 3,
    xp: 35
  },
  {
    day: 3,
    betPoints: 200,
    diamonds: 5,
    xp: 50,
    specialReward: {
      type: 'XP_BOOST',
      value: 25, // 25% XP boost
      duration: 12
    }
  },
  {
    day: 4,
    betPoints: 300,
    diamonds: 7,
    xp: 75
  },
  {
    day: 5,
    betPoints: 400,
    diamonds: 10,
    xp: 100,
    specialReward: {
      type: 'ODDS_BOOST',
      value: 15, // 15% odds boost
      duration: 24
    }
  },
  {
    day: 6,
    betPoints: 600,
    diamonds: 15,
    xp: 150
  },
  {
    day: 7,
    betPoints: 1000,
    diamonds: 25,
    xp: 250,
    isWeeklyBonus: true,
    specialReward: {
      type: 'FREE_BET',
      value: 500, // 500 BP free bet
      duration: 72
    }
  }
]

// Milestone rewards for consecutive week streaks
export const WEEKLY_MILESTONE_REWARDS = {
  2: { betPoints: 2000, diamonds: 50, xp: 500, title: 'Kaksi viikkoa putkeen' },
  4: { betPoints: 5000, diamonds: 100, xp: 1000, title: 'Kuukauden legenda' },
  8: { betPoints: 10000, diamonds: 200, xp: 2000, title: 'Kahden kuukauden mestari' },
  12: { betPoints: 20000, diamonds: 500, xp: 5000, title: 'Kvartaalin sankari' }
}

export class DailyLoginService {
  
  static async getLoginStatus(userId: string): Promise<LoginStreakData> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        lastLoginAt: true,
        // We'll need to add these fields to the User model
        // loginStreak: true,
        // longestLoginStreak: true,
        // lastLoginBonusClaimed: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const now = new Date()
    const today = this.getDateString(now)
    const lastLogin = user.lastLoginAt ? this.getDateString(user.lastLoginAt) : null

    // Get or create login streak data from user preferences/separate table
    const streakData = await this.getUserStreakData(userId)
    
    // Calculate current streak
    const { currentStreak, weekProgress, canClaimBonus, todaysClaimed } = 
      this.calculateStreakStatus(streakData, lastLogin, today)

    const nextBonus = DAILY_LOGIN_REWARDS[(weekProgress - 1) % 7]
    const timeUntilReset = this.getTimeUntilReset()

    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, streakData.longestStreak || 0),
      lastLoginDate: lastLogin || '',
      todaysClaimed,
      nextBonus,
      weekProgress,
      canClaimBonus,
      timeUntilReset
    }
  }

  static async claimDailyBonus(userId: string): Promise<{
    success: boolean
    reward: DailyLoginBonus
    newStreak: number
    milestoneReward?: any
  }> {
    const loginStatus = await this.getLoginStatus(userId)
    
    if (!loginStatus.canClaimBonus) {
      throw new Error('Daily bonus already claimed or not available')
    }

    const reward = loginStatus.nextBonus
    const newStreak = loginStatus.currentStreak + 1
    const weekNumber = Math.floor(newStreak / 7)

    // Update user balance and stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { betPoints: true, diamonds: true, xp: true, level: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const newBetPoints = user.betPoints + reward.betPoints
    const newDiamonds = user.diamonds + reward.diamonds
    const newXP = user.xp + reward.xp

    // Check for level up
    const newLevel = this.calculateLevel(newXP)
    const leveledUp = newLevel > user.level

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        betPoints: newBetPoints,
        diamonds: newDiamonds,
        xp: newXP,
        level: newLevel,
        lastLoginAt: new Date()
      }
    })

    // Update streak data
    await this.updateUserStreakData(userId, {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, loginStatus.longestStreak),
      lastClaimedDate: this.getDateString(new Date()),
      completedWeeks: Math.floor(newStreak / 7)
    })

    // Record transaction
    await prisma.transaction.create({
      data: {
        userId,
        type: 'DAILY_BONUS',
        amount: reward.betPoints,
        currency: 'BETPOINTS',
        description: `Daily Login Bonus - Day ${reward.day}`,
        balanceBefore: user.betPoints,
        balanceAfter: newBetPoints
      }
    })

    // Record diamond transaction if diamonds awarded
    if (reward.diamonds > 0) {
      await prisma.transaction.create({
        data: {
          userId,
          type: 'DAILY_BONUS',
          amount: reward.diamonds,
          currency: 'DIAMONDS',
          description: `Daily Login Bonus - Day ${reward.day} Diamonds`,
          balanceBefore: user.diamonds,
          balanceAfter: newDiamonds
        }
      })
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'LEVEL_UP',
        title: `Päivittäinen bonus lunastettu!`,
        message: `Sait ${reward.betPoints} BP, ${reward.diamonds} 💎 ja ${reward.xp} XP`,
        data: {
          reward,
          streak: newStreak,
          isWeeklyBonus: reward.isWeeklyBonus
        }
      }
    })

    // Check for weekly milestone rewards
    let milestoneReward = null
    const completedWeeks = Math.floor(newStreak / 7)
    if (completedWeeks > 0 && WEEKLY_MILESTONE_REWARDS[completedWeeks as keyof typeof WEEKLY_MILESTONE_REWARDS]) {
      milestoneReward = await this.awardMilestoneReward(userId, completedWeeks)
    }

    // Handle special rewards
    if (reward.specialReward) {
      await this.activateSpecialReward(userId, reward.specialReward)
    }

    return {
      success: true,
      reward,
      newStreak,
      milestoneReward
    }
  }

  static async resetDailyBonuses(): Promise<void> {
    // This would be called by a cron job at midnight
    // Reset daily bonus claims for all users
    console.log('Resetting daily bonuses at midnight...')
    
    // Implementation would depend on how we store the claim status
    // Could be a separate table or user field
  }

  private static async getUserStreakData(userId: string) {
    // For now, we'll store this as JSON in user profile or create a separate table
    // This is a simplified version - in production, you'd want a proper table
    
    try {
      // Try to get from a hypothetical user_login_streaks table
      // For now, return default values
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastClaimedDate: null,
        completedWeeks: 0
      }
    } catch (error) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastClaimedDate: null,
        completedWeeks: 0
      }
    }
  }

  private static async updateUserStreakData(userId: string, data: any) {
    // Update the streak data
    // Implementation depends on storage strategy
    console.log('Updating streak data for user:', userId, data)
  }

  private static calculateStreakStatus(
    streakData: any, 
    lastLogin: string | null, 
    today: string
  ) {
    const now = new Date()
    const lastClaimedDate = streakData.lastClaimedDate

    // Check if already claimed today
    const todaysClaimed = lastClaimedDate === today

    // Calculate streak
    let currentStreak = streakData.currentStreak || 0
    
    if (!lastLogin) {
      // First time login
      currentStreak = 0
    } else if (lastLogin === today && !todaysClaimed) {
      // Same day, haven't claimed yet
      // Keep current streak
    } else if (this.isConsecutiveDay(lastLogin, today)) {
      // Consecutive day - streak continues when they claim
    } else if (lastLogin !== today) {
      // Missed a day - reset streak
      currentStreak = 0
    }

    const weekProgress = (currentStreak % 7) + 1
    const canClaimBonus = !todaysClaimed && (
      !lastLogin || 
      lastLogin !== today || 
      this.isConsecutiveDay(lastClaimedDate, today)
    )

    return {
      currentStreak,
      weekProgress,
      canClaimBonus,
      todaysClaimed
    }
  }

  private static async awardMilestoneReward(userId: string, weekCount: number) {
    const milestone = WEEKLY_MILESTONE_REWARDS[weekCount as keyof typeof WEEKLY_MILESTONE_REWARDS]
    if (!milestone) return null

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { betPoints: true, diamonds: true, xp: true }
    })

    if (!user) return null

    // Award milestone bonus
    await prisma.user.update({
      where: { id: userId },
      data: {
        betPoints: user.betPoints + milestone.betPoints,
        diamonds: user.diamonds + milestone.diamonds,
        xp: user.xp + milestone.xp
      }
    })

    // Record transactions
    await prisma.transaction.createMany({
      data: [
        {
          userId,
          type: 'ACHIEVEMENT_REWARD',
          amount: milestone.betPoints,
          currency: 'BETPOINTS',
          description: `Weekly Milestone - ${weekCount} weeks`,
          balanceBefore: user.betPoints,
          balanceAfter: user.betPoints + milestone.betPoints
        },
        {
          userId,
          type: 'ACHIEVEMENT_REWARD',
          amount: milestone.diamonds,
          currency: 'DIAMONDS',
          description: `Weekly Milestone - ${weekCount} weeks`,
          balanceBefore: user.diamonds,
          balanceAfter: user.diamonds + milestone.diamonds
        }
      ]
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'ACHIEVEMENT_UNLOCKED',
        title: `🏆 Virstanpylväs saavutettu!`,
        message: `${milestone.title} - ${milestone.betPoints} BP, ${milestone.diamonds} 💎!`,
        data: { milestone, weekCount }
      }
    })

    return milestone
  }

  private static async activateSpecialReward(userId: string, specialReward: any) {
    // Implement special reward activation
    // This would create entries in a special_rewards table or user_boosts table
    console.log('Activating special reward:', specialReward)
    
    const expiresAt = new Date(Date.now() + specialReward.duration * 60 * 60 * 1000)
    
    // Create notification for special reward
    await prisma.notification.create({
      data: {
        userId,
        type: 'PROMO',
        title: `✨ Erikoispalkinto aktivoitu!`,
        message: `${specialReward.type} ${specialReward.value}% - voimassa ${specialReward.duration}h`,
        data: { specialReward, expiresAt }
      }
    })
  }

  private static calculateLevel(xp: number): number {
    const XP_REQUIREMENTS = {
      1: 0, 2: 100, 3: 300, 4: 600, 5: 1000,
      6: 1500, 7: 2500, 8: 4000, 9: 6000, 10: 10000
    }
    
    for (let level = 10; level >= 1; level--) {
      if (xp >= XP_REQUIREMENTS[level as keyof typeof XP_REQUIREMENTS]) {
        return level
      }
    }
    return 1
  }

  private static getDateString(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  private static isConsecutiveDay(date1: string | null, date2: string): boolean {
    if (!date1) return false
    
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diffTime = Math.abs(d2.getTime() - d1.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays === 1
  }

  private static getTimeUntilReset(): number {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    return tomorrow.getTime() - now.getTime()
  }

  // Get user's current active boosts
  static async getActiveBoosts(userId: string) {
    // Implementation would query active boosts from database
    // For now, return empty array
    return []
  }

  // Check if user has specific boost active
  static async hasActiveBoost(userId: string, boostType: string): Promise<boolean> {
    const boosts = await this.getActiveBoosts(userId)
    return boosts.some((boost: any) => 
      boost.type === boostType && 
      new Date(boost.expiresAt) > new Date()
    )
  }
}

// Utility functions for UI
export function formatTimeRemaining(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function getStreakMotivationMessage(streak: number): string {
  if (streak === 0) return "Aloita päivittäinen putki tänään!"
  if (streak < 3) return `Hyvä alku! ${streak} päivää putkeen`
  if (streak < 7) return `Mahtavaa! ${streak} päivää - kohti viikkoa!`
  if (streak === 7) return "🔥 Viikko täynnä! Jatka huikeaa putkea!"
  if (streak < 14) return `⭐ ${streak} päivää putkeen - legenda kasvaa!`
  if (streak >= 14) return `👑 ${streak} päivää - olet Nordic Football -legenda!`
  
  return `${streak} päivää putkeen!`
}

export function getDayNameInFinnish(dayIndex: number): string {
  const days = [
    'Sunnuntai', 'Maanantai', 'Tiistai', 'Keskiviikko', 
    'Torstai', 'Perjantai', 'Lauantai'
  ]
  return days[dayIndex] || 'Tuntematon'
}