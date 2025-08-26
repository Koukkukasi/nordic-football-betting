// Hook for live match updates
import { useState, useEffect, useCallback } from 'react'
import { Match } from '@/components/matches/ExpandedMatchList'
import { matchService } from '@/services/match-service'

interface UseLiveMatchesOptions {
  pollInterval?: number // in milliseconds
  enabled?: boolean
}

export function useLiveMatches(options: UseLiveMatchesOptions = {}) {
  const { pollInterval = 30000, enabled = true } = options // Default 30 seconds
  const [liveMatches, setLiveMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  
  const fetchLiveMatches = useCallback(async () => {
    if (!enabled) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const matches = await matchService.getLiveMatches()
      setLiveMatches(matches)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Failed to fetch live matches:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch live matches')
    } finally {
      setIsLoading(false)
    }
  }, [enabled])
  
  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchLiveMatches()
    }
  }, [enabled, fetchLiveMatches])
  
  // Set up polling
  useEffect(() => {
    if (!enabled || pollInterval <= 0) return
    
    const intervalId = setInterval(() => {
      fetchLiveMatches()
    }, pollInterval)
    
    return () => clearInterval(intervalId)
  }, [enabled, pollInterval, fetchLiveMatches])
  
  // Manual refresh function
  const refresh = useCallback(() => {
    return fetchLiveMatches()
  }, [fetchLiveMatches])
  
  return {
    liveMatches,
    isLoading,
    error,
    lastUpdate,
    refresh,
    matchCount: liveMatches.length
  }
}

// Hook for tracking a specific live match
export function useLiveMatch(matchId: string, options: UseLiveMatchesOptions = {}) {
  const { pollInterval = 10000, enabled = true } = options // Faster updates for single match
  const [match, setMatch] = useState<Match | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchMatch = useCallback(async () => {
    if (!enabled || !matchId) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const matchData = await matchService.getMatchById(matchId)
      setMatch(matchData)
    } catch (err) {
      console.error(`Failed to fetch match ${matchId}:`, err)
      setError(err instanceof Error ? err.message : 'Failed to fetch match')
    } finally {
      setIsLoading(false)
    }
  }, [enabled, matchId])
  
  // Initial fetch
  useEffect(() => {
    if (enabled && matchId) {
      fetchMatch()
    }
  }, [enabled, matchId, fetchMatch])
  
  // Set up polling for live matches
  useEffect(() => {
    if (!enabled || !match?.isLive || pollInterval <= 0) return
    
    const intervalId = setInterval(() => {
      fetchMatch()
    }, pollInterval)
    
    return () => clearInterval(intervalId)
  }, [enabled, match?.isLive, pollInterval, fetchMatch])
  
  return {
    match,
    isLoading,
    error,
    refresh: fetchMatch
  }
}