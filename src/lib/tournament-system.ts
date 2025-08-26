// Tournament System for Nordic Football Betting
// Weekly/Monthly competitions with leaderboards and substantial prize pools

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface Tournament {
  id: string
  name: string
  description: string
  type: TournamentType
  format: TournamentFormat
  status: TournamentStatus
  
  startDate: Date
  endDate: Date
  registrationDeadline: Date
  
  entryFee: number
  entryCurrency: 'BETPOINTS' | 'DIAMONDS'
  maxParticipants?: number
  minParticipants: number
  
  prizePool: TournamentPrizePool
  rules: TournamentRules
  
  currentParticipants: number
  leaderboard: TournamentEntry[]
  
  // Special features
  isSeasonSpecial?: boolean
  sponsorBanner?: string
  specialRules?: string[]
}

export enum TournamentType {
  WEEKLY_PROFIT = 'WEEKLY_PROFIT',
  WEEKLY_ACCURACY = 'WEEKLY_ACCURACY',
  MONTHLY_CHAMPIONSHIP = 'MONTHLY_CHAMPIONSHIP',
  SEASON_GRAND_PRIX = 'SEASON_GRAND_PRIX',
  DERBY_SPECIAL = 'DERBY_SPECIAL',
  LIVE_BETTING_MASTERS = 'LIVE_BETTING_MASTERS',
  PITKAVETO_CHALLENGE = 'PITKAVETO_CHALLENGE'
}

export enum TournamentFormat {
  CUMULATIVE_SCORE = 'CUMULATIVE_SCORE', // Total profit/wins
  BEST_STREAK = 'BEST_STREAK', // Longest winning streak
  ACCURACY_PERCENTAGE = 'ACCURACY_PERCENTAGE', // Win rate with minimum bets
  POINTS_SYSTEM = 'POINTS_SYSTEM', // Points for wins, bonuses for odds
  ELIMINATION = 'ELIMINATION' // Progressive elimination rounds
}

export enum TournamentStatus {
  UPCOMING = 'UPCOMING',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED'
}

export interface TournamentPrizePool {
  totalValue: number
  currency: 'BETPOINTS' | 'DIAMONDS'
  distribution: TournamentPrize[]
  guaranteedPrize: number
  bonusPrizes?: {
    participationBonus: number
    streakBonus?: number
    accuracyBonus?: number
  }
}

export interface TournamentPrize {
  position: string // "1", "2-3", "4-10", etc.
  amount: number
  currency: 'BETPOINTS' | 'DIAMONDS'
  specialReward?: {
    badge?: string
    title?: string
    boostDuration?: number // hours
  }
}

export interface TournamentRules {
  minBetsRequired: number
  maxBetsPerDay?: number
  allowedBetTypes: ('SINGLE' | 'PITKAVETO' | 'LIVE')[]
  minOdds?: number
  maxOdds?: number
  allowedLeagues?: string[]
  penaltyForMissedDays?: number
  bonusMultipliers?: {
    derbyMatches?: number
    liveBeiting?: number
    highOdds?: number
  }
}

export interface TournamentEntry {
  userId: string
  username: string
  avatar?: string
  position: number
  score: number
  stats: {
    totalBets: number
    wins: number
    winRate: number
    profit: number
    bestStreak: number
    derbyWins?: number
    liveWins?: number
  }
  progress: {
    dailyScores: Record<string, number>
    weeklyTotal: number
    penalties: number
  }
  joinedAt: Date
  lastActive: Date
}

