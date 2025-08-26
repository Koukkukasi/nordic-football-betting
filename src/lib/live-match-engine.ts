import { PrismaClient } from '@prisma/client'
import { betSettlement } from '@/lib/bet-settlement'
import { apiFootball } from '@/lib/api-football'

const prisma = new PrismaClient()

interface LiveMatch {
  id: string
  externalId: string | null
  leagueId: string
  homeTeamId: string
  awayTeamId: string
  startTime: Date
  status: string
  homeScore: number | null
  awayScore: number | null
  minute: number | null
  isDerby: boolean
  homeTeam: {
    name: string
    city: string
    isDerbyTeam: boolean
  }
  awayTeam: {
    name: string
    city: string
    isDerbyTeam: boolean
  }
}

interface MatchEvent {
  minute: number
  type: 'goal' | 'corner' | 'card' | 'substitution'
  team: 'home' | 'away'
  player?: string
  description: string
}

export class LiveMatchEngine {
  private activeSimulations = new Map<string, NodeJS.Timeout>()
  private apiSyncInterval: NodeJS.Timeout | null = null
  private cashOutUpdateInterval: NodeJS.Timeout | null = null

  // Start API-integrated live match tracking
  async startLiveMatchTracking(): Promise<void> {
    console.log('🚀 Starting live match tracking with API-Football integration')
    
    // Sync with API-Football every 30 seconds
    this.apiSyncInterval = setInterval(() => {
      this.syncWithApiFootball()
    }, 30000)
    
    // Update cash-out values every 60 seconds
    this.cashOutUpdateInterval = setInterval(() => {
      this.updateAllCashOutValues()
    }, 60000)
    
    // Initial sync
    await this.syncWithApiFootball()
  }

  // Sync with API-Football for real live data
  async syncWithApiFootball(): Promise<void> {
    try {
      console.log('🔄 Syncing with API-Football...')
      
      // Get live matches from API
      const apiLiveMatches = await apiFootball.getLiveMatches()
      
      if (apiLiveMatches.length === 0) {
        console.log('📭 No live matches found')
        return
      }
      
      console.log(`📡 Found ${apiLiveMatches.length} live matches`)
      
      for (const apiMatch of apiLiveMatches) {
        await this.processApiMatch(apiMatch)
      }
      
      // Update live odds for all live matches
      await this.updateAllLiveOdds()
      
    } catch (error) {
      console.error('❌ Error syncing with API-Football:', error)
    }
  }

  // Process individual API match data
  private async processApiMatch(apiMatch: any): Promise<void> {
    try {
      const externalId = apiMatch.fixture.id.toString()
      
      // Find or create match in our database
      let match = await prisma.match.findUnique({
        where: { externalId },
        include: { homeTeam: true, awayTeam: true }
      })
      
      if (!match) {
        // Create new match if not exists
        match = await this.createMatchFromApi(apiMatch)
        if (!match) return
      }
      
      // Update match status and score
      const updatedMatch = await prisma.match.update({
        where: { id: match.id },
        data: {
          status: 'LIVE',
          minute: apiMatch.fixture.status.elapsed || 0,
          homeScore: apiMatch.goals.home || 0,
          awayScore: apiMatch.goals.away || 0
        }
      })
      
      // Create match events if score changed
      await this.createMatchEvents(match.id, apiMatch, match)
      
      // Update live odds
      await this.updateMatchOdds(match.id, apiMatch)
      
      console.log(`✅ Updated: ${match.homeTeam.name} vs ${match.awayTeam.name} - ${apiMatch.goals.home}-${apiMatch.goals.away} (${apiMatch.fixture.status.elapsed}')`)
      
    } catch (error) {
      console.error('Error processing API match:', error)
    }
  }

  // Create match from API data
  private async createMatchFromApi(apiMatch: any): Promise<any> {
    try {
      // This would require league and team creation logic
      // For now, we'll focus on updating existing matches
      console.log(`🔍 Match not found in database: ${apiMatch.teams.home.name} vs ${apiMatch.teams.away.name}`)
      return null
    } catch (error) {
      console.error('Error creating match from API:', error)
      return null
    }
  }

