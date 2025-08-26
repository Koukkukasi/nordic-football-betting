// Unified Match Service - Bridge between Mock and Real Data
// This service determines whether to use mock data or real API data

import { Match } from '@/components/matches/ExpandedMatchList'
import { apiFootballClient } from './api-football/client'
import { mapApiFixturesToMatches, getApiLeagueIds, getUpcomingDateRange } from './api-football/mappers'
import { generateMockMatches } from './mock-data/matches'

export interface MatchServiceConfig {
  useRealData: boolean
  apiKey?: string
}

class MatchService {
  private config: MatchServiceConfig
  private mockData: Match[] = []
  
  constructor() {
    // Check if we have a valid API key
    const apiKey = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY
    this.config = {
      useRealData: !!(apiKey && apiKey !== 'your_api_key_here'),
      apiKey
    }
    
    // Generate mock data on initialization
    this.mockData = generateMockMatches()
  }
  
  // Get matches for selected leagues
  async getMatches(selectedLeagues: string[], filters?: {
    viewMode?: 'all' | 'live' | 'upcoming'
    sortBy?: 'time' | 'league' | 'odds'
  }): Promise<Match[]> {
    try {
      // If we don't have a valid API key, use mock data
      if (!this.config.useRealData) {
        return this.getMockMatches(selectedLeagues, filters)
      }
      
      // Try to fetch real data
      return await this.getRealMatches(selectedLeagues, filters)
    } catch (error) {
      console.error('Failed to fetch real matches, falling back to mock data:', error)
      // Fallback to mock data on error
      return this.getMockMatches(selectedLeagues, filters)
    }
  }
  
  // Get mock matches (filtered and sorted)
  private getMockMatches(selectedLeagues: string[], filters?: {
    viewMode?: 'all' | 'live' | 'upcoming'
    sortBy?: 'time' | 'league' | 'odds'
  }): Match[] {
    let matches = [...this.mockData]
    
    // Filter by leagues
    if (selectedLeagues.length > 0) {
      matches = matches.filter(m => selectedLeagues.includes(m.league))
    }
    
    // Filter by view mode
    if (filters?.viewMode === 'live') {
      matches = matches.filter(m => m.isLive)
    } else if (filters?.viewMode === 'upcoming') {
      matches = matches.filter(m => !m.isLive)
    }
    
    // Sort matches
    if (filters?.sortBy === 'time') {
      matches.sort((a, b) => a.date.getTime() - b.date.getTime())
    } else if (filters?.sortBy === 'league') {
      matches.sort((a, b) => a.league.localeCompare(b.league))
    } else if (filters?.sortBy === 'odds') {
      matches.sort((a, b) => Math.min(a.odds.home, a.odds.away) - Math.min(b.odds.home, b.odds.away))
    }
    
    return matches
  }
  
  // Get real matches from API
  private async getRealMatches(selectedLeagues: string[], filters?: {
    viewMode?: 'all' | 'live' | 'upcoming'
    sortBy?: 'time' | 'league' | 'odds'
  }): Promise<Match[]> {
    const apiLeagueIds = getApiLeagueIds(selectedLeagues)
    
    if (apiLeagueIds.length === 0) {
      return []
    }
    
    let fixtures: any[] = []
    
    // Fetch based on view mode
    if (filters?.viewMode === 'live') {
      // Get live fixtures
      fixtures = await apiFootballClient.getLiveFixtures()
      // Filter by our selected leagues
      fixtures = fixtures.filter(f => apiLeagueIds.includes(f.league.id))
    } else {
      // Get upcoming fixtures
      const dateRange = getUpcomingDateRange()
      fixtures = await apiFootballClient.getFixtures(apiLeagueIds, {
        from: dateRange.from,
        to: dateRange.to
      })
    }
    
    // Get odds for fixtures
    const fixtureIds = fixtures.map(f => f.fixture.id)
    const oddsMap = fixtureIds.length > 0 ? await apiFootballClient.getOdds(fixtureIds) : new Map()
    
    // Map to our Match format
    let matches = mapApiFixturesToMatches(fixtures, oddsMap)
    
    // Apply sorting
    if (filters?.sortBy === 'time') {
      matches.sort((a, b) => a.date.getTime() - b.date.getTime())
    } else if (filters?.sortBy === 'league') {
      matches.sort((a, b) => a.league.localeCompare(b.league))
    } else if (filters?.sortBy === 'odds') {
      matches.sort((a, b) => Math.min(a.odds.home, a.odds.away) - Math.min(b.odds.home, b.odds.away))
    }
    
    return matches
  }
  
  // Get live matches only
  async getLiveMatches(): Promise<Match[]> {
    if (!this.config.useRealData) {
      return this.mockData.filter(m => m.isLive)
    }
    
    try {
      const fixtures = await apiFootballClient.getLiveFixtures()
      return mapApiFixturesToMatches(fixtures)
    } catch (error) {
      console.error('Failed to fetch live matches:', error)
      return this.mockData.filter(m => m.isLive)
    }
  }
  
  // Get match by ID
  async getMatchById(id: string): Promise<Match | null> {
    // Check if it's a mock ID or API ID
    if (id.startsWith('api-')) {
      // Real API match - would need to fetch from API
      // For now, return from cached data if available
      const allMatches = await this.getMatches([])
      return allMatches.find(m => m.id === id) || null
    } else {
      // Mock match
      return this.mockData.find(m => m.id === id) || null
    }
  }
  
  // Get standings for a league
  async getStandings(leagueId: string): Promise<any> {
    if (!this.config.useRealData) {
      // Return mock standings
      return []
    }
    
    try {
      const apiLeagueId = getApiLeagueIds([leagueId])[0]
      if (!apiLeagueId) return []
      
      return await apiFootballClient.getStandings(apiLeagueId)
    } catch (error) {
      console.error('Failed to fetch standings:', error)
      return []
    }
  }
  
  // Get top scorers for a league
  async getTopScorers(leagueId: string): Promise<any> {
    if (!this.config.useRealData) {
      // Return mock top scorers
      return []
    }
    
    try {
      const apiLeagueId = getApiLeagueIds([leagueId])[0]
      if (!apiLeagueId) return []
      
      return await apiFootballClient.getTopScorers(apiLeagueId)
    } catch (error) {
      console.error('Failed to fetch top scorers:', error)
      return []
    }
  }
  
  // Check if using real data
  isUsingRealData(): boolean {
    return this.config.useRealData
  }
  
  // Force refresh of data
  async refresh(): Promise<void> {
    if (this.config.useRealData) {
      // Clear cache in API client if needed
      // For now, just regenerate mock data
    }
    this.mockData = generateMockMatches()
  }
}

// Export singleton instance
export const matchService = new MatchService()