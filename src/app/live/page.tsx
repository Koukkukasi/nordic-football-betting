'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PlayerNavigation from '@/components/layout/PlayerNavigation'
import LiveMatchCard from '@/components/betting/live/LiveMatchCard'
import LiveMatchTimeline from '@/components/betting/live/LiveMatchTimeline'
import LiveOddsTracker from '@/components/betting/live/LiveOddsTracker'
import LiveBetSlip from '@/components/betting/live/LiveBetSlip'
import CashOutButton from '@/components/betting/live/CashOutButton'

interface LiveMatch {
  id: string
  externalId: string | null
  league: {
    id: string
    name: string
    country: string
    tier: number
  }
  homeTeam: {
    id: string
    name: string
    city: string
    logoUrl?: string
  }
  awayTeam: {
    id: string
    name: string
    city: string
    logoUrl?: string
  }
  startTime: string
  status: string
  minute: number | null
  homeScore: number | null
  awayScore: number | null
  isDerby: boolean
  isFeatured: boolean
  odds: any[]
  recentEvents: any[]
  liveBettingAvailable: boolean
  diamondMultiplier: number
  cashOutAvailable: boolean
  apiData: any
}

interface LiveBet {
  id: string
  market: string
  selection: string
  stake: number
  potentialWin: number
  cashOutValue: number
  cashOutAvailable: boolean
  match: {
    id: string
    homeTeam: { name: string }
    awayTeam: { name: string }
    minute: number
    homeScore: number
    awayScore: number
    status: string
  }
  odds: number
}

interface BetSlipSelection {
  matchId: string
  market: string
  selection: string
  odds: number
  enhancedOdds?: number
  homeTeam: string
  awayTeam: string
  minute?: number
}

