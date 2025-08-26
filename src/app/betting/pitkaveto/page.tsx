'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
// Removed Supabase import - using API-Football instead

interface Match {
  id: string
  league_id: string
  home_team_id: string
  away_team_id: string
  start_time: string
  status: string
  is_derby: boolean
  league: {
    name: string
    country: string
    tier: number
  }
  home_team: {
    name: string
    city: string
  }
  away_team: {
    name: string
    city: string
  }
  odds: Odds[]
}

interface Odds {
  id: string
  market: string
  home_win: number | null
  draw: number | null
  away_win: number | null
  over_25: number | null
  under_25: number | null
  btts: number | null
  enhanced_home_win: number | null
  enhanced_draw: number | null
  enhanced_away_win: number | null
}

interface PitkavetoSelection {
  matchId: string
  match: Match
  market: string
  selection: string
  odds: number
  enhancedOdds: number
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

export default function PitkavetoPage() {
  const [user, setUser] = useState<User | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedLeague, setSelectedLeague] = useState<string>('all')
  const [selections, setSelections] = useState<PitkavetoSelection[]>([])
  const [stake, setStake] = useState<number>(50)
  const [diamondBoost, setDiamondBoost] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  // const supabase = createClient() - removed, using API-Football

  useEffect(() => {
    loadUserData()
    loadUpcomingMatches()
  }, [selectedLeague])

  const loadUserData = async () => {
    // Check if user is logged in via localStorage
    const authUser = localStorage.getItem('authUser')
    
    if (!authUser) {
      router.push('/auth/login')
      return
    }

    // Load user data from localStorage or create default
    const storedUser = localStorage.getItem('userProfile')
    const userProfile = storedUser ? JSON.parse(storedUser) : {
      id: '1',
      bet_points: 10000,
      diamonds: 50,
      level: 1,
      active_bets: 0,
      max_active_bets: 3,
      max_stake_per_bet: 50
    }

    setUser(userProfile)
    setStake(Math.min(50, userProfile.max_stake_per_bet))
  }

