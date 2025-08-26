// Pitkäveto (Finnish Accumulator) Betting System
// Feature 4: Multi-match accumulator (min 2 selections, optimized for F2P)

import { calculateEnhancedOdds, EnhancedOdds } from './enhanced-odds-system'
import { DIAMOND_BOOST_OPTIONS } from './diamond-economy'

export interface PitkavetoSelection {
  matchId: string
  matchName: string // "HJK vs Inter"
  market: MarketType
  selection: SelectionType
  standardOdds: number
  enhancedOdds: number
  startTime: Date
  isDerby?: boolean
  league?: string
}

export interface PitkavetoSlip {
  id?: string
  userId: string
  selections: PitkavetoSelection[]
  stake: number
  totalOdds: number
  potentialWin: number
  diamondBoost?: {
    type: keyof typeof DIAMOND_BOOST_OPTIONS
    cost: number
    multiplier: number
  }
  status: 'PENDING' | 'WON' | 'LOST' | 'PARTIAL' | 'VOID'
  placedAt?: Date
  settledAt?: Date
}

export type MarketType = 
  | 'MATCH_RESULT'
  | 'OVER_UNDER_25'
  | 'BTTS'
  | 'DOUBLE_CHANCE'
  | 'CORRECT_SCORE'

export type SelectionType = 
  | 'HOME' | 'DRAW' | 'AWAY' // Match Result
  | 'OVER' | 'UNDER' // Over/Under
  | 'YES' | 'NO' // BTTS
  | 'HOME_DRAW' | 'AWAY_DRAW' | 'HOME_AWAY' // Double Chance
  | string // Correct Score like "2-1", "0-0"

// Pitkäveto rules and limits
export const PITKAVETO_RULES = {
  MIN_SELECTIONS: 2, // Reduced from traditional 3 for better F2P experience
  MAX_SELECTIONS: 15,
  MIN_ODDS_PER_SELECTION: 110, // 1.10
  MIN_TOTAL_ODDS: 200, // 2.00
  MAX_TOTAL_ODDS: 1000000, // 10,000.00
  
  // F2P bonuses
  SELECTION_BONUS: {
    2: 1.0,   // No bonus
    3: 1.05,  // 5% bonus
    4: 1.10,  // 10% bonus
    5: 1.15,  // 15% bonus
    6: 1.20,  // 20% bonus
    7: 1.25,  // 25% bonus
    8: 1.30,  // 30% bonus
    9: 1.35,  // 35% bonus
    10: 1.40, // 40% bonus
    11: 1.45, // 45% bonus
    12: 1.50, // 50% bonus
    13: 1.55, // 55% bonus
    14: 1.60, // 60% bonus
    15: 1.65  // 65% bonus
  },
  
  // Special bonuses
  ALL_FAVORITES_BONUS: 1.1, // 10% extra if all selections are favorites (odds < 2.00)
  ALL_UNDERDOGS_BONUS: 1.2, // 20% extra if all selections are underdogs (odds > 3.00)
  MIXED_MARKETS_BONUS: 1.15, // 15% extra for using 3+ different markets
  DERBY_INCLUDED_BONUS: 1.1, // 10% extra if includes a derby match
}

