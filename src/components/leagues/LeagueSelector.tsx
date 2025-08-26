'use client'

import { useState } from 'react'
import { PREMIER_LEAGUE } from '@/data/leagues/premier-league'
import { CHAMPIONSHIP } from '@/data/leagues/championship'

export interface LeagueOption {
  id: string
  name: string
  flag: string
  tier: number
  teams: number
  badge?: string
  featured?: boolean
}

const AVAILABLE_LEAGUES: LeagueOption[] = [
  {
    id: 'premier-league',
    name: 'Premier League',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    tier: 1,
    teams: 20,
    badge: '⭐',
    featured: true
  },
  {
    id: 'championship',
    name: 'Championship',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    tier: 2,
    teams: 24,
    featured: true
  },
  {
    id: 'veikkausliiga',
    name: 'Veikkausliiga',
    flag: '🇫🇮',
    tier: 2,
    teams: 12
  },
  {
    id: 'ykkosliiga',
    name: 'Ykkösliiga',
    flag: '🇫🇮',
    tier: 3,
    teams: 10
  },
  {
    id: 'ykkonen',
    name: 'Ykkönen',
    flag: '🇫🇮',
    tier: 3,
    teams: 10
  },
  {
    id: 'allsvenskan',
    name: 'Allsvenskan',
    flag: '🇸🇪',
    tier: 2,
    teams: 16
  },
  {
    id: 'superettan',
    name: 'Superettan',
    flag: '🇸🇪',
    tier: 3,
    teams: 16
  }
]

interface LeagueSelectorProps {
  selectedLeagues: string[]
  onLeagueToggle: (leagueId: string) => void
  multiSelect?: boolean
}

export default function LeagueSelector({ 
  selectedLeagues, 
  onLeagueToggle,
  multiSelect = true 
}: LeagueSelectorProps) {
  const [showAll, setShowAll] = useState(false)
  
  const displayLeagues = showAll ? AVAILABLE_LEAGUES : AVAILABLE_LEAGUES.slice(0, 4)
  
  const handleLeagueClick = (leagueId: string) => {
    if (!multiSelect) {
      // Single select mode - replace selection
      onLeagueToggle(leagueId)
    } else {
      // Multi-select mode - toggle selection
      onLeagueToggle(leagueId)
    }
  }
  
  const getTierColor = (tier: number) => {
    switch(tier) {
      case 1: return 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300'
      case 2: return 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'
      case 3: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
      default: return 'bg-white border-gray-200'
    }
  }
  
  const getTierLabel = (tier: number) => {
    switch(tier) {
      case 1: return 'Premium'
      case 2: return 'Major'
      case 3: return 'Classic'
      default: return ''
    }
  }
  
  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div className="flex gap-2 flex-wrap">
        <button 
          onClick={() => {
            // Select all English leagues
            const englishLeagues = ['premier-league', 'championship']
            englishLeagues.forEach(id => {
              if (!selectedLeagues.includes(id)) {
                onLeagueToggle(id)
              }
            })
          }}
          className="px-3 py-1 text-xs bg-gradient-to-r from-red-500 to-blue-500 text-white rounded-full hover:scale-105 transition-transform"
        >
          🏴󠁧󠁢󠁥󠁮󠁧󠁿 English
        </button>
        
        <button 
          onClick={() => {
            // Select all Nordic leagues
            const nordicLeagues = ['veikkausliiga', 'ykkosliiga', 'ykkonen', 'allsvenskan', 'superettan']
            nordicLeagues.forEach(id => {
              if (!selectedLeagues.includes(id)) {
                onLeagueToggle(id)
              }
            })
          }}
          className="px-3 py-1 text-xs bg-gradient-to-r from-blue-500 to-yellow-500 text-white rounded-full hover:scale-105 transition-transform"
        >
          🇫🇮🇸🇪 Nordic
        </button>
        
        <button 
          onClick={() => {
            // Clear all selections
            selectedLeagues.forEach(id => onLeagueToggle(id))
          }}
          className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
        >
          Clear All
        </button>
      </div>
      
      {/* League Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {displayLeagues.map((league) => {
          const isSelected = selectedLeagues.includes(league.id)
          
          return (
            <button
              key={league.id}
              onClick={() => handleLeagueClick(league.id)}
              className={`
                relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105
                ${isSelected 
                  ? 'ring-2 ring-green-500 border-green-500 shadow-lg' 
                  : getTierColor(league.tier)
                }
              `}
            >
              {/* Featured Badge */}
              {league.featured && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  HOT
                </div>
              )}
              
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              
              {/* League Info */}
              <div className="text-center">
                <div className="text-2xl mb-1">{league.flag}</div>
                <div className="font-bold text-sm text-gray-800">
                  {league.name}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {league.teams} teams
                </div>
                
                {/* Tier Label */}
                <div className={`
                  inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-2
                  ${league.tier === 1 ? 'bg-yellow-200 text-yellow-800' :
                    league.tier === 2 ? 'bg-blue-200 text-blue-800' :
                    'bg-gray-200 text-gray-700'}
                `}>
                  {getTierLabel(league.tier)}
                  {league.badge && ` ${league.badge}`}
                </div>
              </div>
              
              {/* XP Multiplier Indicator */}
              {league.tier === 1 && (
                <div className="mt-2 text-xs text-center text-purple-600 font-semibold">
                  1.5x XP
                </div>
              )}
            </button>
          )
        })}
      </div>
      
      {/* Show More Button */}
      {!showAll && AVAILABLE_LEAGUES.length > 4 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
        >
          Show {AVAILABLE_LEAGUES.length - 4} more leagues →
        </button>
      )}
      
      {showAll && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full py-2 text-sm text-gray-600 hover:text-gray-700"
        >
          Show less ↑
        </button>
      )}
      
      {/* Selected Summary */}
      {selectedLeagues.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800">
            <span className="font-semibold">{selectedLeagues.length} leagues selected</span>
            {multiSelect && selectedLeagues.length > 1 && (
              <span className="ml-2 text-xs text-green-600">
                (Mixed-league Pitkäveto bonus: 1.3x)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}