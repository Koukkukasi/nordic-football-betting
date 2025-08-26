'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Trophy, Zap, Info, X, Plus, Minus } from 'lucide-react'

interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  league: string
  startTime: string
  odds: {
    home: number
    draw: number
    away: number
  }
}

interface Selection {
  matchId: string
  match: Match
  market: string
  selection: string
  odds: number
  boostedOdds?: number
}

interface PitkavetoBuilderProps {
  matches: Match[]
  onPlaceBet: (selections: Selection[], stake: number, diamondBoost: number) => Promise<void>
}

export default function PitkavetoBuilder({ matches, onPlaceBet }: PitkavetoBuilderProps) {
  const { data: session } = useSession()
  const [selections, setSelections] = useState<Selection[]>([])
  const [stake, setStake] = useState(100)
  const [diamondBoost, setDiamondBoost] = useState(0)
  const [userBalance, setUserBalance] = useState({ betPoints: 10000, diamonds: 50 })
  const [placingBet, setPlacingBet] = useState(false)
  const [showTips, setShowTips] = useState(true)

  // Minimum 3 selections for Pitkäveto
  const MIN_SELECTIONS = 3
  const MAX_SELECTIONS = 12

  // Enhanced odds multipliers for F2P
  const ODDS_BOOST_MULTIPLIERS = {
    3: 1.2,   // 3 selections: 20% boost
    4: 1.3,   // 4 selections: 30% boost
    5: 1.4,   // 5 selections: 40% boost
    6: 1.5,   // 6 selections: 50% boost
    7: 1.6,   // 7+ selections: 60% boost
    8: 1.7,
    9: 1.8,
    10: 1.9,
    11: 2.0,
    12: 2.1
  }

  // Diamond boost options
  const DIAMOND_BOOSTS = [
    { diamonds: 0, multiplier: 1.0, label: 'No Boost' },
    { diamonds: 10, multiplier: 1.5, label: '1.5× Boost' },
    { diamonds: 25, multiplier: 2.0, label: '2× Boost' },
    { diamonds: 50, multiplier: 3.0, label: '3× Boost' },
    { diamonds: 100, multiplier: 5.0, label: '5× Boost' }
  ]

  const addSelection = (match: Match, market: string, selection: string, odds: number) => {
    // Check if match already selected
    const existing = selections.find(s => s.matchId === match.id)
    
    if (existing) {
      // Replace existing selection
      setSelections(prev => prev.map(s => 
        s.matchId === match.id 
          ? { ...s, market, selection, odds, boostedOdds: calculateBoostedOdds(odds) }
          : s
      ))
    } else if (selections.length < MAX_SELECTIONS) {
      // Add new selection
      setSelections(prev => [...prev, {
        matchId: match.id,
        match,
        market,
        selection,
        odds,
        boostedOdds: calculateBoostedOdds(odds)
      }])
    }
  }

  const removeSelection = (matchId: string) => {
    setSelections(prev => prev.filter(s => s.matchId !== matchId))
  }

  const isMatchSelected = (matchId: string, selection: string) => {
    return selections.some(s => s.matchId === matchId && s.selection === selection)
  }

  const calculateBoostedOdds = (baseOdds: number) => {
    const boostMultiplier = ODDS_BOOST_MULTIPLIERS[Math.min(selections.length + 1, 12) as keyof typeof ODDS_BOOST_MULTIPLIERS] || 1.2
    return Number((baseOdds * boostMultiplier).toFixed(2))
  }

  const calculateTotalOdds = () => {
    if (selections.length === 0) return 0
    
    let totalOdds = 1
    selections.forEach(s => {
      totalOdds *= (s.boostedOdds || s.odds)
    })
    
    // Apply diamond boost
    const diamondMultiplier = DIAMOND_BOOSTS.find(b => b.diamonds === diamondBoost)?.multiplier || 1
    totalOdds *= diamondMultiplier
    
    return Number(totalOdds.toFixed(2))
  }

  const calculatePotentialWin = () => {
    return Math.round(stake * calculateTotalOdds())
  }

  const calculateRiskLevel = () => {
    const totalOdds = calculateTotalOdds()
    if (totalOdds < 5) return { level: 'Low', color: 'text-green-600' }
    if (totalOdds < 20) return { level: 'Medium', color: 'text-yellow-600' }
    if (totalOdds < 100) return { level: 'High', color: 'text-orange-600' }
    return { level: 'Very High', color: 'text-red-600' }
  }

  const canPlaceBet = () => {
    return selections.length >= MIN_SELECTIONS && 
           stake > 0 && 
           stake <= userBalance.betPoints &&
           diamondBoost <= userBalance.diamonds &&
           !placingBet
  }

  const handlePlaceBet = async () => {
    if (!canPlaceBet()) return
    
    setPlacingBet(true)
    try {
      await onPlaceBet(selections, stake, diamondBoost)
      
      // Reset after successful bet
      setSelections([])
      setStake(100)
      setDiamondBoost(0)
      
      // Update balance (would be fetched from API)
      setUserBalance(prev => ({
        betPoints: prev.betPoints - stake,
        diamonds: prev.diamonds - diamondBoost
      }))
    } catch (error) {
      console.error('Failed to place bet:', error)
    } finally {
      setPlacingBet(false)
    }
  }

  const quickStakes = [50, 100, 250, 500, 1000]
  const risk = calculateRiskLevel()

  return (
    <div className="space-y-6">
      {/* Tips Banner */}
      {showTips && (
        <div className="glass-card p-4 bg-blue-50 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Pitkäveto Tips</p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Minimum 3 selections required</li>
                  <li>• More selections = Higher odds boost (up to 2.1×)</li>
                  <li>• Use diamonds for extra multipliers (up to 5×)</li>
                  <li>• Mix favorites with underdogs for best value</li>
                </ul>
              </div>
            </div>
            <button onClick={() => setShowTips(false)}>
              <X className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>
      )}

      {/* Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {matches.slice(0, 20).map(match => (
          <div key={match.id} className="glass-card p-4">
            <div className="mb-3">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs text-gray-500">{match.league}</span>
                <span className="text-xs text-gray-500">
                  {new Date(match.startTime).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="font-medium text-gray-800">
                {match.homeTeam} vs {match.awayTeam}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => addSelection(match, '1X2', 'home', match.odds.home)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  isMatchSelected(match.id, 'home')
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs text-gray-600">1</div>
                <div className="font-bold">{match.odds.home.toFixed(2)}</div>
                {isMatchSelected(match.id, 'home') && (
                  <div className="text-xs text-green-600">
                    ↑{calculateBoostedOdds(match.odds.home).toFixed(2)}
                  </div>
                )}
              </button>
              
              <button
                onClick={() => addSelection(match, '1X2', 'draw', match.odds.draw)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  isMatchSelected(match.id, 'draw')
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs text-gray-600">X</div>
                <div className="font-bold">{match.odds.draw.toFixed(2)}</div>
                {isMatchSelected(match.id, 'draw') && (
                  <div className="text-xs text-green-600">
                    ↑{calculateBoostedOdds(match.odds.draw).toFixed(2)}
                  </div>
                )}
              </button>
              
              <button
                onClick={() => addSelection(match, '1X2', 'away', match.odds.away)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  isMatchSelected(match.id, 'away')
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs text-gray-600">2</div>
                <div className="font-bold">{match.odds.away.toFixed(2)}</div>
                {isMatchSelected(match.id, 'away') && (
                  <div className="text-xs text-green-600">
                    ↑{calculateBoostedOdds(match.odds.away).toFixed(2)}
                  </div>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bet Slip */}
      <div className="glass-card p-6 sticky top-4">
        <h3 className="text-xl font-bold mb-4">Pitkäveto Slip</h3>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Selections</span>
            <span className={selections.length >= MIN_SELECTIONS ? 'text-green-600 font-medium' : 'text-gray-600'}>
              {selections.length}/{MIN_SELECTIONS} minimum
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                selections.length >= MIN_SELECTIONS ? 'bg-green-500' : 'bg-gray-400'
              }`}
              style={{ width: `${Math.min((selections.length / MIN_SELECTIONS) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Selections */}
        {selections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Add at least {MIN_SELECTIONS} selections</p>
            <p className="text-sm mt-1">to create your Pitkäveto</p>
          </div>
        ) : (
          <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
            {selections.map((sel) => (
              <div key={sel.matchId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {sel.match.homeTeam} vs {sel.match.awayTeam}
                  </div>
                  <div className="text-xs text-gray-600">
                    {sel.selection === 'home' ? '1' : sel.selection === 'draw' ? 'X' : '2'} 
                    @ {sel.boostedOdds?.toFixed(2) || sel.odds.toFixed(2)}
                    {sel.boostedOdds && (
                      <span className="text-green-600 ml-1">
                        (boosted from {sel.odds.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeSelection(sel.matchId)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {selections.length >= MIN_SELECTIONS && (
          <>
            {/* Diamond Boost */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diamond Boost 💎
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DIAMOND_BOOSTS.slice(0, 3).map(boost => (
                  <button
                    key={boost.diamonds}
                    onClick={() => setDiamondBoost(boost.diamonds)}
                    disabled={boost.diamonds > userBalance.diamonds}
                    className={`p-2 rounded-lg border-2 text-sm transition-all ${
                      diamondBoost === boost.diamonds
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${boost.diamonds > userBalance.diamonds ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="font-medium">{boost.label}</div>
                    {boost.diamonds > 0 && (
                      <div className="text-xs">{boost.diamonds} 💎</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Stake */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stake (BetPoints)
              </label>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setStake(Math.max(10, stake - 50))}
                  className="p-2 border rounded-lg hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border rounded-lg text-center font-medium"
                  min="10"
                  max={userBalance.betPoints}
                />
                <button
                  onClick={() => setStake(Math.min(userBalance.betPoints, stake + 50))}
                  className="p-2 border rounded-lg hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2">
                {quickStakes.map(amount => (
                  <button
                    key={amount}
                    onClick={() => setStake(amount)}
                    disabled={amount > userBalance.betPoints}
                    className={`flex-1 py-1 text-xs rounded border ${
                      amount > userBalance.betPoints
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg mb-4">
              <div className="flex justify-between text-sm">
                <span>Total Odds:</span>
                <span className="font-bold">{calculateTotalOdds().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Risk Level:</span>
                <span className={`font-bold ${risk.color}`}>{risk.level}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Stake:</span>
                <span className="font-medium">{stake} BP</span>
              </div>
              {diamondBoost > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Diamond Cost:</span>
                  <span className="font-medium text-purple-600">{diamondBoost} 💎</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-medium">Potential Win:</span>
                  <span className="text-xl font-bold text-green-600">
                    {calculatePotentialWin().toLocaleString()} BP
                  </span>
                </div>
              </div>
            </div>

            {/* Place Bet Button */}
            <button
              onClick={handlePlaceBet}
              disabled={!canPlaceBet()}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                canPlaceBet()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {placingBet ? 'Placing Bet...' : 'Place Pitkäveto'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}