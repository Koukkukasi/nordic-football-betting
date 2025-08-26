'use client'

import { useState } from 'react'

interface LiveMatchProps {
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
      tier: number
    }
    startTime: string
    status: string
    minute?: number
    homeScore?: number
    awayScore?: number
    isDerby: boolean
    isFeatured: boolean
    odds: Array<{
      id: string
      market: string
      homeWin?: number
      draw?: number
      awayWin?: number
      enhancedHomeWin?: number
      enhancedDraw?: number
      enhancedAwayWin?: number
      over25?: number
      under25?: number
      nextGoalHome?: number
      nextGoalAway?: number
      nextCornerHome?: number
      nextCornerAway?: number
      nextCardHome?: number
      nextCardAway?: number
    }>
    liveBettingAvailable: boolean
    diamondMultiplier: number
  }
  onAddToBetSlip: (matchId: string, market: string, selection: string, odds: number, enhancedOdds?: number) => void
}

export default function LiveMatchCard({ match, onAddToBetSlip }: LiveMatchProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'live' | 'specials'>('main')

  const formatOdds = (odds?: number) => {
    if (!odds) return '-'
    return (odds / 100).toFixed(2)
  }

  const calculateDiamondReward = (odds?: number) => {
    if (!odds) return 1
    const decimalOdds = odds / 100
    let diamonds = 1
    
    if (decimalOdds >= 5.0) diamonds = 8
    else if (decimalOdds >= 4.0) diamonds = 6
    else if (decimalOdds >= 3.0) diamonds = 4
    else if (decimalOdds >= 2.0) diamonds = 3
    else diamonds = 2
    
    // Apply live betting multiplier (2x base, 3x for derby)
    return diamonds * match.diamondMultiplier
  }

  const mainOdds = match.odds.find(o => o.market === 'MATCH_RESULT')
  const liveOdds = match.odds.find(o => o.market === 'LIVE_MARKETS')

  return (
    <div className="nordic-match-card bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Match Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm">
              {match.league.country === 'Finland' ? '🇫🇮' : '🇸🇪'}
            </span>
            <span className="font-medium text-gray-700">
              {match.league.name}
            </span>
            {match.league.tier === 1 && (
              <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 font-semibold">
                TOP TIER
              </span>
            )}
          </div>
          {match.isDerby && (
            <span className="px-2 py-1 text-xs rounded font-semibold bg-yellow-100 text-yellow-800">
              DERBY {match.diamondMultiplier}× 💎
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 animate-pulse">
            🔴 LIVE {match.minute}'
          </div>
          {!match.liveBettingAvailable && (
            <span className="text-xs text-gray-500">Betting Closed</span>
          )}
        </div>
      </div>

      {/* Teams and Score */}
      <div className="flex justify-center items-center mb-6">
        <div className="flex items-center space-x-6">
          {/* Home Team */}
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
              {match.homeTeam.logoUrl ? (
                <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-8 h-8" />
              ) : (
                <span className="text-lg">🏠</span>
              )}
            </div>
            <div className="font-semibold text-gray-900">{match.homeTeam.name}</div>
            <div className="text-sm text-gray-500">{match.homeTeam.city}</div>
          </div>

          {/* Score */}
          <div className="text-center px-6">
            <div className="text-4xl font-bold text-blue-600 mb-1">
              {match.homeScore ?? 0} - {match.awayScore ?? 0}
            </div>
            <div className="text-sm text-gray-500">
              {match.minute}' minute
            </div>
          </div>

          {/* Away Team */}
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
              {match.awayTeam.logoUrl ? (
                <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-8 h-8" />
              ) : (
                <span className="text-lg">✈️</span>
              )}
            </div>
            <div className="font-semibold text-gray-900">{match.awayTeam.name}</div>
            <div className="text-sm text-gray-500">{match.awayTeam.city}</div>
          </div>
        </div>
      </div>

      {/* Market Tabs */}
      <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('main')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'main'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Match Result
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'live'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Live Markets
        </button>
        <button
          onClick={() => setActiveTab('specials')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'specials'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Goals & Cards
        </button>
      </div>

      {/* Main Markets */}
      {activeTab === 'main' && mainOdds && (
        <div className="grid grid-cols-3 gap-3">
          {mainOdds.homeWin && (
            <button
              onClick={() => onAddToBetSlip(
                match.id, 
                'match_result', 
                'HOME', 
                mainOdds.enhancedHomeWin || mainOdds.homeWin,
                mainOdds.enhancedHomeWin
              )}
              disabled={!match.liveBettingAvailable}
              className="betting-odds-card p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <div className="font-semibold text-gray-900 mb-1">1</div>
                <div className="text-sm text-gray-500 line-through">
                  {formatOdds(mainOdds.homeWin)}
                </div>
                <div className="text-lg font-bold text-green-600">
                  {formatOdds(mainOdds.enhancedHomeWin || mainOdds.homeWin)}
                </div>
                <div className="text-xs text-yellow-600 font-semibold">
                  +{calculateDiamondReward(mainOdds.homeWin)}💎
                </div>
              </div>
            </button>
          )}

          {mainOdds.draw && (
            <button
              onClick={() => onAddToBetSlip(
                match.id, 
                'match_result', 
                'DRAW', 
                mainOdds.enhancedDraw || mainOdds.draw,
                mainOdds.enhancedDraw
              )}
              disabled={!match.liveBettingAvailable}
              className="betting-odds-card p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <div className="font-semibold text-gray-900 mb-1">X</div>
                <div className="text-sm text-gray-500 line-through">
                  {formatOdds(mainOdds.draw)}
                </div>
                <div className="text-lg font-bold text-green-600">
                  {formatOdds(mainOdds.enhancedDraw || mainOdds.draw)}
                </div>
                <div className="text-xs text-yellow-600 font-semibold">
                  +{calculateDiamondReward(mainOdds.draw)}💎
                </div>
              </div>
            </button>
          )}

          {mainOdds.awayWin && (
            <button
              onClick={() => onAddToBetSlip(
                match.id, 
                'match_result', 
                'AWAY', 
                mainOdds.enhancedAwayWin || mainOdds.awayWin,
                mainOdds.enhancedAwayWin
              )}
              disabled={!match.liveBettingAvailable}
              className="betting-odds-card p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <div className="font-semibold text-gray-900 mb-1">2</div>
                <div className="text-sm text-gray-500 line-through">
                  {formatOdds(mainOdds.awayWin)}
                </div>
                <div className="text-lg font-bold text-green-600">
                  {formatOdds(mainOdds.enhancedAwayWin || mainOdds.awayWin)}
                </div>
                <div className="text-xs text-yellow-600 font-semibold">
                  +{calculateDiamondReward(mainOdds.awayWin)}💎
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Live Markets */}
      {activeTab === 'live' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {mainOdds?.nextGoalHome && (
            <button
              onClick={() => onAddToBetSlip(match.id, 'next_goal', 'HOME', mainOdds.nextGoalHome)}
              disabled={!match.liveBettingAvailable}
              className="betting-odds-card p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Next Goal</div>
                <div className="text-sm text-gray-600">{match.homeTeam.name}</div>
                <div className="text-lg font-bold text-green-600">
                  {formatOdds(mainOdds.nextGoalHome)}
                </div>
                <div className="text-xs text-yellow-600">
                  +{calculateDiamondReward(mainOdds.nextGoalHome)}💎
                </div>
              </div>
            </button>
          )}

          {mainOdds?.nextGoalAway && (
            <button
              onClick={() => onAddToBetSlip(match.id, 'next_goal', 'AWAY', mainOdds.nextGoalAway)}
              disabled={!match.liveBettingAvailable}
              className="betting-odds-card p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Next Goal</div>
                <div className="text-sm text-gray-600">{match.awayTeam.name}</div>
                <div className="text-lg font-bold text-green-600">
                  {formatOdds(mainOdds.nextGoalAway)}
                </div>
                <div className="text-xs text-yellow-600">
                  +{calculateDiamondReward(mainOdds.nextGoalAway)}💎
                </div>
              </div>
            </button>
          )}

          {mainOdds?.nextCornerHome && (
            <button
              onClick={() => onAddToBetSlip(match.id, 'next_corner', 'HOME', mainOdds.nextCornerHome)}
              disabled={!match.liveBettingAvailable}
              className="betting-odds-card p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Next Corner</div>
                <div className="text-sm text-gray-600">{match.homeTeam.name}</div>
                <div className="text-lg font-bold text-green-600">
                  {formatOdds(mainOdds.nextCornerHome)}
                </div>
                <div className="text-xs text-yellow-600">
                  +{calculateDiamondReward(mainOdds.nextCornerHome)}💎
                </div>
              </div>
            </button>
          )}

          {mainOdds?.nextCornerAway && (
            <button
              onClick={() => onAddToBetSlip(match.id, 'next_corner', 'AWAY', mainOdds.nextCornerAway)}
              disabled={!match.liveBettingAvailable}
              className="betting-odds-card p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Next Corner</div>
                <div className="text-sm text-gray-600">{match.awayTeam.name}</div>
                <div className="text-lg font-bold text-green-600">
                  {formatOdds(mainOdds.nextCornerAway)}
                </div>
                <div className="text-xs text-yellow-600">
                  +{calculateDiamondReward(mainOdds.nextCornerAway)}💎
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Goals & Cards */}
      {activeTab === 'specials' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {mainOdds?.over25 && (
            <button
              onClick={() => onAddToBetSlip(match.id, 'total_goals', 'over_2.5', mainOdds.over25)}
              disabled={!match.liveBettingAvailable}
              className="betting-odds-card p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Over 2.5</div>
                <div className="text-sm text-gray-600">Goals</div>
                <div className="text-lg font-bold text-green-600">
                  {formatOdds(mainOdds.over25)}
                </div>
                <div className="text-xs text-yellow-600">
                  +{calculateDiamondReward(mainOdds.over25)}💎
                </div>
              </div>
            </button>
          )}

          {mainOdds?.under25 && (
            <button
              onClick={() => onAddToBetSlip(match.id, 'total_goals', 'under_2.5', mainOdds.under25)}
              disabled={!match.liveBettingAvailable}
              className="betting-odds-card p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Under 2.5</div>
                <div className="text-sm text-gray-600">Goals</div>
                <div className="text-lg font-bold text-green-600">
                  {formatOdds(mainOdds.under25)}
                </div>
                <div className="text-xs text-yellow-600">
                  +{calculateDiamondReward(mainOdds.under25)}💎
                </div>
              </div>
            </button>
          )}

          {mainOdds?.nextCardHome && (
            <button
              onClick={() => onAddToBetSlip(match.id, 'next_card', 'HOME', mainOdds.nextCardHome)}
              disabled={!match.liveBettingAvailable}
              className="betting-odds-card p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Next Card</div>
                <div className="text-sm text-gray-600">{match.homeTeam.name}</div>
                <div className="text-lg font-bold text-green-600">
                  {formatOdds(mainOdds.nextCardHome)}
                </div>
                <div className="text-xs text-yellow-600">
                  +{calculateDiamondReward(mainOdds.nextCardHome)}💎
                </div>
              </div>
            </button>
          )}

          {mainOdds?.nextCardAway && (
            <button
              onClick={() => onAddToBetSlip(match.id, 'next_card', 'AWAY', mainOdds.nextCardAway)}
              disabled={!match.liveBettingAvailable}
              className="betting-odds-card p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Next Card</div>
                <div className="text-sm text-gray-600">{match.awayTeam.name}</div>
                <div className="text-lg font-bold text-green-600">
                  {formatOdds(mainOdds.nextCardAway)}
                </div>
                <div className="text-xs text-yellow-600">
                  +{calculateDiamondReward(mainOdds.nextCardAway)}💎
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Live Betting Disabled Warning */}
      {!match.liveBettingAvailable && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600">⚠️</span>
            <span className="text-sm text-yellow-800">
              Live betting is closed for this match (75+ minutes)
            </span>
          </div>
        </div>
      )}
    </div>
  )
}