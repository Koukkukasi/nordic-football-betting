// Daily Challenges System for Nordic Football Betting
// Dynamic challenges with rotating objectives and escalating rewards

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface Challenge {
  id: string
  name: string
  description: string
  type: ChallengeType
  difficulty: ChallengeDifficulty
  requirement: ChallengeRequirement
  reward: ChallengeReward
  duration: ChallengeDuration
  isActive: boolean
  startDate: Date
  endDate: Date
}

export enum ChallengeType {
  BETTING = 'BETTING',
  WINNING = 'WINNING',
  LOYALTY = 'LOYALTY',
  SPECIAL = 'SPECIAL',
  SOCIAL = 'SOCIAL'
}

export enum ChallengeDifficulty {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
  EXTREME = 4
}

export enum ChallengeDuration {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  WEEKEND = 'WEEKEND',
  SPECIAL_EVENT = 'SPECIAL_EVENT'
}

export interface ChallengeRequirement {
  type: string
  target: number
  conditions?: {
    minOdds?: number
    maxOdds?: number
    betType?: string
    timeframe?: string
    isDerby?: boolean
    isLive?: boolean
    minStake?: number
    specificTeam?: string
    specificLeague?: string
  }
}

export interface ChallengeReward {
  betPoints: number
  diamonds: number
  xp: number
  multiplier?: number
  specialReward?: {
    type: 'FREE_BET' | 'ODDS_BOOST' | 'CASHBACK' | 'PREMIUM_INSIGHT'
    value: number
    duration?: number // in hours
  }
}

export interface UserChallengeProgress {
  userId: string
  challengeId: string
  progress: number
  completed: boolean
  completedAt?: Date
  claimedAt?: Date
}

// Challenge Templates for Dynamic Generation
export const CHALLENGE_TEMPLATES = [
  // EASY DAILY CHALLENGES
  {
    type: ChallengeType.BETTING,
    difficulty: ChallengeDifficulty.EASY,
    name: 'Päivän Ensimmäinen',
    description: 'Aseta 1 veto tänään',
    requirement: { type: 'PLACE_BETS', target: 1 },
    reward: { betPoints: 200, diamonds: 2, xp: 50 },
    weight: 50 // Probability weight for selection
  },
  {
    type: ChallengeType.BETTING,
    difficulty: ChallengeDifficulty.EASY,
    name: 'Suosikki Voittoon',
    description: 'Aseta veto alle 2.0 kertoimella',
    requirement: { 
      type: 'PLACE_BETS', 
      target: 1, 
      conditions: { maxOdds: 2.0 } 
    },
    reward: { betPoints: 300, diamonds: 3, xp: 75 },
    weight: 30
  },
  {
    type: ChallengeType.LOYALTY,
    difficulty: ChallengeDifficulty.EASY,
    name: 'Päivittäinen Kävijä',
    description: 'Kirjaudu sisään tänään',
    requirement: { type: 'DAILY_LOGIN', target: 1 },
    reward: { betPoints: 150, diamonds: 1, xp: 25 },
    weight: 40
  },

  // MEDIUM DAILY CHALLENGES
  {
    type: ChallengeType.BETTING,
    difficulty: ChallengeDifficulty.MEDIUM,
    name: 'Aktiivinen Veikkaaja',
    description: 'Aseta 3 vetoa tänään',
    requirement: { type: 'PLACE_BETS', target: 3 },
    reward: { betPoints: 500, diamonds: 5, xp: 150 },
    weight: 25
  },
  {
    type: ChallengeType.WINNING,
    difficulty: ChallengeDifficulty.MEDIUM,
    name: 'Voittajan Päivä',
    description: 'Voita 2 vetoa tänään',
    requirement: { type: 'WIN_BETS', target: 2 },
    reward: { betPoints: 800, diamonds: 8, xp: 200 },
    weight: 20
  },
  {
    type: ChallengeType.SPECIAL,
    difficulty: ChallengeDifficulty.MEDIUM,
    name: 'Live-mestari',
    description: 'Aseta 2 live-vetoa',
    requirement: { 
      type: 'PLACE_BETS', 
      target: 2, 
      conditions: { isLive: true } 
    },
    reward: { betPoints: 600, diamonds: 6, xp: 180 },
    weight: 15
  },
  {
    type: ChallengeType.SPECIAL,
    difficulty: ChallengeDifficulty.MEDIUM,
    name: 'Riskipelaaja',
    description: 'Aseta veto yli 5.0 kertoimella',
    requirement: { 
      type: 'PLACE_BETS', 
      target: 1, 
      conditions: { minOdds: 5.0 } 
    },
    reward: { betPoints: 750, diamonds: 10, xp: 250 },
    weight: 10
  },

  // HARD DAILY CHALLENGES
  {
    type: ChallengeType.WINNING,
    difficulty: ChallengeDifficulty.HARD,
    name: 'Voittoputki',
    description: 'Voita 3 vetoa peräkkäin',
    requirement: { type: 'WIN_STREAK', target: 3 },
    reward: { betPoints: 1500, diamonds: 15, xp: 400 },
    weight: 8
  },
  {
    type: ChallengeType.BETTING,
    difficulty: ChallengeDifficulty.HARD,
    name: 'Derby-asiantuntija',
    description: 'Voita derby-veto',
    requirement: { 
      type: 'WIN_BETS', 
      target: 1, 
      conditions: { isDerby: true } 
    },
    reward: { betPoints: 2000, diamonds: 20, xp: 500 },
    weight: 5
  },
  {
    type: ChallengeType.SPECIAL,
    difficulty: ChallengeDifficulty.HARD,
    name: 'Korkeat Panokset',
    description: 'Aseta veto vähintään 500 BP panoksella',
    requirement: { 
      type: 'PLACE_BETS', 
      target: 1, 
      conditions: { minStake: 500 } 
    },
    reward: { betPoints: 1200, diamonds: 12, xp: 350 },
    weight: 6
  },

  // EXTREME CHALLENGES (Rare)
  {
    type: ChallengeType.WINNING,
    difficulty: ChallengeDifficulty.EXTREME,
    name: 'Täydellinen Päivä',
    description: 'Voita 5 vetoa yhdessä päivässä',
    requirement: { type: 'WIN_BETS', target: 5 },
    reward: { 
      betPoints: 5000, 
      diamonds: 50, 
      xp: 1000,
      specialReward: { type: 'ODDS_BOOST', value: 50, duration: 24 }
    },
    weight: 2
  },
  {
    type: ChallengeType.SPECIAL,
    difficulty: ChallengeDifficulty.EXTREME,
    name: 'Jackpot-metsästäjä',
    description: 'Voita veto yli 10.0 kertoimella',
    requirement: { 
      type: 'WIN_BETS', 
      target: 1, 
      conditions: { minOdds: 10.0 } 
    },
    reward: { 
      betPoints: 10000, 
      diamonds: 100, 
      xp: 2000,
      specialReward: { type: 'FREE_BET', value: 1000, duration: 48 }
    },
    weight: 1
  }
]

