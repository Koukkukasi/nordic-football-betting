// Leaderboard System
// Feature: Weekly/Monthly leaderboards with prizes

export type LeaderboardType = 
  | 'WEEKLY_PROFIT'
  | 'WEEKLY_WINS'
  | 'WEEKLY_STREAK'
  | 'WEEKLY_DIAMONDS'
  | 'MONTHLY_PROFIT'
  | 'MONTHLY_WINS'
  | 'MONTHLY_PITKAVETO'
  | 'MONTHLY_LIVE'
  | 'SEASONAL_OVERALL'
  | 'TEAM_LOYALTY'

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatar?: string
  favoriteTeam?: string
  score: number
  previousRank?: number
  prize?: LeaderboardPrize
  stats?: {
    totalBets?: number
    winRate?: number
    biggestWin?: number
    currentStreak?: number
  }
}

export interface LeaderboardPrize {
  betPoints: number
  diamonds: number
  xp: number
  badge?: string
  title?: string
}

export interface Leaderboard {
  id: string
  type: LeaderboardType
  name: string
  description: string
  startDate: Date
  endDate: Date
  status: 'ACTIVE' | 'CALCULATING' | 'COMPLETED'
  totalParticipants: number
  minBetsRequired: number // Minimum bets to qualify
  prizes: {
    rank: number | string // number or range like "1", "2-3", "4-10"
    prize: LeaderboardPrize
  }[]
  userPosition?: LeaderboardEntry // Current user's position
  topEntries: LeaderboardEntry[]
}

// Prize distributions for different leaderboards
export const LEADERBOARD_PRIZES = {
  WEEKLY: {
    PROFIT: [
      { rank: 1, prize: { betPoints: 5000, diamonds: 100, xp: 1000, badge: 'weekly_profit_champion' } },
      { rank: '2-3', prize: { betPoints: 2500, diamonds: 50, xp: 500 } },
      { rank: '4-10', prize: { betPoints: 1000, diamonds: 25, xp: 250 } },
      { rank: '11-25', prize: { betPoints: 500, diamonds: 10, xp: 100 } },
      { rank: '26-50', prize: { betPoints: 250, diamonds: 5, xp: 50 } },
      { rank: '51-100', prize: { betPoints: 100, diamonds: 2, xp: 25 } }
    ],
    WINS: [
      { rank: 1, prize: { betPoints: 3000, diamonds: 75, xp: 750, title: 'Win Machine' } },
      { rank: '2-3', prize: { betPoints: 1500, diamonds: 35, xp: 350 } },
      { rank: '4-10', prize: { betPoints: 750, diamonds: 15, xp: 150 } },
      { rank: '11-50', prize: { betPoints: 250, diamonds: 5, xp: 50 } }
    ],
    STREAK: [
      { rank: 1, prize: { betPoints: 4000, diamonds: 80, xp: 800, badge: 'streak_master' } },
      { rank: '2-3', prize: { betPoints: 2000, diamonds: 40, xp: 400 } },
      { rank: '4-10', prize: { betPoints: 1000, diamonds: 20, xp: 200 } }
    ],
    DIAMONDS: [
      { rank: 1, prize: { betPoints: 2500, diamonds: 150, xp: 500, title: 'Diamond Hunter' } },
      { rank: '2-5', prize: { betPoints: 1000, diamonds: 75, xp: 250 } },
      { rank: '6-20', prize: { betPoints: 500, diamonds: 30, xp: 100 } }
    ]
  },
  MONTHLY: {
    PROFIT: [
      { rank: 1, prize: { betPoints: 25000, diamonds: 500, xp: 5000, badge: 'monthly_champion', title: 'Profit King' } },
      { rank: '2-3', prize: { betPoints: 15000, diamonds: 300, xp: 3000 } },
      { rank: '4-5', prize: { betPoints: 10000, diamonds: 200, xp: 2000 } },
      { rank: '6-10', prize: { betPoints: 5000, diamonds: 100, xp: 1000 } },
      { rank: '11-25', prize: { betPoints: 2500, diamonds: 50, xp: 500 } },
      { rank: '26-50', prize: { betPoints: 1000, diamonds: 25, xp: 250 } },
      { rank: '51-100', prize: { betPoints: 500, diamonds: 10, xp: 100 } },
      { rank: '101-250', prize: { betPoints: 250, diamonds: 5, xp: 50 } }
    ],
    WINS: [
      { rank: 1, prize: { betPoints: 20000, diamonds: 400, xp: 4000, badge: 'monthly_winner' } },
      { rank: '2-3', prize: { betPoints: 10000, diamonds: 200, xp: 2000 } },
      { rank: '4-10', prize: { betPoints: 5000, diamonds: 100, xp: 1000 } },
      { rank: '11-100', prize: { betPoints: 1000, diamonds: 20, xp: 200 } }
    ],
    PITKAVETO: [
      { rank: 1, prize: { betPoints: 15000, diamonds: 300, xp: 3000, title: 'Pitkäveto Master' } },
      { rank: '2-5', prize: { betPoints: 7500, diamonds: 150, xp: 1500 } },
      { rank: '6-50', prize: { betPoints: 2000, diamonds: 40, xp: 400 } }
    ],
    LIVE: [
      { rank: 1, prize: { betPoints: 10000, diamonds: 250, xp: 2500, badge: 'live_legend' } },
      { rank: '2-10', prize: { betPoints: 3000, diamonds: 60, xp: 600 } },
      { rank: '11-100', prize: { betPoints: 750, diamonds: 15, xp: 150 } }
    ]
  }
}