// Tournament templates for automatic generation
export const TOURNAMENT_TEMPLATES = {
  [TournamentType.WEEKLY_PROFIT]: {
    name: 'Viikkovoitto Turnaus',
    description: 'Suurin voitto viikon aikana voittaa!',
    format: TournamentFormat.CUMULATIVE_SCORE,
    entryFee: 100,
    entryCurrency: 'BETPOINTS' as const,
    minParticipants: 10,
    maxParticipants: 100,
    prizeDistribution: [
      { position: '1', percentage: 40 },
      { position: '2', percentage: 25 },
      { position: '3', percentage: 15 },
      { position: '4-10', percentage: 15 },
      { position: '11-25', percentage: 5 }
    ],
    rules: {
      minBetsRequired: 10,
      maxBetsPerDay: 20,
      allowedBetTypes: ['SINGLE', 'PITKAVETO', 'LIVE'],
      bonusMultipliers: {
        derbyMatches: 1.5,
        liveBeiting: 1.2
      }
    }
  },

  [TournamentType.WEEKLY_ACCURACY]: {
    name: 'Tarkkuus Mestari',
    description: 'Paras voittoprosentti (min. 15 vetoa)',
    format: TournamentFormat.ACCURACY_PERCENTAGE,
    entryFee: 150,
    entryCurrency: 'BETPOINTS' as const,
    minParticipants: 15,
    maxParticipants: 50,
    prizeDistribution: [
      { position: '1', percentage: 50 },
      { position: '2', percentage: 30 },
      { position: '3', percentage: 20 }
    ],
    rules: {
      minBetsRequired: 15,
      allowedBetTypes: ['SINGLE', 'PITKAVETO'],
      minOdds: 1.5
    }
  },

  [TournamentType.MONTHLY_CHAMPIONSHIP]: {
    name: 'Kuukauden Mestaruus',
    description: 'Kuukauden suurin haaste - massiiviset palkinnot!',
    format: TournamentFormat.POINTS_SYSTEM,
    entryFee: 500,
    entryCurrency: 'BETPOINTS' as const,
    minParticipants: 50,
    maxParticipants: 500,
    prizeDistribution: [
      { position: '1', percentage: 30 },
      { position: '2', percentage: 20 },
      { position: '3', percentage: 15 },
      { position: '4-5', percentage: 10 },
      { position: '6-10', percentage: 10 },
      { position: '11-25', percentage: 10 },
      { position: '26-100', percentage: 5 }
    ],
    rules: {
      minBetsRequired: 50,
      allowedBetTypes: ['SINGLE', 'PITKAVETO', 'LIVE'],
      bonusMultipliers: {
        derbyMatches: 2.0,
        liveBeiting: 1.5,
        highOdds: 1.3
      }
    }
  },

  [TournamentType.DERBY_SPECIAL]: {
    name: 'Derby Viikko Erikoisturnaus',
    description: 'Derby-ottelut tuplavoitolla!',
    format: TournamentFormat.CUMULATIVE_SCORE,
    entryFee: 200,
    entryCurrency: 'BETPOINTS' as const,
    minParticipants: 20,
    maxParticipants: 200,
    prizeDistribution: [
      { position: '1', percentage: 40 },
      { position: '2-3', percentage: 30 },
      { position: '4-10', percentage: 20 },
      { position: '11-50', percentage: 10 }
    ],
    rules: {
      minBetsRequired: 5,
      allowedBetTypes: ['SINGLE', 'PITKAVETO'],
      bonusMultipliers: {
        derbyMatches: 3.0
      }
    }
  },

  [TournamentType.LIVE_BETTING_MASTERS]: {
    name: 'Live-veto Mestarit',
    description: 'Vain live-vedot kelpaavat!',
    format: TournamentFormat.CUMULATIVE_SCORE,
    entryFee: 25,
    entryCurrency: 'DIAMONDS' as const,
    minParticipants: 25,
    maxParticipants: 100,
    prizeDistribution: [
      { position: '1', percentage: 45 },
      { position: '2', percentage: 25 },
      { position: '3', percentage: 15 },
      { position: '4-10', percentage: 15 }
    ],
    rules: {
      minBetsRequired: 8,
      allowedBetTypes: ['LIVE'],
      bonusMultipliers: {
        liveBeiting: 1.0
      }
    }
  },

  [TournamentType.PITKAVETO_CHALLENGE]: {
    name: 'Pitkäveto Haaste',
    description: 'Vain yhdistelmävedot - suurimmat kertoimet voittavat!',
    format: TournamentFormat.BEST_STREAK,
    entryFee: 300,
    entryCurrency: 'BETPOINTS' as const,
    minParticipants: 30,
    maxParticipants: 150,
    prizeDistribution: [
      { position: '1', percentage: 50 },
      { position: '2', percentage: 25 },
      { position: '3', percentage: 15 },
      { position: '4-5', percentage: 10 }
    ],
    rules: {
      minBetsRequired: 12,
      allowedBetTypes: ['PITKAVETO'],
      minOdds: 3.0
    }
  }
}

