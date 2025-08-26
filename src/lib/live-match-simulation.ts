// Live Match Simulation Engine
// Simulates realistic football match progression with Nordic team characteristics

import { prisma } from '@/lib/prisma'
import { EventEmitter } from 'events'

export interface LiveMatchEvent {
  minute: number
  type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'PENALTY' | 'VAR' | 'INJURY' | 'CORNER' | 'SHOT'
  team: 'HOME' | 'AWAY'
  player?: string
  assist?: string
  description: string
  impact?: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface TeamStats {
  possession: number
  shots: number
  shotsOnTarget: number
  corners: number
  fouls: number
  yellowCards: number
  redCards: number
  offsides: number
  passes: number
  passAccuracy: number
}

export class LiveMatchSimulator extends EventEmitter {
  private matchId: string
  private homeTeam: any
  private awayTeam: any
  private minute: number = 0
  private homeScore: number = 0
  private awayScore: number = 0
  private isRunning: boolean = false
  private interval: NodeJS.Timeout | null = null
  private events: LiveMatchEvent[] = []
  private homeStats: TeamStats
  private awayStats: TeamStats
  private homeMomentum: number = 50
  private awayMomentum: number = 50
  
  // Nordic team characteristics
  private teamCharacteristics: Record<string, any> = {
    'HJK': { attack: 75, defense: 70, discipline: 85, homeFans: 90 },
    'HIFK': { attack: 65, defense: 68, discipline: 80, homeFans: 85 },
    'KuPS': { attack: 70, defense: 72, discipline: 82, homeFans: 75 },
    'FC Inter': { attack: 68, defense: 65, discipline: 78, homeFans: 70 },
    'TPS': { attack: 62, defense: 70, discipline: 85, homeFans: 80 },
    'AIK': { attack: 78, defense: 75, discipline: 70, homeFans: 95 },
    'Malmö FF': { attack: 82, defense: 78, discipline: 75, homeFans: 90 },
    'Djurgården': { attack: 75, defense: 72, discipline: 72, homeFans: 88 },
    'Hammarby': { attack: 73, defense: 70, discipline: 68, homeFans: 92 },
    'IFK Göteborg': { attack: 70, defense: 73, discipline: 80, homeFans: 85 }
  }
  
  constructor(matchId: string, homeTeam: any, awayTeam: any) {
    super()
    this.matchId = matchId
    this.homeTeam = homeTeam
    this.awayTeam = awayTeam
    
    // Initialize stats
    this.homeStats = this.initializeStats()
    this.awayStats = this.initializeStats()
  }
  
  private initializeStats(): TeamStats {
    return {
      possession: 50,
      shots: 0,
      shotsOnTarget: 0,
      corners: 0,
      fouls: 0,
      yellowCards: 0,
      redCards: 0,
      offsides: 0,
      passes: 0,
      passAccuracy: 85 + Math.random() * 10
    }
  }
  
  // Start match simulation
  async start() {
    if (this.isRunning) return
    
    this.isRunning = true
    this.minute = 0
    this.homeScore = 0
    this.awayScore = 0
    this.events = []
    
    // Update match status to LIVE
    await prisma.match.update({
      where: { id: this.matchId },
      data: { 
        status: 'LIVE',
        minute: 0,
        homeScore: 0,
        awayScore: 0
      }
    })
    
    // Emit match started
    this.emit('matchStarted', {
      matchId: this.matchId,
      homeTeam: this.homeTeam.name,
      awayTeam: this.awayTeam.name
    })
    
    // Start simulation loop (1 second = 1 match minute)
    this.interval = setInterval(() => this.simulate(), 1000)
  }
  
