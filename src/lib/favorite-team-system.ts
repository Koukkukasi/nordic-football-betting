// Favorite Team System
// Feature: Choose your favorite team for bonuses and special features

export interface FavoriteTeamBonus {
  xpMultiplier: number
  oddsBoost: number
  diamondBonus: number
  specialEvents: string[]
}

export interface TeamLoyaltyLevel {
  level: number
  name: string
  xpRequired: number
  perks: string[]
  bonuses: FavoriteTeamBonus
}

// Team loyalty levels (separate from main level)
export const TEAM_LOYALTY_LEVELS: TeamLoyaltyLevel[] = [
  {
    level: 1,
    name: 'Supporter',
    xpRequired: 0,
    perks: ['Team news notifications', 'Match reminders'],
    bonuses: {
      xpMultiplier: 1.1,      // 10% extra XP on team bets
      oddsBoost: 1.05,        // 5% extra odds on team
      diamondBonus: 0,
      specialEvents: []
    }
  },
  {
    level: 2,
    name: 'Fan',
    xpRequired: 500,
    perks: ['Custom team badge', 'Priority notifications', 'Team stats'],
    bonuses: {
      xpMultiplier: 1.15,
      oddsBoost: 1.08,
      diamondBonus: 1,        // +1 diamond per team win
      specialEvents: ['TEAM_WIN_STREAK']
    }
  },
  {
    level: 3,
    name: 'Ultra',
    xpRequired: 1500,
    perks: ['Exclusive challenges', 'Team chat access', 'Season predictions'],
    bonuses: {
      xpMultiplier: 1.20,
      oddsBoost: 1.10,
      diamondBonus: 2,
      specialEvents: ['DERBY_DOUBLE', 'TEAM_WIN_STREAK']
    }
  },
  {
    level: 4,
    name: 'Legend',
    xpRequired: 3000,
    perks: ['VIP status', 'Special avatar frame', 'Team leaderboard'],
    bonuses: {
      xpMultiplier: 1.25,
      oddsBoost: 1.15,
      diamondBonus: 3,
      specialEvents: ['DERBY_DOUBLE', 'TEAM_WIN_STREAK', 'COMEBACK_KING']
    }
  },
  {
    level: 5,
    name: 'Icon',
    xpRequired: 5000,
    perks: ['Hall of Fame', 'Predict starting XI', 'Manager mode'],
    bonuses: {
      xpMultiplier: 1.30,
      oddsBoost: 1.20,
      diamondBonus: 5,
      specialEvents: ['DERBY_DOUBLE', 'TEAM_WIN_STREAK', 'COMEBACK_KING', 'PERFECT_SEASON']
    }
  }
]

// Special events for favorite team
export const FAVORITE_TEAM_EVENTS = {
  DERBY_DOUBLE: {
    name: 'Derby Double',
    description: 'Double rewards when betting on your team in derbies',
    multiplier: 2.0
  },
  TEAM_WIN_STREAK: {
    name: 'Winning Streak',
    description: 'Extra diamonds for each consecutive team win',
    diamondsPerWin: [1, 2, 3, 5, 10] // Increases with streak
  },
  COMEBACK_KING: {
    name: 'Comeback King',
    description: '3x rewards if your team wins after being down',
    multiplier: 3.0
  },
  PERFECT_SEASON: {
    name: 'Perfect Season',
    description: 'Massive bonus if team goes unbeaten',
    betPointsBonus: 10000,
    diamondsBonus: 500
  },
  HOME_FORTRESS: {
    name: 'Home Fortress',
    description: 'Extra 25% odds on home games',
    oddsMultiplier: 1.25
  },
  UNDERDOG_SPIRIT: {
    name: 'Underdog Spirit',
    description: '50% extra rewards when team wins as underdog (odds > 3.0)',
    rewardMultiplier: 1.5
  }
}