export class TournamentService {
  
  static async getActiveTournaments(): Promise<Tournament[]> {
    const now = new Date()
    
    // Get tournaments from database
    // For now, return generated tournaments
    return this.generateWeeklyTournaments()
  }

  static async getUserTournaments(userId: string): Promise<{
    active: Tournament[]
    completed: Tournament[]
    upcoming: Tournament[]
  }> {
    // Get user's tournament participations
    const activeTournaments = await this.getActiveTournaments()
    
    return {
      active: activeTournaments.filter(t => t.status === TournamentStatus.ACTIVE),
      completed: [],
      upcoming: activeTournaments.filter(t => t.status === TournamentStatus.UPCOMING)
    }
  }

  static async joinTournament(userId: string, tournamentId: string): Promise<{
    success: boolean
    message: string
    tournament?: Tournament
  }> {
    // Validate user eligibility
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { betPoints: true, diamonds: true, level: true }
    })

    if (!user) {
      return { success: false, message: 'User not found' }
    }

    // Get tournament details
    const tournament = await this.getTournamentById(tournamentId)
    if (!tournament) {
      return { success: false, message: 'Tournament not found' }
    }

    if (tournament.status !== TournamentStatus.REGISTRATION_OPEN) {
      return { success: false, message: 'Registration is closed' }
    }

    if (tournament.maxParticipants && tournament.currentParticipants >= tournament.maxParticipants) {
      return { success: false, message: 'Tournament is full' }
    }

    // Check if user has enough currency
    const userBalance = tournament.entryCurrency === 'BETPOINTS' ? user.betPoints : user.diamonds
    if (userBalance < tournament.entryFee) {
      return { 
        success: false, 
        message: `Insufficient ${tournament.entryCurrency.toLowerCase()}: ${userBalance}/${tournament.entryFee}` 
      }
    }

    // Check level requirements (if any)
    const minLevel = this.getMinLevelForTournament(tournament.type)
    if (user.level < minLevel) {
      return { 
        success: false, 
        message: `Minimum level ${minLevel} required` 
      }
    }

    // Deduct entry fee
    const updateData = tournament.entryCurrency === 'BETPOINTS' 
      ? { betPoints: user.betPoints - tournament.entryFee }
      : { diamonds: user.diamonds - tournament.entryFee }

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    // Record transaction
    await prisma.transaction.create({
      data: {
        userId,
        type: 'PURCHASE',
        amount: tournament.entryFee,
        currency: tournament.entryCurrency,
        description: `Tournament Entry: ${tournament.name}`,
        balanceBefore: userBalance,
        balanceAfter: userBalance - tournament.entryFee
      }
    })

    // Add user to tournament (this would be stored in a tournament_participants table)
    await this.addUserToTournament(userId, tournamentId)

    return { 
      success: true, 
      message: 'Successfully joined tournament!',
      tournament 
    }
  }

  static async updateTournamentScore(
    userId: string, 
    tournamentId: string, 
    betResult: {
      won: boolean
      profit: number
      odds: number
      betType: string
      isDerby?: boolean
      isLive?: boolean
    }
  ): Promise<void> {
    // Update user's tournament score based on bet result
    const tournament = await this.getTournamentById(tournamentId)
    if (!tournament || tournament.status !== TournamentStatus.ACTIVE) {
      return
    }

    let scoreIncrease = 0

    switch (tournament.format) {
      case TournamentFormat.CUMULATIVE_SCORE:
        scoreIncrease = betResult.won ? betResult.profit : 0
        break
        
      case TournamentFormat.POINTS_SYSTEM:
        if (betResult.won) {
          scoreIncrease = 100 // Base points for win
          if (betResult.odds >= 3.0) scoreIncrease += 50 // High odds bonus
          if (betResult.isDerby) scoreIncrease *= (tournament.rules.bonusMultipliers?.derbyMatches || 1)
          if (betResult.isLive) scoreIncrease *= (tournament.rules.bonusMultipliers?.liveBeiting || 1)
        }
        break
        
      case TournamentFormat.ACCURACY_PERCENTAGE:
        // This is calculated separately based on win rate
        break
    }

    if (scoreIncrease > 0) {
      await this.addScoreToUser(userId, tournamentId, scoreIncrease)
    }
  }

  static async getTournamentLeaderboard(tournamentId: string, limit: number = 50): Promise<TournamentEntry[]> {
    // Get tournament leaderboard
    // Implementation would query tournament_participants and aggregate scores
    return []
  }

  static async distributeTournamentPrizes(tournamentId: string): Promise<void> {
    // Called when tournament ends
    const tournament = await this.getTournamentById(tournamentId)
    if (!tournament || tournament.status !== TournamentStatus.FINISHED) {
      return
    }

    const leaderboard = await this.getTournamentLeaderboard(tournamentId)
    
    for (const entry of leaderboard) {
      const prize = this.calculatePrizeForPosition(entry.position, tournament.prizePool)
      if (prize > 0) {
        await this.awardPrize(entry.userId, prize, tournament.prizePool.currency, tournament.name)
      }
    }
  }

  private static generateWeeklyTournaments(): Tournament[] {
    const now = new Date()
    const weekStart = this.getWeekStart(now)
    const weekEnd = this.getWeekEnd(now)
    
    const tournaments: Tournament[] = []

    // Generate weekly tournaments
    const weeklyTypes = [
      TournamentType.WEEKLY_PROFIT,
      TournamentType.WEEKLY_ACCURACY,
      TournamentType.LIVE_BETTING_MASTERS
    ]

    weeklyTypes.forEach((type, index) => {
      const template = TOURNAMENT_TEMPLATES[type]
      const entryFeeTotal = template.entryFee * template.maxParticipants!
      
      tournaments.push({
        id: `weekly_${type}_${weekStart.toISOString()}`,
        name: template.name,
        description: template.description,
        type,
        format: template.format,
        status: TournamentStatus.REGISTRATION_OPEN,
        startDate: weekStart,
        endDate: weekEnd,
        registrationDeadline: new Date(weekStart.getTime() + 24 * 60 * 60 * 1000), // 24h to register
        entryFee: template.entryFee,
        entryCurrency: template.entryCurrency,
        maxParticipants: template.maxParticipants,
        minParticipants: template.minParticipants,
        prizePool: {
          totalValue: entryFeeTotal,
          currency: template.entryCurrency,
          distribution: this.calculatePrizeDistribution(entryFeeTotal, template.prizeDistribution),
          guaranteedPrize: entryFeeTotal * 0.8, // 80% guaranteed payout
          bonusPrizes: {
            participationBonus: 50
          }
        },
        rules: template.rules as TournamentRules,
        currentParticipants: Math.floor(Math.random() * 30) + 5, // Simulated
        leaderboard: []
      })
    })

    return tournaments
  }

  private static async getTournamentById(tournamentId: string): Promise<Tournament | null> {
    // Get tournament from database or generated tournaments
    const activeTournaments = await this.getActiveTournaments()
    return activeTournaments.find(t => t.id === tournamentId) || null
  }

  private static getMinLevelForTournament(type: TournamentType): number {
    const levelRequirements = {
      [TournamentType.WEEKLY_PROFIT]: 3,
      [TournamentType.WEEKLY_ACCURACY]: 4,
      [TournamentType.MONTHLY_CHAMPIONSHIP]: 6,
      [TournamentType.SEASON_GRAND_PRIX]: 8,
      [TournamentType.DERBY_SPECIAL]: 2,
      [TournamentType.LIVE_BETTING_MASTERS]: 5,
      [TournamentType.PITKAVETO_CHALLENGE]: 4
    }
    
    return levelRequirements[type] || 1
  }

  private static async addUserToTournament(userId: string, tournamentId: string): Promise<void> {
    // Add user to tournament_participants table
    console.log('Adding user to tournament:', userId, tournamentId)
  }

  private static async addScoreToUser(userId: string, tournamentId: string, score: number): Promise<void> {
    // Update user's tournament score
    console.log('Adding score to user:', userId, tournamentId, score)
  }

  private static calculatePrizeForPosition(position: number, prizePool: TournamentPrizePool): number {
    for (const prize of prizePool.distribution) {
      if (this.positionMatchesPrize(position, prize.position)) {
        return prize.amount
      }
    }
    return 0
  }

  private static positionMatchesPrize(position: number, prizePosition: string): boolean {
    if (prizePosition.includes('-')) {
      const [min, max] = prizePosition.split('-').map(Number)
      return position >= min && position <= max
    }
    return position === Number(prizePosition)
  }

  private static async awardPrize(
    userId: string, 
    amount: number, 
    currency: 'BETPOINTS' | 'DIAMONDS', 
    tournamentName: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { betPoints: true, diamonds: true }
    })

    if (!user) return

    const updateData = currency === 'BETPOINTS' 
      ? { betPoints: user.betPoints + amount }
      : { diamonds: user.diamonds + amount }

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    await prisma.transaction.create({
      data: {
        userId,
        type: 'ACHIEVEMENT_REWARD',
        amount,
        currency,
        description: `Tournament Prize: ${tournamentName}`,
        balanceBefore: currency === 'BETPOINTS' ? user.betPoints : user.diamonds,
        balanceAfter: currency === 'BETPOINTS' ? user.betPoints + amount : user.diamonds + amount
      }
    })
  }

  private static calculatePrizeDistribution(totalValue: number, distribution: any[]): TournamentPrize[] {
    return distribution.map(dist => ({
      position: dist.position,
      amount: Math.floor(totalValue * (dist.percentage / 100)),
      currency: 'BETPOINTS' as const
    }))
  }

  private static getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
  }

  private static getWeekEnd(date: Date): Date {
    const start = this.getWeekStart(date)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return end
  }
}

