// API-Football.com Client Service
// Handles all interactions with the real football data API

import { Match } from '@/components/matches/ExpandedMatchList'

interface ApiConfig {
  baseUrl: string
  apiKey: string
  version: string
}

// API Response Types
interface ApiTeam {
  id: number
  name: string
  logo: string
}

interface ApiFixture {
  id: number
  referee: string | null
  timezone: string
  date: string
  timestamp: number
  periods: {
    first: number | null
    second: number | null
  }
  venue: {
    id: number
    name: string
    city: string
  }
  status: {
    long: string
    short: string
    elapsed: number | null
  }
}

interface ApiGoals {
  home: number | null
  away: number | null
}

interface ApiOdds {
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string
  }
  fixture: {
    id: number
    date: string
    timestamp: number
  }
  bookmakers: Array<{
    id: number
    name: string
    bets: Array<{
      id: number
      name: string
      values: Array<{
        value: string
        odd: string
      }>
    }>
  }>
}

interface ApiFixtureResponse {
  fixture: ApiFixture
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string | null
    season: number
    round: string
  }
  teams: {
    home: ApiTeam
    away: ApiTeam
  }
  goals: ApiGoals
  score: {
    halftime: ApiGoals
    fulltime: ApiGoals
    extratime: ApiGoals
    penalty: ApiGoals
  }
}

export class ApiFootballClient {
  private config: ApiConfig
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTimeout = 60000 // 1 minute cache

  constructor() {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_API_FOOTBALL_URL || 'https://v3.football.api-sports.io',
      apiKey: process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || '',
      version: 'v3'
    }
  }

  private async fetchWithCache(endpoint: string, params?: Record<string, string>): Promise<any> {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${this.config.baseUrl}/${endpoint}${queryString}`, {
      headers: {
        'x-rapidapi-key': this.config.apiKey,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Cache the response
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    })

    return data
  }

  // Get fixtures for specific leagues
  async getFixtures(leagueIds: number[], options?: {
    date?: string
    live?: boolean
    from?: string
    to?: string
  }): Promise<ApiFixtureResponse[]> {
    const fixtures: ApiFixtureResponse[] = []
    
    for (const leagueId of leagueIds) {
      const params: Record<string, string> = {
        league: leagueId.toString(),
        season: '2025' // API-Football is using 2025 season
      }

      if (options?.date) params.date = options.date
      if (options?.live) params.live = 'all'
      if (options?.from) params.from = options.from
      if (options?.to) params.to = options.to

      try {
        const response = await this.fetchWithCache('fixtures', params)
        if (response.response) {
          fixtures.push(...response.response)
        }
      } catch (error) {
        console.error(`Failed to fetch fixtures for league ${leagueId}:`, error)
      }
    }

    return fixtures
  }

  // Get odds for specific fixtures
  async getOdds(fixtureIds: number[]): Promise<Map<number, ApiOdds>> {
    const oddsMap = new Map<number, ApiOdds>()
    
    // API-Football limits requests, so batch carefully
    for (const fixtureId of fixtureIds) {
      try {
        const response = await this.fetchWithCache('odds', {
          fixture: fixtureId.toString()
        })
        
        if (response.response && response.response.length > 0) {
          oddsMap.set(fixtureId, response.response[0])
        }
      } catch (error) {
        console.error(`Failed to fetch odds for fixture ${fixtureId}:`, error)
      }
    }

    return oddsMap
  }

  // Get live fixtures
  async getLiveFixtures(): Promise<ApiFixtureResponse[]> {
    try {
      const response = await this.fetchWithCache('fixtures', {
        live: 'all'
      })
      return response.response || []
    } catch (error) {
      console.error('Failed to fetch live fixtures:', error)
      return []
    }
  }

  // Get team statistics
  async getTeamStats(teamId: number, season: number): Promise<any> {
    try {
      const response = await this.fetchWithCache('teams/statistics', {
        team: teamId.toString(),
        season: season.toString()
      })
      return response.response
    } catch (error) {
      console.error(`Failed to fetch team stats for ${teamId}:`, error)
      return null
    }
  }

  // Get league standings
  async getStandings(leagueId: number, season?: number): Promise<any> {
    try {
      const response = await this.fetchWithCache('standings', {
        league: leagueId.toString(),
        season: (season || 2025).toString() // Default to 2025 season
      })
      return response.response?.[0]?.league?.standings || []
    } catch (error) {
      console.error(`Failed to fetch standings for league ${leagueId}:`, error)
      return []
    }
  }

  // Get top scorers
  async getTopScorers(leagueId: number, season?: number): Promise<any> {
    try {
      const response = await this.fetchWithCache('players/topscorers', {
        league: leagueId.toString(),
        season: (season || 2025).toString() // Default to 2025 season
      })
      return response.response || []
    } catch (error) {
      console.error(`Failed to fetch top scorers for league ${leagueId}:`, error)
      return []
    }
  }
}

// Singleton instance
export const apiFootballClient = new ApiFootballClient()