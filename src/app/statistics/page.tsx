'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PlayerNavigation from '@/components/layout/PlayerNavigation'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { Trophy, TrendingUp, Target, Award, Calendar, Clock, DollarSign, Percent } from 'lucide-react'

interface DailyStats {
  date: string
  bets: number
  won: number
  lost: number
  profit: number
}

interface LeagueStats {
  league: string
  bets: number
  winRate: number
  profit: number
}

interface MarketStats {
  market: string
  count: number
  winRate: number
}

interface TimeStats {
  hour: number
  bets: number
  winRate: number
}

export default function StatisticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month')
  
  // Mock data - would be fetched from API
  const [stats, setStats] = useState({
    overview: {
      totalBets: 156,
      wonBets: 89,
      lostBets: 67,
      winRate: 57,
      totalStaked: 45000,
      totalWon: 58500,
      profit: 13500,
      roi: 30,
      avgStake: 288,
      avgOdds: 2.15,
      biggestWin: 3500,
      biggestLoss: 1000,
      currentStreak: 3,
      bestStreak: 8,
      worstStreak: -4
    },
    dailyStats: [
      { date: 'Mon', bets: 12, won: 7, lost: 5, profit: 450 },
      { date: 'Tue', bets: 8, won: 5, lost: 3, profit: 320 },
      { date: 'Wed', bets: 15, won: 9, lost: 6, profit: -120 },
      { date: 'Thu', bets: 10, won: 6, lost: 4, profit: 580 },
      { date: 'Fri', bets: 18, won: 11, lost: 7, profit: 750 },
      { date: 'Sat', bets: 22, won: 14, lost: 8, profit: 920 },
      { date: 'Sun', bets: 19, won: 10, lost: 9, profit: 150 }
    ],
    leagueStats: [
      { league: 'Veikkausliiga', bets: 45, winRate: 62, profit: 4500 },
      { league: 'Allsvenskan', bets: 38, winRate: 58, profit: 3200 },
      { league: 'Premier League', bets: 32, winRate: 53, profit: 2100 },
      { league: 'Championship', bets: 25, winRate: 56, profit: 1800 },
      { league: 'Ykkösliiga', bets: 16, winRate: 50, profit: 1900 }
    ],
    marketStats: [
      { market: '1X2', count: 65, winRate: 58 },
      { market: 'Over/Under', count: 42, winRate: 62 },
      { market: 'Both Teams Score', count: 28, winRate: 54 },
      { market: 'Asian Handicap', count: 15, winRate: 60 },
      { market: 'Correct Score', count: 6, winRate: 33 }
    ],
    timeStats: [
      { hour: 15, bets: 25, winRate: 60 },
      { hour: 17, bets: 32, winRate: 56 },
      { hour: 19, bets: 45, winRate: 58 },
      { hour: 20, bets: 38, winRate: 55 },
      { hour: 21, bets: 16, winRate: 50 }
    ],
    monthlyProgress: [
      { month: 'Oct', profit: 2100, bets: 42 },
      { month: 'Nov', profit: 3500, bets: 48 },
      { month: 'Dec', profit: 4200, bets: 55 },
      { month: 'Jan', profit: 3700, bets: 51 }
    ]
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      // Fetch real statistics
      setTimeout(() => setLoading(false), 1000)
    }
  }, [status, router])

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  const pieData = [
    { name: 'Won', value: stats.overview.wonBets, color: '#10B981' },
    { name: 'Lost', value: stats.overview.lostBets, color: '#EF4444' }
  ]

  const radarData = stats.leagueStats.map(league => ({
    league: league.league.replace('Veikkausliiga', 'VL').replace('Allsvenskan', 'AS').replace('Premier League', 'PL'),
    winRate: league.winRate,
    fullMark: 100
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <PlayerNavigation />
        <div className="container-modern py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <PlayerNavigation />
      
      <main className="container-modern py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Personal Statistics</h1>
          <p className="text-gray-600">Analyze your betting performance and trends</p>
        </div>

        {/* Time Range Selector */}
        <div className="glass-card p-4 mb-6">
          <div className="flex gap-2">
            {(['week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last 30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats.overview.winRate}%</p>
                <p className="text-xs text-gray-500">{stats.overview.wonBets}/{stats.overview.totalBets} bets</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">ROI</p>
                <p className="text-2xl font-bold text-green-600">+{stats.overview.roi}%</p>
                <p className="text-xs text-gray-500">Return on Investment</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-green-600">+{stats.overview.profit.toLocaleString()}</p>
                <p className="text-xs text-gray-500">BetPoints</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Best Streak</p>
                <p className="text-2xl font-bold">{stats.overview.bestStreak} wins</p>
                <p className="text-xs text-gray-500">Current: {stats.overview.currentStreak}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Performance */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">Daily Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="won" fill="#10B981" name="Won" />
                <Bar dataKey="lost" fill="#EF4444" name="Lost" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Win/Loss Distribution */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">Win/Loss Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Profit Trend */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">Profit Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Profit (BP)"
                />
                <Line 
                  type="monotone" 
                  dataKey="bets" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Total Bets"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* League Performance */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">League Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="league" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar 
                  name="Win Rate %" 
                  dataKey="winRate" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.6} 
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Stats Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market Performance */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">Market Performance</h3>
            <div className="space-y-3">
              {stats.marketStats.map((market) => (
                <div key={market.market} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{market.market}</p>
                    <p className="text-sm text-gray-600">{market.count} bets</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${market.winRate >= 55 ? 'text-green-600' : 'text-gray-600'}`}>
                      {market.winRate}%
                    </p>
                    <p className="text-xs text-gray-500">win rate</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best Performing Leagues */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">Top Leagues by Profit</h3>
            <div className="space-y-3">
              {stats.leagueStats.slice(0, 5).map((league) => (
                <div key={league.league} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{league.league}</p>
                    <p className="text-sm text-gray-600">{league.bets} bets • {league.winRate}% WR</p>
                  </div>
                  <p className="font-bold text-green-600">+{league.profit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Time Analysis */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">Best Betting Times</h3>
            <div className="space-y-3">
              {stats.timeStats.map((time) => (
                <div key={time.hour} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <p className="font-medium">{time.hour}:00</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{time.bets} bets</p>
                    <p className={`text-sm font-bold ${time.winRate >= 55 ? 'text-green-600' : 'text-gray-600'}`}>
                      {time.winRate}% WR
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="glass-card p-6 mt-6">
          <h3 className="text-lg font-bold mb-4">Additional Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Average Stake</p>
              <p className="text-xl font-bold">{stats.overview.avgStake} BP</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Odds</p>
              <p className="text-xl font-bold">{stats.overview.avgOdds}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Biggest Win</p>
              <p className="text-xl font-bold text-green-600">+{stats.overview.biggestWin} BP</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Biggest Loss</p>
              <p className="text-xl font-bold text-red-600">-{stats.overview.biggestLoss} BP</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}