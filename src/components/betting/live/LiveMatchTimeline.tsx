'use client'

import { useState, useEffect } from 'react'

interface MatchEvent {
  id: string
  minute: number
  type: string
  team: string
  teamName: string
  player?: string
  assist?: string
  description: string
  source: 'database' | 'api'
  timestamp: string
  details?: any
}

interface MatchStats {
  goals: { home: number; away: number }
  corners: { home: number; away: number }
  cards: { 
    home: { yellow: number; red: number }
    away: { yellow: number; red: number }
  }
  substitutions: { home: number; away: number }
  lastGoalMinute: number | null
  timeWithoutGoal: number
  isHighScoringGame: boolean
  tempo: 'slow' | 'normal' | 'fast'
}

interface LiveMatchTimelineProps {
  matchId: string
  homeTeam: string
  awayTeam: string
  currentMinute: number
  homeScore: number
  awayScore: number
  autoRefresh?: boolean
  refreshInterval?: number
  className?: string
}

export default function LiveMatchTimeline({ 
  matchId, 
  homeTeam, 
  awayTeam, 
  currentMinute, 
  homeScore, 
  awayScore,
  autoRefresh = true,
  refreshInterval = 15000,
  className = ''
}: LiveMatchTimelineProps) {
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [stats, setStats] = useState<MatchStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(false)

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/live-betting/events?matchId=${matchId}`)
      const data = await response.json()

      if (data.success) {
        setEvents(data.events || [])
        setStats(data.stats || null)
        setLastUpdate(data.lastUpdate)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch events')
      }
    } catch (err) {
      setError('Network error fetching events')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchEvents()
  }, [matchId])

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchEvents()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, matchId])

  // Format event icons
  const getEventIcon = (type: string, team: string) => {
    const isHome = team === 'home'
    const teamColor = isHome ? 'text-blue-600' : 'text-red-600'
    
    switch (type) {
      case 'goal':
      case 'penalty':
        return <span className={`text-lg ${teamColor}`}>⚽</span>
      case 'own_goal':
        return <span className="text-lg text-gray-600">⚽</span>
      case 'yellow_card':
        return <span className="text-lg text-yellow-500">🟨</span>
      case 'red_card':
        return <span className="text-lg text-red-500">🟥</span>
      case 'substitution':
        return <span className={`text-lg ${teamColor}`}>🔄</span>
      case 'var':
      case 'var_decision':
        return <span className="text-lg text-purple-600">📺</span>
      case 'corner':
        return <span className={`text-sm ${teamColor}`}>📐</span>
      case 'half_time':
        return <span className="text-lg text-gray-500">⏰</span>
      case 'full_time':
        return <span className="text-lg text-green-600">🏁</span>
      default:
        return <span className="text-lg text-gray-400">⚪</span>
    }
  }

  // Get team color for styling
  const getTeamSide = (team: string) => {
    return team === 'home' ? 'left' : 'right'
  }

  // Format time since last event
  const getTimeSinceLastEvent = () => {
    if (events.length === 0) return null
    const lastEvent = events[0]
    const timeDiff = currentMinute - lastEvent.minute
    return timeDiff > 0 ? `${timeDiff} min ago` : 'Just now'
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-red-200 p-4 ${className}`}>
        <div className="text-center">
          <span className="text-red-600 text-sm">⚠️ {error}</span>
          <button 
            onClick={() => {
              setLoading(true)
              fetchEvents()
            }}
            className="ml-2 text-blue-600 text-sm hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900">Live Match Timeline</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span>
                {events.length} events
              </span>
              {events.length > 0 && (
                <span>
                  Last: {getTimeSinceLastEvent()}
                </span>
              )}
              <span className="text-xs">
                Updated {new Date(lastUpdate).toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Match tempo indicator */}
            {stats && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                stats.tempo === 'fast' ? 'bg-red-100 text-red-700' :
                stats.tempo === 'slow' ? 'bg-blue-100 text-blue-700' :
                'bg-green-100 text-green-700'
              }`}>
                {stats.tempo.toUpperCase()}
              </div>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        {/* Match stats summary */}
        {stats && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{stats.goals.home + stats.goals.away}</div>
              <div className="text-gray-500">Total Goals</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {stats.cards.home.yellow + stats.cards.away.yellow + stats.cards.home.red + stats.cards.away.red}
              </div>
              <div className="text-gray-500">Cards</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{stats.substitutions.home + stats.substitutions.away}</div>
              <div className="text-gray-500">Substitutions</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {stats.timeWithoutGoal > 0 ? `${stats.timeWithoutGoal}'` : '-'}
              </div>
              <div className="text-gray-500">Since Goal</div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="p-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="text-2xl mb-2 block">⚽</span>
            <p>No events yet in this match</p>
            <p className="text-sm mt-1">Events will appear here as they happen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Current match time indicator */}
            <div className="flex items-center justify-center py-2">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                🔴 LIVE - {currentMinute}' 
                <span className="ml-2 text-xs">({homeScore}-{awayScore})</span>
              </div>
            </div>

            {/* Events list */}
            {(isExpanded ? events : events.slice(0, 5)).map((event, index) => (
              <div 
                key={event.id} 
                className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                  index === 0 ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                }`}
              >
                {/* Timeline connector */}
                <div className="relative">
                  <div className="flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-300 rounded-full">
                    {getEventIcon(event.type, event.team)}
                  </div>
                  {index < events.length - 1 && (
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gray-200"></div>
                  )}
                </div>

                {/* Event details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {event.minute}'
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.team === 'home' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {event.teamName}
                      </span>
                      {event.source === 'api' && (
                        <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded">
                          LIVE
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="mt-1">
                    <p className="text-sm text-gray-700">{event.description}</p>
                    {event.player && (
                      <p className="text-xs text-gray-500 mt-1">
                        {event.player}
                        {event.assist && ` (assist: ${event.assist})`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Show more button */}
            {!isExpanded && events.length > 5 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Show {events.length - 5} more events
                </button>
              </div>
            )}

            {/* Match start indicator */}
            <div className="flex items-center justify-center py-2">
              <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                🏟️ Match Started
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
          🔄 Auto-refreshing every {refreshInterval / 1000}s
        </div>
      )}
    </div>
  )
}