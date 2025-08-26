// Sarjataulukko (League Table) Prediction System
// Feature: Predict final league positions during live match breaks

export interface SarjataulukkoChallenge {
  id: string
  leagueId: string
  leagueName: string
  season: string
  status: 'ACTIVE' | 'LOCKED' | 'COMPLETED'
  lockTime: Date // When predictions close (usually mid-season)
  endTime: Date // Season end
  entryFee: number // BetPoints cost
  prizePool: {
    betPoints: number
    diamonds: number
  }
  maxParticipants: number
  currentParticipants: number
}

export interface SarjataulukkoPrediction {
  id: string
  userId: string
  challengeId: string
  predictions: TeamPosition[]
  submittedAt: Date
  stake: number
  potentialReward: {
    betPoints: number
    diamonds: number
  }
  finalScore?: number // Points based on accuracy
  rank?: number // Final position in challenge
}

export interface TeamPosition {
  teamId: string
  teamName: string
  predictedPosition: number
  actualPosition?: number // Filled when season ends
  pointsEarned?: number // Points for this prediction
}

export interface LeagueTableState {
  leagueId: string
  currentPositions: {
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
  }[]
  lastUpdated: Date
}

// Scoring system for predictions
export const SARJATAULUKKO_SCORING = {
  EXACT_POSITION: 25,        // Predicted exact final position
  ONE_OFF: 10,               // One position away
  TWO_OFF: 5,                // Two positions away
  TOP_4_CORRECT: 15,         // Correctly predicted top 4 team
  BOTTOM_3_CORRECT: 15,      // Correctly predicted relegation
  PERFECT_TABLE: 500,        // Bonus for perfect prediction
  
  // Difficulty multipliers
  EARLY_SEASON: 2.0,         // Before 25% games played
  MID_SEASON: 1.5,           // 25-50% games played
  LATE_SEASON: 1.0,          // After 50% games played
}

// Calculate when sarjataulukko is available
export function isSarjataulukkoAvailable(
  liveMatchesCount: number,
  lastBetTime?: Date
): {
  available: boolean
  reason?: string
  timeUntilAvailable?: number
} {
  // Available when no live matches
  if (liveMatchesCount > 0) {
    return {
      available: false,
      reason: `${liveMatchesCount} live matches ongoing. Sarjataulukko available during breaks.`
    }
  }
  
  // Cooldown between predictions (prevent spam)
  if (lastBetTime) {
    const cooldownMinutes = 30
    const timeSinceLastBet = Date.now() - lastBetTime.getTime()
    const cooldownRemaining = (cooldownMinutes * 60 * 1000) - timeSinceLastBet
    
    if (cooldownRemaining > 0) {
      return {
        available: false,
        reason: 'Cooldown active',
        timeUntilAvailable: Math.ceil(cooldownRemaining / 60000)
      }
    }
  }
  
  return { available: true }
}

// Calculate entry fee based on league and timing
export function calculateEntryFee(
  league: { tier: number, country: string },
  gamesPlayed: number,
  totalGames: number,
  userLevel: number
): {
  baseFee: number
  discount: number
  finalFee: number
} {
  // Base fee by league tier
  const tierFees = {
    1: 100, // Top division
    2: 75,  // Second division
    3: 50   // Lower divisions
  }
  
  const baseFee = tierFees[league.tier as keyof typeof tierFees] || 50
  
  // Timing discount (cheaper early in season)
  const seasonProgress = gamesPlayed / totalGames
  let timingDiscount = 0
  
  if (seasonProgress < 0.25) {
    timingDiscount = 0.5 // 50% off early season
  } else if (seasonProgress < 0.5) {
    timingDiscount = 0.25 // 25% off mid season
  }
  
  // Level discount
  const levelDiscount = Math.min(userLevel * 0.02, 0.2) // 2% per level, max 20%
  
  const totalDiscount = Math.min(timingDiscount + levelDiscount, 0.6) // Max 60% off
  const finalFee = Math.round(baseFee * (1 - totalDiscount))
  
  return {
    baseFee,
    discount: totalDiscount,
    finalFee
  }
}

// Calculate potential rewards
export function calculateSarjataulukkoRewards(
  entryFee: number,
  participantCount: number,
  league: { tier: number },
  seasonProgress: number
): {
  betPoints: { min: number, max: number }
  diamonds: { min: number, max: number }
} {
  // Prize pool grows with participants
  const prizeMultiplier = Math.log10(participantCount + 10) * 2
  
  // Early predictions worth more
  const timingMultiplier = seasonProgress < 0.25 ? 3 : 
                          seasonProgress < 0.5 ? 2 : 1
  
  // League tier affects prizes
  const tierMultiplier = league.tier === 1 ? 2 : 
                        league.tier === 2 ? 1.5 : 1
  
  const basePrize = entryFee * prizeMultiplier * timingMultiplier * tierMultiplier
  
  return {
    betPoints: {
      min: Math.round(basePrize * 2),      // 2x for last place
      max: Math.round(basePrize * 20)      // 20x for first place
    },
    diamonds: {
      min: Math.round(basePrize / 20),     // Minimum diamonds
      max: Math.round(basePrize / 2)       // Maximum diamonds
    }
  }
}