// Calculate favorite team bonuses for a bet
export function calculateFavoriteTeamBonus(
  isTeamMatch: boolean,
  teamLoyaltyLevel: number,
  betType: 'SINGLE' | 'PITKAVETO' | 'LIVE',
  matchDetails?: {
    isDerby?: boolean
    isHome?: boolean
    teamIsUnderdog?: boolean
    currentStreak?: number
  }
): {
  xpBonus: number
  oddsMultiplier: number
  diamondBonus: number
  specialBonuses: string[]
} {
  if (!isTeamMatch) {
    return {
      xpBonus: 0,
      oddsMultiplier: 1,
      diamondBonus: 0,
      specialBonuses: []
    }
  }
  
  const loyaltyData = TEAM_LOYALTY_LEVELS[teamLoyaltyLevel - 1]
  if (!loyaltyData) {
    return {
      xpBonus: 0,
      oddsMultiplier: 1,
      diamondBonus: 0,
      specialBonuses: []
    }
  }
  
  let xpBonus = loyaltyData.bonuses.xpMultiplier - 1
  let oddsMultiplier = loyaltyData.bonuses.oddsBoost
  let diamondBonus = loyaltyData.bonuses.diamondBonus
  const specialBonuses: string[] = []
  
  // Apply special event bonuses
  if (matchDetails?.isDerby && loyaltyData.bonuses.specialEvents.includes('DERBY_DOUBLE')) {
    xpBonus *= 2
    diamondBonus *= 2
    specialBonuses.push('Derby Double Active!')
  }
  
  if (matchDetails?.isHome && teamLoyaltyLevel >= 3) {
    oddsMultiplier *= FAVORITE_TEAM_EVENTS.HOME_FORTRESS.oddsMultiplier
    specialBonuses.push('Home Fortress Bonus!')
  }
  
  if (matchDetails?.teamIsUnderdog && teamLoyaltyLevel >= 4) {
    xpBonus *= FAVORITE_TEAM_EVENTS.UNDERDOG_SPIRIT.rewardMultiplier
    specialBonuses.push('Underdog Spirit!')
  }
  
  // Streak bonus
  if (matchDetails?.currentStreak && matchDetails.currentStreak > 0) {
    const streakDiamonds = FAVORITE_TEAM_EVENTS.TEAM_WIN_STREAK.diamondsPerWin[
      Math.min(matchDetails.currentStreak - 1, 4)
    ]
    diamondBonus += streakDiamonds
    specialBonuses.push(`${matchDetails.currentStreak} Win Streak!`)
  }
  
  return {
    xpBonus,
    oddsMultiplier,
    diamondBonus,
    specialBonuses
  }
}

// Team-specific challenges
export interface TeamChallenge {
  id: string
  teamId: string
  name: string
  description: string
  requirement: {
    type: 'WINS' | 'CLEAN_SHEETS' | 'GOALS' | 'STREAK' | 'DERBY_WINS'
    target: number
    current: number
  }
  reward: {
    betPoints: number
    diamonds: number
    xp: number
    loyaltyXp: number
  }
  expiresAt: Date
}

// Generate daily team challenges
export function generateTeamChallenges(
  teamId: string,
  teamName: string,
  loyaltyLevel: number
): TeamChallenge[] {
  const challenges: TeamChallenge[] = []
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  
  // Basic challenge - always available
  challenges.push({
    id: `${teamId}-daily-win`,
    teamId,
    name: `${teamName} Victory`,
    description: `Bet on ${teamName} to win today`,
    requirement: { type: 'WINS', target: 1, current: 0 },
    reward: {
      betPoints: 200 * loyaltyLevel,
      diamonds: 5 * loyaltyLevel,
      xp: 50,
      loyaltyXp: 100
    },
    expiresAt: tomorrow
  })
  
  // Level 2+ challenges
  if (loyaltyLevel >= 2) {
    challenges.push({
      id: `${teamId}-clean-sheet`,
      teamId,
      name: 'Clean Sheet Master',
      description: `Bet on ${teamName} to win without conceding`,
      requirement: { type: 'CLEAN_SHEETS', target: 1, current: 0 },
      reward: {
        betPoints: 500,
        diamonds: 10,
        xp: 100,
        loyaltyXp: 200
      },
      expiresAt: tomorrow
    })
  }
  
  // Level 3+ challenges
  if (loyaltyLevel >= 3) {
    challenges.push({
      id: `${teamId}-goals`,
      teamId,
      name: 'Goal Fest',
      description: `Bet on ${teamName} matches with over 2.5 goals`,
      requirement: { type: 'GOALS', target: 3, current: 0 },
      reward: {
        betPoints: 750,
        diamonds: 15,
        xp: 150,
        loyaltyXp: 300
      },
      expiresAt: tomorrow
    })
  }
  
  // Level 4+ challenges
  if (loyaltyLevel >= 4) {
    challenges.push({
      id: `${teamId}-streak`,
      teamId,
      name: 'Streak Builder',
      description: `Win 3 consecutive bets on ${teamName}`,
      requirement: { type: 'STREAK', target: 3, current: 0 },
      reward: {
        betPoints: 1500,
        diamonds: 30,
        xp: 300,
        loyaltyXp: 500
      },
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })
  }
  
  return challenges
}

