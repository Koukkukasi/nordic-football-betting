// Daily Challenge System for Nordic Football Betting
// Dynamic challenge generation with varied objectives

export interface ChallengeReward {
  betPoints: number
  diamonds: number
  xp: number
}

export interface ChallengeRequirement {
  type: string
  target: number
  conditions?: {
    minOdds?: number
    maxOdds?: number
    betType?: 'SINGLE' | 'PITKAVETO' | 'LIVE'
    isDerby?: boolean
    isLive?: boolean
    teams?: string[]
    leagues?: string[]
    timeframe?: 'MORNING' | 'AFTERNOON' | 'EVENING'
    minStake?: number
    maxStake?: number
  }
}

export interface ChallengeTemplate {
  id: string
  name: string
  description: string
  requirement: ChallengeRequirement
  reward: ChallengeReward
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  category: 'BETTING' | 'WINNING' | 'EXPLORATION' | 'RISK' | 'LOYALTY'
  weight: number // Probability of being selected
  isWeekendOnly?: boolean
  isSpecialEvent?: boolean
}

// Challenge Templates Pool
export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  // EASY CHALLENGES (70% selection weight)
  {
    id: 'daily_bet',
    name: 'Päivittäinen Veto',
    description: 'Place 3 bets today',
    requirement: {
      type: 'BETS_PLACED',
      target: 3
    },
    reward: {
      betPoints: 300,
      diamonds: 5,
      xp: 50
    },
    difficulty: 'EASY',
    category: 'BETTING',
    weight: 25
  },
  {
    id: 'small_winner',
    name: 'Pieni Voittaja',
    description: 'Win 2 bets today',
    requirement: {
      type: 'BETS_WON',
      target: 2
    },
    reward: {
      betPoints: 500,
      diamonds: 8,
      xp: 75
    },
    difficulty: 'EASY',
    category: 'WINNING',
    weight: 20
  },
  {
    id: 'safe_bets',
    name: 'Varmat Vedot',
    description: 'Place 3 bets with odds under 2.0',
    requirement: {
      type: 'BETS_PLACED',
      target: 3,
      conditions: {
        maxOdds: 2.0
      }
    },
    reward: {
      betPoints: 400,
      diamonds: 6,
      xp: 60
    },
    difficulty: 'EASY',
    category: 'RISK',
    weight: 15
  },
  {
    id: 'league_explorer',
    name: 'Liigatutkija',
    description: 'Bet on 3 different leagues today',
    requirement: {
      type: 'LEAGUES_BET',
      target: 3
    },
    reward: {
      betPoints: 600,
      diamonds: 10,
      xp: 80
    },
    difficulty: 'EASY',
    category: 'EXPLORATION',
    weight: 10
  },

  // MEDIUM CHALLENGES (25% selection weight)
  {
    id: 'combo_builder',
    name: 'Yhdistelmärakentaja',
    description: 'Place a 4+ selection combo bet',
    requirement: {
      type: 'COMBO_BET_PLACED',
      target: 1,
      conditions: {
        betType: 'PITKAVETO'
      }
    },
    reward: {
      betPoints: 800,
      diamonds: 12,
      xp: 100
    },
    difficulty: 'MEDIUM',
    category: 'BETTING',
    weight: 8
  },
  {
    id: 'risky_business',
    name: 'Riskibisnestä',
    description: 'Win a bet with odds 3.0 or higher',
    requirement: {
      type: 'HIGH_ODDS_WIN',
      target: 1,
      conditions: {
        minOdds: 3.0
      }
    },
    reward: {
      betPoints: 1000,
      diamonds: 15,
      xp: 125
    },
    difficulty: 'MEDIUM',
    category: 'RISK',
    weight: 8
  },
  {
    id: 'live_action',
    name: 'Live-toiminta',
    description: 'Place 3 live bets during matches',
    requirement: {
      type: 'LIVE_BETS_PLACED',
      target: 3,
      conditions: {
        isLive: true
      }
    },
    reward: {
      betPoints: 1200,
      diamonds: 18,
      xp: 150
    },
    difficulty: 'MEDIUM',
    category: 'BETTING',
    weight: 6
  },
  {
    id: 'winning_streak',
    name: 'Voittoputki',
    description: 'Win 3 bets in a row today',
    requirement: {
      type: 'WIN_STREAK',
      target: 3,
      conditions: {
        consecutive: true
      }
    },
    reward: {
      betPoints: 1500,
      diamonds: 20,
      xp: 175
    },
    difficulty: 'MEDIUM',
    category: 'WINNING',
    weight: 5
  },

  // HARD CHALLENGES (5% selection weight)
  {
    id: 'jackpot_hunter',
    name: 'Jättipottimetsästäjä',
    description: 'Win a bet worth 2000+ BP',
    requirement: {
      type: 'BIG_WIN',
      target: 2000
    },
    reward: {
      betPoints: 2500,
      diamonds: 35,
      xp: 250
    },
    difficulty: 'HARD',
    category: 'WINNING',
    weight: 2
  },
  {
    id: 'perfect_combo',
    name: 'Täydellinen Yhdistelmä',
    description: 'Win a 6+ selection combo bet',
    requirement: {
      type: 'PERFECT_COMBO_WIN',
      target: 1,
      conditions: {
        betType: 'PITKAVETO'
      }
    },
    reward: {
      betPoints: 5000,
      diamonds: 50,
      xp: 400
    },
    difficulty: 'HARD',
    category: 'WINNING',
    weight: 1
  },
  {
    id: 'high_roller_day',
    name: 'Korkean Panoksen Päivä',
    description: 'Place 5 bets with stakes over 500 BP each',
    requirement: {
      type: 'HIGH_STAKE_BETS',
      target: 5,
      conditions: {
        minStake: 500
      }
    },
    reward: {
      betPoints: 3000,
      diamonds: 40,
      xp: 300
    },
    difficulty: 'HARD',
    category: 'RISK',
    weight: 2
  },

  // WEEKEND SPECIAL CHALLENGES
  {
    id: 'weekend_warrior',
    name: 'Viikonloppusankari',
    description: 'Place 10 bets over the weekend',
    requirement: {
      type: 'WEEKEND_BETS',
      target: 10
    },
    reward: {
      betPoints: 1500,
      diamonds: 25,
      xp: 200
    },
    difficulty: 'MEDIUM',
    category: 'LOYALTY',
    weight: 0, // Only selected on weekends
    isWeekendOnly: true
  },
  {
    id: 'derby_day',
    name: 'Derby-päivä',
    description: 'Win 2 derby matches today',
    requirement: {
      type: 'DERBY_WINS',
      target: 2,
      conditions: {
        isDerby: true
      }
    },
    reward: {
      betPoints: 2000,
      diamonds: 30,
      xp: 250
    },
    difficulty: 'HARD',
    category: 'WINNING',
    weight: 0, // Only when derby matches are available
    isSpecialEvent: true
  }
]

