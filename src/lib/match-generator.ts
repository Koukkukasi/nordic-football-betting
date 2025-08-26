import { createClient } from '@/lib/supabase'

interface Team {
  id: string
  name: string
  city: string
  country: string
  league_id: string
  is_derby_team: boolean
  is_popular: boolean
}

interface League {
  id: string
  name: string
  country: string
  tier: number
  teams: number
  season_start: string
  season_end: string
}

interface MatchFixture {
  league_id: string
  home_team_id: string
  away_team_id: string
  start_time: string
  round: number
  is_derby: boolean
}

export class MatchGenerator {
  private supabase = createClient()

  // Generate complete season fixtures for Nordic leagues
  async generateSeasonFixtures(): Promise<boolean> {
    try {
      console.log('🏈 Generating 2025 Nordic Football Season Fixtures...')

      // Get all leagues and teams
      const { data: leagues, error: leagueError } = await this.supabase
        .from('leagues')
        .select('*')

      if (leagueError || !leagues) {
        console.error('Error fetching leagues:', leagueError)
        return false
      }

      // Generate fixtures for each league
      for (const league of leagues) {
        await this.generateLeagueFixtures(league)
      }

      console.log('✅ Nordic season fixtures generated successfully!')
      return true
    } catch (error) {
      console.error('Error generating fixtures:', error)
      return false
    }
  }

  private async generateLeagueFixtures(league: League): Promise<void> {
    console.log(`📅 Generating fixtures for ${league.name}...`)

    // Get teams for this league
    const { data: teams, error: teamError } = await this.supabase
      .from('teams')
      .select('*')
      .eq('league_id', league.id)

    if (teamError || !teams) {
      console.error(`Error fetching teams for ${league.name}:`, teamError)
      return
    }

    // Generate round-robin fixtures
    const fixtures = this.generateRoundRobinFixtures(teams, league)
    
    // Insert fixtures into database
    const { error: insertError } = await this.supabase
      .from('matches')
      .insert(fixtures)

    if (insertError) {
      console.error(`Error inserting fixtures for ${league.name}:`, insertError)
    } else {
      console.log(`✅ Generated ${fixtures.length} matches for ${league.name}`)
    }
  }

  private generateRoundRobinFixtures(teams: Team[], league: League): MatchFixture[] {
    const fixtures: MatchFixture[] = []
    const seasonStart = new Date(league.season_start)
    const seasonEnd = new Date(league.season_end)
    
    // Calculate total rounds (each team plays each other twice - home and away)
    const totalRounds = (teams.length - 1) * 2
    const matchesPerRound = teams.length / 2
    const totalMatches = totalRounds * matchesPerRound
    
    // Calculate time between matches
    const seasonDuration = seasonEnd.getTime() - seasonStart.getTime()
    const timeBetweenRounds = seasonDuration / totalRounds

    let currentRound = 1
    let currentDate = new Date(seasonStart)

    // Generate first half of season (each team plays each other once)
    for (let round = 0; round < teams.length - 1; round++) {
      const roundMatches = this.generateRoundMatches(teams, round, league.id, currentDate, currentRound)
      fixtures.push(...roundMatches)
      
      currentDate = new Date(currentDate.getTime() + timeBetweenRounds)
      currentRound++
    }

    // Generate second half of season (return fixtures)
    for (let round = 0; round < teams.length - 1; round++) {
      const roundMatches = this.generateRoundMatches(teams, round, league.id, currentDate, currentRound, true)
      fixtures.push(...roundMatches)
      
      currentDate = new Date(currentDate.getTime() + timeBetweenRounds)
      currentRound++
    }

    return fixtures
  }

