'use client'

import { useState, useEffect } from 'react'

interface CashOutData {
  value: number
  profitLoss: number
  profitPercentage: number
  factors: {
    originalOdds: number
    currentOdds: number
    probabilityShift: number
    timeDecay: number
    margin: number
    betRunningTime: number
  }
}

interface CashOutButtonProps {
  bet: {
    id: string
    stake: number
    potentialWin: number
    cashOutValue?: number
    cashOutAvailable: boolean
    match: {
      homeTeam: { name: string }
      awayTeam: { name: string }
      minute?: number
      status: string
    }
    market: string
    selection: string
    odds: number
  }
  userId: string
  onCashOut: (betId: string, confirmValue?: number) => Promise<void>
  autoRefresh?: boolean
  refreshInterval?: number
  disabled?: boolean
}

export default function CashOutButton({ 
  bet, 
  userId, 
  onCashOut, 
  autoRefresh = true,
  refreshInterval = 30000,
  disabled = false 
}: CashOutButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isCashingOut, setIsCashingOut] = useState(false)
  const [cashOutData, setCashOutData] = useState<CashOutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [valueHistory, setValueHistory] = useState<number[]>([])
  const [showDetails, setShowDetails] = useState(false)

  // Fetch real-time cash-out value
  const fetchCashOutValue = async () => {
    try {
      const response = await fetch(`/api/live-betting/cash-out?betId=${bet.id}&userId=${userId}`)
      const data = await response.json()

      if (data.success && data.eligible) {
        setCashOutData(data.cashOut)
        setValueHistory(prev => {
          const newHistory = [...prev, data.cashOut.value]
          return newHistory.slice(-10) // Keep last 10 values
        })
        setError(null)
      } else {
        setError(data.error || 'Cash-out not available')
      }
    } catch (err) {
      setError('Failed to fetch cash-out value')
      console.error('Cash-out fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (bet.cashOutAvailable && bet.match.status === 'LIVE') {
      fetchCashOutValue()
    }
  }, [bet.id, bet.cashOutAvailable])

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !bet.cashOutAvailable || bet.match.status !== 'LIVE') return

    const interval = setInterval(() => {
      fetchCashOutValue()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, bet.id, bet.cashOutAvailable])

  // Don't render if not available
  if (!bet.cashOutAvailable || bet.match.status !== 'LIVE') {
    return null
  }

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-8 bg-gray-200 rounded mb-2"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    )
  }

  // Show error state
  if (error || !cashOutData) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-3">
        <div className="text-center text-red-600 text-sm">
          ⚠️ {error || 'Cash-out unavailable'}
        </div>
        <button 
          onClick={fetchCashOutValue}
          className="w-full mt-2 text-xs text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  const cashOutValue = cashOutData.value
  const profit = cashOutData.profitLoss
  const isProfitable = profit > 0
  const profitPercentage = cashOutData.profitPercentage

  // Calculate trend
  const getTrend = () => {
    if (valueHistory.length < 2) return 'stable'
    const current = valueHistory[valueHistory.length - 1]
    const previous = valueHistory[valueHistory.length - 2]
    if (current > previous) return 'up'
    if (current < previous) return 'down'
    return 'stable'
  }

  const trend = getTrend()
  const trendIcon = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️'

  const handleCashOut = async () => {
    if (!isConfirming) {
      setIsConfirming(true)
      return
    }

    setIsCashingOut(true)
    try {
      await onCashOut(bet.id, cashOutValue) // Pass current value for confirmation
    } catch (error) {
      console.error('Cash out failed:', error)
    } finally {
      setIsCashingOut(false)
      setIsConfirming(false)
    }
  }

  const handleCancel = () => {
    setIsConfirming(false)
  }

  if (isConfirming) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="text-center">
          <h4 className="font-medium text-gray-900 mb-2">Confirm Cash Out</h4>
          <div className="mb-3">
            <div className="text-lg font-bold text-orange-600">
              {cashOutValue} BP
            </div>
            <div className={`text-sm ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
              {isProfitable ? '+' : ''}{profit} BP ({profitPercentage >= 0 ? '+' : ''}{profitPercentage}%)
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mb-4 space-y-1">
            <div className="flex justify-between">
              <span>Original Stake:</span>
              <span>{bet.stake} BP</span>
            </div>
            <div className="flex justify-between">
              <span>Potential Win:</span>
              <span>{bet.potentialWin} BP</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Cash Out:</span>
              <span>{cashOutValue} BP</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-4">
            ⚠️ Value may change if match situation changes
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCashOut}
              disabled={isCashingOut}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {isCashingOut ? (
                <div className="flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                  Processing
                </div>
              ) : (
                'Confirm Cash Out'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      {/* Cash Out Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-orange-600">💰</span>
          <span className="text-sm font-medium text-gray-900">Live Cash Out</span>
          <span className="text-xs">{trendIcon}</span>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold transition-colors duration-300 ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-orange-600'
          }`}>
            {cashOutValue} BP
          </div>
          <div className={`text-xs ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
            {isProfitable ? '+' : ''}{profit} BP ({profitPercentage >= 0 ? '+' : ''}{profitPercentage}%)
          </div>
        </div>
      </div>

      {/* Quick comparison */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Stake: {bet.stake} BP</span>
          <span>•</span>
          <span>Potential: {bet.potentialWin} BP</span>
          <span>•</span>
          <span>Cash Out: {cashOutValue} BP</span>
        </div>
      </div>

      {/* Progress bar showing cash-out value relative to potential win */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Value Progress</span>
          <span>{Math.round((cashOutValue / bet.potentialWin) * 100)}% of potential</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              isProfitable ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, (cashOutValue / bet.potentialWin) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Cash Out Button */}
      <button
        onClick={handleCashOut}
        disabled={disabled || isCashingOut}
        className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          isProfitable 
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-orange-600 hover:bg-orange-700 text-white'
        }`}
      >
        {isCashingOut ? (
          <div className="flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Processing...
          </div>
        ) : (
          `Cash Out ${cashOutValue} BP`
        )}
      </button>

      {/* Details toggle and info */}
      <div className="mt-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-600 hover:underline"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
        
        {showDetails && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs space-y-1">
            <div className="font-medium text-gray-700 mb-2">Cash-out Factors:</div>
            <div className="grid grid-cols-2 gap-1 text-gray-600">
              <div>Original Odds: {(cashOutData.factors.originalOdds / 100).toFixed(2)}</div>
              <div>Current Odds: {(cashOutData.factors.currentOdds / 100).toFixed(2)}</div>
              <div>Time Decay: {Math.round(cashOutData.factors.timeDecay * 100)}%</div>
              <div>Running: {cashOutData.factors.betRunningTime} min</div>
            </div>
            <div className="text-gray-500 text-xs mt-2">
              💡 Value updates every {refreshInterval / 1000}s based on match progress
            </div>
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className="mt-2 flex items-center justify-center text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
          Live updates
        </div>
      )}
    </div>
  )
}