// Weekly Challenges (Higher rewards, longer duration)
export const WEEKLY_CHALLENGE_TEMPLATES = [
  {
    type: ChallengeType.BETTING,
    difficulty: ChallengeDifficulty.MEDIUM,
    name: 'Viikkoaktiivi',
    description: 'Aseta 15 vetoa viikon aikana',
    requirement: { type: 'PLACE_BETS', target: 15 },
    reward: { betPoints: 2500, diamonds: 25, xp: 500 },
    weight: 30
  },
  {
    type: ChallengeType.WINNING,
    difficulty: ChallengeDifficulty.HARD,
    name: 'Viikon Mestari',
    description: 'Voita 10 vetoa viikon aikana',
    requirement: { type: 'WIN_BETS', target: 10 },
    reward: { betPoints: 5000, diamonds: 50, xp: 1000 },
    weight: 20
  },
  {
    type: ChallengeType.SPECIAL,
    difficulty: ChallengeDifficulty.EXTREME,
    name: 'Liigan Legenda',
    description: 'Aseta onnistunut veto jokaiselle Veikkausliigan joukkueelle',
    requirement: { 
      type: 'WIN_BETS_ALL_TEAMS', 
      target: 12, 
      conditions: { specificLeague: 'Veikkausliiga' } 
    },
    reward: { 
      betPoints: 15000, 
      diamonds: 150, 
      xp: 3000,
      specialReward: { type: 'PREMIUM_INSIGHT', value: 1, duration: 168 } // 1 week
    },
    weight: 5
  }
]

// Challenge Generation Service
export class ChallengeService {
  
  static async generateDailyChallenges(): Promise<Challenge[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Generate 3-5 daily challenges with varying difficulties
    const challenges: Challenge[] = []
    
    // Always include 1 easy challenge
    const easyTemplates = CHALLENGE_TEMPLATES.filter(t => t.difficulty === ChallengeDifficulty.EASY)
    const easyChallenge = this.selectRandomTemplate(easyTemplates)
    challenges.push(this.createChallengeFromTemplate(easyChallenge, today, tomorrow))

    // Include 1-2 medium challenges
    const mediumTemplates = CHALLENGE_TEMPLATES.filter(t => t.difficulty === ChallengeDifficulty.MEDIUM)
    const mediumCount = Math.random() > 0.5 ? 2 : 1
    for (let i = 0; i < mediumCount; i++) {
      const template = this.selectRandomTemplate(mediumTemplates)
      challenges.push(this.createChallengeFromTemplate(template, today, tomorrow))
    }

    // Sometimes include 1 hard challenge (50% chance)
    if (Math.random() > 0.5) {
      const hardTemplates = CHALLENGE_TEMPLATES.filter(t => t.difficulty === ChallengeDifficulty.HARD)
      const hardChallenge = this.selectRandomTemplate(hardTemplates)
      challenges.push(this.createChallengeFromTemplate(hardChallenge, today, tomorrow))
    }

    // Rarely include 1 extreme challenge (10% chance)
    if (Math.random() > 0.9) {
      const extremeTemplates = CHALLENGE_TEMPLATES.filter(t => t.difficulty === ChallengeDifficulty.EXTREME)
      const extremeChallenge = this.selectRandomTemplate(extremeTemplates)
      challenges.push(this.createChallengeFromTemplate(extremeChallenge, today, tomorrow))
    }

    return challenges
  }

