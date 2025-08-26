// Match synchronization service
// Syncs API-Football data with our database for betting features

import { prisma } from '@/lib/prisma'
import { apiFootball, ApiFootballMatch, NORDIC_LEAGUES } from '@/lib/api-football'

export class MatchSyncService {
  // Sync matches from API-Football to database
  async syncMatches() {
    try {
      // Get upcoming matches from API
      const apiMatches = await apiFootball.getUpcomingMatches(14) // 2 weeks ahead
      
      for (const apiMatch of apiMatches) {
        await this.syncSingleMatch(apiMatch)
      }
      
      console.log(`Synced ${apiMatches.length} matches`)
      return { success: true, count: apiMatches.length }
    } catch (error) {
      console.error('Match sync error:', error)
      return { success: false, error }
    }
  }
  
  // Sync single match
  async syncSingleMatch(apiMatch: ApiFootballMatch) {
    try {
      // First, ensure league exists
      const league = await this.ensureLeague(apiMatch.league)
      
      // Ensure teams exist
      const homeTeam = await this.ensureTeam(apiMatch.teams.home, apiMatch.league.id)
      const awayTeam = await this.ensureTeam(apiMatch.teams.away, apiMatch.league.id)
      
      // Check if match exists
      const existingMatch = await prisma.match.findUnique({
        where: { externalId: `api-${apiMatch.fixture.id}` }
      })
      
      const matchStatus = this.getMatchStatus(apiMatch.fixture.status.short)
      const isDerby = this.checkIfDerby(homeTeam.name, awayTeam.name)
      
      if (existingMatch) {
        // Update existing match
        const updatedMatch = await prisma.match.update({
          where: { id: existingMatch.id },
          data: {
            status: matchStatus,
            homeScore: apiMatch.goals.home,
            awayScore: apiMatch.goals.away,
            minute: apiMatch.fixture.status.elapsed,
            isDerby
          }
        })
        
        // Update odds if available
        await this.syncOdds(updatedMatch.id, apiMatch.fixture.id)
        
        return updatedMatch
      } else {
        // Create new match
        const newMatch = await prisma.match.create({
          data: {
            externalId: `api-${apiMatch.fixture.id}`,
            leagueId: league.id,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            startTime: new Date(apiMatch.fixture.date),
            status: matchStatus,
            homeScore: apiMatch.goals.home,
            awayScore: apiMatch.goals.away,
            minute: apiMatch.fixture.status.elapsed,
            isDerby,
            isFeatured: isDerby || Math.random() > 0.7 // Feature derbies and some random matches
          }
        })
        
        // Create initial odds
        await this.syncOdds(newMatch.id, apiMatch.fixture.id)
        
        return newMatch
      }
    } catch (error) {
      console.error(`Error syncing match ${apiMatch.fixture.id}:`, error)
      throw error
    }
  }
  
  // Ensure league exists in database
  private async ensureLeague(apiLeague: any) {
    const leagueKey = `${apiLeague.name}-${apiLeague.country}`
    
    let league = await prisma.league.findFirst({
      where: {
        name: apiLeague.name,
        country: apiLeague.country
      }
    })
    
    if (!league) {
      league = await prisma.league.create({
        data: {
          name: apiLeague.name,
          country: apiLeague.country,
          tier: this.getLeagueTier(apiLeague.id),
          shortName: this.getLeagueShortName(apiLeague.name),
          logoUrl: apiLeague.logo
        }
      })
    }
    
    return league
  }
  
  // Ensure team exists in database
  private async ensureTeam(apiTeam: any, leagueId: number) {
    let team = await prisma.team.findFirst({
      where: {
        name: apiTeam.name
      }
    })
    
    if (!team) {
      const league = await this.ensureLeague({
        id: leagueId,
        name: this.getLeagueName(leagueId),
        country: this.getLeagueCountry(leagueId)
      })
      
      team = await prisma.team.create({
        data: {
          name: apiTeam.name,
          shortName: this.getTeamShortName(apiTeam.name),
          city: this.getCityFromTeam(apiTeam.name),
          country: this.getTeamCountry(apiTeam.name),
          logoUrl: apiTeam.logo,
          leagueId: league.id,
          isDerbyTeam: this.isDerbyTeam(apiTeam.name)
        }
      })
    }
    
    return team
  }
  
