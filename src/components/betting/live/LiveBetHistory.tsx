'use client'

import { useState } from 'react'
import CashOutButton from './CashOutButton'

interface LiveBet {
  id: string
  market: string
  selection: string
  odds: number
  enhancedOdds?: number
  stake: number
  potentialWin: number
  status: 'PENDING' | 'WON' | 'LOST' | 'CASHED_OUT' | 'VOID'
  placedAtMinute: number
  matchScore: { home: number, away: number, minute: number } | null
  diamondReward: number
  diamondAwarded: boolean
  
  // Cash-out info
  cashOutAvailable: boolean
  cashOutValue?: number
  cashedOut: boolean
  cashOutAt?: string
  
  // Settlement info
  settledAt?: string
  winAmount?: number
  
  // Match info
  match: {
    id: string
    homeTeam: {
      name: string
      city: string
      logoUrl?: string
    }
    awayTeam: {
      name: string
      city: string  
      logoUrl?: string
    }
    league: {
      name: string
      country: string
    }
    startTime: string
    status: string
    minute?: number
    homeScore?: number
    awayScore?: number
    isDerby: boolean
  }
  
  createdAt: string
  isLive: boolean
  canCashOut: boolean
  statusColor: string
  resultText: string
}

interface LiveBetHistoryProps {
  activeBets: LiveBet[]
  settledBets: LiveBet[]
  isLoading: boolean
  onCashOut: (betId: string) => Promise<void>
  onRefresh: () => void
}

export default function LiveBetHistory({
  activeBets,
  settledBets,
  isLoading,
  onCashOut,
  onRefresh
}: LiveBetHistoryProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'settled'>('active')

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatSelection = (bet: LiveBet) => {
    const { market, selection } = bet
    
    switch (market) {
      case 'match_result':
        if (selection === 'HOME') return `1 (${bet.match.homeTeam.name})`
        if (selection === 'AWAY') return `2 (${bet.match.awayTeam.name})`
        return 'X (Draw)'
      case 'total_goals':
        return selection.replace('_', ' ').toUpperCase()
      case 'next_goal':
        return `Next Goal - ${selection === 'HOME' ? bet.match.homeTeam.name : bet.match.awayTeam.name}`
      case 'next_corner':
        return `Next Corner - ${selection === 'HOME' ? bet.match.homeTeam.name : bet.match.awayTeam.name}`
      case 'next_card':
        return `Next Card - ${selection === 'HOME' ? bet.match.homeTeam.name : bet.match.awayTeam.name}`
      default:
        return selection
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '🔵'
      case 'WON': return '🟢'  
      case 'LOST': return '🔴'
      case 'CASHED_OUT': return '🟠'
      case 'VOID': return '⚪'
      default: return '⚫'
    }
  }

  const renderBetCard = (bet: LiveBet) => (
    <div key={bet.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-gray-900">
            {bet.match.homeTeam.name} vs {bet.match.awayTeam.name}
          </h4>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{bet.match.league.country === 'Finland' ? '🇫🇮' : '🇸🇪'}</span>
            <span>{bet.match.league.name}</span>
            {bet.match.isDerby && (
              <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700 font-semibold">
                DERBY
              </span>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-1">
            <span>{getStatusIcon(bet.status)}</span>
            <span className={`text-sm font-medium text-${bet.statusColor}-600`}>
              {bet.status}
            </span>
          </div>
          {bet.isLive && bet.match.minute && (
            <div className="text-xs text-red-600">
              LIVE {bet.match.minute}'
            </div>
          )}
        </div>
      </div>

      {/* Match Status */}
      {bet.isLive && (
        <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
          <div className="flex justify-center items-center space-x-4 text-sm">
            <span className="font-medium">{bet.match.homeTeam.name}</span>
            <span className="text-lg font-bold text-red-600">
              {bet.match.homeScore ?? 0} - {bet.match.awayScore ?? 0}
            </span>
            <span className="font-medium">{bet.match.awayTeam.name}</span>
          </div>
          <div className="text-center text-xs text-red-600 mt-1">
            {bet.match.minute}' minute
          </div>
        </div>
      )}

      {/* Bet Details */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Selection:</span>
          <span className="font-medium">{formatSelection(bet)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Odds:</span>
          <div className="flex items-center space-x-2">
            {bet.enhancedOdds && (
              <span className="text-gray-400 line-through">
                {(bet.odds).toFixed(2)}
              </span>
            )}
            <span className="font-medium text-green-600">
              {(bet.enhancedOdds || bet.odds).toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Stake:</span>
          <span className="font-medium">{bet.stake} BP</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Potential Win:</span>
          <span className="font-medium text-green-600">{bet.potentialWin} BP</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Diamond Reward:</span>
          <span className="font-medium text-yellow-600">+{bet.diamondReward}💎</span>
        </div>
      </div>

      {/* Bet Context */}
      <div className="text-xs text-gray-500 mb-3">
        <div>Placed at {bet.placedAtMinute}' minute</div>
        {bet.matchScore && (
          <div>
            Score when placed: {bet.matchScore.home}-{bet.matchScore.away}
          </div>
        )}
        <div>{formatDateTime(bet.createdAt)}</div>
      </div>

      {/* Cash Out */}
      {bet.canCashOut && (
        <div className="mt-3">
          <CashOutButton
            bet={bet}
            onCashOut={onCashOut}
          />
        </div>
      )}

      {/* Settlement Info */}
      {bet.status !== 'PENDING' && (
        <div className={`mt-3 p-3 rounded-lg ${
          bet.status === 'WON' ? 'bg-green-50 border border-green-200' :
          bet.status === 'CASHED_OUT' ? 'bg-orange-50 border border-orange-200' :
          'bg-red-50 border border-red-200'
        }`}>
          <div className="text-sm font-medium">{bet.resultText}</div>
          {bet.settledAt && (
            <div className="text-xs text-gray-500 mt-1">
              Settled: {formatDateTime(bet.settledAt)}
            </div>
          )}
        </div>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your live bets...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Live Bets</h2>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'active'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active Bets ({activeBets.length})
        </button>
        <button
          onClick={() => setActiveTab('settled')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'settled'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Settled Bets ({settledBets.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'active' ? (
        <div>
          {activeBets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📱</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Live Bets</h3>
              <p className="text-gray-600">
                Your active live bets will appear here with real-time updates and cash-out options.
              </p>
            </div>
          ) : (
            <div>
              {activeBets.map(renderBetCard)}
            </div>
          )}
        </div>
      ) : (
        <div>
          {settledBets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Settled Bets</h3>
              <p className="text-gray-600">
                Your completed live bets will appear here with settlement details.
              </p>
            </div>
          ) : (
            <div>
              {settledBets.map(renderBetCard)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}