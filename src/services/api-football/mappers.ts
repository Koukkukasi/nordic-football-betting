// Data mapping utilities for API-Football responses to our internal Match format

import { Match } from '@/components/matches/ExpandedMatchList'

// League ID mappings
export const LEAGUE_IDS = {
  'premier-league': 39,
  'championship': 40,
  'veikkausliiga': 244,    // Finnish top league
  'allsvenskan': 113,      // Swedish top league
  'superettan': 114,       // Swedish second league
  'ykkonen': 245,          // Finnish second league (Ykkönen)
  'ykkosliiga': 1087,      // Finnish third league (Ykkösliiga)
} as const

// Reverse mapping for league IDs to our internal IDs
export const API_TO_INTERNAL_LEAGUE: Record<number, string> = {
  39: 'premier-league',
  40: 'championship',
  244: 'veikkausliiga',
  113: 'allsvenskan',
  114: 'superettan',
  245: 'ykkonen',
  1087: 'ykkosliiga',
}

// League display names
export const LEAGUE_NAMES: Record<string, string> = {
  'premier-league': 'Premier League',
  'championship': 'Championship',
  'veikkausliiga': 'Veikkausliiga',
  'allsvenskan': 'Allsvenskan',
  'superettan': 'Superettan',
  'ykkonen': 'Ykkönen',
  'ykkosliiga': 'Ykkösliiga',
}

// Check if match is a derby based on team names
function checkIfDerby(homeTeam: string, awayTeam: string, leagueId: string): { isDerby: boolean; derbyName?: string } {
  // Premier League derbies
  if (leagueId === 'premier-league') {
    if ((homeTeam.includes('Arsenal') && awayTeam.includes('Tottenham')) ||
        (homeTeam.includes('Tottenham') && awayTeam.includes('Arsenal'))) {
      return { isDerby: true, derbyName: 'North London Derby' }
    }
    if ((homeTeam.includes('Manchester United') && awayTeam.includes('Manchester City')) ||
        (homeTeam.includes('Manchester City') && awayTeam.includes('Manchester United'))) {
      return { isDerby: true, derbyName: 'Manchester Derby' }
    }
    if ((homeTeam.includes('Liverpool') && awayTeam.includes('Everton')) ||
        (homeTeam.includes('Everton') && awayTeam.includes('Liverpool'))) {
      return { isDerby: true, derbyName: 'Merseyside Derby' }
    }
  }
  
  // Championship derbies
  if (leagueId === 'championship') {
    if ((homeTeam.includes('Sheffield United') && awayTeam.includes('Sheffield Wednesday')) ||
        (homeTeam.includes('Sheffield Wednesday') && awayTeam.includes('Sheffield United'))) {
      return { isDerby: true, derbyName: 'Steel City Derby' }
    }
    if ((homeTeam.includes('Cardiff') && awayTeam.includes('Swansea')) ||
        (homeTeam.includes('Swansea') && awayTeam.includes('Cardiff'))) {
      return { isDerby: true, derbyName: 'South Wales Derby' }
    }
  }
  
  // Nordic derbies
  if (leagueId === 'veikkausliiga') {
    if ((homeTeam.includes('HJK') && awayTeam.includes('HIFK')) ||
        (homeTeam.includes('HIFK') && awayTeam.includes('HJK'))) {
      return { isDerby: true, derbyName: 'Helsinki Derby' }
    }
  }
  
  if (leagueId === 'allsvenskan') {
    if ((homeTeam.includes('AIK') && awayTeam.includes('Djurgården')) ||
        (homeTeam.includes('Djurgården') && awayTeam.includes('AIK')) ||
        (homeTeam.includes('AIK') && awayTeam.includes('Hammarby')) ||
        (homeTeam.includes('Hammarby') && awayTeam.includes('AIK'))) {
      return { isDerby: true, derbyName: 'Stockholm Derby' }
    }
  }
  
  return { isDerby: false }
}

// Generate short name from full team name
function generateShortName(fullName: string): string {
  // Common patterns
  if (fullName.includes('FC ')) {
    return fullName.replace('FC ', '').substring(0, 3).toUpperCase()
  }
  if (fullName.includes('United')) {
    return fullName.split(' ')[0].substring(0, 3).toUpperCase()
  }
  if (fullName.includes('City')) {
    return fullName.split(' ')[0].substring(0, 3).toUpperCase()
  }
  
  // Take first 3 letters of first word
  return fullName.split(' ')[0].substring(0, 3).toUpperCase()
}

// Map API fixture to our Match format
export function mapApiFixtureToMatch(fixture: any, odds?: any): Match {
  const leagueId = API_TO_INTERNAL_LEAGUE[fixture.league.id] || 'unknown'
  const leagueName = LEAGUE_NAMES[leagueId] || fixture.league.name
  
  const homeTeam = fixture.teams.home.name
  const awayTeam = fixture.teams.away.name
  const { isDerby, derbyName } = checkIfDerby(homeTeam, awayTeam, leagueId)
  
  // Check if match is live
  const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(fixture.fixture.status.short)
  
  // Extract odds from bookmaker data (using first bookmaker's 1X2 market)
  let matchOdds = { home: 2.0, draw: 3.2, away: 3.5 } // Default odds
  
  if (odds?.bookmakers?.length > 0) {
    const bookmaker = odds.bookmakers[0]
    const market = bookmaker.bets.find((bet: any) => bet.name === 'Match Winner')
    
    if (market?.values?.length >= 3) {
      matchOdds = {
        home: parseFloat(market.values.find((v: any) => v.value === 'Home')?.odd || '2.0'),
        draw: parseFloat(market.values.find((v: any) => v.value === 'Draw')?.odd || '3.2'),
        away: parseFloat(market.values.find((v: any) => v.value === 'Away')?.odd || '3.5'),
      }
    }
  }
  
  return {
    id: `api-${fixture.fixture.id}`,
    league: leagueId,
    leagueName,
    homeTeam,
    awayTeam,
    homeTeamShort: generateShortName(homeTeam),
    awayTeamShort: generateShortName(awayTeam),
    date: new Date(fixture.fixture.date),
    odds: matchOdds,
    isDerby,
    derbyName,
    isLive,
    minute: isLive ? fixture.fixture.status.elapsed : undefined,
    score: isLive ? {
      home: fixture.goals.home || 0,
      away: fixture.goals.away || 0
    } : undefined
  }
}

// Map multiple fixtures
export function mapApiFixturesToMatches(fixtures: any[], oddsMap?: Map<number, any>): Match[] {
  return fixtures.map(fixture => {
    const odds = oddsMap?.get(fixture.fixture.id)
    return mapApiFixtureToMatch(fixture, odds)
  })
}

// Get API league IDs from internal league IDs
export function getApiLeagueIds(internalLeagueIds: string[]): number[] {
  return internalLeagueIds
    .map(id => LEAGUE_IDS[id as keyof typeof LEAGUE_IDS])
    .filter(id => id !== undefined)
}

// Format date for API request
export function formatApiDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Get date range for upcoming matches
export function getUpcomingDateRange(): { from: string; to: string } {
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return {
    from: formatApiDate(today),
    to: formatApiDate(nextWeek)
  }
}