// Enhanced Odds System for Free-to-Play Experience
// Feature 2: 1.5x to 2.1x multiplier for F2P experience

export interface StandardOdds {
  homeWin: number
  draw: number
  awayWin: number
}

export interface EnhancedOdds extends StandardOdds {
  enhancedHomeWin: number
  enhancedDraw: number
  enhancedAwayWin: number
  boostPercentage: number
}

export interface OddsBoostFactors {
  isFirstBet: boolean
  isDerbyMatch: boolean
  isFeaturedMatch: boolean
  userLevel: number
  hasActivePromo: boolean
}

// Base enhancement range for free-to-play
const MIN_ENHANCEMENT = 1.5
const MAX_ENHANCEMENT = 2.1

// Calculate enhanced odds for free-to-play experience
export function calculateEnhancedOdds(
  standardOdds: StandardOdds,
  factors: Partial<OddsBoostFactors> = {}
): EnhancedOdds {
  // Calculate base enhancement multiplier
  let baseMultiplier = MIN_ENHANCEMENT + (Math.random() * (MAX_ENHANCEMENT - MIN_ENHANCEMENT))
  
  // Apply additional boosts based on factors
  if (factors.isFirstBet) {
    baseMultiplier += 0.2 // Extra 20% for first bet
  }
  
  if (factors.isDerbyMatch) {
    baseMultiplier += 0.15 // Extra 15% for derby matches
  }
  
  if (factors.isFeaturedMatch) {
    baseMultiplier += 0.1 // Extra 10% for featured matches
  }
  
  if (factors.userLevel && factors.userLevel >= 5) {
    baseMultiplier += 0.05 * Math.min(factors.userLevel - 4, 5) // Up to 25% extra at level 10
  }
  
  if (factors.hasActivePromo) {
    baseMultiplier += 0.25 // Extra 25% during promotions
  }
  
  // Cap the maximum multiplier at 3.0 to maintain balance
  baseMultiplier = Math.min(baseMultiplier, 3.0)
  
  return {
    ...standardOdds,
    enhancedHomeWin: Math.round(standardOdds.homeWin * baseMultiplier),
    enhancedDraw: Math.round(standardOdds.draw * baseMultiplier),
    enhancedAwayWin: Math.round(standardOdds.awayWin * baseMultiplier),
    boostPercentage: Math.round((baseMultiplier - 1) * 100)
  }
}

// Format odds for display (convert from integer to decimal)
export function formatOdds(odds: number): string {
  return (odds / 100).toFixed(2)
}

// Calculate potential win
export function calculatePotentialWin(stake: number, odds: number, diamondBoost?: number): number {
  const decimalOdds = odds / 100
  const boostMultiplier = diamondBoost || 1
  return Math.round(stake * decimalOdds * boostMultiplier)
}

// Special event odds boosts
export const SPECIAL_EVENTS = {
  WEEKEND_BOOST: {
    name: 'Weekend Special',
    multiplier: 1.2,
    days: [5, 6, 0] // Friday, Saturday, Sunday
  },
  HAPPY_HOUR: {
    name: 'Happy Hour',
    multiplier: 1.3,
    hours: [18, 19, 20] // 6-9 PM
  },
  DERBY_DAY: {
    name: 'Derby Day Madness',
    multiplier: 1.5,
    condition: 'isDerby'
  },
  NEW_PLAYER: {
    name: 'New Player Bonus',
    multiplier: 1.75,
    condition: 'firstWeek'
  }
}

// Check if any special events are active
export function getActiveSpecialEvents(date: Date = new Date(), userCreatedAt?: Date): string[] {
  const activeEvents: string[] = []
  const day = date.getDay()
  const hour = date.getHours()
  
  // Weekend boost
  if (SPECIAL_EVENTS.WEEKEND_BOOST.days.includes(day)) {
    activeEvents.push('WEEKEND_BOOST')
  }
  
  // Happy hour
  if (SPECIAL_EVENTS.HAPPY_HOUR.hours.includes(hour)) {
    activeEvents.push('HAPPY_HOUR')
  }
  
  // New player bonus (first 7 days)
  if (userCreatedAt) {
    const daysSinceJoined = Math.floor((date.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceJoined <= 7) {
      activeEvents.push('NEW_PLAYER')
    }
  }
  
  return activeEvents
}

// Apply all active special event boosts
export function applySpecialEventBoosts(baseOdds: number, activeEvents: string[]): number {
  let boostedOdds = baseOdds
  
  activeEvents.forEach(event => {
    const specialEvent = SPECIAL_EVENTS[event as keyof typeof SPECIAL_EVENTS]
    if (specialEvent && specialEvent.multiplier) {
      boostedOdds = Math.round(boostedOdds * specialEvent.multiplier)
    }
  })
  
  return boostedOdds
}

// Compare standard vs enhanced odds for display
export function calculateOddsImprovement(standardOdds: number, enhancedOdds: number): string {
  const improvement = ((enhancedOdds - standardOdds) / standardOdds) * 100
  return `+${improvement.toFixed(0)}%`
}

// Pitkäveto (accumulator) odds calculation
export function calculateAccumulatorOdds(selections: number[]): number {
  if (selections.length === 0) return 0
  
  let totalOdds = 1
  selections.forEach(odds => {
    totalOdds *= (odds / 100)
  })
  
  // Apply free-to-play bonus for accumulators (more selections = bigger bonus)
  const accumulatorBonus = 1 + (selections.length * 0.05) // 5% per selection
  
  return Math.round(totalOdds * accumulatorBonus * 100)
}

// Odds validation
export function validateOdds(odds: number): boolean {
  // Odds should be between 1.01 (101) and 100.00 (10000)
  return odds >= 101 && odds <= 10000
}

// Get odds color for UI (better odds = greener color)
export function getOddsColor(standardOdds: number, enhancedOdds: number): string {
  const improvement = ((enhancedOdds - standardOdds) / standardOdds) * 100
  
  if (improvement >= 100) return '#10b981' // Green 500
  if (improvement >= 75) return '#34d399'  // Green 400
  if (improvement >= 50) return '#6ee7b7'  // Green 300
  if (improvement >= 25) return '#86efac'  // Green 200
  return '#bbf7d0' // Green 100
}