  // Sync odds from API to database
  private async syncOdds(matchId: string, fixtureId: number) {
    try {
      const apiOdds = await apiFootball.getOdds(fixtureId)
      
      if (!apiOdds || !apiOdds.bookmakers?.length) {
        // Generate default odds if not available
        return this.generateDefaultOdds(matchId)
      }
      
      // Find best odds from bookmakers
      const bookmaker = apiOdds.bookmakers[0] // Use first bookmaker
      const matchWinner = bookmaker.bets.find(bet => bet.name === 'Match Winner')
      const goalsOverUnder = bookmaker.bets.find(bet => bet.name === 'Goals Over/Under')
      const btts = bookmaker.bets.find(bet => bet.name === 'Both Teams Score')
      
      let homeWin = 250, draw = 330, awayWin = 280 // Default odds
      let over25 = 190, under25 = 185
      let bttsYes = 175, bttsNo = 195
      
      if (matchWinner) {
        const home = matchWinner.values.find(v => v.value === 'Home')
        const drawValue = matchWinner.values.find(v => v.value === 'Draw')
        const away = matchWinner.values.find(v => v.value === 'Away')
        
        if (home) homeWin = Math.round(parseFloat(home.odd) * 100)
        if (drawValue) draw = Math.round(parseFloat(drawValue.odd) * 100)
        if (away) awayWin = Math.round(parseFloat(away.odd) * 100)
      }
      
      if (goalsOverUnder) {
        const over = goalsOverUnder.values.find(v => v.value === 'Over 2.5')
        const under = goalsOverUnder.values.find(v => v.value === 'Under 2.5')
        
        if (over) over25 = Math.round(parseFloat(over.odd) * 100)
        if (under) under25 = Math.round(parseFloat(under.odd) * 100)
      }
      
      if (btts) {
        const yes = btts.values.find(v => v.value === 'Yes')
        const no = btts.values.find(v => v.value === 'No')
        
        if (yes) bttsYes = Math.round(parseFloat(yes.odd) * 100)
        if (no) bttsNo = Math.round(parseFloat(no.odd) * 100)
      }
      
      // Check if odds exist
      const existingOdds = await prisma.odds.findUnique({
        where: {
          matchId_market: {
            matchId,
            market: 'MATCH_RESULT'
          }
        }
      })
      
      const oddsData = {
        homeWin,
        draw,
        awayWin,
        over25,
        under25,
        bttsYes,
        bttsNo,
        // Enhanced odds for F2P features (50% boost)
        enhancedHomeWin: Math.round(homeWin * 1.5),
        enhancedDraw: Math.round(draw * 1.5),
        enhancedAwayWin: Math.round(awayWin * 1.5)
      }
      
      if (existingOdds) {
        return await prisma.odds.update({
          where: { id: existingOdds.id },
          data: oddsData
        })
      } else {
        return await prisma.odds.create({
          data: {
            matchId,
            market: 'MATCH_RESULT',
            ...oddsData
          }
        })
      }
    } catch (error) {
      console.error(`Error syncing odds for match ${matchId}:`, error)
      return this.generateDefaultOdds(matchId)
    }
  }
  
  // Generate default odds when API odds not available
  private async generateDefaultOdds(matchId: string) {
    const existingOdds = await prisma.odds.findUnique({
      where: {
        matchId_market: {
          matchId,
          market: 'MATCH_RESULT'
        }
      }
    })
    
    if (existingOdds) return existingOdds
    
    // Generate reasonable default odds
    const homeWin = 180 + Math.round(Math.random() * 120)
    const draw = 300 + Math.round(Math.random() * 60)
    const awayWin = 200 + Math.round(Math.random() * 150)
    
    return await prisma.odds.create({
      data: {
        matchId,
        market: 'MATCH_RESULT',
        homeWin,
        draw,
        awayWin,
        over25: 185 + Math.round(Math.random() * 30),
        under25: 190 + Math.round(Math.random() * 30),
        bttsYes: 175 + Math.round(Math.random() * 40),
        bttsNo: 195 + Math.round(Math.random() * 40),
        // Enhanced odds for F2P
        enhancedHomeWin: Math.round(homeWin * 1.5),
        enhancedDraw: Math.round(draw * 1.5),
        enhancedAwayWin: Math.round(awayWin * 1.5)
      }
    })
  }
  
