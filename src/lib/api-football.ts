// API-Football integration for Nordic matches
// https://www.api-football.com/

const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || ''
const BASE_URL = 'https://v3.football.api-sports.io'

// League IDs for Nordic competitions
export const NORDIC_LEAGUES = {
  // Finland
  VEIKKAUSLIIGA: 113, // Finnish Premier Division
  YKKONEN: 114, // Finnish Division 1
  
  // Sweden  
  ALLSVENSKAN: 103, // Swedish Premier Division
  SUPERETTAN: 104, // Swedish Division 1
}

export interface ApiFootballMatch {
  fixture: {
    id: number
    timezone: string
    date: string
    timestamp: number
    status: {
      long: string
      short: string
      elapsed: number | null
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string
    season: number
    round: string
  }
  teams: {
    home: {
      id: number
      name: string
      logo: string
      winner: boolean | null
    }
    away: {
      id: number
      name: string
      logo: string
      winner: boolean | null
    }
  }
  goals: {
    home: number | null
    away: number | null
  }
  score: {
    halftime: {
      home: number | null
      away: number | null
    }
    fulltime: {
      home: number | null
      away: number | null
    }
  }
}

export interface ApiFootballOdds {
  fixture: {
    id: number
  }
  bookmakers: {
    id: number
    name: string
    bets: {
      id: number
      name: string
      values: {
        value: string
        odd: string
      }[]
    }[]
  }[]
}

class ApiFootballClient {
  private headers = {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io'
  }

  async getUpcomingMatches(days: number = 7): Promise<ApiFootballMatch[]> {
    const matches: ApiFootballMatch[] = []
    
    // Get dates
    const from = new Date().toISOString().split('T')[0]
    const to = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    // Fetch for each league
    for (const [leagueName, leagueId] of Object.entries(NORDIC_LEAGUES)) {
      try {
        const response = await fetch(
          `${BASE_URL}/fixtures?league=${leagueId}&season=${new Date().getFullYear()}&from=${from}&to=${to}`,
          { headers: this.headers }
        )
        
        if (!response.ok) {
          console.error(`Failed to fetch ${leagueName}:`, response.status)
          continue
        }
        
        const data = await response.json()
        if (data.response) {
          matches.push(...data.response)
        }
      } catch (error) {
        console.error(`Error fetching ${leagueName}:`, error)
      }
    }
    
    return matches.sort((a, b) => a.fixture.timestamp - b.fixture.timestamp)
  }

  async getLiveMatches(): Promise<ApiFootballMatch[]> {
    const matches: ApiFootballMatch[] = []
    
    for (const [leagueName, leagueId] of Object.entries(NORDIC_LEAGUES)) {
      try {
        const response = await fetch(
          `${BASE_URL}/fixtures?league=${leagueId}&live=all`,
          { headers: this.headers }
        )
        
        if (!response.ok) {
          console.error(`Failed to fetch live ${leagueName}:`, response.status)
          continue
        }
        
        const data = await response.json()
        if (data.response) {
          matches.push(...data.response)
        }
      } catch (error) {
        console.error(`Error fetching live ${leagueName}:`, error)
      }
    }
    
    return matches
  }

  async getOdds(fixtureId: number): Promise<ApiFootballOdds | null> {
    try {
      const response = await fetch(
        `${BASE_URL}/odds?fixture=${fixtureId}`,
        { headers: this.headers }
      )
      
      if (!response.ok) {
        console.error(`Failed to fetch odds for fixture ${fixtureId}:`, response.status)
        return null
      }
      
      const data = await response.json()
      return data.response?.[0] || null
    } catch (error) {
      console.error(`Error fetching odds for fixture ${fixtureId}:`, error)
      return null
    }
  }

  async getFixtureEvents(fixtureId: number) {
    try {
      const response = await fetch(
        `${BASE_URL}/fixtures/events?fixture=${fixtureId}`,
        { headers: this.headers }
      )
      
      if (!response.ok) {
        console.error(`Failed to fetch events for fixture ${fixtureId}:`, response.status)
        return []
      }
      
      const data = await response.json()
      return data.response || []
    } catch (error) {
      console.error(`Error fetching events for fixture ${fixtureId}:`, error)
      return []
    }
  }

  async getStandings(leagueId: number, season: number = new Date().getFullYear()) {
    try {
      const response = await fetch(
        `${BASE_URL}/standings?league=${leagueId}&season=${season}`,
        { headers: this.headers }
      )
      
      if (!response.ok) {
        console.error(`Failed to fetch standings for league ${leagueId}:`, response.status)
        return null
      }
      
      const data = await response.json()
      return data.response?.[0]?.league?.standings?.[0] || null
    } catch (error) {
      console.error(`Error fetching standings for league ${leagueId}:`, error)
      return null
    }
  }

