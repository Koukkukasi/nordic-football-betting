'use client'

import { useState, useEffect } from 'react'

interface BetSelection {
  matchId: string
  market: string
  selection: string
  odds: number
  enhancedOdds?: number
  match: {
    homeTeam: string
    awayTeam: string
    isDerby: boolean
    minute?: number
  }
  diamondReward: number
}

interface LiveBetSlipProps {
  selections: BetSelection[]
  isOpen: boolean
  onClose: () => void
  onRemoveSelection: (index: number) => void
  onPlaceBets: (selections: BetSelection[], stakePerBet: number) => Promise<void>
  userBalance: {
    betPoints: number
    diamonds: number
  }
  isPlacingBets: boolean
  className?: string
}

export default function LiveBetSlip({
  selections,
  isOpen,
  onClose,
  onRemoveSelection,
  onPlaceBets,
  userBalance,
  isPlacingBets,
  className = ''
}: LiveBetSlipProps) {
  const [stakePerBet, setStakePerBet] = useState(100)
  const [customStake, setCustomStake] = useState('')
  const [useCustomStake, setUseCustomStake] = useState(false)

  const currentStake = useCustomStake ? parseInt(customStake) || 0 : stakePerBet
  const totalStake = selections.length * currentStake
  const canAfford = totalStake <= userBalance.betPoints
  const totalPotentialWin = selections.reduce((sum, sel) => 
    sum + (currentStake * ((sel.enhancedOdds || sel.odds) / 100)), 0
  )
  
  // Calculate diamond rewards (2x base for live betting)
  const calculateDiamondReward = (odds: number) => {
    const decimalOdds = odds / 100
    let baseDiamonds = 1
    
    if (decimalOdds >= 5.0) baseDiamonds = 8
    else if (decimalOdds >= 4.0) baseDiamonds = 6
    else if (decimalOdds >= 3.0) baseDiamonds = 4
    else if (decimalOdds >= 2.0) baseDiamonds = 3
    else baseDiamonds = 2
    
    return baseDiamonds * 2 // 2x multiplier for live betting
  }
  
  const totalDiamondReward = selections.reduce((sum, sel) => 
    sum + sel.diamondReward, 0
  )

  const formatSelection = (selection: BetSelection) => {
    const { market, selection: sel } = selection
    
    switch (market) {
      case 'match_result':
        return sel === 'HOME' ? '1' : sel === 'DRAW' ? 'X' : '2'
      case 'total_goals':
        return sel.replace('_', ' ')
      case 'next_goal':
        return `Next Goal - ${sel === 'HOME' ? selection.match.homeTeam : sel === 'AWAY' ? selection.match.awayTeam : 'None'}`
      case 'next_corner':
        return `Next Corner - ${sel === 'HOME' ? selection.match.homeTeam : selection.match.awayTeam}`
      case 'next_card':
        return `Next Card - ${sel === 'HOME' ? selection.match.homeTeam : selection.match.awayTeam}`
      default:
        return sel
    }
  }

  const getMarketName = (market: string) => {
    switch (market) {
      case 'match_result': return 'Match Result'
      case 'total_goals': return 'Total Goals'
      case 'next_goal': return 'Next Goal'
      case 'next_corner': return 'Next Corner'
      case 'next_card': return 'Next Card'
      default: return market
    }
  }

  const handlePlaceBets = async () => {
    if (!canAfford || selections.length === 0 || isPlacingBets) return
    
    await onPlaceBets(selections, currentStake)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              🔴 Live Bet Slip ({selections.length})
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        {selections.length > 0 && (
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              2× Diamond Rewards 💎
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              Enhanced Odds
            </span>
          </div>
        )}
      </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Empty State */}
          {selections.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-600">Select odds to add to your live bet slip</p>
            </div>
          )}

          {/* Selections */}
          {selections.map((selection, index) => (
            <div key={`${selection.matchId}-${selection.market}`} className="border border-gray-200 rounded-lg p-4 mb-3 relative">
              {/* Remove Button */}
              <button
                onClick={() => onRemoveSelection(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Match Info */}
              <div className="pr-8">
                <div className="font-medium text-gray-900 mb-1">
                  {selection.match.homeTeam} vs {selection.match.awayTeam}
                </div>
                
                {/* Live Indicator */}
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 font-semibold">
                    🔴 LIVE {selection.match.minute || 0}'
                  </span>
                  <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700 font-semibold">
                    2× 💎 LIVE
                  </span>
                </div>

                {/* Selection Details */}
                <div className="text-sm text-gray-600 mb-2">
                  {getMarketName(selection.market)} - {formatSelection(selection)}
                </div>

                {/* Odds and Rewards */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {selection.enhancedOdds && (
                      <span className="text-sm text-gray-500 line-through">
                        {(selection.odds / 100).toFixed(2)}
                      </span>
                    )}
                    <span className="font-bold text-green-600">
                      {((selection.enhancedOdds || selection.odds) / 100).toFixed(2)}
                    </span>
                    {selection.enhancedOdds && (
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-1 py-0.5 rounded">
                        BOOST
                      </span>
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="text-yellow-600 font-semibold">
                      +{selection.diamondReward}💎
                    </span>
                  </div>
                </div>

                {/* Potential Win */}
                <div className="text-xs text-gray-500 mt-1">
                  Potential win: {Math.round(currentStake * ((selection.enhancedOdds || selection.odds) / 100))} BP
                </div>
              </div>
            </div>
          ))}

          {/* Stake Selection */}
          {selections.length > 0 && (
            <>
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Stake per bet</h4>
                
                {/* Quick Stakes */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[50, 100, 250, 500].map(amount => (
                    <button
                      key={amount}
                      onClick={() => {
                        setStakePerBet(amount)
                        setUseCustomStake(false)
                      }}
                      className={`py-2 px-3 text-sm font-medium rounded-md border ${
                        !useCustomStake && stakePerBet === amount
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {amount} BP
                    </button>
                  ))}
                </div>

                {/* Custom Stake */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="custom-stake"
                    checked={useCustomStake}
                    onChange={(e) => setUseCustomStake(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="custom-stake" className="text-sm text-gray-700">
                    Custom:
                  </label>
                  <input
                    type="number"
                    value={customStake}
                    onChange={(e) => setCustomStake(e.target.value)}
                    placeholder="Amount"
                    min="10"
                    max="1000"
                    className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500">BP</span>
                </div>
              </div>

              {/* Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Bets:</span>
                    <span className="font-medium">{selections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stake per bet:</span>
                    <span className="font-medium">{currentStake} BP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Stake:</span>
                    <span className="font-medium">{totalStake} BP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potential Win:</span>
                    <span className="font-bold text-green-600">{Math.round(totalPotentialWin)} BP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diamond Rewards (2× Live):</span>
                    <span className="font-bold text-yellow-600">+{totalDiamondReward}💎</span>
                  </div>
                </div>

                {/* Balance Check */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Current Balance:</span>
                    <span className="font-medium">{userBalance.betPoints.toLocaleString()} BP</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>After Bet:</span>
                    <span className={`font-medium ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                      {(userBalance.betPoints - totalStake).toLocaleString()} BP
                    </span>
                  </div>
                </div>

                {/* Place Bets Button */}
                <button
                  onClick={handlePlaceBets}
                  disabled={!canAfford || currentStake < 10 || isPlacingBets}
                  className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPlacingBets ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Placing Bets...</span>
                    </div>
                  ) : !canAfford ? (
                    'Insufficient Balance'
                  ) : (
                    `Place ${selections.length} Live Bet${selections.length !== 1 ? 's' : ''}`
                  )}
                </button>

                {/* Live Betting Notice */}
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-xs text-blue-800 space-y-1">
                    <div className="flex items-center justify-center space-x-2">
                      <span>🔴</span>
                      <span className="font-medium">Live Betting Perks</span>
                    </div>
                    <div className="text-center space-y-1">
                      <div>• Enhanced odds (30% boost)</div>
                      <div>• 2× Diamond rewards on wins</div>
                      <div>• Real-time cash-out available</div>
                      <div>• Individual bet settlement</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}