// Utility functions for UI
export function formatTournamentPrize(amount: number, currency: 'BETPOINTS' | 'DIAMONDS'): string {
  if (currency === 'BETPOINTS') {
    return `${amount.toLocaleString()} BP`
  }
  return `💎 ${amount}`
}

export function getTournamentStatusColor(status: TournamentStatus): string {
  const colors = {
    [TournamentStatus.UPCOMING]: '#6B7280',
    [TournamentStatus.REGISTRATION_OPEN]: '#10B981',
    [TournamentStatus.ACTIVE]: '#3B82F6',
    [TournamentStatus.FINISHED]: '#8B5CF6',
    [TournamentStatus.CANCELLED]: '#EF4444'
  }
  return colors[status]
}

export function getTournamentTypeIcon(type: TournamentType): string {
  const icons = {
    [TournamentType.WEEKLY_PROFIT]: '💰',
    [TournamentType.WEEKLY_ACCURACY]: '🎯',
    [TournamentType.MONTHLY_CHAMPIONSHIP]: '👑',
    [TournamentType.SEASON_GRAND_PRIX]: '🏆',
    [TournamentType.DERBY_SPECIAL]: '⚡',
    [TournamentType.LIVE_BETTING_MASTERS]: '📺',
    [TournamentType.PITKAVETO_CHALLENGE]: '🎲'
  }
  return icons[type]
}