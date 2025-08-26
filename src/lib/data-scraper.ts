import { createClient } from '@/lib/supabase'
import * as cheerio from 'cheerio'

interface ScrapedMatch {
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  minute: number | null
  status: 'scheduled' | 'live' | 'finished'
  kickoffTime: Date
  league: string
}

interface ScrapedOdds {
  homeWin: number
  draw: number
  awayWin: number
  over25: number
  under25: number
}

export class NordicDataScraper {
  private supabase = createClient()
  private updateInterval: NodeJS.Timeout | null = null

  // Scraping configuration with multiple fallback sources
  private sources = {
    finnish: [
      {
        name: 'Flashscore Finland',
        url: 'https://www.flashscore.fi/jalkapallo/suomi/veikkausliiga/',
        selector: {
          matches: '.event__match',
          homeTeam: '.event__participant--home',
          awayTeam: '.event__participant--away',
          score: '.event__score',
          time: '.event__time'
        }
      },
      {
        name: 'Livescore',
        url: 'https://www.livescore.com/en/football/finland/veikkausliiga/',
        selector: {
          matches: '[data-type="match"]',
          homeTeam: '.home-team-name',
          awayTeam: '.away-team-name',
          score: '.score',
          time: '.match-time'
        }
      }
    ],
    swedish: [
      {
        name: 'Flashscore Sweden',
        url: 'https://www.flashscore.se/fotboll/sverige/allsvenskan/',
        selector: {
          matches: '.event__match',
          homeTeam: '.event__participant--home',
          awayTeam: '.event__participant--away',
          score: '.event__score',
          time: '.event__time'
        }
      }
    ]
  }

  // Main scraping orchestrator
  async startScraping(intervalMinutes: number = 2): Promise<void> {
    console.log('🕷️ Starting Nordic football data scraping...')
    
    // Initial scrape
    await this.scrapeAllSources()
    
    // Set up periodic scraping (every 2 minutes by default)
    this.updateInterval = setInterval(async () => {
      await this.scrapeAllSources()
    }, intervalMinutes * 60 * 1000)
  }