// Calculate leaderboard score based on type
export function calculateLeaderboardScore(
  type: LeaderboardType,
  stats: {
    profit?: number
    wins?: number
    currentStreak?: number
    maxStreak?: number
    diamondsEarned?: number
    pitkavetoWins?: number
    liveBetProfit?: number
    teamLoyaltyXP?: number
  }
): number {
  switch (type) {
    case 'WEEKLY_PROFIT':
    case 'MONTHLY_PROFIT':
      return stats.profit || 0
      
    case 'WEEKLY_WINS':
    case 'MONTHLY_WINS':
      return stats.wins || 0
      
    case 'WEEKLY_STREAK':
      return stats.maxStreak || 0
      
    case 'WEEKLY_DIAMONDS':
      return stats.diamondsEarned || 0
      
    case 'MONTHLY_PITKAVETO':
      return stats.pitkavetoWins || 0
      
    case 'MONTHLY_LIVE':
      return stats.liveBetProfit || 0
      
    case 'TEAM_LOYALTY':
      return stats.teamLoyaltyXP || 0
      
    case 'SEASONAL_OVERALL':
      // Complex scoring combining multiple factors
      const profit = stats.profit || 0
      const wins = stats.wins || 0
      const winBonus = wins * 100
      const streakBonus = (stats.maxStreak || 0) * 500
      const diamondBonus = (stats.diamondsEarned || 0) * 10
      return profit + winBonus + streakBonus + diamondBonus
      
    default:
      return 0
  }
}