  private generateRoundMatches(
    teams: Team[], 
    roundIndex: number, 
    leagueId: string, 
    matchDate: Date, 
    round: number,
    isReturn: boolean = false
  ): MatchFixture[] {
    const matches: MatchFixture[] = []
    const teamCount = teams.length
    
    // Round-robin algorithm
    for (let i = 0; i < teamCount / 2; i++) {
      let homeIndex, awayIndex
      
      if (i === 0) {
        homeIndex = 0
        awayIndex = roundIndex + 1
      } else {
        homeIndex = (roundIndex + i) % (teamCount - 1) + 1
        awayIndex = (roundIndex - i + teamCount - 1) % (teamCount - 1) + 1
      }
      
      // Ensure valid indices
      if (homeIndex >= teamCount) homeIndex = homeIndex % teamCount
      if (awayIndex >= teamCount) awayIndex = awayIndex % teamCount
      
      const homeTeam = teams[homeIndex]
      const awayTeam = teams[awayIndex]
      
      // Skip if same team
      if (homeTeam.id === awayTeam.id) continue
      
      // For return fixtures, swap home and away
      const finalHomeTeam = isReturn ? awayTeam : homeTeam
      const finalAwayTeam = isReturn ? homeTeam : awayTeam
      
      // Calculate specific match time (spread throughout the week)
      const matchTime = new Date(matchDate)
      matchTime.setHours(
        this.getMatchHour(i), // Stagger kickoff times
        0, 0, 0
      )
      
      // Add some random days within the round
      matchTime.setDate(matchTime.getDate() + (i % 3))
      
      matches.push({
        league_id: leagueId,
        home_team_id: finalHomeTeam.id,
        away_team_id: finalAwayTeam.id,
        start_time: matchTime.toISOString(),
        round,
        is_derby: this.isDerbyMatch(finalHomeTeam, finalAwayTeam)
      })
    }
    
    return matches
  }

  private getMatchHour(matchIndex: number): number {
    // Realistic Nordic football kickoff times
    const kickoffTimes = [14, 16, 18, 19] // 2pm, 4pm, 6pm, 7pm
    return kickoffTimes[matchIndex % kickoffTimes.length]
  }

  private isDerbyMatch(homeTeam: Team, awayTeam: Team): boolean {
    // Helsinki Derby (Finland)
    if (homeTeam.city === 'Helsinki' && awayTeam.city === 'Helsinki') {
      return true
    }
    
    // Stockholm Derby (Sweden) 
    if (homeTeam.city === 'Stockholm' && awayTeam.city === 'Stockholm') {
      return true
    }
    
    // Göteborg Derby (Sweden)
    if (homeTeam.city === 'Göteborg' && awayTeam.city === 'Göteborg') {
      return true
    }
    
    // Cross-city rivalries
    const rivalries = [
      ['Helsinki', 'Espoo'], // HJK vs Honka
      ['Malmö', 'Stockholm'], // Malmö FF vs Stockholm clubs
      ['Turku', 'Helsinki'], // FC Inter vs HJK
    ]
    
    return rivalries.some(([city1, city2]) => 
      (homeTeam.city === city1 && awayTeam.city === city2) ||
      (homeTeam.city === city2 && awayTeam.city === city1)
    )
  }