  // Helper methods
  private getMatchStatus(apiStatus: string) {
    const statusMap: Record<string, any> = {
      'NS': 'SCHEDULED',
      'FT': 'FINISHED',
      'AET': 'FINISHED',
      'PEN': 'FINISHED',
      'PST': 'POSTPONED',
      'CANC': 'CANCELLED',
      'ABD': 'CANCELLED',
      'SUSP': 'POSTPONED'
    }
    
    // If not in map, it's probably live
    return statusMap[apiStatus] || 'LIVE'
  }
  
  private getLeagueTier(leagueId: number): number {
    if (leagueId === NORDIC_LEAGUES.VEIKKAUSLIIGA || leagueId === NORDIC_LEAGUES.ALLSVENSKAN) {
      return 1
    }
    return 2
  }
  
  private getLeagueName(leagueId: number): string {
    const names: Record<number, string> = {
      [NORDIC_LEAGUES.VEIKKAUSLIIGA]: 'Veikkausliiga',
      [NORDIC_LEAGUES.YKKONEN]: 'Ykkönen',
      [NORDIC_LEAGUES.ALLSVENSKAN]: 'Allsvenskan',
      [NORDIC_LEAGUES.SUPERETTAN]: 'Superettan'
    }
    return names[leagueId] || 'Unknown League'
  }
  
  private getLeagueCountry(leagueId: number): string {
    if (leagueId === NORDIC_LEAGUES.VEIKKAUSLIIGA || leagueId === NORDIC_LEAGUES.YKKONEN) {
      return 'Finland'
    }
    return 'Sweden'
  }
  
  private getLeagueShortName(name: string): string {
    const shortNames: Record<string, string> = {
      'Veikkausliiga': 'VL',
      'Ykkönen': 'Y1',
      'Allsvenskan': 'AS',
      'Superettan': 'SE'
    }
    return shortNames[name] || name.substring(0, 3).toUpperCase()
  }
  
  private getTeamShortName(name: string): string {
    // Extract 3-letter abbreviation
    const words = name.split(' ')
    if (words.length === 1) {
      return name.substring(0, 3).toUpperCase()
    }
    return words.map(w => w[0]).join('').substring(0, 3).toUpperCase()
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
      'AC Oulu': 'Oulu',
      'VPS': 'Vaasa',
      
      // Swedish teams
      'AIK': 'Stockholm',
      'Djurgården': 'Stockholm',
      'Hammarby': 'Stockholm',
      'Malmö FF': 'Malmö',
      'IFK Göteborg': 'Göteborg',
      'BK Häcken': 'Göteborg',
      'IF Elfsborg': 'Borås',
      'Kalmar FF': 'Kalmar',
      'IFK Norrköping': 'Norrköping',
      'Helsingborg': 'Helsingborg'
    }
    
    for (const [key, city] of Object.entries(cityMap)) {
      if (teamName.includes(key)) return city
    }
    
    return teamName.split(' ').pop() || 'Unknown'
  }
  
  private getTeamCountry(teamName: string): string {
    const finnishTeams = ['HJK', 'HIFK', 'FC Inter', 'TPS', 'KuPS', 'FC Haka', 'SJK', 'FC Honka', 'FC Lahti', 'IFK Mariehamn', 'AC Oulu', 'VPS']
    
    for (const team of finnishTeams) {
      if (teamName.includes(team)) return 'Finland'
    }
    
    return 'Sweden'
  }
  
  private checkIfDerby(homeTeam: string, awayTeam: string): boolean {
    const derbies = [
      // Finnish derbies
      ['HJK', 'HIFK'], // Helsinki derby
      ['FC Inter', 'TPS'], // Turku derby
      
      // Swedish derbies  
      ['AIK', 'Djurgården'], // Stockholm derbies
      ['AIK', 'Hammarby'],
      ['Djurgården', 'Hammarby'],
      ['IFK Göteborg', 'BK Häcken'], // Gothenburg derby
      ['Malmö FF', 'Helsingborg'] // Skåne derby
    ]
    
    return derbies.some(derby => 
      (homeTeam.includes(derby[0]) && awayTeam.includes(derby[1])) ||
      (homeTeam.includes(derby[1]) && awayTeam.includes(derby[0]))
    )
  }
  
  private isDerbyTeam(teamName: string): boolean {
    const derbyTeams = ['HJK', 'HIFK', 'FC Inter', 'TPS', 'AIK', 'Djurgården', 'Hammarby', 'IFK Göteborg', 'BK Häcken', 'Malmö FF', 'Helsingborg']
    
    return derbyTeams.some(team => teamName.includes(team))
  }
}

export const matchSync = new MatchSyncService()