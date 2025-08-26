'use client'

import { useState, useEffect } from 'react'

interface OddsSelection {
  name: string
  selection: string
  odds: number
  enhancedOdds?: number
  diamondReward: number
}

interface OddsMarket {
  market: string
  timeFrame?: string
  note?: string
  selections: OddsSelection[]
}

interface LiveOddsData {
  match: {
    id: string
    homeTeam: string
    awayTeam: string
    minute: number
    homeScore: number
    awayScore: number
    status: string
  }
  odds: OddsMarket[]
  betting: {
    available: boolean
    cashOutAvailable: boolean
    restrictions: any
    diamondMultiplier: number
    enhancedOddsAvailable: boolean
  }
  lastUpdate: string
  cacheStatus: string
}

interface LiveOddsTrackerProps {
  matchId: string
  selectedMarkets?: string[]
  autoRefresh?: boolean
  refreshInterval?: number
  onOddsSelect?: (matchId: string, market: string, selection: string, odds: number, enhancedOdds?: number) => void
  className?: string
}

export default function LiveOddsTracker({
  matchId,
  selectedMarkets = ['MATCH_RESULT', 'NEXT_GOAL', 'TOTAL_GOALS'],
  autoRefresh = true,
  refreshInterval = 20000,
  onOddsSelect,
  className = ''
}: LiveOddsTrackerProps) {
  const [oddsData, setOddsData] = useState<LiveOddsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [oddsHistory, setOddsHistory] = useState<Map<string, number[]>>(new Map())
  const [selectedMarket, setSelectedMarket] = useState(selectedMarkets[0] || 'MATCH_RESULT')

  // Fetch live odds
  const fetchOdds = async () => {
    try {
      const response = await fetch(`/api/live-betting/odds?matchId=${matchId}`)
      const data = await response.json()

      if (data.success) {
        setOddsData(data)
        setError(null)
        
        // Update odds history for trend tracking
        if (data.odds) {
          const newHistory = new Map(oddsHistory)
          data.odds.forEach((market: OddsMarket) => {
            market.selections.forEach((selection: OddsSelection) => {
              const key = `${market.market}_${selection.selection}`
              const history = newHistory.get(key) || []
              history.push(selection.odds)
              if (history.length > 10) history.shift() // Keep last 10 odds
              newHistory.set(key, history)
            })
          })
          setOddsHistory(newHistory)
        }
      } else {
        setError(data.error || 'Failed to fetch odds')
      }
    } catch (err) {
      setError('Network error fetching odds')
      console.error('Error fetching odds:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchOdds()
  }, [matchId])

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchOdds()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, matchId])

  // Get odds trend (up, down, stable)
  const getOddsTrend = (market: string, selection: string): 'up' | 'down' | 'stable' => {
    const key = `${market}_${selection}`
    const history = oddsHistory.get(key) || []
    if (history.length < 2) return 'stable'
    
    const latest = history[history.length - 1]
    const previous = history[history.length - 2]
    
    if (latest > previous) return 'up'
    if (latest < previous) return 'down'
    return 'stable'
  }

  // Get trend arrow component
  const getTrendArrow = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <span className="text-red-500 text-xs">↗️</span>
      case 'down':
        return <span className="text-green-500 text-xs">↘️</span>
      default:
        return <span className="text-gray-400 text-xs">→</span>
    }
  }

  // Format odds display
  const formatOdds = (odds: number) => {
    return (odds / 100).toFixed(2)
  }

  // Calculate profit for stake
  const calculateProfit = (odds: number, stake: number = 100) => {
    return Math.round(((odds / 100) - 1) * stake)
  }

  // Handle odds selection
  const handleOddsSelect = (market: string, selection: OddsSelection) => {
    if (onOddsSelect) {
      onOddsSelect(
        matchId,
        market,
        selection.selection,
        selection.enhancedOdds || selection.odds,
        selection.enhancedOdds
      )
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !oddsData) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-red-200 p-4 ${className}`}>
        <div className="text-center">
          <span className="text-red-600 text-sm">⚠️ {error || 'No odds data'}</span>
          <button 
            onClick={() => {
              setLoading(true)
              fetchOdds()
            }}
            className="ml-2 text-blue-600 text-sm hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const currentMarket = oddsData.odds.find(market => market.market === selectedMarket)
  const allMarkets = oddsData.odds.filter(market => selectedMarkets.includes(market.market))

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900">Live Odds Tracker</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span>
                {oddsData.match.homeTeam} vs {oddsData.match.awayTeam}
              </span>
              <span>
                {oddsData.match.minute}' - {oddsData.match.homeScore}-{oddsData.match.awayScore}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                oddsData.cacheStatus === 'fresh' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {oddsData.cacheStatus === 'fresh' ? '🔄 LIVE' : '📋 CACHED'}
              </span>
            </div>
          </div>

          {/* Betting status */}
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              oddsData.betting.available 
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {oddsData.betting.available ? 'Betting Open' : 'Betting Closed'}
            </div>
            {oddsData.betting.available && (
              <div className="text-xs text-gray-500 mt-1">
                {oddsData.betting.diamondMultiplier}x Diamond Rewards 💎
              </div>
            )}
          </div>
        </div>

        {/* Market selector */}
        <div className="flex space-x-1 mt-4 bg-gray-100 p-1 rounded-lg">
          {allMarkets.map((market) => (
            <button
              key={market.market}
              onClick={() => setSelectedMarket(market.market)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                selectedMarket === market.market
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {market.market.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Current market odds */}
      {currentMarket && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-900">
              {currentMarket.market.replace('_', ' ')}
            </h4>
            {currentMarket.timeFrame && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {currentMarket.timeFrame}
              </span>
            )}
          </div>

          {currentMarket.note && (
            <p className="text-xs text-gray-500 mb-3">{currentMarket.note}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentMarket.selections.map((selection, index) => {
              const trend = getOddsTrend(currentMarket.market, selection.selection)
              const isEnhanced = selection.enhancedOdds && selection.enhancedOdds > selection.odds
              
              return (
                <button
                  key={index}
                  onClick={() => handleOddsSelect(currentMarket.market, selection)}
                  disabled={!oddsData.betting.available}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isEnhanced
                      ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400 hover:bg-yellow-100'
                      : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-left">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {selection.name}
                      </div>
                      {getTrendArrow(trend)}
                    </div>

                    {/* Odds display */}
                    <div className="space-y-1">
                      {isEnhanced && (
                        <div className="text-xs text-gray-500 line-through">
                          {formatOdds(selection.odds)}
                        </div>
                      )}
                      <div className={`text-lg font-bold ${
                        isEnhanced ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {formatOdds(selection.enhancedOdds || selection.odds)}
                        {isEnhanced && (
                          <span className="text-xs ml-1 bg-yellow-200 text-yellow-800 px-1 py-0.5 rounded">
                            BOOST
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Profit calculation */}
                    <div className="text-xs text-gray-500 mt-2">
                      100 BP → {calculateProfit(selection.enhancedOdds || selection.odds, 100)} BP profit
                    </div>

                    {/* Diamond reward */}
                    <div className="text-xs text-yellow-600 font-semibold mt-1">
                      +{selection.diamondReward}💎
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick odds overview for all markets */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <h5 className="text-sm font-medium text-gray-900 mb-3">Quick Overview</h5>
        <div className="space-y-2">
          {allMarkets.map((market) => (
            <div key={market.market} className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {market.market.replace('_', ' ')}:
              </span>
              <div className="flex space-x-2">
                {market.selections.slice(0, 3).map((selection, index) => (
                  <span 
                    key={index}
                    className="text-gray-900 font-medium bg-white px-2 py-1 rounded border"
                  >
                    {formatOdds(selection.enhancedOdds || selection.odds)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>
            Last updated: {new Date(oddsData.lastUpdate).toLocaleTimeString()}
          </span>
          {autoRefresh && (
            <span>
              🔄 Auto-refresh: {refreshInterval / 1000}s
            </span>
          )}
        </div>

        {/* Betting restrictions */}
        {oddsData.betting.restrictions && Object.values(oddsData.betting.restrictions).some(Boolean) && (
          <div className="mt-2 text-xs text-yellow-600">
            ⚠️ {Object.values(oddsData.betting.restrictions).filter(Boolean).join(', ')}
          </div>
        )}
      </div>
    </div>
  )
}