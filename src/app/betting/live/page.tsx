'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PlayerNavigation from '@/components/layout/PlayerNavigation'
import LiveMatchCard from '@/components/betting/live/LiveMatchCard'
import LiveBetSlip from '@/components/betting/live/LiveBetSlip'
import LiveBetHistory from '@/components/betting/live/LiveBetHistory'
import { useLiveBettingUpdates } from '@/lib/live-betting-realtime'
import { useUserProfile } from '@/hooks/useUserProfile'

interface LiveMatch {
  id: string
  league_id: string
  home_team_id: string
  away_team_id: string
  start_time: string
  status: string
  home_score: number | null
  away_score: number | null
  minute: number | null
  is_derby: boolean
  league: {
    name: string
    country: string
    tier: number
  }
  home_team: {
    name: string
    city: string
    is_derby_team: boolean
  }
  away_team: {
    name: string
    city: string
    is_derby_team: boolean
  }
  odds: LiveOdds[]
}

interface LiveOdds {
  id: string
  market: string
  home_win: number | null
  draw: number | null
  away_win: number | null
  over_25: number | null
  under_25: number | null
  next_goal: number | null
  next_corner: number | null
  next_card: number | null
  enhanced_home_win: number | null
  enhanced_draw: number | null
  enhanced_away_win: number | null
}

interface User {
  id: string
  bet_points: number
  diamonds: number
  level: number
  active_bets: number
  max_active_bets: number
  max_stake_per_bet: number
}