  // Stop match simulation
  async stop() {
    if (!this.isRunning) return
    
    this.isRunning = false
    
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    
    // Update match status to FINISHED
    await prisma.match.update({
      where: { id: this.matchId },
      data: { 
        status: 'FINISHED',
        minute: 90,
        homeScore: this.homeScore,
        awayScore: this.awayScore
      }
    })
    
    // Settle bets
    await this.settleBets()
    
    // Emit match finished
    this.emit('matchFinished', {
      matchId: this.matchId,
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      winner: this.homeScore > this.awayScore ? 'HOME' : 
              this.homeScore < this.awayScore ? 'AWAY' : 'DRAW'
    })
  }
  
  // Main simulation loop
  private async simulate() {
    this.minute++
    
    // End match at 90 minutes
    if (this.minute >= 90) {
      await this.stop()
      return
    }
    
    // Update possession
    this.updatePossession()
    
    // Generate events based on minute
    await this.generateEvents()
    
    // Update match in database
    await prisma.match.update({
      where: { id: this.matchId },
      data: {
        minute: this.minute,
        homeScore: this.homeScore,
        awayScore: this.awayScore
      }
    })
    
    // Update live odds
    await this.updateLiveOdds()
    
    // Emit minute update
    this.emit('minuteUpdate', {
      matchId: this.matchId,
      minute: this.minute,
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      homeStats: this.homeStats,
      awayStats: this.awayStats,
      momentum: {
        home: this.homeMomentum,
        away: this.awayMomentum
      }
    })
  }
  
  // Generate match events
  private async generateEvents() {
    const homeChars = this.getTeamCharacteristics(this.homeTeam.name)
    const awayChars = this.getTeamCharacteristics(this.awayTeam.name)
    
    // Goal probability (higher in certain minutes)
    const keyMinutes = [15, 30, 45, 60, 75, 85]
    const isKeyMinute = keyMinutes.includes(this.minute)
    
    // Calculate goal probability
    const baseGoalChance = 0.02
    const homeGoalChance = baseGoalChance * (homeChars.attack / 70) * (this.homeMomentum / 50)
    const awayGoalChance = baseGoalChance * (awayChars.attack / 70) * (this.awayMomentum / 50)
    
    // Check for goal
    if (Math.random() < homeGoalChance * (isKeyMinute ? 1.5 : 1)) {
      await this.createGoalEvent('HOME')
    } else if (Math.random() < awayGoalChance * (isKeyMinute ? 1.5 : 1)) {
      await this.createGoalEvent('AWAY')
    }
    
    // Shot events (more frequent)
    if (Math.random() < 0.1) {
      await this.createShotEvent(Math.random() > 0.5 ? 'HOME' : 'AWAY')
    }
    
    // Corner events
    if (Math.random() < 0.05) {
      await this.createCornerEvent(Math.random() > 0.5 ? 'HOME' : 'AWAY')
    }
    
    // Card events (based on discipline)
    const homeCardChance = 0.02 * (100 - homeChars.discipline) / 30
    const awayCardChance = 0.02 * (100 - awayChars.discipline) / 30
    
    if (Math.random() < homeCardChance) {
      await this.createCardEvent('HOME')
    }
    if (Math.random() < awayCardChance) {
      await this.createCardEvent('AWAY')
    }
    
    // Substitution events (after 60 minutes)
    if (this.minute > 60 && Math.random() < 0.03) {
      await this.createSubstitutionEvent(Math.random() > 0.5 ? 'HOME' : 'AWAY')
    }
  }
  