  // Generate realistic odds for all matches
  async generateMatchOdds(): Promise<boolean> {
    try {
      console.log('💰 Generating realistic odds for Nordic matches...')

      const { data: matches, error: matchError } = await this.supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!home_team_id(*),
          away_team:teams!away_team_id(*)
        `)
        .is('home_score', null) // Only upcoming matches

      if (matchError || !matches) {
        console.error('Error fetching matches:', matchError)
        return false
      }

      for (const match of matches) {
        await this.generateOddsForMatch(match)
      }

      console.log('✅ Odds generated for all Nordic matches!')
      return true
    } catch (error) {
      console.error('Error generating odds:', error)
      return false
    }
  }

  private async generateOddsForMatch(match: any): Promise<void> {
    // Calculate team strength based on various factors
    const homeStrength = this.calculateTeamStrength(match.home_team, true)
    const awayStrength = this.calculateTeamStrength(match.away_team, false)
    
    // Generate realistic odds based on team strengths
    const homeWinProb = homeStrength / (homeStrength + awayStrength) * 0.7 + 0.15 // Home advantage
    const awayWinProb = awayStrength / (homeStrength + awayStrength) * 0.7 + 0.15
    const drawProb = 1 - homeWinProb - awayWinProb + 0.1 // Draws are common in football
    
    // Normalize probabilities
    const total = homeWinProb + drawProb + awayWinProb
    const normHomeProb = homeWinProb / total
    const normDrawProb = drawProb / total
    const normAwayProb = awayWinProb / total
    
    // Convert to odds (with bookmaker margin)
    const margin = 1.08 // 8% bookmaker margin
    const homeOdds = Math.round((margin / normHomeProb) * 100)
    const drawOdds = Math.round((margin / normDrawProb) * 100)
    const awayOdds = Math.round((margin / normAwayProb) * 100)
    
    // Generate other market odds
    const over25Odds = Math.round((150 + Math.random() * 100)) // 1.50-2.50
    const under25Odds = Math.round((150 + Math.random() * 100))
    const bttsOdds = Math.round((180 + Math.random() * 80)) // 1.80-2.60
    
    // Generate enhanced odds for free-to-play
    const enhancedHomeOdds = this.enhanceOdds(homeOdds)
    const enhancedDrawOdds = this.enhanceOdds(drawOdds)
    const enhancedAwayOdds = this.enhanceOdds(awayOdds)
    
    // Insert match result odds
    await this.supabase
      .from('odds')
      .insert({
        match_id: match.id,
        market: 'match_result',
        home_win: homeOdds,
        draw: drawOdds,
        away_win: awayOdds,
        enhanced_home_win: enhancedHomeOdds,
        enhanced_draw: enhancedDrawOdds,
        enhanced_away_win: enhancedAwayOdds
      })
    
    // Insert over/under odds
    await this.supabase
      .from('odds')
      .insert({
        match_id: match.id,
        market: 'over_under',
        over_25: over25Odds,
        under_25: under25Odds,
        btts: bttsOdds
      })
    
    // Insert live betting odds (for when match goes live)
    await this.supabase
      .from('odds')
      .insert({
        match_id: match.id,
        market: 'live_next_goal',
        next_goal: Math.round(250 + Math.random() * 100), // 2.50-3.50
        next_corner: Math.round(400 + Math.random() * 200), // 4.00-6.00
        next_card: Math.round(300 + Math.random() * 150) // 3.00-4.50
      })
  }

  private calculateTeamStrength(team: any, isHome: boolean): number {
    let strength = 50 // Base strength
    
    // League tier affects strength
    if (team.league?.tier === 1) strength += 20
    else if (team.league?.tier === 2) strength += 10
    
    // Popular teams are stronger
    if (team.is_popular) strength += 15
    
    // Home advantage
    if (isHome) strength += 10
    
    // Add some randomness for variety
    strength += Math.random() * 20 - 10
    
    return Math.max(strength, 20) // Minimum strength
  }

  private enhanceOdds(originalOdds: number): number {
    // Enhanced odds for free-to-play: 20-60% boost
    const boost = 1.2 + (Math.random() * 0.4)
    return Math.round(originalOdds * boost)
  }

  // Simulate some matches going live
  async simulateLiveMatches(): Promise<boolean> {
    try {
      console.log('⚽ Simulating live matches...')

      // Get upcoming matches in the next 24 hours
      const now = new Date()
      const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      const { data: upcomingMatches, error } = await this.supabase
        .from('matches')
        .select('*')
        .gte('start_time', now.toISOString())
        .lte('start_time', next24Hours.toISOString())
        .limit(5) // Simulate up to 5 live matches

      if (error || !upcomingMatches) {
        console.error('Error fetching upcoming matches:', error)
        return false
      }

      // Make some matches live
      for (const match of upcomingMatches.slice(0, 3)) {
        await this.supabase
          .from('matches')
          .update({
            status: 'live',
            is_live: true,
            minute: Math.floor(Math.random() * 90) + 1,
            home_score: Math.floor(Math.random() * 3),
            away_score: Math.floor(Math.random() * 3)
          })
          .eq('id', match.id)
      }

      console.log('✅ Live matches simulation complete!')
      return true
    } catch (error) {
      console.error('Error simulating live matches:', error)
      return false
    }
  }

  // Main initialization function
  async initializeNordicContent(): Promise<boolean> {
    console.log('🚀 PHASE 3: Nordic Content Integration Starting...')
    
    try {
      // Step 1: Generate season fixtures
      const fixturesSuccess = await this.generateSeasonFixtures()
      if (!fixturesSuccess) return false

      // Step 2: Generate odds for all matches
      const oddsSuccess = await this.generateMatchOdds()
      if (!oddsSuccess) return false

      // Step 3: Simulate some live matches
      const liveSuccess = await this.simulateLiveMatches()
      if (!liveSuccess) return false

      console.log('🎉 PHASE 3 COMPLETE: Nordic content fully integrated!')
      return true
    } catch (error) {
      console.error('Phase 3 initialization failed:', error)
      return false
    }
  }
}

export const matchGenerator = new MatchGenerator()