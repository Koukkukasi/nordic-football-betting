'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PlayerNavigation from '@/components/layout/PlayerNavigation'
import { Trophy, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface BetSelection {
  id: string
  market: string
  selection: string
  odds: number
  result: string | null
  match: {
    id: string
    homeTeam: string
    awayTeam: string
    league: string
    startTime: string
    status: string
    score: {
      home: number
      away: number
    } | null
  }
}

interface Bet {
  id: string
  betType: string
  stake: number
  totalOdds: number
  potentialWin: number
  status: string
  winAmount: number | null
  diamondBoost: boolean
  diamondsUsed: number
  createdAt: string
  settledAt: string | null
  selections: BetSelection[]
}

interface BetStats {
  totalBets: number
  totalStaked: number
  totalWon: number
  profit: number
  wonBets: number
  lostBets: number
  winRate: number
}

export default function BettingHistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bets, setBets] = useState<Bet[]>([])
  const [stats, setStats] = useState<BetStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'stake' | 'odds'>('date')
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      fetchBettingHistory()
    }
  }, [status, filter, sortBy, router])

  const fetchBettingHistory = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter.toUpperCase())
      }
      params.append('sortBy', sortBy === 'date' ? 'createdAt' : sortBy)
      params.append('limit', '50')

      const response = await fetch(`/api/bets/history?${params}`)
      if (!response.ok) throw new Error('Failed to fetch betting history')
      
      const data = await response.json()
      setBets(data.bets || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error('Error fetching betting history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'WON':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'LOST':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WON':
        return 'text-green-600 bg-green-50'
      case 'LOST':
        return 'text-red-600 bg-red-50'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Betting History</h1>
          <p className="text-gray-600">Track your betting performance and past wagers</p>
        </div>

        {/* Statistics Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Bets</p>
                  <p className="text-xl font-bold">{stats.totalBets}</p>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Win Rate</p>
                  <p className="text-xl font-bold">{stats.winRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${stats.profit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {stats.profit >= 0 ? 
                    <TrendingUp className="w-5 h-5 text-green-600" /> : 
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  }
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Profit</p>
                  <p className={`text-xl font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.profit >= 0 ? '+' : ''}{stats.profit.toLocaleString()} BP
                  </p>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100">
                  <span className="text-lg">📊</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Won/Lost</p>
                  <p className="text-xl font-bold">
                    <span className="text-green-600">{stats.wonBets}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-red-600">{stats.lostBets}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="glass-card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              {(['all', 'pending', 'won', 'lost'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2 ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="stake">Sort by Stake</option>
                <option value="odds">Sort by Odds</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bets List */}
        <div className="space-y-4">
          {bets.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-gray-600">No bets found</p>
            </div>
          ) : (
            bets.map((bet) => (
              <div key={bet.id} className="glass-card p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Bet Header */}
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(bet.status)}
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bet.status)}`}>
                          {bet.status}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          {formatDate(bet.createdAt)}
                        </span>
                      </div>
                      {bet.diamondBoost && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                          💎 Boosted
                        </span>
                      )}
                    </div>

                    {/* Selections */}
                    <div className="space-y-2 mb-3">
                      {bet.selections.map((selection, idx) => (
                        <div key={selection.id} className="text-sm">
                          <div className="font-medium text-gray-800">
                            {selection.match.homeTeam} vs {selection.match.awayTeam}
                          </div>
                          <div className="text-gray-600">
                            {selection.market}: {selection.selection} @ {selection.odds.toFixed(2)}
                            {selection.match.score && (
                              <span className="ml-2">
                                ({selection.match.score.home}-{selection.match.score.away})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bet Details */}
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Stake:</span>
                        <span className="ml-1 font-medium">{bet.stake} BP</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Odds:</span>
                        <span className="ml-1 font-medium">{bet.totalOdds.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          {bet.status === 'WON' ? 'Won:' : 'Potential:'}
                        </span>
                        <span className={`ml-1 font-medium ${bet.status === 'WON' ? 'text-green-600' : ''}`}>
                          {bet.status === 'WON' ? bet.winAmount : bet.potentialWin} BP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedBet(bet)}
                    className="ml-4 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bet Details Modal */}
        {selectedBet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Bet Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedBet.status)}
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBet.status)}`}>
                    {selectedBet.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Placed</p>
                    <p className="font-medium">{new Date(selectedBet.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedBet.settledAt && (
                    <div>
                      <p className="text-sm text-gray-600">Settled</p>
                      <p className="font-medium">{new Date(selectedBet.settledAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Selections</h3>
                  {selectedBet.selections.map((sel) => (
                    <div key={sel.id} className="bg-gray-50 rounded-lg p-3 mb-2">
                      <div className="font-medium">
                        {sel.match.homeTeam} vs {sel.match.awayTeam}
                      </div>
                      <div className="text-sm text-gray-600">
                        {sel.match.league} • {sel.market}: {sel.selection}
                      </div>
                      <div className="text-sm mt-1">
                        Odds: {sel.odds.toFixed(2)}
                        {sel.result && (
                          <span className={`ml-2 ${sel.result === 'WON' ? 'text-green-600' : 'text-red-600'}`}>
                            • {sel.result}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Stake</p>
                    <p className="font-bold">{selectedBet.stake} BP</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Odds</p>
                    <p className="font-bold">{selectedBet.totalOdds.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Potential Win</p>
                    <p className="font-bold">{selectedBet.potentialWin} BP</p>
                  </div>
                  {selectedBet.winAmount !== null && (
                    <div>
                      <p className="text-sm text-gray-600">Actual Win</p>
                      <p className="font-bold text-green-600">+{selectedBet.winAmount} BP</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedBet(null)}
                className="mt-6 w-full btn-blue"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}