  // Convert API-Football data to our format
  convertToMatchFormat(apiMatch: ApiFootballMatch, odds?: ApiFootballOdds): any {
    // Find 1X2 odds
    let homeOdds = null, drawOdds = null, awayOdds = null
    
    if (odds?.bookmakers?.length > 0) {
      const matchWinnerBet = odds.bookmakers[0].bets.find(bet => bet.name === 'Match Winner')
      if (matchWinnerBet) {
        homeOdds = parseFloat(matchWinnerBet.values.find(v => v.value === 'Home')?.odd || '0') * 100
        drawOdds = parseFloat(matchWinnerBet.values.find(v => v.value === 'Draw')?.odd || '0') * 100
        awayOdds = parseFloat(matchWinnerBet.values.find(v => v.value === 'Away')?.odd || '0') * 100
      }
    }
    
    // Generate fallback odds if not available
    if (!homeOdds || !drawOdds || !awayOdds) {
      homeOdds = 180 + Math.random() * 200
      drawOdds = 300 + Math.random() * 100
      awayOdds = 200 + Math.random() * 250
    }
    
    // Check if it's a derby
    const isDerby = this.checkIfDerby(apiMatch.teams.home.name, apiMatch.teams.away.name)
    
    return {
      id: `api-${apiMatch.fixture.id}`,
      league_id: `league-${apiMatch.league.id}`,
      home_team_id: `team-${apiMatch.teams.home.id}`,
      away_team_id: `team-${apiMatch.teams.away.id}`,
      start_time: apiMatch.fixture.date,
      status: apiMatch.fixture.status.short === 'NS' ? 'scheduled' : 
              apiMatch.fixture.status.short === 'FT' ? 'finished' : 'live',
      is_derby: isDerby,
      league: {
        name: apiMatch.league.name,
        country: apiMatch.league.country,
        tier: this.getLeagueTier(apiMatch.league.id)
      },
      home_team: {
        name: apiMatch.teams.home.name,
        city: this.getCityFromTeam(apiMatch.teams.home.name)
      },
      away_team: {
        name: apiMatch.teams.away.name,
        city: this.getCityFromTeam(apiMatch.teams.away.name)
      },
      odds: [{
        id: `odds-${apiMatch.fixture.id}`,
        market: 'match_result',
        home_win: Math.round(homeOdds),
        draw: Math.round(drawOdds),
        away_win: Math.round(awayOdds),
        over_25: Math.round(190 + Math.random() * 30),
        under_25: Math.round(185 + Math.random() * 30),
        btts: Math.round(175 + Math.random() * 50),
        enhanced_home_win: Math.round(homeOdds * 1.5),
        enhanced_draw: Math.round(drawOdds * 1.5),
        enhanced_away_win: Math.round(awayOdds * 1.5)
      }],
      score: apiMatch.goals.home !== null ? {
        home: apiMatch.goals.home,
        away: apiMatch.goals.away
      } : null,
      elapsed: apiMatch.fixture.status.elapsed
    }
  }

  private checkIfDerby(homeTeam: string, awayTeam: string): boolean {
    const derbies = [
      // Finnish derbies
      ['HJK', 'HIFK'],
      ['FC Inter', 'TPS'],
      
      // Swedish derbies
      ['AIK', 'Djurgården'],
      ['AIK', 'Hammarby'],
      ['Djurgården', 'Hammarby'],
      ['IFK Göteborg', 'BK Häcken'],
      ['Malmö FF', 'Helsingborg']
    ]
    
    return derbies.some(derby => 
      (homeTeam.includes(derby[0]) && awayTeam.includes(derby[1])) ||
      (homeTeam.includes(derby[1]) && awayTeam.includes(derby[0]))
    )
  }

  private getLeagueTier(leagueId: number): number {
    if (leagueId === NORDIC_LEAGUES.VEIKKAUSLIIGA || leagueId === NORDIC_LEAGUES.ALLSVENSKAN) {
      return 1
    }
    return 2
  }

  private getCityFromTeam(teamName: string): string {
    const cityMap: Record<string, string> = {
      // Finnish teams
      'HJK': 'Helsinki',
      'HIFK': 'Helsinki',
      'FC Inter': 'Turku',
      'TPS': 'Turku',
      'KuPS': 'Kuopio',
      'FC Haka': 'Valkeakoski',
      'SJK': 'Seinäjoki',
      'FC Honka': 'Espoo',
      'FC Lahti': 'Lahti',
      'IFK Mariehamn': 'Mariehamn',
      
      // Swedish teams
      'AIK': 'Stockholm',
      'Djurgården': 'Stockholm',
      'Hammarby': 'Stockholm',
      'Malmö FF': 'Malmö',
      'IFK Göteborg': 'Göteborg',
      'BK Häcken': 'Göteborg',
      'IF Elfsborg': 'Borås',
      'Kalmar FF': 'Kalmar',
      'IFK Norrköping': 'Norrköping'
    }
    
    // Try to find city in map
    for (const [key, city] of Object.entries(cityMap)) {
      if (teamName.includes(key)) return city
    }
    
    // Extract city from team name if possible
    const parts = teamName.split(' ')
    return parts[parts.length - 1]
  }
}

export const apiFootball = new ApiFootballClient()