'use client'

import { useState, useEffect } from 'react'
import { PitkavetoSelection, calculatePitkavetoOdds, validatePitkaveto } from '@/lib/pitkaveto-system'
import { DIAMOND_BOOST_OPTIONS, canAffordBoost } from '@/lib/diamond-economy'
import { formatOdds, calculateOddsImprovement } from '@/lib/enhanced-odds-system'
import { BettingService } from '@/services/betting-service'

interface EnhancedBettingSlipProps {
  selections: PitkavetoSelection[]
  userBalance: {
    betPoints: number
    diamonds: number
    level: number
  }
  onRemoveSelection: (matchId: string) => void
  onPlaceBet: (betDetails: any) => void
  onClear: () => void
}

export default function EnhancedBettingSlip({
  selections,
  userBalance,
  onRemoveSelection,
  onPlaceBet,
  onClear
}: EnhancedBettingSlipProps) {
  const [stake, setStake] = useState(50)
  const [selectedBoost, setSelectedBoost] = useState<keyof typeof DIAMOND_BOOST_OPTIONS | null>(null)
  const [oddsCalculation, setOddsCalculation] = useState<any>(null)
  const [validation, setValidation] = useState<any>(null)
  const [isPlacing, setIsPlacing] = useState(false)
  
  const bettingService = new BettingService()
  
  useEffect(() => {
    if (selections.length > 0) {
      // Validate selections
      const validationResult = validatePitkaveto(selections)
      setValidation(validationResult)
      
      // Calculate odds
      const odds = calculatePitkavetoOdds(selections, selectedBoost || undefined)
      setOddsCalculation(odds)
    } else {
      setValidation(null)
      setOddsCalculation(null)
    }
  }, [selections, selectedBoost])
  
  const maxStake = Math.min(userBalance.betPoints, userBalance.level * 50)
  const potentialWin = oddsCalculation ? Math.round(stake * (oddsCalculation.finalOdds / 100)) : 0
  const profit = potentialWin - stake
  
  const handleBoostSelect = (boostType: keyof typeof DIAMOND_BOOST_OPTIONS | null) => {
    if (boostType && !canAffordBoost(userBalance.diamonds, boostType)) {
      return
    }
    setSelectedBoost(boostType === selectedBoost ? null : boostType)
  }
  
  const handlePlaceBet = async () => {
    if (!validation?.valid || isPlacing) return
    
    setIsPlacing(true)
    try {
      await onPlaceBet({
        selections,
        stake,
        diamondBoost: selectedBoost,
        totalOdds: oddsCalculation.finalOdds,
        potentialWin
      })
      
      // Reset slip
      setStake(50)
      setSelectedBoost(null)
      onClear()
    } catch (error) {
      console.error('Failed to place bet:', error)
    } finally {
      setIsPlacing(false)
    }
  }
  
  if (selections.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pitkäveto Slip</h3>
        <div className="text-center py-8">
          <div className="text-5xl mb-3">⚽</div>
          <p className="text-gray-500">Add at least 2 selections to create your bet</p>
          <p className="text-sm text-gray-400 mt-2">Enhanced odds • F2P bonuses • Diamond boosts</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Pitkäveto ({selections.length})
          </h3>
          <button
            onClick={onClear}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Clear all
          </button>
        </div>
      </div>
      
      {/* Selections */}
      <div className="max-h-64 overflow-y-auto">
        {selections.map((selection, index) => (
          <div key={selection.matchId} className="p-3 border-b border-gray-100 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-800">
                  {selection.matchName}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selection.market} • {selection.selection}
                </div>
                {selection.isDerby && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                    Derby +10%
                  </span>
                )}
              </div>
              <div className="text-right ml-3">
                <div className="font-bold text-green-600">
                  {formatOdds(selection.enhancedOdds)}
                </div>
                <div className="text-xs text-gray-400 line-through">
                  {formatOdds(selection.standardOdds)}
                </div>
                <button
                  onClick={() => onRemoveSelection(selection.matchId)}
                  className="text-xs text-red-500 hover:text-red-600 mt-1"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Diamond Boosts */}
      {validation?.valid && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">💎 Diamond Boost (Optional)</h4>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(DIAMOND_BOOST_OPTIONS).map(([key, boost]) => {
              const canAfford = userBalance.diamonds >= boost.cost
              const isSelected = selectedBoost === key
              
              return (
                <button
                  key={key}
                  onClick={() => handleBoostSelect(key as keyof typeof DIAMOND_BOOST_OPTIONS)}
                  disabled={!canAfford}
                  className={`
                    p-2 rounded-lg text-xs font-medium transition-all
                    ${isSelected 
                      ? 'bg-purple-600 text-white shadow-lg transform scale-105' 
                      : canAfford
                        ? 'bg-white border border-gray-300 hover:border-purple-400 text-gray-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="font-bold">{boost.multiplier}×</div>
                  <div>{boost.cost} 💎</div>
                </button>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Stake Input */}
      {validation?.valid && (
        <div className="p-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stake (BP)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(Math.min(Number(e.target.value), maxStake))}
              min="1"
              max={maxStake}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex gap-1">
              {[50, 100, 200].map(amount => (
                <button
                  key={amount}
                  onClick={() => setStake(Math.min(amount, maxStake))}
                  disabled={amount > maxStake}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Max: {maxStake} BP (Level {userBalance.level})
          </div>
        </div>
      )}
      
      {/* Odds Breakdown */}
      {oddsCalculation && validation?.valid && (
        <div className="p-4 border-t border-gray-200 bg-blue-50">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base odds:</span>
              <span className="font-medium">{formatOdds(oddsCalculation.baseOdds)}</span>
            </div>
            {oddsCalculation.bonusReasons.map((reason, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-green-600">✓ {reason}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-2 border-t border-blue-200">
              <span>Total odds:</span>
              <span className="text-lg text-blue-600">{formatOdds(oddsCalculation.finalOdds)}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Summary & Place Bet */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        {validation?.errors && validation.errors.length > 0 && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
            {validation.errors[0]}
          </div>
        )}
        
        {validation?.valid && (
          <>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Stake:</span>
                <span className="font-medium">{stake} BP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Potential win:</span>
                <span className="font-bold text-green-600 text-lg">{potentialWin} BP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Profit:</span>
                <span className="font-medium text-green-600">+{profit} BP</span>
              </div>
            </div>
            
            <button
              onClick={handlePlaceBet}
              disabled={!validation.valid || isPlacing || stake > userBalance.betPoints}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
            >
              {isPlacing ? 'Placing bet...' : 'Place Pitkäveto'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}