// Get active leaderboards
export function getActiveLeaderboards(currentDate: Date = new Date()): Leaderboard[] {
  const leaderboards: Leaderboard[] = []
  
  // Weekly leaderboards (reset every Monday)
  const weekStart = getWeekStart(currentDate)
  const weekEnd = getWeekEnd(currentDate)
  
  leaderboards.push(
    {
      id: `weekly-profit-${weekStart.toISOString()}`,
      type: 'WEEKLY_PROFIT',
      name: 'Weekly Profit Leaders',
      description: 'Highest profit this week',
      startDate: weekStart,
      endDate: weekEnd,
      status: 'ACTIVE',
      totalParticipants: 0,
      minBetsRequired: 10,
      prizes: LEADERBOARD_PRIZES.WEEKLY.PROFIT,
      topEntries: []
    },
    {
      id: `weekly-wins-${weekStart.toISOString()}`,
      type: 'WEEKLY_WINS',
      name: 'Weekly Win Champions',
      description: 'Most wins this week',
      startDate: weekStart,
      endDate: weekEnd,
      status: 'ACTIVE',
      totalParticipants: 0,
      minBetsRequired: 10,
      prizes: LEADERBOARD_PRIZES.WEEKLY.WINS,
      topEntries: []
    },
    {
      id: `weekly-streak-${weekStart.toISOString()}`,
      type: 'WEEKLY_STREAK',
      name: 'Weekly Streak Masters',
      description: 'Longest win streak this week',
      startDate: weekStart,
      endDate: weekEnd,
      status: 'ACTIVE',
      totalParticipants: 0,
      minBetsRequired: 5,
      prizes: LEADERBOARD_PRIZES.WEEKLY.STREAK,
      topEntries: []
    },
    {
      id: `weekly-diamonds-${weekStart.toISOString()}`,
      type: 'WEEKLY_DIAMONDS',
      name: 'Diamond Collectors',
      description: 'Most diamonds earned this week',
      startDate: weekStart,
      endDate: weekEnd,
      status: 'ACTIVE',
      totalParticipants: 0,
      minBetsRequired: 20,
      prizes: LEADERBOARD_PRIZES.WEEKLY.DIAMONDS,
      topEntries: []
    }
  )
  
  // Monthly leaderboards
  const monthStart = getMonthStart(currentDate)
  const monthEnd = getMonthEnd(currentDate)
  
  leaderboards.push(
    {
      id: `monthly-profit-${monthStart.toISOString()}`,
      type: 'MONTHLY_PROFIT',
      name: 'Monthly Profit Championship',
      description: 'Highest profit this month - Grand prizes!',
      startDate: monthStart,
      endDate: monthEnd,
      status: 'ACTIVE',
      totalParticipants: 0,
      minBetsRequired: 50,
      prizes: LEADERBOARD_PRIZES.MONTHLY.PROFIT,
      topEntries: []
    },
    {
      id: `monthly-pitkaveto-${monthStart.toISOString()}`,
      type: 'MONTHLY_PITKAVETO',
      name: 'Pitkäveto Masters',
      description: 'Most successful Pitkäveto bets',
      startDate: monthStart,
      endDate: monthEnd,
      status: 'ACTIVE',
      totalParticipants: 0,
      minBetsRequired: 20,
      prizes: LEADERBOARD_PRIZES.MONTHLY.PITKAVETO,
      topEntries: []
    },
    {
      id: `monthly-live-${monthStart.toISOString()}`,
      type: 'MONTHLY_LIVE',
      name: 'Live Betting Legends',
      description: 'Best live betting performance',
      startDate: monthStart,
      endDate: monthEnd,
      status: 'ACTIVE',
      totalParticipants: 0,
      minBetsRequired: 30,
      prizes: LEADERBOARD_PRIZES.MONTHLY.LIVE,
      topEntries: []
    }
  )
  
  return leaderboards
}

// Leaderboard position rewards (participation bonus)
export function getPositionReward(rank: number, totalParticipants: number): LeaderboardPrize | null {
  // Participation rewards for being in top percentages
  const percentage = (rank / totalParticipants) * 100
  
  if (percentage <= 1) {
    // Top 1%
    return { betPoints: 1000, diamonds: 20, xp: 200 }
  } else if (percentage <= 5) {
    // Top 5%
    return { betPoints: 500, diamonds: 10, xp: 100 }
  } else if (percentage <= 10) {
    // Top 10%
    return { betPoints: 250, diamonds: 5, xp: 50 }
  } else if (percentage <= 25) {
    // Top 25%
    return { betPoints: 100, diamonds: 2, xp: 20 }
  } else if (percentage <= 50) {
    // Top 50%
    return { betPoints: 50, diamonds: 1, xp: 10 }
  }
  
  return null
}

// Special event leaderboards
export interface EventLeaderboard extends Leaderboard {
  eventType: 'DERBY_WEEK' | 'WORLD_CUP' | 'SEASON_END' | 'HOLIDAY_SPECIAL'
  specialRules?: string[]
  bonusMultiplier?: number
}