  // Create goal event
  private async createGoalEvent(team: 'HOME' | 'AWAY') {
    const scorer = this.getRandomPlayer(team)
    const assister = Math.random() > 0.3 ? this.getRandomPlayer(team) : undefined
    
    const event: LiveMatchEvent = {
      minute: this.minute,
      type: 'GOAL',
      team,
      player: scorer,
      assist: assister,
      description: assister ? 
        `GOAL! ${scorer} scores for ${team === 'HOME' ? this.homeTeam.name : this.awayTeam.name}! Assisted by ${assister}` :
        `GOAL! ${scorer} scores for ${team === 'HOME' ? this.homeTeam.name : this.awayTeam.name}!`,
      impact: 'HIGH'
    }
    
    // Update score
    if (team === 'HOME') {
      this.homeScore++
      this.homeMomentum = Math.min(80, this.homeMomentum + 15)
      this.awayMomentum = Math.max(20, this.awayMomentum - 10)
    } else {
      this.awayScore++
      this.awayMomentum = Math.min(80, this.awayMomentum + 15)
      this.homeMomentum = Math.max(20, this.homeMomentum - 10)
    }
    
    this.events.push(event)
    
    // Save to database
    await prisma.matchEvent.create({
      data: {
        matchId: this.matchId,
        minute: this.minute,
        eventType: 'GOAL',
        team,
        player: scorer,
        details: assister ? `Assist: ${assister}` : undefined
      }
    })
    
    // Emit goal event
    this.emit('goal', event)
  }
  
  // Create shot event
  private async createShotEvent(team: 'HOME' | 'AWAY') {
    const player = this.getRandomPlayer(team)
    const onTarget = Math.random() > 0.6
    
    if (team === 'HOME') {
      this.homeStats.shots++
      if (onTarget) this.homeStats.shotsOnTarget++
    } else {
      this.awayStats.shots++
      if (onTarget) this.awayStats.shotsOnTarget++
    }
    
    const event: LiveMatchEvent = {
      minute: this.minute,
      type: 'SHOT',
      team,
      player,
      description: onTarget ? 
        `${player} with a shot on target!` : 
        `${player} shoots wide!`,
      impact: 'LOW'
    }
    
    this.events.push(event)
    this.emit('shot', event)
  }
  
  // Create corner event
  private async createCornerEvent(team: 'HOME' | 'AWAY') {
    if (team === 'HOME') {
      this.homeStats.corners++
    } else {
      this.awayStats.corners++
    }
    
    const event: LiveMatchEvent = {
      minute: this.minute,
      type: 'CORNER',
      team,
      description: `Corner kick for ${team === 'HOME' ? this.homeTeam.name : this.awayTeam.name}`,
      impact: 'LOW'
    }
    
    this.events.push(event)
    this.emit('corner', event)
  }
  
  // Create card event
  private async createCardEvent(team: 'HOME' | 'AWAY') {
    const player = this.getRandomPlayer(team)
    const isYellow = Math.random() > 0.1 // 90% yellow, 10% red
    
    if (team === 'HOME') {
      this.homeStats.fouls++
      if (isYellow) {
        this.homeStats.yellowCards++
      } else {
        this.homeStats.redCards++
        this.homeMomentum = Math.max(20, this.homeMomentum - 20)
      }
    } else {
      this.awayStats.fouls++
      if (isYellow) {
        this.awayStats.yellowCards++
      } else {
        this.awayStats.redCards++
        this.awayMomentum = Math.max(20, this.awayMomentum - 20)
      }
    }
    
    const event: LiveMatchEvent = {
      minute: this.minute,
      type: isYellow ? 'YELLOW_CARD' : 'RED_CARD',
      team,
      player,
      description: `${isYellow ? 'Yellow' : 'RED'} card for ${player}!`,
      impact: isYellow ? 'MEDIUM' : 'HIGH'
    }
    
    this.events.push(event)
    
    // Save to database
    await prisma.matchEvent.create({
      data: {
        matchId: this.matchId,
        minute: this.minute,
        eventType: isYellow ? 'YELLOW_CARD' : 'RED_CARD',
        team,
        player
      }
    })
    
    this.emit('card', event)
  }
  
  // Create substitution event
  private async createSubstitutionEvent(team: 'HOME' | 'AWAY') {
    const playerOut = this.getRandomPlayer(team)
    const playerIn = this.getRandomPlayer(team)
    
    const event: LiveMatchEvent = {
      minute: this.minute,
      type: 'SUBSTITUTION',
      team,
      player: playerIn,
      description: `Substitution: ${playerIn} replaces ${playerOut}`,
      impact: 'LOW'
    }
    
    this.events.push(event)
    this.emit('substitution', event)
  }
  
