// Statistics and Standings Engagement System
// Keep players engaged between matches with interactive stats exploration

export interface LeagueStandings {
  leagueId: string
  leagueName: string
  country: '🇫🇮' | '🇸🇪'
  lastUpdated: Date
  teams: TeamStanding[]
  topScorers: PlayerStats[]
  topAssists: PlayerStats[]
  formTeams: TeamForm[]
}

export interface TeamStanding {
  position: number
  teamId: string
  teamName: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: string // Last 5 matches: WWLDW
  nextMatch?: {
    opponent: string
    isHome: boolean
    date: Date
  }
  change: 'UP' | 'DOWN' | 'SAME' // Position change from last week
}

export interface PlayerStats {
  playerId: string
  playerName: string
  teamName: string
  nationality: string
  position: 'FW' | 'MF' | 'DF' | 'GK'
  goals?: number
  assists?: number
  yellowCards?: number
  redCards?: number
  matchesPlayed: number
  minutesPlayed: number
  rating: number // Average match rating
  fantasyPoints?: number // For fantasy integration
}

export interface TeamForm {
  teamId: string
  teamName: string
  last5: string // e.g., "WWWDL"
  homeForm: string
  awayForm: string
  scoringRate: number // Goals per match
  cleanSheets: number
  trend: 'HOT' | 'COLD' | 'STABLE'
}

// Interactive Stats Features
export interface StatsChallenge {
  id: string
  type: 'TRIVIA' | 'PREDICTION' | 'COMPARISON'
  question: string
  options?: string[]
  correctAnswer?: string | number
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  rewards: {
    xp: number
    betPoints: number
  }
  expiresIn: number // Minutes
}

// Stats Viewing Rewards System
export class StatsEngagement {
  // Award XP for exploring stats
  static readonly EXPLORATION_REWARDS = {
    VIEW_STANDINGS: 2,
    VIEW_TOP_SCORERS: 2,
    COMPARE_TEAMS: 5,
    ANALYZE_PLAYER: 3,
    CHECK_HEAD_TO_HEAD: 5,
    PREDICT_NEXT_SCORER: 10,
    SHARE_STAT: 15,
    COMPLETE_TRIVIA: 20
  }
  
  // Generate daily stats challenges based on current data
  static generateDailyStatsChallenge(standings: LeagueStandings): StatsChallenge[] {
    const challenges: StatsChallenge[] = []
    
    // Top scorer challenge
    if (standings.topScorers.length > 0) {
      const topScorer = standings.topScorers[0]
      challenges.push({
        id: 'daily_scorer_1',
        type: 'TRIVIA',
        question: `Who is the current top scorer in ${standings.leagueName}?`,
        options: standings.topScorers.slice(0, 4).map(p => p.playerName),
        correctAnswer: topScorer.playerName,
        difficulty: 'EASY',
        rewards: { xp: 10, betPoints: 50 },
        expiresIn: 1440
      })
    }
    
    // Form prediction challenge
    const hotTeam = standings.formTeams.find(t => t.trend === 'HOT')
    if (hotTeam) {
      challenges.push({
        id: 'form_prediction_1',
        type: 'PREDICTION',
        question: `Will ${hotTeam.teamName} continue their winning streak?`,
        options: ['Yes', 'No'],
        difficulty: 'MEDIUM',
        rewards: { xp: 15, betPoints: 100 },
        expiresIn: 720
      })
    }
    
    // Points comparison
    if (standings.teams.length > 2) {
      const team1 = standings.teams[0]
      const team2 = standings.teams[1]
      challenges.push({
        id: 'points_gap_1',
        type: 'TRIVIA',
        question: `How many points separate ${team1.teamName} and ${team2.teamName}?`,
        correctAnswer: Math.abs(team1.points - team2.points),
        difficulty: 'MEDIUM',
        rewards: { xp: 12, betPoints: 75 },
        expiresIn: 1440
      })
    }
    
    return challenges
  }
}

// Head-to-Head Statistics
export interface HeadToHead {
  team1: string
  team2: string
  matches: H2HMatch[]
  stats: {
    team1Wins: number
    draws: number
    team2Wins: number
    totalGoals: number
    avgGoalsPerMatch: number
    biggestWin: { team: string; score: string; date: Date }
    currentStreak: { team: string; count: number }
  }
  predictions: {
    winProbability: { team1: number; draw: number; team2: number }
    expectedGoals: { team1: number; team2: number }
    formAdvantage: string
  }
}

