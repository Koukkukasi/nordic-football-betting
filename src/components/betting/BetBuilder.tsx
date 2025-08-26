'use client'

import { useState } from 'react'
import { Plus, X, Info, TrendingUp, Target, Zap, DollarSign } from 'lucide-react'

interface Market {
  id: string
  name: string
  category: string
  options: MarketOption[]
}

interface MarketOption {
  id: string
  name: string
  odds: number
  probability?: number
  trend?: 'up' | 'down' | 'stable'
}

interface BetBuilderSelection {
  marketId: string
  marketName: string
  optionId: string
  optionName: string
  odds: number
}

interface BetBuilderProps {
  matchId: string
  homeTeam: string
  awayTeam: string
  onPlaceBet?: (selections: BetBuilderSelection[], stake: number) => void
}

export default function BetBuilder({ matchId, homeTeam, awayTeam, onPlaceBet }: BetBuilderProps) {
  const [selections, setSelections] = useState<BetBuilderSelection[]>([])
  const [stake, setStake] = useState(100)
  const [showInfo, setShowInfo] = useState(false)
  const [activeCategory, setActiveCategory] = useState('popular')

  // Available markets for bet builder
  const markets: Market[] = [
    // Popular Markets
    {
      id: 'result_btts',
      name: 'Match Result & Both Teams to Score',
      category: 'popular',
      options: [
        { id: 'home_yes', name: `${homeTeam} & BTTS Yes`, odds: 4.50, probability: 22, trend: 'up' },
        { id: 'home_no', name: `${homeTeam} & BTTS No`, odds: 3.25, probability: 31 },
        { id: 'draw_yes', name: 'Draw & BTTS Yes', odds: 5.50, probability: 18 },
        { id: 'draw_no', name: 'Draw & BTTS No', odds: 6.00, probability: 17 },
        { id: 'away_yes', name: `${awayTeam} & BTTS Yes`, odds: 6.50, probability: 15, trend: 'down' },
        { id: 'away_no', name: `${awayTeam} & BTTS No`, odds: 4.00, probability: 25 }
      ]
    },
    {
      id: 'result_goals',
      name: 'Match Result & Total Goals',
      category: 'popular',
      options: [
        { id: 'home_over25', name: `${homeTeam} & Over 2.5`, odds: 3.75, probability: 27 },
        { id: 'home_under25', name: `${homeTeam} & Under 2.5`, odds: 3.50, probability: 29 },
        { id: 'draw_over25', name: 'Draw & Over 2.5', odds: 6.50, probability: 15 },
        { id: 'draw_under25', name: 'Draw & Under 2.5', odds: 5.00, probability: 20 },
        { id: 'away_over25', name: `${awayTeam} & Over 2.5`, odds: 5.50, probability: 18 },
        { id: 'away_under25', name: `${awayTeam} & Under 2.5`, odds: 4.50, probability: 22 }
      ]
    },
    
    // Goal Markets
    {
      id: 'exact_goals',
      name: 'Exact Total Goals',
      category: 'goals',
      options: [
        { id: '0', name: '0 Goals', odds: 11.00, probability: 9 },
        { id: '1', name: '1 Goal', odds: 6.50, probability: 15 },
        { id: '2', name: '2 Goals', odds: 4.00, probability: 25, trend: 'stable' },
        { id: '3', name: '3 Goals', odds: 4.50, probability: 22 },
        { id: '4', name: '4 Goals', odds: 6.00, probability: 17 },
        { id: '5+', name: '5+ Goals', odds: 8.00, probability: 13 }
      ]
    },
    {
      id: 'goal_range',
      name: 'Goal Range',
      category: 'goals',
      options: [
        { id: '0-1', name: '0-1 Goals', odds: 3.50, probability: 29 },
        { id: '2-3', name: '2-3 Goals', odds: 2.00, probability: 50, trend: 'up' },
        { id: '4-5', name: '4-5 Goals', odds: 4.00, probability: 25 },
        { id: '6+', name: '6+ Goals', odds: 15.00, probability: 7 }
      ]
    },
    {
      id: 'team_goals',
      name: 'Team Goals',
      category: 'goals',
      options: [
        { id: 'home_1+', name: `${homeTeam} 1+ Goals`, odds: 1.40, probability: 71 },
        { id: 'home_2+', name: `${homeTeam} 2+ Goals`, odds: 2.50, probability: 40 },
        { id: 'home_3+', name: `${homeTeam} 3+ Goals`, odds: 5.00, probability: 20 },
        { id: 'away_1+', name: `${awayTeam} 1+ Goals`, odds: 1.60, probability: 63 },
        { id: 'away_2+', name: `${awayTeam} 2+ Goals`, odds: 3.00, probability: 33 },
        { id: 'away_3+', name: `${awayTeam} 3+ Goals`, odds: 7.00, probability: 14 }
      ]
    },
    
    // Player Markets
    {
      id: 'goalscorer',
      name: 'Anytime Goalscorer',
      category: 'players',
      options: [
        { id: 'player1', name: 'J. Andersson', odds: 2.20, probability: 45, trend: 'up' },
        { id: 'player2', name: 'M. Virtanen', odds: 2.50, probability: 40 },
        { id: 'player3', name: 'E. Lindqvist', odds: 3.00, probability: 33 },
        { id: 'player4', name: 'K. Rantanen', odds: 3.50, probability: 29 },
        { id: 'player5', name: 'T. Hakala', odds: 4.00, probability: 25 },
        { id: 'player6', name: 'S. Eriksson', odds: 4.50, probability: 22 }
      ]
    },
    {
      id: 'first_goalscorer',
      name: 'First Goalscorer',
      category: 'players',
      options: [
        { id: 'first_player1', name: 'J. Andersson', odds: 5.50, probability: 18 },
        { id: 'first_player2', name: 'M. Virtanen', odds: 6.00, probability: 17 },
        { id: 'first_player3', name: 'E. Lindqvist', odds: 7.50, probability: 13 },
        { id: 'first_player4', name: 'K. Rantanen', odds: 8.00, probability: 13 },
        { id: 'no_goal', name: 'No Goalscorer', odds: 11.00, probability: 9 }
      ]
    },
    
    // Specials
    {
      id: 'corners',
      name: 'Total Corners',
      category: 'specials',
      options: [
        { id: 'under_8', name: 'Under 8.5', odds: 2.30, probability: 43 },
        { id: '8-10', name: '8-10 Corners', odds: 3.00, probability: 33 },
        { id: '11-13', name: '11-13 Corners', odds: 3.50, probability: 29 },
        { id: 'over_13', name: 'Over 13.5', odds: 3.25, probability: 31 }
      ]
    },
    {
      id: 'cards',
      name: 'Total Cards',
      category: 'specials',
      options: [
        { id: 'under_3', name: 'Under 3.5 Cards', odds: 2.10, probability: 48 },
        { id: '3-4', name: '3-4 Cards', odds: 2.50, probability: 40, trend: 'stable' },
        { id: '5-6', name: '5-6 Cards', odds: 3.50, probability: 29 },
        { id: 'over_6', name: 'Over 6.5 Cards', odds: 5.00, probability: 20 }
      ]
    },
    {
      id: 'halftime',
      name: 'Half Time Result',
      category: 'specials',
      options: [
        { id: 'ht_home', name: `HT: ${homeTeam}`, odds: 2.80, probability: 36 },
        { id: 'ht_draw', name: 'HT: Draw', odds: 2.20, probability: 45 },
        { id: 'ht_away', name: `HT: ${awayTeam}`, odds: 3.75, probability: 27 }
      ]
    }
  ]

  const categories = [
    { id: 'popular', name: 'Popular', icon: '🔥' },
    { id: 'goals', name: 'Goals', icon: '⚽' },
    { id: 'players', name: 'Players', icon: '👤' },
    { id: 'specials', name: 'Specials', icon: '⭐' }
  ]

  const filteredMarkets = markets.filter(m => m.category === activeCategory)

  const addSelection = (market: Market, option: MarketOption) => {
    // Check if market already has a selection
    const existingIndex = selections.findIndex(s => s.marketId === market.id)
    
    const newSelection: BetBuilderSelection = {
      marketId: market.id,
      marketName: market.name,
      optionId: option.id,
      optionName: option.name,
      odds: option.odds
    }

    if (existingIndex >= 0) {
      // Replace existing selection from same market
      setSelections(prev => {
        const updated = [...prev]
        updated[existingIndex] = newSelection
        return updated
      })
    } else {
      // Add new selection
      setSelections(prev => [...prev, newSelection])
    }
  }

  const removeSelection = (marketId: string) => {
    setSelections(prev => prev.filter(s => s.marketId !== marketId))
  }

  const isOptionSelected = (marketId: string, optionId: string) => {
    return selections.some(s => s.marketId === marketId && s.optionId === optionId)
  }

  const calculateTotalOdds = () => {
    if (selections.length === 0) return 0
    return selections.reduce((total, sel) => total * sel.odds, 1)
  }

  const calculatePotentialWin = () => {
    return Math.round(stake * calculateTotalOdds())
  }

  const calculateImpliedProbability = () => {
    const totalOdds = calculateTotalOdds()
    if (totalOdds === 0) return 0
    return Math.round((1 / totalOdds) * 100)
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (!trend) return null
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />
      case 'down': return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
      case 'stable': return <span className="text-gray-400">—</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">{homeTeam} vs {awayTeam}</h3>
            <p className="text-sm text-gray-600">Custom Bet Builder</p>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Info className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        {showInfo && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Build your own custom bet by combining multiple markets. 
              Select one option from each market to create unique betting combinations 
              with enhanced odds!
            </p>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Markets */}
      <div className="space-y-4">
        {filteredMarkets.map(market => (
          <div key={market.id} className="glass-card p-4">
            <h4 className="font-medium mb-3">{market.name}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {market.options.map(option => (
                <button
                  key={option.id}
                  onClick={() => addSelection(market, option)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isOptionSelected(market.id, option.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">{option.name}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">
                      {option.odds.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1">
                      {option.probability && (
                        <span className="text-xs text-gray-500">
                          {option.probability}%
                        </span>
                      )}
                      {getTrendIcon(option.trend)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bet Slip */}
      {selections.length > 0 && (
        <div className="glass-card p-6 sticky bottom-4 border-2 border-blue-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Your Custom Bet</h3>
            <button
              onClick={() => setSelections([])}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear all
            </button>
          </div>

          {/* Selections */}
          <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
            {selections.map(sel => (
              <div key={sel.marketId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="text-xs text-gray-600">{sel.marketName}</div>
                  <div className="text-sm font-medium">{sel.optionName}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-600">{sel.odds.toFixed(2)}</span>
                  <button
                    onClick={() => removeSelection(sel.marketId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Stake Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stake (BetPoints)
            </label>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
              min="10"
              max="10000"
            />
          </div>

          {/* Summary */}
          <div className="space-y-2 p-3 bg-blue-50 rounded-lg mb-4">
            <div className="flex justify-between text-sm">
              <span>Selections:</span>
              <span className="font-medium">{selections.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Combined Odds:</span>
              <span className="font-bold text-blue-600">
                {calculateTotalOdds().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Implied Probability:</span>
              <span className="font-medium">{calculateImpliedProbability()}%</span>
            </div>
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
            onClick={() => onPlaceBet?.(selections, stake)}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Place Custom Bet
          </button>
        </div>
      )}
    </div>
  )
}