  // Update possession based on momentum
  private updatePossession() {
    const totalMomentum = this.homeMomentum + this.awayMomentum
    this.homeStats.possession = Math.round((this.homeMomentum / totalMomentum) * 100)
    this.awayStats.possession = 100 - this.homeStats.possession
    
    // Gradually normalize momentum
    this.homeMomentum = this.homeMomentum + (50 - this.homeMomentum) * 0.02
    this.awayMomentum = this.awayMomentum + (50 - this.awayMomentum) * 0.02
  }
  
  // Update live odds based on current match situation
  private async updateLiveOdds() {
    const timeRemaining = 90 - this.minute
    const scoreDiff = this.homeScore - this.awayScore
    
    // Calculate new odds based on current situation
    let homeWinProb = 0.33
    let drawProb = 0.33
    let awayWinProb = 0.33
    
    // Adjust based on current score
    if (scoreDiff > 0) {
      homeWinProb = 0.6 + (scoreDiff * 0.15)
      drawProb = 0.25 - (scoreDiff * 0.05)
      awayWinProb = 0.15 - (scoreDiff * 0.1)
    } else if (scoreDiff < 0) {
      awayWinProb = 0.6 + (Math.abs(scoreDiff) * 0.15)
      drawProb = 0.25 - (Math.abs(scoreDiff) * 0.05)
      homeWinProb = 0.15 - (Math.abs(scoreDiff) * 0.1)
    }
    
    // Adjust based on time remaining
    const timeFactor = timeRemaining / 90
    homeWinProb *= (1 + timeFactor * 0.2)
    awayWinProb *= (1 + timeFactor * 0.2)
    drawProb *= (1 - timeFactor * 0.1)
    
    // Normalize probabilities
    const total = homeWinProb + drawProb + awayWinProb
    homeWinProb /= total
    drawProb /= total
    awayWinProb /= total
    
    // Convert to decimal odds
    const homeOdds = Math.round((1 / homeWinProb) * 100)
    const drawOdds = Math.round((1 / drawProb) * 100)
    const awayOdds = Math.round((1 / awayWinProb) * 100)
    
    // Update odds in database
    await prisma.odds.updateMany({
      where: {
        matchId: this.matchId,
        market: 'MATCH_RESULT'
      },
      data: {
        homeWin: homeOdds,
        draw: drawOdds,
        awayWin: awayOdds
      }
    })
    
    // Emit odds update
    this.emit('oddsUpdate', {
      matchId: this.matchId,
      homeWin: homeOdds,
      draw: drawOdds,
      awayWin: awayOdds
    })
  }
  
  // Settle bets for this match
  private async settleBets() {
    // Get all pending bets for this match
    const bets = await prisma.bet.findMany({
      where: {
        status: 'PENDING',
        selections: {
          some: {
            matchId: this.matchId
          }
        }
      },
      include: {
        selections: true
      }
    })
    
    for (const bet of bets) {
      let allWin = true
      
      for (const selection of bet.selections) {
        if (selection.matchId === this.matchId) {
          const result = this.getSelectionResult(selection)
          
          // Update selection result
          await prisma.betSelection.update({
            where: { id: selection.id },
            data: { result }
          })
          
          if (result !== 'WON') {
            allWin = false
          }
        }
      }
      
      // Check if all selections are settled
      const unsettledSelections = await prisma.betSelection.count({
        where: {
          betId: bet.id,
          result: null
        }
      })
      
      if (unsettledSelections === 0) {
        // Settle bet
        if (allWin) {
          const winAmount = Math.round(bet.stake * bet.totalOdds)
          
          await prisma.$transaction(async (tx) => {
            // Update bet status
            await tx.bet.update({
              where: { id: bet.id },
              data: {
                status: 'WON',
                winAmount,
                settledAt: new Date()
              }
            })
            
            // Credit winnings
            await tx.user.update({
              where: { id: bet.userId },
              data: {
                betPoints: { increment: winAmount },
                totalWins: { increment: 1 },
                totalWon: { increment: winAmount },
                currentStreak: { increment: 1 }
              }
            })
            
            // Create transaction
            await tx.transaction.create({
              data: {
                userId: bet.userId,
                type: 'BET_WON',
                amount: winAmount,
                currency: 'BETPOINTS',
                description: `Won bet ${bet.id}`,
                reference: bet.id
              }
            })
          })
        } else {
          // Mark as lost
          await prisma.bet.update({
            where: { id: bet.id },
            data: {
              status: 'LOST',
              settledAt: new Date()
            }
          })
          
          // Reset streak
          await prisma.user.update({
            where: { id: bet.userId },
            data: {
              currentStreak: 0
            }
          })
        }
      }
    }
  }
  