export default function LiveBettingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([])
  const [activeLiveBets, setActiveLiveBets] = useState<LiveBet[]>([])
  const [betSlipSelections, setBetSlipSelections] = useState<BetSlipSelection[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [activeTab, setActiveTab] = useState<'matches' | 'my-bets' | 'live-feed'>('matches')

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Fetch live matches
  const fetchLiveMatches = async () => {
    try {
      const response = await fetch('/api/live-betting/matches')
      const data = await response.json()

      if (data.success) {
        setLiveMatches(data.matches || [])
        setError(null)
        
        // Auto-select first match if none selected
        if (!selectedMatch && data.matches?.length > 0) {
          setSelectedMatch(data.matches[0].id)
        }
      } else {
        setError(data.error || 'Failed to fetch live matches')
      }
    } catch (err) {
      setError('Network error fetching live matches')
      console.error('Error fetching live matches:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch user's active live bets
  const fetchActiveLiveBets = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/live-betting/user-bets?userId=${session.user.id}`)
      const data = await response.json()

      if (data.success) {
        setActiveLiveBets(data.liveBets || [])
      }
    } catch (err) {
      console.error('Error fetching active live bets:', err)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (session?.user?.id) {
      fetchLiveMatches()
      fetchActiveLiveBets()
    }
  }, [session?.user?.id])

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !session?.user?.id) return

    const interval = setInterval(() => {
      fetchLiveMatches()
      fetchActiveLiveBets()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, session?.user?.id])

  // Add selection to bet slip
  const handleAddToBetSlip = (
    matchId: string, 
    market: string, 
    selection: string, 
    odds: number, 
    enhancedOdds?: number
  ) => {
    const match = liveMatches.find(m => m.id === matchId)
    if (!match) return

    const newSelection: BetSlipSelection = {
      matchId,
      market,
      selection,
      odds,
      enhancedOdds,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      minute: match.minute || undefined
    }

    // Remove existing selection for same match/market if exists
    setBetSlipSelections(prev => {
      const filtered = prev.filter(s => !(s.matchId === matchId && s.market === market))
      return [...filtered, newSelection]
    })
  }

  // Remove selection from bet slip
  const handleRemoveFromBetSlip = (matchId: string, market: string) => {
    setBetSlipSelections(prev => 
      prev.filter(s => !(s.matchId === matchId && s.market === market))
    )
  }

  // Clear bet slip
  const handleClearBetSlip = () => {
    setBetSlipSelections([])
  }

  // Place live bet
  const handlePlaceLiveBet = async (betData: any) => {
    try {
      const response = await fetch('/api/live-betting/place-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...betData,
          userId: session?.user?.id
        })
      })

      const data = await response.json()

      if (data.success) {
        // Refresh active bets
        await fetchActiveLiveBets()
        
        // Clear placed selections from bet slip
        setBetSlipSelections([])
        
        return { success: true, bet: data.liveBet }
      } else {
        throw new Error(data.error || 'Failed to place bet')
      }
    } catch (error) {
      console.error('Error placing live bet:', error)
      throw error
    }
  }

  // Cash out live bet
  const handleCashOut = async (betId: string, confirmValue?: number) => {
    try {
      const response = await fetch('/api/live-betting/cash-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          betId,
          userId: session?.user?.id,
          confirmValue
        })
      })

      const data = await response.json()

      if (data.success) {
        // Refresh active bets
        await fetchActiveLiveBets()
        return { success: true }
      } else {
        throw new Error(data.error || 'Failed to cash out')
      }
    } catch (error) {
      console.error('Error cashing out bet:', error)
      throw error
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live betting...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect
  }

  const selectedMatchData = selectedMatch ? liveMatches.find(m => m.id === selectedMatch) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <PlayerNavigation />
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🔴 Live Betting</h1>
              <p className="text-sm text-gray-600 mt-1">
                Real-time betting with enhanced odds and 2x diamond rewards
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Auto-refresh toggle */}
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span className="text-gray-600">Auto-refresh</span>
              </label>

              {/* Live matches count */}
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                {liveMatches.length} Live Matches
              </div>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'matches'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Live Matches ({liveMatches.length})
            </button>
            <button
              onClick={() => setActiveTab('my-bets')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'my-bets'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Live Bets ({activeLiveBets.length})
            </button>
            <button
              onClick={() => setActiveTab('live-feed')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'live-feed'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Live Feed
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <span className="text-red-800">{error}</span>
              <button 
                onClick={() => {
                  setError(null)
                  fetchLiveMatches()
                }}
                className="ml-auto text-red-600 hover:underline text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Live Matches Tab */}
        {activeTab === 'matches' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {liveMatches.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <div className="text-4xl mb-4">⚽</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Live Matches</h3>
                  <p className="text-gray-600">
                    There are currently no live matches available for betting.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Check back later or browse upcoming matches.
                  </p>
                </div>
              ) : (
                <>
                  {/* Live matches list */}
                  <div className="space-y-4">
                    {liveMatches.map((match) => (
                      <div key={match.id} className="relative">
                        <LiveMatchCard 
                          match={match}
                          onAddToBetSlip={handleAddToBetSlip}
                        />
                        <button
                          onClick={() => setSelectedMatch(match.id)}
                          className={`absolute top-2 right-2 px-3 py-1 text-xs rounded-full transition-colors ${
                            selectedMatch === match.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {selectedMatch === match.id ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Selected match detailed view */}
                  {selectedMatchData && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Match Details: {selectedMatchData.homeTeam.name} vs {selectedMatchData.awayTeam.name}
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <LiveMatchTimeline
                          matchId={selectedMatchData.id}
                          homeTeam={selectedMatchData.homeTeam.name}
                          awayTeam={selectedMatchData.awayTeam.name}
                          currentMinute={selectedMatchData.minute || 0}
                          homeScore={selectedMatchData.homeScore || 0}
                          awayScore={selectedMatchData.awayScore || 0}
                          autoRefresh={autoRefresh}
                        />
                        
                        <LiveOddsTracker
                          matchId={selectedMatchData.id}
                          selectedMarkets={['MATCH_RESULT', 'NEXT_GOAL', 'TOTAL_GOALS', 'BOTH_TEAMS_TO_SCORE']}
                          onOddsSelect={handleAddToBetSlip}
                          autoRefresh={autoRefresh}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar - Bet Slip */}
            <div className="space-y-6">
              <LiveBetSlip
                selections={betSlipSelections}
                onRemoveSelection={handleRemoveFromBetSlip}
                onClearAll={handleClearBetSlip}
                onPlaceBet={handlePlaceLiveBet}
                userId={session?.user?.id || ''}
              />
            </div>
          </div>
        )}

        {/* My Live Bets Tab */}
        {activeTab === 'my-bets' && (
          <div className="space-y-6">
            {activeLiveBets.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Live Bets</h3>
                <p className="text-gray-600">
                  You don't have any active live bets at the moment.
                </p>
                <button
                  onClick={() => setActiveTab('matches')}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Browse Live Matches
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeLiveBets.map((bet) => (
                  <div key={bet.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900">
                        {bet.match.homeTeam.name} vs {bet.match.awayTeam.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {bet.market} - {bet.selection}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {bet.match.minute}' - {bet.match.homeScore}-{bet.match.awayScore}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Stake:</span>
                        <span className="font-medium">{bet.stake} BP</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Potential Win:</span>
                        <span className="font-medium">{bet.potentialWin} BP</span>
                      </div>
                    </div>

                    {bet.cashOutAvailable && (
                      <div className="mt-4">
                        <CashOutButton
                          bet={bet}
                          userId={session?.user?.id || ''}
                          onCashOut={handleCashOut}
                          autoRefresh={autoRefresh}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live Feed Tab */}
        {activeTab === 'live-feed' && selectedMatchData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LiveMatchTimeline
              matchId={selectedMatchData.id}
              homeTeam={selectedMatchData.homeTeam.name}
              awayTeam={selectedMatchData.awayTeam.name}
              currentMinute={selectedMatchData.minute || 0}
              homeScore={selectedMatchData.homeScore || 0}
              awayScore={selectedMatchData.awayScore || 0}
              autoRefresh={autoRefresh}
              className="h-fit"
            />
            
            <LiveOddsTracker
              matchId={selectedMatchData.id}
              selectedMarkets={['MATCH_RESULT', 'NEXT_GOAL', 'TOTAL_GOALS']}
              onOddsSelect={handleAddToBetSlip}
              autoRefresh={autoRefresh}
              className="h-fit"
            />
          </div>
        )}
      </div>
    </div>
  )
}