// Score a prediction when season ends
export function scoreSarjataulukkoPrediction(
  predictions: TeamPosition[],
  actualPositions: Map<string, number>,
  seasonProgress: number
): {
  totalScore: number
  breakdown: {
    teamId: string
    predicted: number
    actual: number
    points: number
    reason: string
  }[]
  bonuses: string[]
} {
  let totalScore = 0
  const breakdown: any[] = []
  const bonuses: string[] = []
  
  // Difficulty multiplier based on when prediction was made
  const difficultyMultiplier = seasonProgress < 0.25 ? SARJATAULUKKO_SCORING.EARLY_SEASON :
                               seasonProgress < 0.5 ? SARJATAULUKKO_SCORING.MID_SEASON :
                               SARJATAULUKKO_SCORING.LATE_SEASON
  
  // Check each prediction
  predictions.forEach(pred => {
    const actual = actualPositions.get(pred.teamId)
    if (!actual) return
    
    const difference = Math.abs(pred.predictedPosition - actual)
    let points = 0
    let reason = ''
    
    if (difference === 0) {
      points = SARJATAULUKKO_SCORING.EXACT_POSITION
      reason = 'Exact position!'
    } else if (difference === 1) {
      points = SARJATAULUKKO_SCORING.ONE_OFF
      reason = 'One position off'
    } else if (difference === 2) {
      points = SARJATAULUKKO_SCORING.TWO_OFF
      reason = 'Two positions off'
    }
    
    // Bonus for top 4 prediction
    if (pred.predictedPosition <= 4 && actual <= 4) {
      points += SARJATAULUKKO_SCORING.TOP_4_CORRECT
      reason += ' + Top 4 bonus'
    }
    
    // Bonus for relegation prediction
    const totalTeams = predictions.length
    if (pred.predictedPosition >= totalTeams - 2 && actual >= totalTeams - 2) {
      points += SARJATAULUKKO_SCORING.BOTTOM_3_CORRECT
      reason += ' + Relegation bonus'
    }
    
    // Apply difficulty multiplier
    points = Math.round(points * difficultyMultiplier)
    
    breakdown.push({
      teamId: pred.teamId,
      predicted: pred.predictedPosition,
      actual,
      points,
      reason
    })
    
    totalScore += points
  })
  
  // Check for perfect prediction
  const perfectPrediction = breakdown.every(b => b.predicted === b.actual)
  if (perfectPrediction) {
    totalScore += SARJATAULUKKO_SCORING.PERFECT_TABLE
    bonuses.push('PERFECT TABLE PREDICTION! +500 points')
  }
  
  // Other bonuses
  const exactCount = breakdown.filter(b => b.predicted === b.actual).length
  if (exactCount >= predictions.length * 0.5) {
    const bonus = Math.round(100 * difficultyMultiplier)
    totalScore += bonus
    bonuses.push(`50%+ exact predictions! +${bonus} points`)
  }
  
  return { totalScore, breakdown, bonuses }
}

// Get available challenges based on current matches
export function getAvailableSarjataulukkoChallenges(
  leagues: any[],
  currentSeason: string,
  ongoingPredictions: string[] // League IDs user already predicted
): SarjataulukkoChallenge[] {
  const now = new Date()
  
  return leagues
    .filter(league => !ongoingPredictions.includes(league.id))
    .map(league => {
      // Mock data - in production, get from database
      const totalTeams = league.tier === 1 ? 12 : 10
      const gamesPlayed = Math.floor(Math.random() * 15) + 5
      const totalGames = (totalTeams * (totalTeams - 1)) // Each team plays others twice
      
      const seasonProgress = gamesPlayed / totalGames
      const lockTime = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)) // Lock in 7 days
      
      return {
        id: `${league.id}-${currentSeason}`,
        leagueId: league.id,
        leagueName: league.name,
        season: currentSeason,
        status: 'ACTIVE' as const,
        lockTime,
        endTime: new Date(now.getFullYear(), 11, 31), // Season end
        entryFee: calculateEntryFee(league, gamesPlayed, totalGames, 1).finalFee,
        prizePool: calculateSarjataulukkoRewards(100, 50, league, seasonProgress),
        maxParticipants: 1000,
        currentParticipants: Math.floor(Math.random() * 500) + 100
      }
    })
}

// Validate prediction (all positions filled, no duplicates)
export function validateSarjataulukkoPrediction(
  predictions: { teamId: string, position: number }[],
  totalTeams: number
): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check all positions filled
  if (predictions.length !== totalTeams) {
    errors.push(`Must predict all ${totalTeams} positions`)
  }
  
  // Check for duplicate positions
  const positions = predictions.map(p => p.position)
  const uniquePositions = new Set(positions)
  if (positions.length !== uniquePositions.size) {
    errors.push('Each position must be unique')
  }
  
  // Check position range
  const invalidPositions = positions.filter(p => p < 1 || p > totalTeams)
  if (invalidPositions.length > 0) {
    errors.push(`Positions must be between 1 and ${totalTeams}`)
  }
  
  // Check for duplicate teams
  const teamIds = predictions.map(p => p.teamId)
  const uniqueTeams = new Set(teamIds)
  if (teamIds.length !== uniqueTeams.size) {
    errors.push('Each team can only appear once')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}