  const loadUpcomingMatches = async () => {
    try {
      const response = await fetch('/api/matches?type=upcoming&days=7')
      const data = await response.json()
      
      if (data.success) {
        let filteredMatches = data.matches
        
        // Filter by league if needed
        if (selectedLeague !== 'all') {
          filteredMatches = data.matches.filter((match: Match) => {
            if (selectedLeague === 'finnish') {
              return match.league.country === 'Finland'
            } else if (selectedLeague === 'swedish') {
              return match.league.country === 'Sweden'
            }
            return true
          })
        }
        
        setMatches(filteredMatches)
      } else {
        console.error('Failed to load matches:', data.error)
      }
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSelection = (match: Match, market: string, selection: string, odds: number) => {
    if (!user) return

    // Check if match already selected
    const existingIndex = selections.findIndex(sel => sel.matchId === match.id)
    
    const newSelection: PitkavetoSelection = {
      matchId: match.id,
      match,
      market,
      selection,
      odds,
      enhancedOdds: getEnhancedOdds(odds)
    }

    if (existingIndex >= 0) {
      // Replace existing selection for this match
      setSelections(prev => {
        const updated = [...prev]
        updated[existingIndex] = newSelection
        return updated
      })
    } else {
      setSelections(prev => [...prev, newSelection])
    }
  }

  const removeSelection = (matchId: string) => {
    setSelections(prev => prev.filter(sel => sel.matchId !== matchId))
  }

  const getEnhancedOdds = (originalOdds: number) => {
    // Enhanced odds for free-to-play: 1.50 → 1.80-2.10
    const boost = 1.2 + (Math.random() * 0.4) // 20-60% boost
    return Math.round((originalOdds * boost))
  }

  const calculateTotalOdds = () => {
    if (selections.length === 0) return 0
    
    let totalOdds = 1
    selections.forEach(selection => {
      totalOdds *= (selection.enhancedOdds / 100)
    })
    
    // Apply diamond boost
    if (diamondBoost > 0) {
      totalOdds *= getDiamondMultiplier(diamondBoost)
    }
    
    return totalOdds
  }

  const getDiamondMultiplier = (diamonds: number) => {
    if (diamonds >= 50) return 3.0
    if (diamonds >= 25) return 2.0
    if (diamonds >= 10) return 1.5
    return 1.0
  }

  const getDiamondBoostCost = (multiplier: number) => {
    if (multiplier === 3.0) return 50
    if (multiplier === 2.0) return 25
    if (multiplier === 1.5) return 10
    return 0
  }

  const calculatePotentialWin = () => {
    if (selections.length === 0 || stake === 0) return 0
    return Math.round(stake * calculateTotalOdds())
  }

  const formatOdds = (odds: number | null) => {
    if (!odds) return '-'
    return (odds / 100).toFixed(2)
  }

  const formatEnhancedOdds = (odds: number | null) => {
    if (!odds) return '-'
    const enhanced = getEnhancedOdds(odds)
    return (enhanced / 100).toFixed(2)
  }

  const canPlaceBet = () => {
    if (!user || selections.length < 3) return false
    if (stake < 1 || stake > user.max_stake_per_bet) return false
    if (stake > user.bet_points) return false
    if (user.active_bets >= user.max_active_bets) return false
    if (diamondBoost > user.diamonds) return false
    return true
  }

  const placePitkaveto = async () => {
    if (!canPlaceBet() || !user) return

    try {
      // Place the bet
      const betData = {
        user_id: user.id,
        type: 'pitkaveto',
        stake,
        total_odds: Math.round(calculateTotalOdds() * 100),
        diamond_boost: diamondBoost > 0 ? getDiamondMultiplier(diamondBoost) : null,
        diamond_cost: diamondBoost
      }

      const { data: bet, error: betError } = await supabase
        .from('bets')
        .insert(betData)
        .select()
        .single()

      if (betError) {
        alert('Failed to place bet: ' + betError.message)
        return
      }

      // Add bet selections
      const selectionData = selections.map(selection => ({
        bet_id: bet.id,
        match_id: selection.matchId,
        market: selection.market,
        selection: selection.selection,
        odds: selection.odds,
        enhanced_odds: selection.enhancedOdds
      }))

      const { error: selectionsError } = await supabase
        .from('bet_selections')
        .insert(selectionData)

      if (selectionsError) {
        alert('Failed to save bet selections: ' + selectionsError.message)
        return
      }

      // Update user balance
      const newBetPoints = user.bet_points - stake
      const newDiamonds = user.diamonds - diamondBoost
      const newActiveBets = user.active_bets + 1
      const newTotalStaked = (user as any).total_staked + stake

      const { error: updateError } = await supabase
        .from('users')
        .update({
          bet_points: newBetPoints,
          diamonds: newDiamonds,
          active_bets: newActiveBets,
          total_staked: newTotalStaked
        })
        .eq('id', user.id)

      if (updateError) {
        alert('Failed to update balance: ' + updateError.message)
        return
      }

      // Record transactions
      await supabase.from('transactions').insert([
        {
          user_id: user.id,
          type: 'bet_placed',
          amount: stake,
          currency: 'betpoints',
          description: `Pitkäveto bet (${selections.length} selections)`,
          balance_before: user.bet_points,
          balance_after: newBetPoints,
          related_bet_id: bet.id
        },
        ...(diamondBoost > 0 ? [{
          user_id: user.id,
          type: 'diamond_spent',
          amount: diamondBoost,
          currency: 'diamonds',
          description: `Diamond boost (${getDiamondMultiplier(diamondBoost)}x)`,
          balance_before: user.diamonds,
          balance_after: newDiamonds,
          related_bet_id: bet.id
        }] : [])
      ])

      // Reset form
      setSelections([])
      setStake(50)
      setDiamondBoost(0)
      
      // Reload user data
      loadUserData()

      alert(`Pitkäveto placed successfully! Potential win: ${calculatePotentialWin()} BP`)
      
    } catch (error) {
      console.error('Error placing bet:', error)
      alert('Failed to place bet. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--nordic-bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" 
                 style={{ borderColor: 'var(--nordic-primary)' }}></div>
            <p className="mt-4" style={{ color: 'var(--nordic-text-secondary)' }}>
              Loading upcoming matches...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--nordic-bg-secondary)' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'var(--nordic-bg-primary)' }} className="shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--nordic-primary)' }}>
                  Nordic Football
                </h1>
                <span className="ml-2 px-2 py-1 text-xs rounded-full font-semibold"
                      style={{ backgroundColor: 'var(--nordic-primary)', color: 'var(--nordic-text-light)' }}>
                  PITKÄVETO
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="text-sm">
                    <span style={{ color: 'var(--nordic-text-muted)' }}>BP:</span>
                    <span className="font-bold ml-1" style={{ color: 'var(--nordic-primary)' }}>
                      {user.bet_points.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span style={{ color: 'var(--nordic-text-muted)' }}>💎:</span>
                    <span className="font-bold ml-1" style={{ color: 'var(--nordic-warning)' }}>
                      {user.diamonds}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span style={{ color: 'var(--nordic-text-muted)' }}>Bets:</span>
                    <span className="font-bold ml-1" style={{ color: 'var(--nordic-text-primary)' }}>
                      {user.active_bets}/{user.max_active_bets}
                    </span>
                  </div>
                </>
              )}
              <Link
                href="/dashboard"
                className="text-sm hover:underline"
                style={{ color: 'var(--nordic-primary)' }}
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold" style={{ color: 'var(--nordic-text-primary)' }}>
                Pitkäveto Builder
              </h2>
              <p style={{ color: 'var(--nordic-text-secondary)' }}>
                Create accumulator bets with minimum 3 selections • Enhanced odds for free-to-play
              </p>
            </div>

            {/* League Filter */}
            <div className="nordic-card mb-6">
              <div className="flex space-x-2 overflow-x-auto">
                <button
                  onClick={() => setSelectedLeague('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    selectedLeague === 'all' ? 'nordic-button-primary' : ''
                  }`}
                  style={selectedLeague !== 'all' ? { 
                    backgroundColor: 'var(--nordic-secondary-light)', 
                    color: 'var(--nordic-text-secondary)' 
                  } : {}}
                >
                  All Leagues
                </button>
                <button 
                  onClick={() => setSelectedLeague('finnish')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex items-center ${
                    selectedLeague === 'finnish' ? 'nordic-button-primary' : ''
                  }`}
                  style={selectedLeague !== 'finnish' ? { 
                    backgroundColor: 'var(--nordic-secondary-light)', 
                    color: 'var(--nordic-text-secondary)' 
                  } : {}}>
                  🇫🇮 Finnish
                </button>
                <button 
                  onClick={() => setSelectedLeague('swedish')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex items-center ${
                    selectedLeague === 'swedish' ? 'nordic-button-primary' : ''
                  }`}
                  style={selectedLeague !== 'swedish' ? { 
                    backgroundColor: 'var(--nordic-secondary-light)', 
                    color: 'var(--nordic-text-secondary)' 
                  } : {}}>
                  🇸🇪 Swedish
                </button>
              </div>
            </div>

            {/* Matches */}
            <div className="space-y-4">
              {matches.slice(0, 20).map(match => (
                <div key={match.id} className="nordic-match-card">
                  {/* Match Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm">
                        {match.league.country === 'Finland' ? '🇫🇮' : '🇸🇪'}
                      </span>
                      <span className="font-medium" style={{ color: 'var(--nordic-text-primary)' }}>
                        {match.league.name}
                      </span>
                      {match.is_derby && (
                        <span className="px-2 py-1 text-xs rounded font-semibold"
                              style={{ backgroundColor: 'var(--nordic-warning)', color: 'var(--nordic-text-primary)' }}>
                          DERBY
                        </span>
                      )}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--nordic-text-muted)' }}>
                      {new Date(match.start_time).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center flex-1">
                      <div className="font-semibold" style={{ color: 'var(--nordic-text-primary)' }}>
                        {match.home_team.name}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--nordic-text-muted)' }}>
                        {match.home_team.city}
                      </div>
                    </div>
                    <div className="px-4 py-2 text-center">
                      <div className="text-sm" style={{ color: 'var(--nordic-text-muted)' }}>vs</div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="font-semibold" style={{ color: 'var(--nordic-text-primary)' }}>
                        {match.away_team.name}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--nordic-text-muted)' }}>
                        {match.away_team.city}
                      </div>
                    </div>
                  </div>

                  {/* Odds */}
                  {match.odds.map(odds => (
                    <div key={odds.id}>
                      {odds.market === 'match_result' && (
                        <div className="grid grid-cols-3 gap-3">
                          {odds.home_win && (
                            <button
                              onClick={() => odds.home_win && addSelection(match, 'match_result', 'home', odds.enhanced_home_win || odds.home_win)}
                              className={`nordic-odds-card ${
                                selections.find(s => s.matchId === match.id && s.selection === 'home') ? 'selected' : ''
                              }`}
                            >
                              <div className="font-medium">1</div>
                              <div className="text-sm line-through" style={{ color: 'var(--nordic-text-muted)' }}>
                                {formatOdds(odds.home_win)}
                              </div>
                              <div className="font-bold" style={{ color: 'var(--nordic-success)' }}>
                                {formatEnhancedOdds(odds.home_win)}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--nordic-primary)' }}>
                                Enhanced
                              </div>
                            </button>
                          )}
                          {odds.draw && (
                            <button
                              onClick={() => odds.draw && addSelection(match, 'match_result', 'draw', odds.enhanced_draw || odds.draw)}
                              className={`nordic-odds-card ${
                                selections.find(s => s.matchId === match.id && s.selection === 'draw') ? 'selected' : ''
                              }`}
                            >
                              <div className="font-medium">X</div>
                              <div className="text-sm line-through" style={{ color: 'var(--nordic-text-muted)' }}>
                                {formatOdds(odds.draw)}
                              </div>
                              <div className="font-bold" style={{ color: 'var(--nordic-success)' }}>
                                {formatEnhancedOdds(odds.draw)}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--nordic-primary)' }}>
                                Enhanced
                              </div>
                            </button>
                          )}
                          {odds.away_win && (
                            <button
                              onClick={() => odds.away_win && addSelection(match, 'match_result', 'away', odds.enhanced_away_win || odds.away_win)}
                              className={`nordic-odds-card ${
                                selections.find(s => s.matchId === match.id && s.selection === 'away') ? 'selected' : ''
                              }`}
                            >
                              <div className="font-medium">2</div>
                              <div className="text-sm line-through" style={{ color: 'var(--nordic-text-muted)' }}>
                                {formatOdds(odds.away_win)}
                              </div>
                              <div className="font-bold" style={{ color: 'var(--nordic-success)' }}>
                                {formatEnhancedOdds(odds.away_win)}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--nordic-primary)' }}>
                                Enhanced
                              </div>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Bet Slip */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="nordic-card">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--nordic-text-primary)' }}>
                  Pitkäveto Bet Slip
                </h3>

                {/* Selections */}
                {selections.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">⚽</div>
                    <p style={{ color: 'var(--nordic-text-secondary)' }}>
                      Add minimum 3 selections to create your Pitkäveto
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {selections.map((selection, index) => (
                      <div key={index} className="border rounded-lg p-3" 
                           style={{ borderColor: 'var(--nordic-secondary-light)' }}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-sm" style={{ color: 'var(--nordic-text-primary)' }}>
                              {selection.match.home_team.name} vs {selection.match.away_team.name}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--nordic-text-secondary)' }}>
                              {selection.selection === 'home' ? '1' : selection.selection === 'draw' ? 'X' : '2'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold" style={{ color: 'var(--nordic-success)' }}>
                              {(selection.enhancedOdds / 100).toFixed(2)}
                            </div>
                            <button
                              onClick={() => removeSelection(selection.matchId)}
                              className="text-xs hover:underline"
                              style={{ color: 'var(--nordic-text-muted)' }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Diamond Boost */}
                {selections.length >= 3 && user && user.diamonds > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3" style={{ color: 'var(--nordic-text-primary)' }}>
                      Diamond Boost 💎
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setDiamondBoost(diamondBoost === 10 ? 0 : 10)}
                        className={`p-2 rounded text-sm ${diamondBoost === 10 ? 'nordic-button-primary' : ''}`}
                        style={diamondBoost !== 10 ? { 
                          backgroundColor: 'var(--nordic-secondary-light)', 
                          color: 'var(--nordic-text-secondary)' 
                        } : {}}
                        disabled={user.diamonds < 10}
                      >
                        1.5× (10💎)
                      </button>
                      <button
                        onClick={() => setDiamondBoost(diamondBoost === 25 ? 0 : 25)}
                        className={`p-2 rounded text-sm ${diamondBoost === 25 ? 'nordic-button-primary' : ''}`}
                        style={diamondBoost !== 25 ? { 
                          backgroundColor: 'var(--nordic-secondary-light)', 
                          color: 'var(--nordic-text-secondary)' 
                        } : {}}
                        disabled={user.diamonds < 25}
                      >
                        2.0× (25💎)
                      </button>
                      <button
                        onClick={() => setDiamondBoost(diamondBoost === 50 ? 0 : 50)}
                        className={`p-2 rounded text-sm col-span-2 ${diamondBoost === 50 ? 'nordic-button-primary' : ''}`}
                        style={diamondBoost !== 50 ? { 
                          backgroundColor: 'var(--nordic-secondary-light)', 
                          color: 'var(--nordic-text-secondary)' 
                        } : {}}
                        disabled={user.diamonds < 50}
                      >
                        3.0× (50💎)
                      </button>
                    </div>
                  </div>
                )}

                {/* Stake */}
                {selections.length >= 3 && (
                  <div className="mb-6">
                    <label className="block font-medium mb-2" style={{ color: 'var(--nordic-text-primary)' }}>
                      Stake (BP)
                    </label>
                    <input
                      type="number"
                      value={stake}
                      onChange={(e) => setStake(Number(e.target.value))}
                      min="1"
                      max={user?.max_stake_per_bet || 50}
                      className="nordic-input"
                    />
                    <div className="text-xs mt-1" style={{ color: 'var(--nordic-text-muted)' }}>
                      Max: {user?.max_stake_per_bet || 50} BP (Level {user?.level || 1})
                    </div>
                  </div>
                )}

                {/* Summary */}
                {selections.length >= 3 && (
                  <div className="border-t pt-4" style={{ borderColor: 'var(--nordic-secondary-light)' }}>
                    <div className="flex justify-between mb-2">
                      <span style={{ color: 'var(--nordic-text-secondary)' }}>Total Odds:</span>
                      <span className="font-bold" style={{ color: 'var(--nordic-primary)' }}>
                        {calculateTotalOdds().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span style={{ color: 'var(--nordic-text-secondary)' }}>Potential Win:</span>
                      <span className="font-bold" style={{ color: 'var(--nordic-success)' }}>
                        {calculatePotentialWin()} BP
                      </span>
                    </div>
                    
                    <button
                      onClick={placePitkaveto}
                      disabled={!canPlaceBet()}
                      className="w-full nordic-button-primary disabled:opacity-50"
                    >
                      Place Pitkäveto
                    </button>
                    
                    {selections.length < 3 && (
                      <p className="text-xs mt-2 text-center" style={{ color: 'var(--nordic-text-muted)' }}>
                        Add {3 - selections.length} more selection{3 - selections.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}