// Team loyalty XP calculation
export function calculateTeamLoyaltyXP(
  action: 'BET_PLACED' | 'BET_WON' | 'CHALLENGE_COMPLETE' | 'ATTENDANCE' | 'PREDICTION_CORRECT',
  isWin: boolean = false,
  betAmount?: number
): number {
  switch (action) {
    case 'BET_PLACED':
      return 25
    case 'BET_WON':
      return 50 + Math.floor((betAmount || 0) / 50) // Bonus based on stake
    case 'CHALLENGE_COMPLETE':
      return 100
    case 'ATTENDANCE':
      return 200 // Betting on every home game in a month
    case 'PREDICTION_CORRECT':
      return 150 // Correct score or first goalscorer
    default:
      return 0
  }
}

// Team rivalry system
export const TEAM_RIVALRIES: Record<string, string[]> = {
  // Finnish derbies
  'HJK Helsinki': ['HIFK Helsinki', 'FC Honka'],
  'HIFK Helsinki': ['HJK Helsinki'],
  'FC Honka': ['HJK Helsinki'],
  'FC Inter Turku': ['TPS Turku'],
  'TPS Turku': ['FC Inter Turku'],
  
  // Swedish derbies
  'AIK Stockholm': ['Djurgården Stockholm', 'Hammarby Stockholm'],
  'Djurgården Stockholm': ['AIK Stockholm', 'Hammarby Stockholm'],
  'Hammarby Stockholm': ['AIK Stockholm', 'Djurgården Stockholm'],
  'IFK Göteborg': ['BK Häcken'],
  'BK Häcken': ['IFK Göteborg'],
  'Malmö FF': ['Helsingborgs IF'],
  'Helsingborgs IF': ['Malmö FF']
}

// Check if match is a derby for user's favorite team
export function isFavoriteTeamDerby(
  favoriteTeamId: string,
  homeTeamId: string,
  awayTeamId: string,
  teamNames: Map<string, string>
): boolean {
  if (favoriteTeamId !== homeTeamId && favoriteTeamId !== awayTeamId) {
    return false
  }
  
  const favoriteTeamName = teamNames.get(favoriteTeamId)
  const opponentId = favoriteTeamId === homeTeamId ? awayTeamId : homeTeamId
  const opponentName = teamNames.get(opponentId)
  
  if (!favoriteTeamName || !opponentName) return false
  
  const rivals = TEAM_RIVALRIES[favoriteTeamName] || []
  return rivals.includes(opponentName)
}

// Season-long team achievements
export interface TeamSeasonAchievement {
  id: string
  name: string
  description: string
  requirement: any
  progress: number
  reward: {
    betPoints: number
    diamonds: number
    loyaltyXp: number
    badge?: string
  }
}

export function getTeamSeasonAchievements(teamId: string): TeamSeasonAchievement[] {
  return [
    {
      id: 'loyal-supporter',
      name: 'Loyal Supporter',
      description: 'Bet on your team in 20 matches',
      requirement: { matches: 20 },
      progress: 0,
      reward: { betPoints: 5000, diamonds: 100, loyaltyXp: 1000, badge: 'loyal_supporter' }
    },
    {
      id: 'derby-specialist',
      name: 'Derby Specialist',
      description: 'Win 5 derby bets with your team',
      requirement: { derbyWins: 5 },
      progress: 0,
      reward: { betPoints: 3000, diamonds: 75, loyaltyXp: 750, badge: 'derby_king' }
    },
    {
      id: 'profit-machine',
      name: 'Profit Machine',
      description: 'Make 10,000 BP profit from team bets',
      requirement: { profit: 10000 },
      progress: 0,
      reward: { betPoints: 10000, diamonds: 200, loyaltyXp: 2000, badge: 'money_maker' }
    }
  ]
}