'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/currency-system'
import { getDiamondTips } from '@/lib/diamond-economy'

interface CurrencyDisplayProps {
  betPoints: number
  diamonds: number
  level: number
  xp: number
  xpRequired: number
  showTips?: boolean
  compact?: boolean
}

export default function CurrencyDisplay({
  betPoints = 0,
  diamonds = 0,
  level = 1,
  xp = 0,
  xpRequired = 100,
  showTips = false,
  compact = false
}: CurrencyDisplayProps) {
  const [tips, setTips] = useState<string[]>([])
  const [currentTip, setCurrentTip] = useState(0)
  
  // Ensure values are numbers and not undefined
  const safeBetPoints = betPoints ?? 0
  const safeDiamonds = diamonds ?? 0
  const safeLevel = level ?? 1
  const safeXp = xp ?? 0
  const safeXpRequired = xpRequired ?? 100
  
  useEffect(() => {
    if (showTips) {
      const diamondTips = getDiamondTips(safeDiamonds)
      setTips(diamondTips)
    }
  }, [safeDiamonds, showTips])
  
  useEffect(() => {
    if (tips.length > 1) {
      const interval = setInterval(() => {
        setCurrentTip((prev) => (prev + 1) % tips.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [tips])
  
  const xpProgress = (safeXp / safeXpRequired) * 100
  
  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">BP:</span>
          <span className="font-bold text-blue-600">{safeBetPoints.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">💎</span>
          <span className="font-bold text-purple-600">{safeDiamonds}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Lvl</span>
          <span className="font-bold text-green-600">{safeLevel}</span>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* BetPoints */}
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">BetPoints</div>
          <div className="text-2xl font-bold text-blue-600">
            {safeBetPoints.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">BP</div>
        </div>
        
        {/* Diamonds */}
        <div className="text-center border-x border-gray-200">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Diamonds</div>
          <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-1">
            <span>💎</span>
            <span>{safeDiamonds}</span>
          </div>
          {safeDiamonds < 10 && (
            <div className="text-xs text-orange-500">Low!</div>
          )}
        </div>
        
        {/* Level */}
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Level</div>
          <div className="text-2xl font-bold text-green-600">{safeLevel}</div>
          <div className="text-xs text-gray-400">
            {safeXp}/{safeXpRequired} XP
          </div>
        </div>
      </div>
      
      {/* XP Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress to Level {safeLevel + 1}</span>
          <span>{xpProgress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>
      
      {/* Tips */}
      {showTips && tips.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800 animate-fade-in">
            {tips[currentTip]}
          </div>
        </div>
      )}
      
      {/* Low Balance Warnings */}
      {safeBetPoints < 100 && (
        <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="text-sm text-orange-800">
            ⚠️ Low on BetPoints! Complete daily challenges or watch ads for more.
          </div>
        </div>
      )}
    </div>
  )
}