export interface H2HMatch {
  date: Date
  competition: string
  homeTeam: string
  awayTeam: string
  score: string
  scorers: { player: string; minute: number; team: string }[]
}

// Fantasy Integration
export interface FantasyPlayer {
  player: PlayerStats
  price: number // In fantasy points
  ownership: number // Percentage of players who own
  upcomingFixtures: {
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    opponent: string
    isHome: boolean
  }[]
  projectedPoints: number
  trend: 'RISING' | 'FALLING' | 'STABLE'
}

// Stats Discovery Game
export interface StatsDiscoveryQuest {
  id: string
  name: string
  description: string
  tasks: DiscoveryTask[]
  totalReward: {
    xp: number
    betPoints: number
    diamonds?: number
    badge?: string
  }
  completedBy: number // Number of players
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT'
}

export interface DiscoveryTask {
  id: string
  description: string
  type: 'VIEW' | 'ANALYZE' | 'PREDICT' | 'SHARE'
  target: string // What to interact with
  completed: boolean
  reward: { xp: number }
}

// Weekly Stats Quests
export const WEEKLY_QUESTS: StatsDiscoveryQuest[] = [
  {
    id: 'scorer_expert',
    name: 'Goal Scorer Expert',
    description: 'Become an expert on league top scorers',
    tasks: [
      {
        id: 'view_scorers',
        description: 'View top scorers in all 5 leagues',
        type: 'VIEW',
        target: 'TOP_SCORERS',
        completed: false,
        reward: { xp: 5 }
      },
      {
        id: 'predict_scorer',
        description: 'Predict next round top scorer',
        type: 'PREDICT',
        target: 'NEXT_SCORER',
        completed: false,
        reward: { xp: 10 }
      },
      {
        id: 'analyze_scoring',
        description: 'Analyze scoring patterns of 3 players',
        type: 'ANALYZE',
        target: 'PLAYER_PATTERNS',
        completed: false,
        reward: { xp: 15 }
      }
    ],
    totalReward: {
      xp: 30,
      betPoints: 500,
      badge: 'Scorer Scout'
    },
    completedBy: 0,
    difficulty: 'BEGINNER'
  },
  {
    id: 'form_analyst',
    name: 'Form Analyst',
    description: 'Master team form analysis',
    tasks: [
      {
        id: 'check_form',
        description: 'Check form of top 3 teams',
        type: 'VIEW',
        target: 'TEAM_FORM',
        completed: false,
        reward: { xp: 5 }
      },
      {
        id: 'compare_home_away',
        description: 'Compare home vs away form for 5 teams',
        type: 'ANALYZE',
        target: 'HOME_AWAY_FORM',
        completed: false,
        reward: { xp: 10 }
      },
      {
        id: 'predict_form',
        description: 'Predict form changes for next round',
        type: 'PREDICT',
        target: 'FORM_CHANGE',
        completed: false,
        reward: { xp: 20 }
      }
    ],
    totalReward: {
      xp: 35,
      betPoints: 750,
      diamonds: 2,
      badge: 'Form Master'
    },
    completedBy: 0,
    difficulty: 'INTERMEDIATE'
  },
  {
    id: 'derby_historian',
    name: 'Derby Historian',
    description: 'Learn the history of Nordic derbies',
    tasks: [
      {
        id: 'view_h2h',
        description: 'View H2H for Helsinki Derby',
        type: 'VIEW',
        target: 'HELSINKI_DERBY',
        completed: false,
        reward: { xp: 10 }
      },
      {
        id: 'view_stockholm',
        description: 'View H2H for Stockholm Derby',
        type: 'VIEW',
        target: 'STOCKHOLM_DERBY',
        completed: false,
        reward: { xp: 10 }
      },
      {
        id: 'analyze_derbies',
        description: 'Analyze last 5 derby matches',
        type: 'ANALYZE',
        target: 'DERBY_HISTORY',
        completed: false,
        reward: { xp: 15 }
      },
      {
        id: 'share_stat',
        description: 'Share an interesting derby stat',
        type: 'SHARE',
        target: 'DERBY_STAT',
        completed: false,
        reward: { xp: 20 }
      }
    ],
    totalReward: {
      xp: 55,
      betPoints: 1000,
      diamonds: 5,
      badge: 'Derby Expert'
    },
    completedBy: 0,
    difficulty: 'EXPERT'
  }
]