  static async generateWeeklyChallenges(): Promise<Challenge[]> {
    const monday = this.getThisMonday()
    const nextMonday = new Date(monday)
    nextMonday.setDate(nextMonday.getDate() + 7)

    return WEEKLY_CHALLENGE_TEMPLATES.map(template => 
      this.createChallengeFromTemplate(template, monday, nextMonday, ChallengeDuration.WEEKLY)
    )
  }

  private static selectRandomTemplate(templates: any[]): any {
    const totalWeight = templates.reduce((sum, t) => sum + t.weight, 0)
    let random = Math.random() * totalWeight
    
    for (const template of templates) {
      random -= template.weight
      if (random <= 0) return template
    }
    
    return templates[0] // Fallback
  }

  private static createChallengeFromTemplate(
    template: any, 
    startDate: Date, 
    endDate: Date,
    duration: ChallengeDuration = ChallengeDuration.DAILY
  ): Challenge {
    return {
      id: `${template.type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: template.name,
      description: template.description,
      type: template.type,
      difficulty: template.difficulty,
      requirement: template.requirement,
      reward: template.reward,
      duration,
      isActive: true,
      startDate,
      endDate
    }
  }

  private static getThisMonday(): Date {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    return monday
  }

  // Progress Tracking
  static async updateChallengeProgress(
    userId: string, 
    action: string, 
    context?: any
  ): Promise<Challenge[]> {
    // Get active challenges for user
    const activeChallenges = await this.getActiveChallengesForUser(userId)
    const completedChallenges: Challenge[] = []

    for (const challenge of activeChallenges) {
      const progress = await this.calculateProgress(userId, challenge, action, context)
      
      if (progress >= challenge.requirement.target) {
        // Challenge completed!
        await this.completeChallengeForUser(userId, challenge.id)
        completedChallenges.push(challenge)
      } else {
        // Update progress
        await this.updateProgressForUser(userId, challenge.id, progress)
      }
    }

    return completedChallenges
  }

  private static async calculateProgress(
    userId: string, 
    challenge: Challenge, 
    action: string, 
    context?: any
  ): Promise<number> {
    // This would implement the actual progress calculation logic
    // Based on the challenge requirement type and user actions
    return 0 // Placeholder
  }

  static async getActiveChallengesForUser(userId: string): Promise<Challenge[]> {
    // Implementation would query database for active challenges
    // and user progress
    return []
  }

  static async completeChallengeForUser(userId: string, challengeId: string): Promise<void> {
    // Mark challenge as completed and award rewards
    // Create notification and transaction records
  }

  static async updateProgressForUser(userId: string, challengeId: string, progress: number): Promise<void> {
    // Update user's progress toward challenge completion
  }

  // Public API methods
  static async getUserChallenges(userId: string): Promise<{
    daily: (Challenge & { progress: number })[]
    weekly: (Challenge & { progress: number })[]
  }> {
    // Return user's challenges with current progress
    return { daily: [], weekly: [] }
  }

  static async claimChallengeReward(userId: string, challengeId: string): Promise<ChallengeReward> {
    // Award the challenge reward to the user
    // Mark as claimed and create transaction records
    return { betPoints: 0, diamonds: 0, xp: 0 }
  }
}

// Challenge Validation
export function validateChallengeRequirement(
  requirement: ChallengeRequirement,
  userAction: any
): boolean {
  // Validate if user action meets challenge requirements
  // Check conditions like minOdds, betType, etc.
  return true // Placeholder
}

// Challenge Difficulty Colors & Icons
export const DIFFICULTY_CONFIG = {
  [ChallengeDifficulty.EASY]: {
    color: '#10B981', // Green
    icon: '⭐',
    name: 'Helppo'
  },
  [ChallengeDifficulty.MEDIUM]: {
    color: '#F59E0B', // Amber
    icon: '⭐⭐',
    name: 'Keskivaikea'
  },
  [ChallengeDifficulty.HARD]: {
    color: '#EF4444', // Red
    icon: '⭐⭐⭐',
    name: 'Vaikea'
  },
  [ChallengeDifficulty.EXTREME]: {
    color: '#8B5CF6', // Purple
    icon: '⭐⭐⭐⭐',
    name: 'Äärimmäinen'
  }
}

// Helper Functions
export function getChallengeProgress(current: number, target: number): number {
  return Math.min((current / target) * 100, 100)
}

export function getTimeRemaining(endDate: Date): string {
  const now = new Date()
  const diff = endDate.getTime() - now.getTime()
  
  if (diff <= 0) return 'Päättynyt'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}