export function createSpecialEventLeaderboard(
  eventType: EventLeaderboard['eventType'],
  startDate: Date,
  endDate: Date
): EventLeaderboard {
  const configs = {
    DERBY_WEEK: {
      name: 'Derby Week Madness',
      description: 'Best performance during derby week',
      specialRules: ['2x points for derby bets', 'Bonus for correct scores'],
      bonusMultiplier: 2,
      prizes: [
        { rank: 1, prize: { betPoints: 10000, diamonds: 200, xp: 2000, badge: 'derby_champion' } },
        { rank: '2-10', prize: { betPoints: 3000, diamonds: 60, xp: 600 } }
      ]
    },
    SEASON_END: {
      name: 'Season Finale Championship',
      description: 'Grand championship for season end',
      specialRules: ['All bets count double', 'Special Sarjataulukko bonus'],
      bonusMultiplier: 2,
      prizes: [
        { rank: 1, prize: { betPoints: 50000, diamonds: 1000, xp: 10000, badge: 'season_champion', title: 'Season Legend' } },
        { rank: '2-3', prize: { betPoints: 25000, diamonds: 500, xp: 5000 } },
        { rank: '4-10', prize: { betPoints: 10000, diamonds: 200, xp: 2000 } }
      ]
    }
  }
  
  const config = configs[eventType] || configs.DERBY_WEEK
  
  return {
    id: `event-${eventType}-${startDate.toISOString()}`,
    type: 'SEASONAL_OVERALL',
    eventType,
    name: config.name,
    description: config.description,
    startDate,
    endDate,
    status: 'ACTIVE',
    totalParticipants: 0,
    minBetsRequired: 5,
    prizes: config.prizes,
    specialRules: config.specialRules,
    bonusMultiplier: config.bonusMultiplier,
    topEntries: []
  }
}

// Helper functions
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  return new Date(d.setDate(diff))
}

function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date)
  return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000)
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

// Leaderboard notifications
export interface LeaderboardNotification {
  type: 'RANK_UP' | 'RANK_DOWN' | 'NEW_LEADER' | 'PRIZE_WON' | 'ENDING_SOON'
  leaderboardName: string
  message: string
  data?: {
    previousRank?: number
    currentRank?: number
    prize?: LeaderboardPrize
    timeRemaining?: string
  }
}

export function generateLeaderboardNotifications(
  previousPosition: number,
  currentPosition: number,
  leaderboard: Leaderboard
): LeaderboardNotification[] {
  const notifications: LeaderboardNotification[] = []
  
  if (currentPosition < previousPosition) {
    notifications.push({
      type: 'RANK_UP',
      leaderboardName: leaderboard.name,
      message: `You climbed to #${currentPosition} in ${leaderboard.name}!`,
      data: { previousRank: previousPosition, currentRank: currentPosition }
    })
    
    // Check if entered prize range
    const prize = getPrizeForRank(currentPosition, leaderboard.prizes)
    if (prize && !getPrizeForRank(previousPosition, leaderboard.prizes)) {
      notifications.push({
        type: 'PRIZE_WON',
        leaderboardName: leaderboard.name,
        message: `You're now in the prize zone! Keep it up!`,
        data: { prize }
      })
    }
  } else if (currentPosition > previousPosition) {
    notifications.push({
      type: 'RANK_DOWN',
      leaderboardName: leaderboard.name,
      message: `You dropped to #${currentPosition} in ${leaderboard.name}`,
      data: { previousRank: previousPosition, currentRank: currentPosition }
    })
  }
  
  // Check if leaderboard ending soon
  const hoursRemaining = (leaderboard.endDate.getTime() - Date.now()) / (1000 * 60 * 60)
  if (hoursRemaining <= 24 && hoursRemaining > 0) {
    notifications.push({
      type: 'ENDING_SOON',
      leaderboardName: leaderboard.name,
      message: `${leaderboard.name} ends in ${Math.ceil(hoursRemaining)} hours!`,
      data: { timeRemaining: `${Math.ceil(hoursRemaining)}h` }
    })
  }
  
  return notifications
}

function getPrizeForRank(rank: number, prizes: any[]): LeaderboardPrize | null {
  for (const prizeConfig of prizes) {
    if (typeof prizeConfig.rank === 'number' && prizeConfig.rank === rank) {
      return prizeConfig.prize
    } else if (typeof prizeConfig.rank === 'string') {
      const [min, max] = prizeConfig.rank.split('-').map(Number)
      if (rank >= min && rank <= max) {
        return prizeConfig.prize
      }
    }
  }
  return null
}