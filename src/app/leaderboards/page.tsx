'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PlayerNavigation from '@/components/layout/PlayerNavigation'
import { createClient } from '@/lib/supabase'
import { 
  getActiveLeaderboards, 
  Leaderboard, 
  LeaderboardEntry,
  generateLeaderboardNotifications 
} from '@/lib/leaderboard-system'

export default function LeaderboardsPage() {
  const [user, setUser] = useState<any>(null)
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([])
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<Leaderboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({})
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUserData()
    loadLeaderboards()
    
    // Update time remaining every minute
    const interval = setInterval(updateTimeRemaining, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    updateTimeRemaining()
  }, [leaderboards])

  const loadUserData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/auth/login')
      return
    }

    // Mock user data
    setUser({
      id: authUser.id,
      username: 'DemoPlayer',
      betPoints: 10000,
      diamonds: 50,
      level: 1,
      favoriteTeam: 'HJK Helsinki'
    })
  }

  const loadLeaderboards = async () => {
    try {
      const activeLeaderboards = getActiveLeaderboards()
      
      // Mock data for demo
      const mockLeaderboards = activeLeaderboards.map(lb => ({
        ...lb,
        totalParticipants: Math.floor(Math.random() * 1000) + 100,
        topEntries: generateMockEntries(lb.type),
        userPosition: {
          rank: Math.floor(Math.random() * 50) + 1,
          userId: '1',
          username: 'You',
          score: Math.floor(Math.random() * 10000),
          stats: {
            totalBets: Math.floor(Math.random() * 100),
            winRate: Math.random() * 100,
            biggestWin: Math.floor(Math.random() * 5000)
          }
        }
      }))
      
      setLeaderboards(mockLeaderboards)
      if (mockLeaderboards.length > 0) {
        setSelectedLeaderboard(mockLeaderboards[0])
      }
    } finally {
      setLoading(false)
    }
  }

  const generateMockEntries = (type: string): LeaderboardEntry[] => {
    const names = ['NordicKing', 'FinnishFlash', 'SwedishSniper', 'BettingBoss', 'PitkävetoPro', 
                   'LiveLegend', 'DiamondHunter', 'StreakMaster', 'ProfitPrince', 'OddsOracle']
    
    return Array.from({ length: 10 }, (_, i) => ({
      rank: i + 1,
      userId: `user-${i + 2}`,
      username: names[i],
      favoriteTeam: ['HJK Helsinki', 'AIK Stockholm', 'Malmö FF', 'KuPS Kuopio'][Math.floor(Math.random() * 4)],
      score: Math.floor(Math.random() * 50000) * (10 - i),
      previousRank: i + 1 + Math.floor(Math.random() * 3) - 1,
      stats: {
        totalBets: Math.floor(Math.random() * 500) + 50,
        winRate: 40 + Math.random() * 30,
        biggestWin: Math.floor(Math.random() * 10000) + 1000,
        currentStreak: Math.floor(Math.random() * 10)
      }
    }))
  }

  const updateTimeRemaining = () => {
    const remaining: Record<string, string> = {}
    
    leaderboards.forEach(lb => {
      const now = Date.now()
      const end = lb.endDate.getTime()
      const diff = end - now
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        
        if (days > 0) {
          remaining[lb.id] = `${days}d ${hours}h`
        } else if (hours > 0) {
          remaining[lb.id] = `${hours}h ${minutes}m`
        } else {
          remaining[lb.id] = `${minutes}m`
        }
      } else {
        remaining[lb.id] = 'Ended'
      }
    })
    
    setTimeRemaining(remaining)
  }

  const formatScore = (score: number, type: string): string => {
    if (type.includes('PROFIT') || type.includes('LIVE')) {
      return `${score >= 0 ? '+' : ''}${score.toLocaleString()} BP`
    }
    if (type.includes('WINS') || type.includes('PITKAVETO')) {
      return `${score} wins`
    }
    if (type.includes('STREAK')) {
      return `${score} streak`
    }
    if (type.includes('DIAMONDS')) {
      return `${score} 💎`
    }
    return score.toLocaleString()
  }

  const getRankChange = (current: number, previous?: number): JSX.Element | null => {
    if (!previous || current === previous) return null
    
    if (current < previous) {
      return <span className="text-green-600 text-xs">▲ {previous - current}</span>
    }
    return <span className="text-red-600 text-xs">▼ {current - previous}</span>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PlayerNavigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Leaderboards</h1>
          <p className="text-gray-600 mt-1">Compete for glory and amazing prizes!</p>
        </div>

        {/* Leaderboard Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            {leaderboards.map(lb => (
              <button
                key={lb.id}
                onClick={() => setSelectedLeaderboard(lb)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  selectedLeaderboard?.id === lb.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div>{lb.name}</div>
                <div className="text-xs mt-1 font-normal">
                  {timeRemaining[lb.id] || 'Loading...'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedLeaderboard && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Leaderboard */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedLeaderboard.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedLeaderboard.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-gray-500">
                      {selectedLeaderboard.totalParticipants} participants
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">
                      Min {selectedLeaderboard.minBetsRequired} bets to qualify
                    </span>
                  </div>
                </div>

                {/* Your Position */}
                {selectedLeaderboard.userPosition && (
                  <div className="p-4 bg-blue-50 border-b border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-blue-600">
                          #{selectedLeaderboard.userPosition.rank}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Your Position</div>
                          <div className="text-sm text-gray-600">
                            {formatScore(selectedLeaderboard.userPosition.score, selectedLeaderboard.type)}
                          </div>
                        </div>
                      </div>
                      {getRankChange(
                        selectedLeaderboard.userPosition.rank,
                        selectedLeaderboard.userPosition.previousRank
                      )}
                    </div>
                  </div>
                )}

                {/* Top 10 */}
                <div className="divide-y divide-gray-200">
                  {selectedLeaderboard.topEntries.map(entry => (
                    <div key={entry.userId} className={`p-4 hover:bg-gray-50 ${
                      entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`text-lg font-bold ${
                            entry.rank === 1 ? 'text-yellow-600' :
                            entry.rank === 2 ? 'text-gray-500' :
                            entry.rank === 3 ? 'text-orange-600' :
                            'text-gray-700'
                          }`}>
                            {entry.rank === 1 && '🥇'}
                            {entry.rank === 2 && '🥈'}
                            {entry.rank === 3 && '🥉'}
                            {entry.rank > 3 && `#${entry.rank}`}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{entry.username}</div>
                            <div className="text-xs text-gray-500">{entry.favoriteTeam}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {formatScore(entry.score, selectedLeaderboard.type)}
                          </div>
                          <div className="flex items-center gap-2 justify-end">
                            {entry.stats && (
                              <span className="text-xs text-gray-500">
                                {entry.stats.winRate?.toFixed(0)}% WR
                              </span>
                            )}
                            {getRankChange(entry.rank, entry.previousRank)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Prize Pool & Info */}
            <div className="lg:col-span-1">
              {/* Prize Distribution */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Prize Distribution</h3>
                </div>
                <div className="p-4 space-y-3">
                  {selectedLeaderboard.prizes.slice(0, 6).map((prize, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {typeof prize.rank === 'number' ? `#${prize.rank}` : `#${prize.rank}`}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {prize.prize.betPoints.toLocaleString()} BP
                        </div>
                        <div className="text-xs text-gray-500">
                          {prize.prize.diamonds} 💎 • {prize.prize.xp} XP
                        </div>
                        {prize.prize.badge && (
                          <div className="text-xs text-purple-600 mt-1">
                            🏅 {prize.prize.badge}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {selectedLeaderboard.prizes.length > 6 && (
                    <div className="text-xs text-center text-gray-500 pt-2">
                      + {selectedLeaderboard.prizes.length - 6} more prize tiers
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Your Stats</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Rank</span>
                    <span className="font-medium">#{selectedLeaderboard.userPosition?.rank || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Bets</span>
                    <span className="font-medium">{selectedLeaderboard.userPosition?.stats?.totalBets || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Win Rate</span>
                    <span className="font-medium">
                      {selectedLeaderboard.userPosition?.stats?.winRate?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Time Left</span>
                    <span className="font-medium text-orange-600">
                      {timeRemaining[selectedLeaderboard.id]}
                    </span>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <Link
                    href="/betting/pitkaveto"
                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Place Bets to Climb
                  </Link>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Pro Tips</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Place at least {selectedLeaderboard.minBetsRequired} bets to qualify</li>
                  <li>• Higher stakes = bigger potential profits</li>
                  <li>• Consistency beats luck in the long run</li>
                  <li>• Check back daily to track your progress</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}