  // Start legacy simulation for testing
  async startMatchSimulation(matchId: string): Promise<boolean> {
    try {
      // Get match details
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          homeTeam: true,
          awayTeam: true
        }
      })

      if (!match) {
        console.error('Match not found:', matchId)
        return false
      }

      // Set match as live
      await prisma.match.update({
        where: { id: matchId },
        data: {
          status: 'LIVE',
          minute: 1,
          homeScore: 0,
          awayScore: 0
        }
      })

      console.log(`⚽ Starting live simulation for ${match.homeTeam.name} vs ${match.awayTeam.name}`)

      // Start simulation interval (1 second = 1 minute in game time)
      const simulationInterval = setInterval(() => {
        this.simulateMatchMinute(matchId)
      }, 1000)

      this.activeSimulations.set(matchId, simulationInterval)
      return true
    } catch (error) {
      console.error('Error starting match simulation:', error)
      return false
    }
  }

  private async simulateMatchMinute(matchId: string): Promise<void> {
    try {
      // Get current match state
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          homeTeam: true,
          awayTeam: true
        }
      })

      if (!match || match.status !== 'LIVE') {
        this.stopMatchSimulation(matchId)
        return
      }

      const currentMinute = (match.minute || 0) + 1
      let newHomeScore = match.homeScore || 0
      let newAwayScore = match.awayScore || 0
      let status = match.status

      // Generate match events based on minute
      const events = this.generateMatchEvents(currentMinute, match)

      // Process events
      for (const event of events) {
        if (event.type === 'goal') {
          if (event.team === 'home') {
            newHomeScore++
          } else {
            newAwayScore++
          }
          
          // Update live odds after goal
          await this.updateLiveOdds(matchId, newHomeScore, newAwayScore, currentMinute)
          
          console.log(`⚽ GOAL! ${event.description} (${newHomeScore}-${newAwayScore}) ${currentMinute}'`)
        }
      }

      // Check for match end
      if (currentMinute >= 90) {
        const additionalTime = Math.floor(Math.random() * 5) + 1 // 1-5 minutes
        if (currentMinute >= 90 + additionalTime) {
          status = 'finished'
          await this.finishMatch(matchId, newHomeScore, newAwayScore)
          this.stopMatchSimulation(matchId)
          return
        }
      }

      // Update match state
      await prisma.match.update({
        where: { id: matchId },
        data: {
          minute: currentMinute,
          homeScore: newHomeScore,
          awayScore: newAwayScore,
          status
        }
      })

    } catch (error) {
      console.error('Error simulating match minute:', error)
      this.stopMatchSimulation(matchId)
    }
  }

  private generateMatchEvents(minute: number, match: any): MatchEvent[] {
    const events: MatchEvent[] = []
    
    // Goal probability (higher in certain minutes)
    let goalProb = 0.02 // Base 2% chance per minute
    
    // Higher probability in final minutes
    if (minute > 80) goalProb *= 1.5
    if (minute > 85) goalProb *= 1.2
    
    // Derby matches have more action
    if (match.isDerby) goalProb *= 1.3
    
    // Generate goal event
    if (Math.random() < goalProb) {
      const isHomeGoal = this.calculateGoalProbability(match)
      const team = isHomeGoal ? 'home' : 'away'
      const teamName = isHomeGoal ? match.homeTeam.name : match.awayTeam.name
      
      events.push({
        minute,
        type: 'goal',
        team,
        description: `${teamName} scores!`,
        player: this.generatePlayerName(teamName)
      })
    }

    // Corner probability
    if (Math.random() < 0.08) { // 8% chance
      const team = Math.random() < 0.5 ? 'home' : 'away'
      events.push({
        minute,
        type: 'corner',
        team,
        description: `Corner kick`
      })
    }

    // Card probability
    if (Math.random() < 0.03) { // 3% chance
      const team = Math.random() < 0.5 ? 'home' : 'away'
      events.push({
        minute,
        type: 'card',
        team,
        description: `Yellow card`
      })
    }

    return events
  }

  private calculateGoalProbability(match: any): boolean {
    // Home advantage + team strength factors
    let homeProb = 0.55 // Base home advantage

    // Derby teams are generally stronger
    if (match.homeTeam.isDerbyTeam) homeProb += 0.1
    if (match.awayTeam.isDerbyTeam) homeProb -= 0.05

    // Current score affects probability
    const scoreDiff = (match.homeScore || 0) - (match.awayScore || 0)
    if (scoreDiff > 0) homeProb -= 0.1 // Leading team less likely to score
    if (scoreDiff < 0) homeProb += 0.1 // Trailing team more likely to score

    return Math.random() < homeProb
  }

  private generatePlayerName(teamName: string): string {
    // Nordic player names for authenticity
    const finnishNames = [
      'Väinämöinen', 'Koskinen', 'Virtanen', 'Hämäläinen', 'Mäkinen',
      'Laine', 'Hakala', 'Nieminen', 'Korhonen', 'Järvinen'
    ]
    
    const swedishNames = [
      'Andersson', 'Johansson', 'Karlsson', 'Nilsson', 'Eriksson',
      'Larsson', 'Olsson', 'Persson', 'Svensson', 'Gustafsson'
    ]
    
    // Determine nationality from team/league
    const names = teamName.includes('Helsinki') || teamName.includes('Kuopio') || teamName.includes('Turku') || teamName.includes('HJK') || teamName.includes('KuPS')
      ? finnishNames 
      : swedishNames
    
    return names[Math.floor(Math.random() * names.length)]
  }

  private async updateLiveOdds(matchId: string, homeScore: number, awayScore: number, minute: number): Promise<void> {
    try {
      // Get current odds
      const currentOdds = await prisma.odds.findFirst({
        where: {
          matchId,
          market: 'MATCH_RESULT'
        }
      })

      if (!currentOdds) return

      // Calculate new odds based on current score and time remaining
      const timeRemaining = 90 - minute
      const scoreDiff = homeScore - awayScore
      
      let newHomeOdds = currentOdds.homeWin
      let newDrawOdds = currentOdds.draw
      let newAwayOdds = currentOdds.awayWin

      // Adjust odds based on score and time
      if (scoreDiff > 0) {
        // Home team leading
        newHomeOdds = Math.max(110, newHomeOdds - (scoreDiff * 20) - (timeRemaining * 2))
        newAwayOdds = Math.min(800, newAwayOdds + (scoreDiff * 40) + (timeRemaining * 3))
      } else if (scoreDiff < 0) {
        // Away team leading
        newAwayOdds = Math.max(110, newAwayOdds + (scoreDiff * 20) - (timeRemaining * 2))
        newHomeOdds = Math.min(800, newHomeOdds - (scoreDiff * 40) + (timeRemaining * 3))
      }

      // Draw odds adjustment
      if (homeScore === awayScore && minute > 70) {
        newDrawOdds = Math.max(250, newDrawOdds - (90 - minute) * 5)
      }

      // Update odds with enhanced versions
      await prisma.odds.update({
        where: { id: currentOdds.id },
        data: {
          homeWin: newHomeOdds,
          draw: newDrawOdds,
          awayWin: newAwayOdds,
          enhancedHomeWin: Math.round(newHomeOdds * 1.3),
          enhancedDraw: Math.round(newDrawOdds * 1.3),
          enhancedAwayWin: Math.round(newAwayOdds * 1.3),
          isLive: true,
          lastUpdatedMinute: minute
        }
      })

    } catch (error) {
      console.error('Error updating live odds:', error)
    }
  }

  private async finishMatch(matchId: string, finalHomeScore: number, finalAwayScore: number): Promise<void> {
    try {
      console.log(`🏁 Match finished: ${finalHomeScore}-${finalAwayScore}`)

      // Set match as finished
      await prisma.match.update({
        where: { id: matchId },
        data: {
          status: 'FINISHED',
          homeScore: finalHomeScore,
          awayScore: finalAwayScore
        }
      })

      // Settle all live bets for this match
      await this.settleLiveBetsForMatch(matchId)

    } catch (error) {
      console.error('Error finishing match:', error)
    }
  }

  // Settle live bets specifically
  private async settleLiveBetsForMatch(matchId: string): Promise<void> {
    try {
      // Get all pending live bets for this match
      const liveBets = await prisma.liveBet.findMany({
        where: {
          matchId,
          status: 'PENDING'
        },
        include: {
          match: {
            include: {
              homeTeam: true,
              awayTeam: true
            }
          },
          user: true
        }
      })

      console.log(`💰 Settling ${liveBets.length} live bets for finished match`)

      for (const bet of liveBets) {
        await this.settleLiveBet(bet)
      }

    } catch (error) {
      console.error('Error settling live bets for match:', error)
    }
  }

  // Settle individual live bet
  private async settleLiveBet(bet: any): Promise<void> {
    try {
      const match = bet.match
      const finalScore = { home: match.homeScore || 0, away: match.awayScore || 0 }
      
      // Determine if bet won
      const isWinner = this.evaluateLiveBet(bet, finalScore)
      const status = isWinner ? 'WON' : 'LOST'
      const winAmount = isWinner ? bet.potentialWin : 0
      
      // Update bet status
      await prisma.liveBet.update({
        where: { id: bet.id },
        data: {
          status,
          settledAt: new Date(),
          winAmount,
          diamondAwarded: isWinner
        }
      })

      if (isWinner) {
        // Update user balance and stats
        await prisma.user.update({
          where: { id: bet.userId },
          data: {
            betPoints: bet.user.betPoints + winAmount,
            diamonds: bet.user.diamonds + bet.diamondReward,
            totalWins: bet.user.totalWins + 1,
            totalWon: bet.user.totalWon + winAmount
          }
        })

        // Create transaction
        await prisma.transaction.create({
          data: {
            userId: bet.userId,
            type: 'BET_WON',
            amount: winAmount,
            currency: 'BETPOINTS',
            description: `Live bet won: ${match.homeTeam.name} vs ${match.awayTeam.name}`,
            reference: bet.id,
            balanceBefore: bet.user.betPoints,
            balanceAfter: bet.user.betPoints + winAmount
          }
        })

        // Create notification
        await prisma.notification.create({
          data: {
            userId: bet.userId,
            type: 'BET_SETTLED',
            title: 'Live Bet Won! 🎉',
            message: `Your live bet won ${winAmount} BP + ${bet.diamondReward} 💎`,
            data: {
              betId: bet.id,
              winAmount,
              diamonds: bet.diamondReward
            }
          }
        })
      }
      
    } catch (error) {
      console.error('Error settling individual live bet:', error)
    }
  }

  // Evaluate if live bet won
  private evaluateLiveBet(bet: any, finalScore: { home: number, away: number }): boolean {
    const { market, selection } = bet
    
    switch (market) {
      case 'match_result':
        if (selection === 'HOME' && finalScore.home > finalScore.away) return true
        if (selection === 'AWAY' && finalScore.away > finalScore.home) return true  
        if (selection === 'DRAW' && finalScore.home === finalScore.away) return true
        return false
        
      case 'total_goals':
        const totalGoals = finalScore.home + finalScore.away
        if (selection === 'over_2.5' && totalGoals > 2.5) return true
        if (selection === 'under_2.5' && totalGoals < 2.5) return true
        return false
        
      // Simplified evaluation for other markets
      default:
        return Math.random() < 0.3 // 30% win rate for specialized markets
    }
  }

  private stopMatchSimulation(matchId: string): void {
    const interval = this.activeSimulations.get(matchId)
    if (interval) {
      clearInterval(interval)
      this.activeSimulations.delete(matchId)
      console.log(`⏹️ Stopped simulation for match ${matchId}`)
    }
  }

  // Start multiple live matches for testing
  async startTestLiveMatches(): Promise<number> {
    try {
      // Get some upcoming matches to make live
      const { data: upcomingMatches, error } = await this.supabase
        .from('matches')
        .select('id')
        .eq('status', 'scheduled')
        .limit(3)

      if (error || !upcomingMatches) {
        console.error('Error fetching upcoming matches:', error)
        return 0
      }

      let startedCount = 0
      for (const match of upcomingMatches) {
        const success = await this.startMatchSimulation(match.id)
        if (success) startedCount++
      }

      console.log(`🚀 Started ${startedCount} live match simulations`)
      return startedCount
    } catch (error) {
      console.error('Error starting test live matches:', error)
      return 0
    }
  }

  // Create match events from API data
  private async createMatchEvents(matchId: string, apiMatch: any, previousMatch: any): Promise<void> {
    try {
      const currentScore = { home: apiMatch.goals.home || 0, away: apiMatch.goals.away || 0 }
      const previousScore = { home: previousMatch.homeScore || 0, away: previousMatch.awayScore || 0 }
      
      // Check if score changed
      if (currentScore.home > previousScore.home) {
        await prisma.matchEvent.create({
          data: {
            matchId,
            minute: apiMatch.fixture.status.elapsed || 0,
            eventType: 'GOAL',
            team: 'HOME',
            details: {
              scorer: 'Unknown Player',
              newScore: `${currentScore.home}-${currentScore.away}`
            }
          }
        })
      }
      
      if (currentScore.away > previousScore.away) {
        await prisma.matchEvent.create({
          data: {
            matchId,
            minute: apiMatch.fixture.status.elapsed || 0,
            eventType: 'GOAL',
            team: 'AWAY',
            details: {
              scorer: 'Unknown Player',
              newScore: `${currentScore.home}-${currentScore.away}`
            }
          }
        })
      }
    } catch (error) {
      console.error('Error creating match events:', error)
    }
  }

  // Update match odds based on API data and current state
  private async updateMatchOdds(matchId: string, apiMatch: any): Promise<void> {
    try {
      const currentMinute = apiMatch.fixture.status.elapsed || 0
      const homeScore = apiMatch.goals.home || 0
      const awayScore = apiMatch.goals.away || 0
      
      await this.updateLiveOdds(matchId, homeScore, awayScore, currentMinute)
      
      // Also update specialized live markets
      await this.updateLiveMarkets(matchId, currentMinute, homeScore, awayScore)
    } catch (error) {
      console.error('Error updating match odds:', error)
    }
  }

  // Update all live odds for active matches
  private async updateAllLiveOdds(): Promise<void> {
    try {
      const liveMatches = await prisma.match.findMany({
        where: { status: 'LIVE' },
        include: { odds: true }
      })

      for (const match of liveMatches) {
        await this.updateLiveMarkets(
          match.id,
          match.minute || 0,
          match.homeScore || 0,
          match.awayScore || 0
        )
      }
    } catch (error) {
      console.error('Error updating all live odds:', error)
    }
  }

  // Update live markets (next goal, corner, card, etc.)
  private async updateLiveMarkets(matchId: string, minute: number, homeScore: number, awayScore: number): Promise<void> {
    try {
      // Get current odds record
      const odds = await prisma.odds.findFirst({
        where: { matchId, market: 'MATCH_RESULT' }
      })

      if (!odds) return

      // Calculate dynamic live market odds
      const liveMarketOdds = {
        nextGoalHome: this.calculateNextGoalOdds({ minute, homeScore, awayScore, isDerby: false }, 'HOME'),
        nextGoalAway: this.calculateNextGoalOdds({ minute, homeScore, awayScore, isDerby: false }, 'AWAY'),
        nextCornerHome: this.calculateNextCornerOdds({ minute, homeScore, awayScore }, 'HOME'),
        nextCornerAway: this.calculateNextCornerOdds({ minute, homeScore, awayScore }, 'AWAY'),
        nextCardHome: this.calculateNextCardOdds({ minute, isDerby: false }, 'HOME'),
        nextCardAway: this.calculateNextCardOdds({ minute, isDerby: false }, 'AWAY'),
        liveOver15: this.calculateLiveOverUnder(homeScore + awayScore, minute, 1.5, 'over'),
        liveUnder15: this.calculateLiveOverUnder(homeScore + awayScore, minute, 1.5, 'under'),
        liveOver35: this.calculateLiveOverUnder(homeScore + awayScore, minute, 3.5, 'over'),
        liveUnder35: this.calculateLiveOverUnder(homeScore + awayScore, minute, 3.5, 'under'),
        lastUpdatedMinute: minute
      }

      await prisma.odds.update({
        where: { id: odds.id },
        data: liveMarketOdds
      })

    } catch (error) {
      console.error('Error updating live markets:', error)
    }
  }

  // Calculate live over/under odds
  private calculateLiveOverUnder(currentGoals: number, minute: number, threshold: number, type: 'over' | 'under'): number {
    const timeRemaining = Math.max(0, 90 - minute)
    const goalsNeeded = type === 'over' ? threshold - currentGoals + 0.5 : currentGoals - threshold + 0.5
    
    if (type === 'over' && currentGoals > threshold) return 100 // Already won
    if (type === 'under' && currentGoals < threshold && minute > 85) return 110 // Very likely to win
    
    // Base probability calculation
    let odds = 200 + (goalsNeeded * 50) + ((90 - timeRemaining) * 2)
    
    return Math.max(105, Math.min(800, Math.round(odds)))
  }

  // Update cash-out values for all active live bets
  private async updateAllCashOutValues(): Promise<void> {
    try {
      const activeLiveBets = await prisma.liveBet.findMany({
        where: {
          status: 'PENDING',
          cashOutAvailable: true,
          cashedOut: false
        },
        include: {
          match: true
        }
      })

      for (const bet of activeLiveBets) {
        if (bet.match.status === 'LIVE' && bet.match.minute && bet.match.minute < 80) {
          const newCashOutValue = this.calculateCurrentCashOutValue(bet)
          
          await prisma.liveBet.update({
            where: { id: bet.id },
            data: {
              cashOutValue: newCashOutValue,
              cashOutAvailable: bet.match.minute < 75 // Disable after 75th minute
            }
          })
        }
      }

      console.log(`🔄 Updated cash-out values for ${activeLiveBets.length} live bets`)
    } catch (error) {
      console.error('Error updating cash-out values:', error)
    }
  }

  // Calculate current cash-out value (simplified version from earlier)
  private calculateCurrentCashOutValue(liveBet: any): number {
    const match = liveBet.match
    const currentMinute = match.minute || 0
    const timeFactor = (90 - currentMinute) / 90
    const baseCashOut = liveBet.stake * 0.85
    
    return Math.round(baseCashOut * timeFactor)
  }

  // Stop all active simulations and intervals
  stopAllSimulations(): void {
    // Stop legacy simulations
    for (const [matchId, interval] of this.activeSimulations) {
      clearInterval(interval)
      console.log(`⏹️ Stopped simulation for match ${matchId}`)
    }
    this.activeSimulations.clear()

    // Stop API sync intervals
    if (this.apiSyncInterval) {
      clearInterval(this.apiSyncInterval)
      this.apiSyncInterval = null
      console.log('⏹️ Stopped API sync interval')
    }

    if (this.cashOutUpdateInterval) {
      clearInterval(this.cashOutUpdateInterval)
      this.cashOutUpdateInterval = null
      console.log('⏹️ Stopped cash-out update interval')
    }
  }

  // Get simulation status
  getActiveSimulations(): string[] {
    return Array.from(this.activeSimulations.keys())
  }
}

export const liveMatchEngine = new LiveMatchEngine()