// Challenge Generation Logic
export function generateDailyChallenges(
  date: Date,
  userLevel: number,
  availableMatches?: {
    isDerbyDay: boolean
    availableLeagues: string[]
    liveMatchesCount: number
  }
): ChallengeTemplate[] {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  const challenges: ChallengeTemplate[] = []
  
  // Always include one easy challenge
  const easyPool = CHALLENGE_TEMPLATES.filter(t => t.difficulty === 'EASY')
  challenges.push(selectWeightedChallenge(easyPool))
  
  // Select second challenge based on user level and day
  if (userLevel >= 3) {
    const mediumPool = CHALLENGE_TEMPLATES.filter(t => 
      t.difficulty === 'MEDIUM' && 
      (!t.isWeekendOnly || isWeekend)
    )
    
    if (Math.random() < 0.7) { // 70% chance for medium
      challenges.push(selectWeightedChallenge(mediumPool))
    } else { // 30% chance for another easy
      challenges.push(selectWeightedChallenge(easyPool.filter(t => t.id !== challenges[0].id)))
    }
  } else {
    // Lower level users get another easy challenge
    challenges.push(selectWeightedChallenge(easyPool.filter(t => t.id !== challenges[0].id)))
  }
  
  // High level users (7+) get a third challenge
  if (userLevel >= 7) {
    const allPool = CHALLENGE_TEMPLATES.filter(t => 
      !challenges.some(c => c.id === t.id) &&
      (!t.isWeekendOnly || isWeekend) &&
      (!t.isSpecialEvent || (availableMatches?.isDerbyDay && t.id === 'derby_day'))
    )
    
    if (Math.random() < 0.1 && userLevel >= 8) { // 10% chance for hard challenge at level 8+
      const hardPool = allPool.filter(t => t.difficulty === 'HARD')
      if (hardPool.length > 0) {
        challenges.push(selectWeightedChallenge(hardPool))
      }
    } else {
      // Add another medium or easy challenge
      const mediumEasyPool = allPool.filter(t => 
        t.difficulty === 'MEDIUM' || t.difficulty === 'EASY'
      )
      if (mediumEasyPool.length > 0) {
        challenges.push(selectWeightedChallenge(mediumEasyPool))
      }
    }
  }
  
  // Add weekend bonus challenge
  if (isWeekend && userLevel >= 5) {
    const weekendChallenge = CHALLENGE_TEMPLATES.find(t => t.id === 'weekend_warrior')
    if (weekendChallenge && !challenges.some(c => c.id === weekendChallenge.id)) {
      challenges.push(weekendChallenge)
    }
  }
  
  // Add derby challenge if available
  if (availableMatches?.isDerbyDay && userLevel >= 6) {
    const derbyChallenge = CHALLENGE_TEMPLATES.find(t => t.id === 'derby_day')
    if (derbyChallenge && !challenges.some(c => c.id === derbyChallenge.id)) {
      challenges.push(derbyChallenge)
    }
  }
  
  return challenges.slice(0, 4) // Max 4 challenges per day
}

