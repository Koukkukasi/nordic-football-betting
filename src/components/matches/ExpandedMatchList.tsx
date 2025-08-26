'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import LeagueSelector from '@/components/leagues/LeagueSelector'
import { matchService } from '@/services/match-service'
import { groupMatchesByDate, groupMatchesByGameweek, getMatchTimeDisplay, isMatchUpcomingSoon } from '@/utils/date-grouping'

// Mock match data structure
export interface Match {
  id: string
  league: string
  leagueName: string
  homeTeam: string
  awayTeam: string
  homeTeamShort: string
  awayTeamShort: string
  date: Date
  odds: {
    home: number
    draw: number
    away: number
  }
  isDerby?: boolean
  derbyName?: string
  isLive?: boolean
  minute?: number
  score?: {
    home: number
    away: number
  }
}


export default function ExpandedMatchList() {
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(['premier-league'])
  const [viewMode, setViewMode] = useState<'all' | 'live' | 'upcoming'>('all')
  const [sortBy, setSortBy] = useState<'time' | 'league' | 'odds'>('time')
  const [groupBy, setGroupBy] = useState<'none' | 'date' | 'gameweek'>('date')
  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dataSource, setDataSource] = useState<'mock' | 'api'>('mock')
  
  // Fetch matches when component mounts or when filters change
  useEffect(() => {
    async function fetchMatches() {
      setIsLoading(true)
      try {
        const matches = await matchService.getMatches(selectedLeagues, {
          viewMode,
          sortBy
        })
        setAllMatches(matches)
        setDataSource(matchService.isUsingRealData() ? 'api' : 'mock')
      } catch (error) {
        console.error('Failed to fetch matches:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMatches()
  }, [selectedLeagues, viewMode, sortBy])
  
  // Matches are already filtered and sorted by the service
  const filteredMatches = allMatches
  
  // Group matches if needed
  const groupedMatches = useMemo(() => {
    if (groupBy === 'date') {
      return groupMatchesByDate(filteredMatches)
    } else if (groupBy === 'gameweek') {
      return groupMatchesByGameweek(filteredMatches)
    }
    return null
  }, [filteredMatches, groupBy])
  
  const handleLeagueToggle = (leagueId: string) => {
    setSelectedLeagues(prev => {
      if (prev.includes(leagueId)) {
        return prev.filter(id => id !== leagueId)
      }
      return [...prev, leagueId]
    })
  }
  
  const getLeagueColor = (league: string) => {
    if (league === 'premier-league') return 'bg-gradient-to-r from-purple-500 to-pink-500'
    if (league === 'championship') return 'bg-gradient-to-r from-blue-500 to-cyan-500'
    if (league.includes('finnish') || league.includes('veikkaus') || league.includes('ykkos')) return 'bg-gradient-to-r from-blue-600 to-blue-400'
    if (league.includes('swedish') || league.includes('allsvenskan') || league.includes('superettan')) return 'bg-gradient-to-r from-yellow-500 to-blue-500'
    return 'bg-gray-500'
  }
  
  return (
    <div className="space-y-6">
      {/* League Selector */}
      <div className="glass-card p-4">
        <h2 className="text-lg font-bold mb-4">Select Leagues</h2>
        <LeagueSelector 
          selectedLeagues={selectedLeagues}
          onLeagueToggle={handleLeagueToggle}
          multiSelect={true}
        />
      </div>
      
      {/* Data Source Indicator */}
      {dataSource === 'mock' && (
        <div className="glass-card p-3 mb-4 bg-yellow-50 border border-yellow-200">
          <div className="flex items-center gap-2 text-sm text-yellow-800">
            <span>⚠️</span>
            <span>Using demo data. Add your API key to .env.local to see real matches.</span>
          </div>
        </div>
      )}
      
      {/* View Controls */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          {/* View Mode */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Matches ({allMatches.length})
            </button>
            <button
              onClick={() => setViewMode('live')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'live' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🔴 Live ({allMatches.filter(m => m.isLive).length})
            </button>
            <button
              onClick={() => setViewMode('upcoming')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'upcoming' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Upcoming
            </button>
          </div>
          
          {/* Sort and Group Options */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Group by:</span>
              <select 
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
                className="px-3 py-1 rounded-lg border border-gray-300 bg-white"
              >
                <option value="none">None</option>
                <option value="date">Date</option>
                <option value="gameweek">Gameweek</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 rounded-lg border border-gray-300 bg-white"
              >
                <option value="time">Time</option>
                <option value="league">League</option>
                <option value="odds">Best Odds</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Match List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="glass-card p-8 text-center">
            <div className="text-gray-500">
              Loading matches...
            </div>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="text-gray-500">
              No matches found. Try selecting different leagues or changing filters.
            </div>
          </div>
        ) : groupBy === 'none' ? (
          filteredMatches.map((match) => (
            <div key={match.id} className="glass-card hover-lift transition-all">
              {/* League Header */}
              <div className={`${getLeagueColor(match.league)} text-white px-4 py-2 rounded-t-lg flex justify-between items-center`}>
                <span className="font-bold text-sm">{match.leagueName}</span>
                {match.isDerby && (
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">
                    🔥 {match.derbyName}
                  </span>
                )}
                {match.isLive && (
                  <span className="bg-red-600 px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                    LIVE {match.minute}'
                  </span>
                )}
              </div>
              
              {/* Match Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  {/* Teams */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">{match.homeTeam}</div>
                        {match.isLive && (
                          <div className="text-2xl font-bold text-blue-600">{match.score?.home}</div>
                        )}
                      </div>
                      
                      <div className="px-4 text-gray-500 text-lg">VS</div>
                      
                      <div className="flex-1 text-right">
                        <div className="font-semibold">{match.awayTeam}</div>
                        {match.isLive && (
                          <div className="text-2xl font-bold text-blue-600">{match.score?.away}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Odds */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button className="btn-white hover:bg-green-50 border-2 hover:border-green-500 transition-all">
                    <div className="text-xs text-gray-600">Home</div>
                    <div className="font-bold">{match.odds.home.toFixed(2)}</div>
                  </button>
                  <button className="btn-white hover:bg-green-50 border-2 hover:border-green-500 transition-all">
                    <div className="text-xs text-gray-600">Draw</div>
                    <div className="font-bold">{match.odds.draw.toFixed(2)}</div>
                  </button>
                  <button className="btn-white hover:bg-green-50 border-2 hover:border-green-500 transition-all">
                    <div className="text-xs text-gray-600">Away</div>
                    <div className="font-bold">{match.odds.away.toFixed(2)}</div>
                  </button>
                </div>
                
                {/* Match Time & Actions */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {getMatchTimeDisplay(match)}
                  </span>
                  
                  <div className="flex gap-2">
                    <Link 
                      href={`/matches/${match.id}`}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      View Markets
                    </Link>
                    {match.isLive && (
                      <Link 
                        href={`/live/${match.id}`}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors animate-pulse"
                      >
                        Live Bet 💎
                      </Link>
                    )}
                  </div>
                </div>
                
                {/* XP Indicator */}
                {match.league === 'premier-league' && (
                  <div className="mt-2 text-center text-xs text-purple-600 font-semibold">
                    1.5x XP for Premier League predictions!
                  </div>
                )}
              </div>
            </div>
          ))
        ) : groupBy === 'date' ? (
          // Date grouped view
          groupedMatches && groupMatchesByDate(filteredMatches).map(group => (
            <div key={group.id} className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {group.title}
                    {group.isLive && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">LIVE</span>}
                  </h3>
                  {group.subtitle && <p className="text-sm text-gray-600">{group.subtitle}</p>}
                </div>
                <span className="text-sm text-gray-600">
                  {group.matches.length} {group.matches.length === 1 ? 'match' : 'matches'}
                </span>
              </div>
              
              {group.matches.map((match) => (
                <div key={match.id} className="glass-card hover-lift transition-all">
                  {/* League Header */}
                  <div className={`${getLeagueColor(match.league)} text-white px-4 py-2 rounded-t-lg flex justify-between items-center`}>
                    <span className="font-bold text-sm">{match.leagueName}</span>
                    {match.isDerby && (
                      <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">
                        🔥 {match.derbyName}
                      </span>
                    )}
                    {match.isLive && (
                      <span className="bg-red-600 px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                        LIVE {match.minute}'
                      </span>
                    )}
                    {isMatchUpcomingSoon(match) && (
                      <span className="bg-orange-500 px-2 py-1 rounded-full text-xs font-semibold">
                        Starting Soon
                      </span>
                    )}
                  </div>
                  
                  {/* Match Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      {/* Teams */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold">{match.homeTeam}</div>
                            {match.isLive && (
                              <div className="text-2xl font-bold text-blue-600">{match.score?.home}</div>
                            )}
                          </div>
                          
                          <div className="px-4 text-gray-500 text-lg">VS</div>
                          
                          <div className="flex-1 text-right">
                            <div className="font-semibold">{match.awayTeam}</div>
                            {match.isLive && (
                              <div className="text-2xl font-bold text-blue-600">{match.score?.away}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Odds */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <button className="btn-white hover:bg-green-50 border-2 hover:border-green-500 transition-all">
                        <div className="text-xs text-gray-600">Home</div>
                        <div className="font-bold">{match.odds.home.toFixed(2)}</div>
                      </button>
                      <button className="btn-white hover:bg-green-50 border-2 hover:border-green-500 transition-all">
                        <div className="text-xs text-gray-600">Draw</div>
                        <div className="font-bold">{match.odds.draw.toFixed(2)}</div>
                      </button>
                      <button className="btn-white hover:bg-green-50 border-2 hover:border-green-500 transition-all">
                        <div className="text-xs text-gray-600">Away</div>
                        <div className="font-bold">{match.odds.away.toFixed(2)}</div>
                      </button>
                    </div>
                    
                    {/* Match Time & Actions */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {getMatchTimeDisplay(match)}
                      </span>
                      
                      <div className="flex gap-2">
                        <Link 
                          href={`/matches/${match.id}`}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          View Markets
                        </Link>
                        {match.isLive && (
                          <Link 
                            href={`/live/${match.id}`}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors animate-pulse"
                          >
                            Live Bet 💎
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    {/* XP Indicator */}
                    {match.league === 'premier-league' && (
                      <div className="mt-2 text-center text-xs text-purple-600 font-semibold">
                        1.5x XP for Premier League predictions!
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          // Gameweek grouped view
          groupedMatches && Array.from(groupMatchesByGameweek(filteredMatches).entries()).map(([leagueName, gameweeks]) => (
            <div key={leagueName} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">{leagueName}</h2>
              {gameweeks.map(gameweek => (
                <div key={gameweek.id} className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">
                        {gameweek.title}
                        {gameweek.isLive && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">LIVE</span>}
                      </h3>
                      <p className="text-sm text-gray-600">{gameweek.subtitle}</p>
                    </div>
                    <span className="text-sm text-gray-600">
                      {gameweek.matches.length} {gameweek.matches.length === 1 ? 'match' : 'matches'}
                    </span>
                  </div>
                  
                  <div className="grid gap-2">
                    {gameweek.matches.map(match => (
                      <div key={match.id} className="glass-card p-3 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="text-sm text-gray-600 min-w-[60px]">
                              {getMatchTimeDisplay(match)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">{match.homeTeamShort}</span>
                                {match.isLive && <span className="text-lg font-bold">{match.score?.home}</span>}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">{match.awayTeamShort}</span>
                                {match.isLive && <span className="text-lg font-bold">{match.score?.away}</span>}
                              </div>
                            </div>
                            {match.isDerby && (
                              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-semibold">
                                Derby
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1 text-xs">
                              <span className="bg-gray-100 px-2 py-1 rounded">{match.odds.home.toFixed(2)}</span>
                              <span className="bg-gray-100 px-2 py-1 rounded">{match.odds.draw.toFixed(2)}</span>
                              <span className="bg-gray-100 px-2 py-1 rounded">{match.odds.away.toFixed(2)}</span>
                            </div>
                            <Link 
                              href={`/matches/${match.id}`}
                              className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              Bet
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      
      {/* Load More */}
      {filteredMatches.length > 0 && (
        <div className="text-center">
          <button className="btn-blue hover-lift">
            Load More Matches
          </button>
        </div>
      )}
    </div>
  )
}