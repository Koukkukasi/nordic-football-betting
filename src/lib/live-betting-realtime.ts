// Real-time live betting updates service
'use client'

export interface LiveMatchUpdate {
  matchId: string
  minute: number
  homeScore: number
  awayScore: number
  status: string
  events?: Array<{
    minute: number
    type: string
    team: string
    description: string
  }>
  odds?: {
    homeWin: number
    draw: number
    awayWin: number
    enhancedHomeWin: number
    enhancedDraw: number
    enhancedAwayWin: number
    [key: string]: number
  }
}

export interface LiveBetUpdate {
  betId: string
  cashOutValue: number
  cashOutAvailable: boolean
  status: string
}

export class LiveBettingRealtime {
  private eventSource: EventSource | null = null
  private pollInterval: NodeJS.Timeout | null = null
  private subscribers: Map<string, Function> = new Map()

  // Subscribe to live updates
  subscribe(event: 'match-update' | 'bet-update', callback: Function): string {
    const subscriberId = Math.random().toString(36).substr(2, 9)
    this.subscribers.set(`${event}-${subscriberId}`, callback)
    return subscriberId
  }

  // Unsubscribe from updates
  unsubscribe(event: 'match-update' | 'bet-update', subscriberId: string): void {
    this.subscribers.delete(`${event}-${subscriberId}`)
  }

  // Start real-time updates (polling-based for simplicity)
  startUpdates(): void {
    this.stopUpdates() // Stop any existing updates
    
    // Poll for updates every 15 seconds
    this.pollInterval = setInterval(() => {
      this.fetchUpdates()
    }, 15000)

    // Initial fetch
    this.fetchUpdates()
  }

  // Stop real-time updates
  stopUpdates(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
  }

  // Fetch latest updates
  private async fetchUpdates(): Promise<void> {
    try {
      // Fetch live match updates
      const matchResponse = await fetch('/api/live-betting/matches')
      if (matchResponse.ok) {
        const matchData = await matchResponse.json()
        if (matchData.success && matchData.matches) {
          this.notifySubscribers('match-update', matchData.matches)
        }
      }

      // Fetch user's live bet updates
      const betResponse = await fetch('/api/live-betting/user-bets')
      if (betResponse.ok) {
        const betData = await betResponse.json()
        if (betData.success) {
          this.notifySubscribers('bet-update', {
            activeBets: betData.activeBets,
            settledBets: betData.settledBets
          })
        }
      }
    } catch (error) {
      console.error('Error fetching live updates:', error)
    }
  }

  // Notify all subscribers of an event
  private notifySubscribers(event: string, data: any): void {
    for (const [key, callback] of this.subscribers) {
      if (key.startsWith(event)) {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in subscriber callback:', error)
        }
      }
    }
  }

  // Get current subscriber count
  getSubscriberCount(): number {
    return this.subscribers.size
  }
}

// Singleton instance
export const liveBettingRealtime = new LiveBettingRealtime()

// React hook for live betting updates
import { useState, useEffect, useRef } from 'react'

export function useLiveBettingUpdates() {
  const [liveMatches, setLiveMatches] = useState<any[]>([])
  const [userBets, setUserBets] = useState<{ activeBets: any[], settledBets: any[] }>({
    activeBets: [],
    settledBets: []
  })
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const subscriberIds = useRef<string[]>([])

  useEffect(() => {
    // Subscribe to updates
    const matchSubscriberId = liveBettingRealtime.subscribe('match-update', (matches: any[]) => {
      setLiveMatches(matches)
      setLastUpdate(new Date())
      setIsConnected(true)
    })

    const betSubscriberId = liveBettingRealtime.subscribe('bet-update', (bets: any) => {
      setUserBets(bets)
      setLastUpdate(new Date())
    })

    subscriberIds.current = [matchSubscriberId, betSubscriberId]

    // Start updates
    liveBettingRealtime.startUpdates()

    // Cleanup on unmount
    return () => {
      subscriberIds.current.forEach(id => {
        liveBettingRealtime.unsubscribe('match-update', id)
        liveBettingRealtime.unsubscribe('bet-update', id)
      })
      subscriberIds.current = []
    }
  }, [])

  const refreshData = () => {
    liveBettingRealtime.startUpdates() // This triggers an immediate fetch
  }

  return {
    liveMatches,
    userBets,
    isConnected,
    lastUpdate,
    refreshData
  }
}

// Utility hook for individual match updates
export function useMatchUpdates(matchId: string) {
  const [matchData, setMatchData] = useState<any>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const subscriberId = useRef<string>()

  useEffect(() => {
    if (!matchId) return

    subscriberId.current = liveBettingRealtime.subscribe('match-update', (matches: any[]) => {
      const match = matches.find(m => m.id === matchId)
      if (match) {
        setMatchData(match)
        setLastUpdate(new Date())
      }
    })

    return () => {
      if (subscriberId.current) {
        liveBettingRealtime.unsubscribe('match-update', subscriberId.current)
      }
    }
  }, [matchId])

  return { matchData, lastUpdate }
}

// Utility hook for cash-out updates
export function useCashOutUpdates(betId: string) {
  const [cashOutValue, setCashOutValue] = useState<number>(0)
  const [cashOutAvailable, setCashOutAvailable] = useState<boolean>(false)
  const subscriberId = useRef<string>()

  useEffect(() => {
    if (!betId) return

    subscriberId.current = liveBettingRealtime.subscribe('bet-update', (data: any) => {
      const bet = data.activeBets.find((b: any) => b.id === betId)
      if (bet) {
        setCashOutValue(bet.cashOutValue || 0)
        setCashOutAvailable(bet.cashOutAvailable || false)
      }
    })

    return () => {
      if (subscriberId.current) {
        liveBettingRealtime.unsubscribe('bet-update', subscriberId.current)
      }
    }
  }, [betId])

  return { cashOutValue, cashOutAvailable }
}