export default function LiveBettingPage() {
  const [selectedBets, setSelectedBets] = useState<any[]>([])
  const [betSlipOpen, setBetSlipOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [isPlacingBets, setIsPlacingBets] = useState(false)
  const router = useRouter()
  
  // Use user profile hook
  const { profile: user, loading, updateProfile, isAuthenticated } = useUserProfile()
  
  // Use real-time updates
  const { liveMatches, userBets, isConnected, lastUpdate, refreshData } = useLiveBettingUpdates()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [loading, isAuthenticated, router])



  const addToBetSlip = (matchId: string, market: string, selection: string, odds: number, enhancedOdds?: number) => {
    if (!user) return

    const match = liveMatches.find(m => m.id === matchId)
    if (!match) return

    // Check if betting is available
    if (!match.liveBettingAvailable) {
      alert('Betting is closed for this match')
      return
    }

    const betSelection = {
      matchId,
      match: {
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        isDerby: match.isDerby,
        minute: match.minute
      },
      market,
      selection,
      odds,
      enhancedOdds,
      diamondReward: calculateDiamondReward(enhancedOdds || odds, match.isDerby)
    }

    // Check if already selected
    const existingIndex = selectedBets.findIndex(bet => 
      bet.matchId === matchId && bet.market === market
    )

    if (existingIndex >= 0) {
      setSelectedBets(prev => {
        const updated = [...prev]
        updated[existingIndex] = betSelection
        return updated
      })
    } else {
      setSelectedBets(prev => [...prev, betSelection])
    }

    setBetSlipOpen(true)
  }


  const calculateDiamondReward = (odds: number, isDerby: boolean) => {
    const baseOdds = odds / 100
    let diamonds = 1
    
    if (baseOdds >= 5.0) diamonds = 8
    else if (baseOdds >= 4.0) diamonds = 6
    else if (baseOdds >= 3.0) diamonds = 4
    else if (baseOdds >= 2.0) diamonds = 3
    else diamonds = 2

    // 2x multiplier for live betting
    diamonds *= 2
    
    // Additional 3x for derby (total 6x)
    if (isDerby) diamonds *= 3

    return diamonds
  }



  const placeLiveBets = async (selections: any[], stakePerBet: number) => {
    if (!user) return
    
    setIsPlacingBets(true)
    let successCount = 0
    
    try {
      for (const selection of selections) {
        const response = await fetch('/api/live-betting/place-bet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            matchId: selection.matchId,
            market: selection.market,
            selection: selection.selection,
            odds: selection.odds,
            enhancedOdds: selection.enhancedOdds,
            stake: stakePerBet
          })
        })
        
        if (response.ok) {
          successCount++
          const result = await response.json()
          // Update user balance locally
          updateProfile({
            betPoints: result.userBalance
          })
        }
      }
      
      // Clear selections and close bet slip
      setSelectedBets([])
      setBetSlipOpen(false)
      
      if (successCount === selections.length) {
        alert(`${successCount} live bets placed successfully!`)
      } else {
        alert(`${successCount} of ${selections.length} bets placed successfully.`)
      }
      
      // Refresh data
      refreshData()
      
    } catch (error) {
      console.error('Error placing live bets:', error)
      alert('Failed to place bets. Please try again.')
    } finally {
      setIsPlacingBets(false)
    }
  }
  
  const handleCashOut = async (betId: string) => {
    try {
      const response = await fetch('/api/live-betting/cash-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ betId })
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(`Successfully cashed out for ${result.cashOutValue} BP`)
        
        // Update user balance
        updateProfile({
          betPoints: result.newBalance
        })
        
        // Refresh data
        refreshData()
      } else {
        const error = await response.json()
        alert(`Cash-out failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error cashing out:', error)
      alert('Failed to cash out. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Loading live betting...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <PlayerNavigation />
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">
                  Nordic Football
                </h1>
                <span className="ml-2 px-2 py-1 text-xs rounded-full font-semibold bg-red-100 text-red-700 animate-pulse">
                  🔴 LIVE
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="text-sm">
                    <span className="text-gray-500">BP:</span>
                    <span className="font-bold ml-1 text-blue-600">
                      {user.betPoints?.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">💎:</span>
                    <span className="font-bold ml-1 text-yellow-600">
                      {user.diamonds}
                    </span>
                  </div>
                </>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {showHistory ? 'Live Matches' : 'My Bets'}
                </button>
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
                >
                  ← Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Status */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
              isConnected ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
              }`}></div>
              <span>{isConnected ? 'Live Updates Active' : 'Connecting...'}</span>
            </div>
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedBets.length > 0 && (
              <button
                onClick={() => setBetSlipOpen(true)}
                className="relative bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
              >
                Bet Slip ({selectedBets.length})
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-500 text-white rounded-full text-xs flex items-center justify-center">
                  {selectedBets.length}
                </span>
              </button>
            )}
            <button
              onClick={refreshData}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        {showHistory ? (
          <LiveBetHistory
            activeBets={userBets.activeBets}
            settledBets={userBets.settledBets}
            isLoading={loading}
            onCashOut={handleCashOut}
            onRefresh={refreshData}
          />
        ) : (
          <>
            {/* Live Matches Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Live Betting
              </h2>
              <p className="text-gray-600">
                {liveMatches.length} live matches • Enhanced odds & 2x diamonds for F2P
              </p>
            </div>

            {/* No Live Matches */}
            {liveMatches.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
                <div className="text-6xl mb-4">⚽</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  No Live Matches
                </h3>
                <p className="mb-6 text-gray-600">
                  No Nordic football matches are currently live. Check back later or try other betting options!
                </p>
                <div className="space-x-4">
                  <Link href="/challenges" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700">
                    League Table Challenges
                  </Link>
                  <Link href="/betting/pitkaveto" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-300">
                    Pitkäveto Builder
                  </Link>
                </div>
              </div>
            )}

            {/* Live Matches */}
            {liveMatches.map(match => (
              <LiveMatchCard
                key={match.id}
                match={match}
                onAddToBetSlip={addToBetSlip}
              />
            ))}
          </>
        )}
      </main>

      {/* Live Bet Slip */}
      <LiveBetSlip
        selections={selectedBets}
        isOpen={betSlipOpen}
        onClose={() => setBetSlipOpen(false)}
        onRemoveSelection={(index) => {
          setSelectedBets(prev => prev.filter((_, i) => i !== index))
        }}
        onPlaceBets={placeLiveBets}
        userBalance={{
          betPoints: user?.betPoints || 0,
          diamonds: user?.diamonds || 0
        }}
        isPlacingBets={isPlacingBets}
      />
    </div>
  )
}