// Interactive Stats Comparison Tool
export class StatsComparison {
  static compareTeams(team1: TeamStanding, team2: TeamStanding) {
    return {
      formAdvantage: this.calculateFormAdvantage(team1.form, team2.form),
      goalsAdvantage: team1.goalsFor > team2.goalsFor ? team1.teamName : team2.teamName,
      defenseAdvantage: team1.goalsAgainst < team2.goalsAgainst ? team1.teamName : team2.teamName,
      pointsPerGame: {
        [team1.teamName]: (team1.points / team1.played).toFixed(2),
        [team2.teamName]: (team2.points / team2.played).toFixed(2)
      },
      prediction: this.predictOutcome(team1, team2)
    }
  }
  
  static calculateFormAdvantage(form1: string, form2: string): string {
    const getPoints = (form: string) => {
      return form.split('').reduce((sum, result) => {
        if (result === 'W') return sum + 3
        if (result === 'D') return sum + 1
        return sum
      }, 0)
    }
    
    const points1 = getPoints(form1.slice(-5))
    const points2 = getPoints(form2.slice(-5))
    
    if (points1 > points2) return 'Team 1'
    if (points2 > points1) return 'Team 2'
    return 'Equal'
  }
  
  static predictOutcome(team1: TeamStanding, team2: TeamStanding) {
    // Simple prediction based on position and form
    const positionDiff = team2.position - team1.position
    const formPoints1 = this.getFormPoints(team1.form)
    const formPoints2 = this.getFormPoints(team2.form)
    
    let team1Chance = 33
    let drawChance = 33
    let team2Chance = 34
    
    // Adjust based on league position
    if (positionDiff > 5) {
      team1Chance += 20
      team2Chance -= 15
      drawChance -= 5
    } else if (positionDiff < -5) {
      team2Chance += 20
      team1Chance -= 15
      drawChance -= 5
    }
    
    // Adjust based on form
    if (formPoints1 > formPoints2 + 5) {
      team1Chance += 10
      team2Chance -= 10
    } else if (formPoints2 > formPoints1 + 5) {
      team2Chance += 10
      team1Chance -= 10
    }
    
    return {
      team1Win: Math.min(70, Math.max(10, team1Chance)),
      draw: Math.min(40, Math.max(15, drawChance)),
      team2Win: Math.min(70, Math.max(10, team2Chance))
    }
  }
  
  private static getFormPoints(form: string): number {
    return form.slice(-5).split('').reduce((sum, result) => {
      if (result === 'W') return sum + 3
      if (result === 'D') return sum + 1
      return sum
    }, 0)
  }
}

// Stats-based Mini Predictions (Quick engagement)
export interface QuickPrediction {
  id: string
  question: string
  timeLimit: number // Seconds to answer
  options: Array<{
    text: string
    odds: number // Potential multiplier
  }>
  correctAnswer?: string
  stake: number // Fixed stake amount
  resolved: boolean
}

export class QuickStatsGame {
  static generateQuickPredictions(standings: LeagueStandings): QuickPrediction[] {
    const predictions: QuickPrediction[] = []
    
    // Next goal scorer prediction
    if (standings.topScorers.length > 0) {
      predictions.push({
        id: 'quick_scorer_1',
        question: 'Who will score next in their match?',
        timeLimit: 30,
        options: standings.topScorers.slice(0, 3).map(player => ({
          text: player.playerName,
          odds: 2.5 - (standings.topScorers.indexOf(player) * 0.3)
        })),
        stake: 50,
        resolved: false
      })
    }
    
    // Clean sheet prediction
    const topTeam = standings.teams[0]
    predictions.push({
      id: 'clean_sheet_1',
      question: `Will ${topTeam.teamName} keep a clean sheet?`,
      timeLimit: 20,
      options: [
        { text: 'Yes', odds: 2.2 },
        { text: 'No', odds: 1.6 }
      ],
      stake: 30,
      resolved: false
    })
    
    return predictions
  }
}