// Validate Pitkäveto selections
export function validatePitkaveto(selections: PitkavetoSelection[]): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check minimum selections
  if (selections.length < PITKAVETO_RULES.MIN_SELECTIONS) {
    errors.push(`Minimum ${PITKAVETO_RULES.MIN_SELECTIONS} selections required`)
  }
  
  // Check maximum selections
  if (selections.length > PITKAVETO_RULES.MAX_SELECTIONS) {
    errors.push(`Maximum ${PITKAVETO_RULES.MAX_SELECTIONS} selections allowed`)
  }
  
  // Check for duplicate matches
  const matchIds = selections.map(s => s.matchId)
  const uniqueMatchIds = new Set(matchIds)
  if (matchIds.length !== uniqueMatchIds.size) {
    errors.push('Cannot select multiple outcomes from the same match')
  }
  
  // Check minimum odds per selection
  selections.forEach((sel, index) => {
    if (sel.enhancedOdds < PITKAVETO_RULES.MIN_ODDS_PER_SELECTION) {
      errors.push(`Selection ${index + 1} odds too low (min ${PITKAVETO_RULES.MIN_ODDS_PER_SELECTION / 100})`)
    }
  })
  
  // Check match start times (can't bet on started matches)
  const now = new Date()
  selections.forEach((sel, index) => {
    if (sel.startTime < now) {
      errors.push(`Selection ${index + 1}: Match has already started`)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Calculate total odds with F2P bonuses
export function calculatePitkavetoOdds(
  selections: PitkavetoSelection[],
  diamondBoost?: keyof typeof DIAMOND_BOOST_OPTIONS
): {
  baseOdds: number
  bonusMultiplier: number
  finalOdds: number
  bonusReasons: string[]
} {
  // Calculate base odds (multiply all selections)
  let baseOdds = 1
  selections.forEach(sel => {
    baseOdds *= (sel.enhancedOdds / 100)
  })
  
  let bonusMultiplier = 1
  const bonusReasons: string[] = []
  
  // Selection count bonus
  const selectionBonus = PITKAVETO_RULES.SELECTION_BONUS[selections.length as keyof typeof PITKAVETO_RULES.SELECTION_BONUS] || 1
  if (selectionBonus > 1) {
    bonusMultiplier *= selectionBonus
    bonusReasons.push(`${selections.length} selections: +${Math.round((selectionBonus - 1) * 100)}%`)
  }
  
  // Check for all favorites
  const allFavorites = selections.every(sel => sel.enhancedOdds < 200)
  if (allFavorites && selections.length >= 3) {
    bonusMultiplier *= PITKAVETO_RULES.ALL_FAVORITES_BONUS
    bonusReasons.push('All favorites bonus: +10%')
  }
  
  // Check for all underdogs
  const allUnderdogs = selections.every(sel => sel.enhancedOdds > 300)
  if (allUnderdogs && selections.length >= 3) {
    bonusMultiplier *= PITKAVETO_RULES.ALL_UNDERDOGS_BONUS
    bonusReasons.push('All underdogs bonus: +20%')
  }
  
  // Check for mixed markets
  const markets = new Set(selections.map(sel => sel.market))
  if (markets.size >= 3) {
    bonusMultiplier *= PITKAVETO_RULES.MIXED_MARKETS_BONUS
    bonusReasons.push('Mixed markets bonus: +15%')
  }
  
  // Check for derby
  const hasDerby = selections.some(sel => sel.isDerby)
  if (hasDerby) {
    bonusMultiplier *= PITKAVETO_RULES.DERBY_INCLUDED_BONUS
    bonusReasons.push('Derby included bonus: +10%')
  }
  
  // Apply diamond boost if used
  if (diamondBoost) {
    const boost = DIAMOND_BOOST_OPTIONS[diamondBoost]
    bonusMultiplier *= boost.multiplier
    bonusReasons.push(`Diamond boost: ${boost.multiplier}×`)
  }
  
  const finalOdds = Math.round(baseOdds * bonusMultiplier * 100)
  
  return {
    baseOdds: Math.round(baseOdds * 100),
    bonusMultiplier,
    finalOdds,
    bonusReasons
  }
}

// Calculate potential win
export function calculatePotentialWin(stake: number, totalOdds: number): number {
  return Math.round(stake * (totalOdds / 100))
}

// Get selection description for display
export function getSelectionDescription(selection: PitkavetoSelection): string {
  const market = selection.market
  const pick = selection.selection
  
  switch (market) {
    case 'MATCH_RESULT':
      return pick === 'HOME' ? '1' : pick === 'DRAW' ? 'X' : '2'
    case 'OVER_UNDER_25':
      return pick === 'OVER' ? 'Over 2.5' : 'Under 2.5'
    case 'BTTS':
      return pick === 'YES' ? 'BTTS Yes' : 'BTTS No'
    case 'DOUBLE_CHANCE':
      return pick === 'HOME_DRAW' ? '1X' : pick === 'AWAY_DRAW' ? 'X2' : '12'
    case 'CORRECT_SCORE':
      return `Score ${pick}`
    default:
      return pick
  }
}

// Pitkäveto statistics
export interface PitkavetoStats {
  totalPlaced: number
  totalWon: number
  winRate: number
  averageOdds: number
  averageSelections: number
  biggestWin: number
  currentStreak: number
  bestStreak: number
  favoriteMarket: string
  profitLoss: number
}

// Calculate user's Pitkäveto statistics
export function calculatePitkavetoStats(bets: PitkavetoSlip[]): PitkavetoStats {
  if (bets.length === 0) {
    return {
      totalPlaced: 0,
      totalWon: 0,
      winRate: 0,
      averageOdds: 0,
      averageSelections: 0,
      biggestWin: 0,
      currentStreak: 0,
      bestStreak: 0,
      favoriteMarket: 'MATCH_RESULT',
      profitLoss: 0
    }
  }
  
  const wonBets = bets.filter(bet => bet.status === 'WON')
  const totalStaked = bets.reduce((sum, bet) => sum + bet.stake, 0)
  const totalWinnings = wonBets.reduce((sum, bet) => sum + bet.potentialWin, 0)
  
  // Calculate average selections per bet
  const totalSelections = bets.reduce((sum, bet) => sum + bet.selections.length, 0)
  
  // Find favorite market
  const marketCounts = new Map<string, number>()
  bets.forEach(bet => {
    bet.selections.forEach(sel => {
      marketCounts.set(sel.market, (marketCounts.get(sel.market) || 0) + 1)
    })
  })
  const favoriteMarket = Array.from(marketCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'MATCH_RESULT'
  
  // Calculate streaks
  let currentStreak = 0
  let bestStreak = 0
  let tempStreak = 0
  
  // Sort bets by date (newest first)
  const sortedBets = [...bets].sort((a, b) => 
    (b.settledAt?.getTime() || 0) - (a.settledAt?.getTime() || 0)
  )
  
  for (const bet of sortedBets) {
    if (bet.status === 'WON') {
      tempStreak++
      currentStreak = tempStreak
      bestStreak = Math.max(bestStreak, tempStreak)
    } else if (bet.status === 'LOST') {
      tempStreak = 0
    }
  }
  
  return {
    totalPlaced: bets.length,
    totalWon: wonBets.length,
    winRate: (wonBets.length / bets.length) * 100,
    averageOdds: bets.reduce((sum, bet) => sum + bet.totalOdds, 0) / bets.length,
    averageSelections: totalSelections / bets.length,
    biggestWin: Math.max(...wonBets.map(bet => bet.potentialWin), 0),
    currentStreak,
    bestStreak,
    favoriteMarket,
    profitLoss: totalWinnings - totalStaked
  }
}

// Smart bet suggestions based on user history
export function suggestSmartPitkaveto(
  availableMatches: any[],
  userStats: PitkavetoStats
): PitkavetoSelection[] {
  // This is a placeholder for AI-powered suggestions
  // In production, this would analyze user patterns and suggest optimal combinations
  
  const suggestions: PitkavetoSelection[] = []
  
  // Suggest based on user's average selections
  const targetSelections = Math.round(userStats.averageSelections) || 3
  
  // Filter matches by user's favorite market success
  // Sort by best value (enhanced odds vs standard odds ratio)
  
  return suggestions
}