  // Get selection result
  private getSelectionResult(selection: any): 'WON' | 'LOST' | 'VOID' | null {
    if (selection.market === 'MATCH_RESULT') {
      if (selection.selection === 'HOME' && this.homeScore > this.awayScore) return 'WON'
      if (selection.selection === 'DRAW' && this.homeScore === this.awayScore) return 'WON'
      if (selection.selection === 'AWAY' && this.homeScore < this.awayScore) return 'WON'
      return 'LOST'
    }
    
    // Add more market types as needed
    return null
  }
  
  // Get team characteristics
  private getTeamCharacteristics(teamName: string) {
    for (const [key, chars] of Object.entries(this.teamCharacteristics)) {
      if (teamName.includes(key)) {
        return chars
      }
    }
    
    // Default characteristics
    return { attack: 65, defense: 65, discipline: 75, homeFans: 70 }
  }
  
  // Get random player name (Nordic names)
  private getRandomPlayer(team: 'HOME' | 'AWAY'): string {
    const finnishNames = ['Järvinen', 'Väänänen', 'Lindström', 'Hakkarainen', 'Nieminen', 'Virtanen', 'Korhonen']
    const swedishNames = ['Andersson', 'Johansson', 'Larsson', 'Nilsson', 'Eriksson', 'Pettersson', 'Olsson']
    
    const teamName = team === 'HOME' ? this.homeTeam.name : this.awayTeam.name
    const isFinnish = this.homeTeam.country === 'Finland' || teamName.includes('HJK') || teamName.includes('KuPS')
    
    const names = isFinnish ? finnishNames : swedishNames
    return names[Math.floor(Math.random() * names.length)]
  }
  
  // Get current match state
  getState() {
    return {
      matchId: this.matchId,
      minute: this.minute,
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      homeStats: this.homeStats,
      awayStats: this.awayStats,
      events: this.events,
      isRunning: this.isRunning,
      momentum: {
        home: this.homeMomentum,
        away: this.awayMomentum
      }
    }
  }
}

// Match simulator manager
class MatchSimulatorManager {
  private simulators: Map<string, LiveMatchSimulator> = new Map()
  
  async startMatch(matchId: string) {
    // Get match details
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true
      }
    })
    
    if (!match) {
      throw new Error('Match not found')
    }
    
    // Check if already running
    if (this.simulators.has(matchId)) {
      return this.simulators.get(matchId)
    }
    
    // Create and start simulator
    const simulator = new LiveMatchSimulator(matchId, match.homeTeam, match.awayTeam)
    this.simulators.set(matchId, simulator)
    
    await simulator.start()
    
    return simulator
  }
  
  async stopMatch(matchId: string) {
    const simulator = this.simulators.get(matchId)
    if (simulator) {
      await simulator.stop()
      this.simulators.delete(matchId)
    }
  }
  
  getSimulator(matchId: string) {
    return this.simulators.get(matchId)
  }
  
  getAllSimulators() {
    return Array.from(this.simulators.values())
  }
}

export const matchSimulatorManager = new MatchSimulatorManager()