  async stopScraping(): Promise<void> {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
      console.log('🛑 Stopped data scraping')
    }
  }

  async scrapeAllSources(): Promise<void> {
    console.log(`🔄 Scraping Nordic matches at ${new Date().toLocaleTimeString()}`)
    
    try {
      // Scrape Finnish matches
      for (const source of this.sources.finnish) {
        await this.scrapeSource(source, 'Finland')
      }
      
      // Scrape Swedish matches
      for (const source of this.sources.swedish) {
        await this.scrapeSource(source, 'Sweden')
      }
      
      // Clean up old/stale data
      await this.cleanStaleData()
      
      console.log('✅ Scraping cycle completed')
    } catch (error) {
      console.error('❌ Scraping error:', error)
    }
  }

  private async scrapeSource(source: any, country: string): Promise<void> {
    try {
      console.log(`📡 Scraping ${source.name}...`)
      
      // Fetch HTML content
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        console.error(`Failed to fetch ${source.name}: ${response.status}`)
        return
      }
      
      const html = await response.text()
      const $ = cheerio.load(html)
      
      // Parse matches
      const matches: ScrapedMatch[] = []
      
      $(source.selector.matches).each((index, element) => {
        const homeTeam = $(element).find(source.selector.homeTeam).text().trim()
        const awayTeam = $(element).find(source.selector.awayTeam).text().trim()
        const scoreText = $(element).find(source.selector.score).text().trim()
        const timeText = $(element).find(source.selector.time).text().trim()
        
        if (!homeTeam || !awayTeam) return
        
        // Parse score
        let homeScore = null
        let awayScore = null
        let status: 'scheduled' | 'live' | 'finished' = 'scheduled'
        let minute = null
        
        if (scoreText && scoreText.includes('-')) {
          const [home, away] = scoreText.split('-').map(s => parseInt(s.trim()))
          if (!isNaN(home) && !isNaN(away)) {
            homeScore = home
            awayScore = away
            status = 'live'
          }
        }
        
        // Parse time/status
        if (timeText) {
          if (timeText.includes("'")) {
            // Live match with minute
            minute = parseInt(timeText.replace("'", ""))
            status = 'live'
          } else if (timeText.toLowerCase().includes('ft') || timeText.toLowerCase().includes('full')) {
            status = 'finished'
            minute = 90
          } else if (timeText.includes(':')) {
            // Scheduled match with kickoff time
            status = 'scheduled'
          }
        }
        
        // Create match object
        const match: ScrapedMatch = {
          homeTeam: this.normalizeTeamName(homeTeam),
          awayTeam: this.normalizeTeamName(awayTeam),
          homeScore,
          awayScore,
          minute,
          status,
          kickoffTime: this.parseKickoffTime(timeText),
          league: this.detectLeague(homeTeam, country)
        }
        
        matches.push(match)
      })
      
      // Update database with scraped matches
      await this.updateDatabase(matches, country)
      
      console.log(`✅ Scraped ${matches.length} matches from ${source.name}`)
    } catch (error) {
      console.error(`❌ Error scraping ${source.name}:`, error)
    }
  }

  private normalizeTeamName(teamName: string): string {
    // Normalize team names to match our database
    const teamMappings: Record<string, string> = {
      // Finnish teams
      'HJK': 'HJK Helsinki',
      'KuPS': 'KuPS Kuopio',
      'Inter': 'FC Inter Turku',
      'Inter Turku': 'FC Inter Turku',
      'Mariehamn': 'IFK Mariehamn',
      'HIFK': 'HIFK Helsinki',
      'SJK': 'SJK Seinäjoki',
      'Haka': 'FC Haka',
      'Honka': 'FC Honka',
      'Ilves': 'Ilves Tampere',
      'VPS': 'VPS Vaasa',
      'Oulu': 'AC Oulu',
      'Lahti': 'FC Lahti',
      
      // Swedish teams
      'Malmö': 'Malmö FF',
      'AIK': 'AIK Stockholm',
      'Djurgården': 'Djurgården Stockholm',
      'Hammarby': 'Hammarby Stockholm',
      'IFK Göteborg': 'IFK Göteborg',
      'Häcken': 'BK Häcken',
      'Elfsborg': 'IF Elfsborg',
      'Norrköping': 'IFK Norrköping',
      'Kalmar': 'Kalmar FF',
      'Mjällby': 'Mjällby AIF',
      'Sirius': 'Sirius IK',
      'Västerås': 'Västerås SK',
      'GAIS': 'GAIS Göteborg',
      'Värnamo': 'IFK Värnamo',
      'Brommapojkarna': 'Brommapojkarna',
      'Halmstad': 'Halmstads BK'
    }
    
    // Check if we have a mapping
    for (const [key, value] of Object.entries(teamMappings)) {
      if (teamName.includes(key)) {
        return value
      }
    }
    
    return teamName
  }

  private detectLeague(teamName: string, country: string): string {
    // Simple league detection based on team and country
    if (country === 'Finland') {
      // Check if team is in top tier Finnish teams
      const topTierTeams = ['HJK', 'KuPS', 'Inter', 'Mariehamn', 'HIFK', 'SJK', 'Haka', 'Honka', 'Ilves', 'VPS', 'Oulu', 'Lahti']
      if (topTierTeams.some(team => teamName.includes(team))) {
        return 'Veikkausliiga'
      }
      return 'Ykkösliiga'
    } else if (country === 'Sweden') {
      // Swedish top tier teams
      const topTierTeams = ['Malmö', 'AIK', 'Djurgården', 'Hammarby', 'Göteborg', 'Häcken', 'Elfsborg', 'Norrköping']
      if (topTierTeams.some(team => teamName.includes(team))) {
        return 'Allsvenskan'
      }
      return 'Superettan'
    }
    
    return 'Unknown'
  }

  private parseKickoffTime(timeText: string): Date {
    const now = new Date()
    
    // Try to parse time format (e.g., "19:00")
    if (timeText && timeText.includes(':')) {
      const [hours, minutes] = timeText.split(':').map(n => parseInt(n))
      const kickoff = new Date(now)
      kickoff.setHours(hours, minutes, 0, 0)
      
      // If time is in the past today, assume it's tomorrow
      if (kickoff < now) {
        kickoff.setDate(kickoff.getDate() + 1)
      }
      
      return kickoff
    }
    
    // Default to 2 hours from now
    return new Date(now.getTime() + 2 * 60 * 60 * 1000)
  }

  private async updateDatabase(matches: ScrapedMatch[], country: string): Promise<void> {
    for (const match of matches) {
      try {
        // Find teams in database
        const { data: homeTeam } = await this.supabase
          .from('teams')
          .select('id, league_id')
          .eq('name', match.homeTeam)
          .single()
        
        const { data: awayTeam } = await this.supabase
          .from('teams')
          .select('id')
          .eq('name', match.awayTeam)
          .single()
        
        if (!homeTeam || !awayTeam) {
          console.warn(`Teams not found: ${match.homeTeam} vs ${match.awayTeam}`)
          continue
        }
        
        // Check if match already exists
        const { data: existingMatch } = await this.supabase
          .from('matches')
          .select('id, status')
          .eq('home_team_id', homeTeam.id)
          .eq('away_team_id', awayTeam.id)
          .gte('start_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .single()
        
        if (existingMatch) {
          // Update existing match
          if (match.status === 'live' || match.status === 'finished') {
            await this.supabase
              .from('matches')
              .update({
                status: match.status,
                home_score: match.homeScore,
                away_score: match.awayScore,
                minute: match.minute,
                is_live: match.status === 'live'
              })
              .eq('id', existingMatch.id)
            
            // If match just finished, trigger bet settlement
            if (existingMatch.status === 'live' && match.status === 'finished') {
              console.log(`🏁 Match finished: ${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam}`)
              // Bet settlement will be handled by the live match engine
            }
          }
        } else {
          // Create new match
          const { data: newMatch } = await this.supabase
            .from('matches')
            .insert({
              league_id: homeTeam.league_id,
              home_team_id: homeTeam.id,
              away_team_id: awayTeam.id,
              start_time: match.kickoffTime.toISOString(),
              status: match.status,
              home_score: match.homeScore,
              away_score: match.awayScore,
              minute: match.minute,
              is_live: match.status === 'live'
            })
            .select()
            .single()
          
          if (newMatch) {
            // Generate initial odds for new match
            await this.generateOddsForMatch(newMatch.id)
          }
        }
      } catch (error) {
        console.error(`Error updating match ${match.homeTeam} vs ${match.awayTeam}:`, error)
      }
    }
  }

  private async generateOddsForMatch(matchId: string): Promise<void> {
    // Scrape odds from betting sites or generate reasonable defaults
    const defaultOdds = {
      match_id: matchId,
      market: 'match_result',
      home_win: 250, // 2.50
      draw: 320, // 3.20
      away_win: 280, // 2.80
      over_25: 185, // 1.85
      under_25: 195, // 1.95
      btts: 175, // 1.75
      // Enhanced odds for free-to-play
      enhanced_home_win: 300, // 3.00
      enhanced_draw: 385, // 3.85
      enhanced_away_win: 335 // 3.35
    }
    
    await this.supabase
      .from('odds')
      .insert(defaultOdds)
  }

  private async cleanStaleData(): Promise<void> {
    // Mark matches as finished if they should be done
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    
    await this.supabase
      .from('matches')
      .update({
        status: 'finished',
        is_live: false,
        minute: 90
      })
      .eq('status', 'live')
      .lt('start_time', twoHoursAgo.toISOString())
  }

  // Scrape odds from betting sites
  async scrapeOdds(matchId: string, homeTeam: string, awayTeam: string): Promise<ScrapedOdds | null> {
    try {
      // Try to scrape from odds comparison sites
      const oddsUrl = `https://www.oddsportal.com/search/${encodeURIComponent(homeTeam + ' ' + awayTeam)}/`
      
      // For MVP, return reasonable default odds
      // In production, implement actual odds scraping
      return {
        homeWin: 2.10,
        draw: 3.40,
        awayWin: 3.50,
        over25: 1.75,
        under25: 2.10
      }
    } catch (error) {
      console.error('Error scraping odds:', error)
      return null
    }
  }
}

export const dataScraper = new NordicDataScraper()