// Weighted selection algorithm
function selectWeightedChallenge(pool: ChallengeTemplate[]): ChallengeTemplate {
  const totalWeight = pool.reduce((sum, template) => sum + template.weight, 0)
  let random = Math.random() * totalWeight
  
  for (const template of pool) {
    random -= template.weight
    if (random <= 0) {
      return template
    }
  }
  
  return pool[0] // Fallback
}

// Challenge progress tracking
export function updateChallengeProgress(
  challengeType: string,
  userAction: any,
  currentProgress: number = 0
): number {
  switch (challengeType) {
    case 'BETS_PLACED':
      return currentProgress + 1
      
    case 'BETS_WON':
      if (userAction.won) return currentProgress + 1
      break
      
    case 'LEAGUES_BET':
      // Implement league tracking logic
      return currentProgress + (userAction.newLeague ? 1 : 0)
      
    case 'COMBO_BET_PLACED':
      if (userAction.betType === 'PITKAVETO' && userAction.selectionCount >= 4) {
        return currentProgress + 1
      }
      break
      
    case 'HIGH_ODDS_WIN':
      if (userAction.won && userAction.odds >= 3.0) {
        return currentProgress + 1
      }
      break
      
    case 'LIVE_BETS_PLACED':
      if (userAction.isLive) return currentProgress + 1
      break
      
    case 'WIN_STREAK':
      if (userAction.won) {
        return currentProgress + 1
      } else {
        return 0 // Reset streak on loss
      }
      
    case 'BIG_WIN':
      if (userAction.won && userAction.winAmount >= 2000) {
        return Math.max(currentProgress, userAction.winAmount)
      }
      break
      
    case 'PERFECT_COMBO_WIN':
      if (userAction.won && userAction.betType === 'PITKAVETO' && userAction.selectionCount >= 6) {
        return currentProgress + 1
      }
      break
      
    case 'HIGH_STAKE_BETS':
      if (userAction.stake >= 500) return currentProgress + 1
      break
      
    case 'WEEKEND_BETS':
      const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6
      if (isWeekend) return currentProgress + 1
      break
      
    case 'DERBY_WINS':
      if (userAction.won && userAction.isDerby) return currentProgress + 1
      break
  }
  
  return currentProgress
}

// Challenge completion check
export function checkChallengeCompletion(
  challenge: ChallengeTemplate,
  progress: number
): boolean {
  return progress >= challenge.requirement.target
}

// Calculate streak bonus for completing challenges
export function calculateChallengeStreakBonus(consecutiveDays: number): ChallengeReward {
  if (consecutiveDays < 3) return { betPoints: 0, diamonds: 0, xp: 0 }
  
  const baseBonus = {
    betPoints: 200 * consecutiveDays,
    diamonds: 5 * Math.floor(consecutiveDays / 3),
    xp: 50 * consecutiveDays
  }
  
  // Cap the bonus to prevent inflation
  return {
    betPoints: Math.min(baseBonus.betPoints, 2000),
    diamonds: Math.min(baseBonus.diamonds, 50),
    xp: Math.min(baseBonus.xp, 500)
  }
}

// Get challenge difficulty color for UI
export function getChallengeColor(difficulty: string): string {
  switch (difficulty) {
    case 'EASY': return '#10B981' // Green
    case 'MEDIUM': return '#F59E0B' // Amber
    case 'HARD': return '#EF4444' // Red
    default: return '#6B7280' // Gray
  }
}

// Challenge category icons for UI
export const CHALLENGE_CATEGORY_ICONS = {
  BETTING: '🎯',
  WINNING: '🏆',
  EXPLORATION: '🗺️',
  RISK: '⚡',
  LOYALTY: '⭐'
}

// Difficulty configuration for UI
export const DIFFICULTY_CONFIG = {
  EASY: {
    name: 'Helppo',
    color: '#10B981',
    icon: '✅'
  },
  MEDIUM: {
    name: 'Keskitaso',
    color: '#F59E0B',
    icon: '⚡'
  },
  HARD: {
    name: 'Vaikea',
    color: '#EF4444',
    icon: '🔥'
  }
}

// Get challenge progress percentage
export function getChallengeProgress(current: number, target: number): number {
  return Math.min((current / target) * 100, 100)
}

// Get time remaining for challenge
export function getTimeRemaining(endDate: Date): string {
  const now = new Date()
  const timeDiff = endDate.getTime() - now.getTime()
  
  if (timeDiff <= 0) {
    return 'Päättynyt'
  }
  
  const hours = Math.floor(timeDiff / (1000 * 60 * 60))
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days} päivää jäljellä`
  } else if (hours > 0) {
    return `${hours}h ${minutes}min jäljellä`
  } else {
    return `${minutes} min jäljellä`
  }
}

// Challenge interface for components
export interface Challenge {
  id: string
  name: string
  description: string
  startDate: Date
  endDate: Date
  requirement: ChallengeRequirement
  reward: ChallengeReward & { specialReward?: { type: string; value?: any } }
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  isDaily: boolean
  isActive: boolean
}

export type ChallengeDifficulty = 'EASY' | 'MEDIUM' | 'HARD'