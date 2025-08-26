// Betting limits and validation service
// Implements responsible gaming features for F2P platform

import { prisma } from '@/lib/prisma'

export interface BettingLimits {
  minStake: number
  maxStake: number
  maxDailyBets: number
  maxDailyStake: number
  maxWeeklyStake: number
  maxSelections: number
  minOdds: number
  maxOdds: number
  maxPotentialWin: number
}

export class BettingLimitsService {
  // Get betting limits based on user level and VIP status
  async getUserLimits(userId: string): Promise<BettingLimits> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        vipStatus: true,
        role: true
      }
    })
    
    if (!user) {
      return this.getDefaultLimits()
    }
    
    // Base limits
    let limits: BettingLimits = {
      minStake: 10,
      maxStake: 10000,
      maxDailyBets: 50,
      maxDailyStake: 50000,
      maxWeeklyStake: 200000,
      maxSelections: 10,
      minOdds: 1.01,
      maxOdds: 1000,
      maxPotentialWin: 1000000
    }
    
    // Adjust based on level
    if (user.level >= 10) {
      limits.maxStake = 25000
      limits.maxDailyStake = 100000
      limits.maxWeeklyStake = 500000
      limits.maxSelections = 15
      limits.maxPotentialWin = 2000000
    }
    
    if (user.level >= 20) {
      limits.maxStake = 50000
      limits.maxDailyStake = 200000
      limits.maxWeeklyStake = 1000000
      limits.maxSelections = 20
      limits.maxPotentialWin = 5000000
    }
    
    // VIP bonuses
    if (user.vipStatus === 'VIP_MONTHLY') {
      limits.maxStake *= 1.5
      limits.maxDailyStake *= 1.5
      limits.maxWeeklyStake *= 1.5
      limits.maxDailyBets = 75
      limits.maxPotentialWin *= 1.5
    }
    
    if (user.vipStatus === 'SEASON_PASS') {
      limits.maxStake *= 2
      limits.maxDailyStake *= 2
      limits.maxWeeklyStake *= 2
      limits.maxDailyBets = 100
      limits.maxPotentialWin *= 2
    }
    
    // Admin/moderator unlimited
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      limits.maxStake = 1000000
      limits.maxDailyStake = 10000000
      limits.maxWeeklyStake = 100000000
      limits.maxDailyBets = 1000
      limits.maxPotentialWin = 100000000
    }
    
    return limits
  }
  
  // Validate bet against limits
  async validateBet(
    userId: string,
    stake: number,
    selections: any[],
    totalOdds: number
  ): Promise<{ valid: boolean; error?: string }> {
    const limits = await this.getUserLimits(userId)
    
    // Check stake limits
    if (stake < limits.minStake) {
      return {
        valid: false,
        error: `Minimum stake is ${limits.minStake} BetPoints`
      }
    }
    
    if (stake > limits.maxStake) {
      return {
        valid: false,
        error: `Maximum stake is ${limits.maxStake} BetPoints`
      }
    }
    
    // Check selections limit
    if (selections.length > limits.maxSelections) {
      return {
        valid: false,
        error: `Maximum ${limits.maxSelections} selections allowed`
      }
    }
    
    // Check odds limits
    if (totalOdds < limits.minOdds) {
      return {
        valid: false,
        error: `Minimum total odds is ${limits.minOdds}`
      }
    }
    
    if (totalOdds > limits.maxOdds) {
      return {
        valid: false,
        error: `Maximum total odds is ${limits.maxOdds}`
      }
    }
    
    // Check potential win
    const potentialWin = stake * totalOdds
    if (potentialWin > limits.maxPotentialWin) {
      return {
        valid: false,
        error: `Maximum potential win is ${limits.maxPotentialWin} BetPoints`
      }
    }
    
    // Check daily limits
    const dailyValidation = await this.checkDailyLimits(userId, stake, limits)
    if (!dailyValidation.valid) {
      return dailyValidation
    }
    
    // Check weekly limits
    const weeklyValidation = await this.checkWeeklyLimits(userId, stake, limits)
    if (!weeklyValidation.valid) {
      return weeklyValidation
    }
    
    return { valid: true }
  }
  
  // Check daily betting limits
  private async checkDailyLimits(
    userId: string,
    stake: number,
    limits: BettingLimits
  ): Promise<{ valid: boolean; error?: string }> {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    // Count today's bets
    const todayBets = await prisma.bet.count({
      where: {
        userId,
        createdAt: { gte: todayStart }
      }
    })
    
    if (todayBets >= limits.maxDailyBets) {
      return {
        valid: false,
        error: `Daily bet limit reached (${limits.maxDailyBets} bets)`
      }
    }
    
    // Sum today's stakes
    const todayStakes = await prisma.bet.aggregate({
      where: {
        userId,
        createdAt: { gte: todayStart }
      },
      _sum: { stake: true }
    })
    
    const todayTotal = (todayStakes._sum.stake || 0) + stake
    
    if (todayTotal > limits.maxDailyStake) {
      return {
        valid: false,
        error: `Daily stake limit reached (${limits.maxDailyStake} BetPoints)`
      }
    }
    
    return { valid: true }
  }
  
  // Check weekly betting limits
  private async checkWeeklyLimits(
    userId: string,
    stake: number,
    limits: BettingLimits
  ): Promise<{ valid: boolean; error?: string }> {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    
    // Sum this week's stakes
    const weekStakes = await prisma.bet.aggregate({
      where: {
        userId,
        createdAt: { gte: weekStart }
      },
      _sum: { stake: true }
    })
    
    const weekTotal = (weekStakes._sum.stake || 0) + stake
    
    if (weekTotal > limits.maxWeeklyStake) {
      return {
        valid: false,
        error: `Weekly stake limit reached (${limits.maxWeeklyStake} BetPoints)`
      }
    }
    
    return { valid: true }
  }
  
  // Get user's current limit usage
  async getLimitUsage(userId: string) {
    const limits = await this.getUserLimits(userId)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    
    // Get today's stats
    const todayBets = await prisma.bet.count({
      where: {
        userId,
        createdAt: { gte: todayStart }
      }
    })
    
    const todayStakes = await prisma.bet.aggregate({
      where: {
        userId,
        createdAt: { gte: todayStart }
      },
      _sum: { stake: true }
    })
    
    // Get week's stats
    const weekStakes = await prisma.bet.aggregate({
      where: {
        userId,
        createdAt: { gte: weekStart }
      },
      _sum: { stake: true }
    })
    
    return {
      limits,
      usage: {
        daily: {
          bets: todayBets,
          betsLimit: limits.maxDailyBets,
          betsRemaining: Math.max(0, limits.maxDailyBets - todayBets),
          stake: todayStakes._sum.stake || 0,
          stakeLimit: limits.maxDailyStake,
          stakeRemaining: Math.max(0, limits.maxDailyStake - (todayStakes._sum.stake || 0))
        },
        weekly: {
          stake: weekStakes._sum.stake || 0,
          stakeLimit: limits.maxWeeklyStake,
          stakeRemaining: Math.max(0, limits.maxWeeklyStake - (weekStakes._sum.stake || 0))
        }
      }
    }
  }
  
  // Check if user can place a bet
  async canPlaceBet(userId: string, stake: number): Promise<boolean> {
    const validation = await this.validateBet(userId, stake, [], 1)
    return validation.valid
  }
  
  // Get default limits for anonymous users
  private getDefaultLimits(): BettingLimits {
    return {
      minStake: 10,
      maxStake: 5000,
      maxDailyBets: 20,
      maxDailyStake: 20000,
      maxWeeklyStake: 50000,
      maxSelections: 5,
      minOdds: 1.01,
      maxOdds: 100,
      maxPotentialWin: 100000
    }
  }
  
  // Responsible gaming features
  async setSelfExclusion(userId: string, days: number) {
    const excludeUntil = new Date()
    excludeUntil.setDate(excludeUntil.getDate() + days)
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: excludeUntil
      }
    })
    
    return {
      success: true,
      excludedUntil: excludeUntil
    }
  }
  
  async setCustomLimits(userId: string, customLimits: Partial<BettingLimits>) {
    // Store custom limits in user's privacy settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { privacySettings: true }
    })
    
    const settings = user?.privacySettings ? JSON.parse(user.privacySettings) : {}
    settings.customLimits = customLimits
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        privacySettings: JSON.stringify(settings)
      }
    })
    
    return {
      success: true,
      limits: customLimits
    }
  }
}

export const bettingLimits = new BettingLimitsService()