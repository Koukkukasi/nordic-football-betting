'use client'

import { useState, useEffect } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'

export default function MyBetsPage() {
  const { profile } = useUserProfile()
  const [activeTab, setActiveTab] = useState('active')
  const [bets, setBets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserBets()
  }, [])

  const fetchUserBets = async () => {
    try {
      // For now, show demo bets
      setBets([
        {
          id: '1',
          match: 'HJK Helsinki vs FC Inter Turku',
          bet: 'HJK Helsinki to win',
          odds: 1.65,
          stake: 1000,
          potentialWin: 1650,
          status: 'active',
          date: new Date().toISOString(),
          league: 'Veikkausliiga'
        },
        {
          id: '2',
          match: 'IFK Göteborg vs Malmö FF',
          bet: 'Over 2.5 Goals',
          odds: 1.85,
          stake: 500,
          potentialWin: 925,
          status: 'won',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          league: 'Allsvenskan'
        },
        {
          id: '3',
          match: 'KuPS Kuopio vs TPS Turku',
          bet: 'Draw',
          odds: 3.20,
          stake: 250,
          potentialWin: 800,
          status: 'lost',
          date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          league: 'Veikkausliiga'
        }
      ])
    } catch (error) {
      console.error('Error fetching bets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBets = bets.filter(bet => {
    if (activeTab === 'active') return bet.status === 'active'
    if (activeTab === 'won') return bet.status === 'won'
    if (activeTab === 'lost') return bet.status === 'lost'
    return true
  })

  const stats = {
    totalBets: bets.length,
    activeBets: bets.filter(b => b.status === 'active').length,
    wonBets: bets.filter(b => b.status === 'won').length,
    lostBets: bets.filter(b => b.status === 'lost').length,
    totalStaked: bets.reduce((sum, bet) => sum + bet.stake, 0),
    totalWon: bets.filter(b => b.status === 'won').reduce((sum, bet) => sum + bet.potentialWin, 0),
    winRate: bets.length > 0 ? Math.round((bets.filter(b => b.status === 'won').length / bets.filter(b => b.status !== 'active').length) * 100) || 0 : 0
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'nordic-status-warning'
      case 'won': return 'nordic-status-success'
      case 'lost': return 'nordic-status-error'
      default: return 'nordic-status-info'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '⏳'
      case 'won': return '✅'
      case 'lost': return '❌'
      default: return '❓'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen nordic-bg-secondary">
        <div className="nordic-container nordic-section">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nordic-blue mx-auto"></div>
            <p className="nordic-text-muted mt-4">Loading your bets...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen nordic-bg-secondary">
      <div className="nordic-container nordic-section-small">
        {/* Header */}
        <div className="nordic-text-center nordic-mb-2xl">
          <h1 className="nordic-heading-1 nordic-mb-md">My Bets</h1>
          <p className="nordic-body nordic-text-secondary">
            Track your betting history and active wagers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="nordic-grid-4 nordic-gap-lg nordic-mb-2xl">
          <div className="nordic-card nordic-text-center">
            <div className="nordic-text-brand text-3xl font-bold nordic-mb-sm">{stats.totalBets}</div>
            <div className="nordic-body-small nordic-text-secondary">Total Bets</div>
          </div>
          <div className="nordic-card nordic-text-center">
            <div className="nordic-text-warning text-3xl font-bold nordic-mb-sm">{stats.activeBets}</div>
            <div className="nordic-body-small nordic-text-secondary">Active Bets</div>
          </div>
          <div className="nordic-card nordic-text-center">
            <div className="nordic-text-success text-3xl font-bold nordic-mb-sm">{stats.winRate}%</div>
            <div className="nordic-body-small nordic-text-secondary">Win Rate</div>
          </div>
          <div className="nordic-card nordic-text-center">
            <div className="nordic-text-brand text-3xl font-bold nordic-mb-sm">{stats.totalWon.toLocaleString()}</div>
            <div className="nordic-body-small nordic-text-secondary">Total Won (BP)</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="nordic-mb-xl">
          <div className="nordic-flex nordic-gap-sm flex-wrap">
            {[
              { id: 'active', label: 'Active Bets', count: stats.activeBets },
              { id: 'won', label: 'Won Bets', count: stats.wonBets },
              { id: 'lost', label: 'Lost Bets', count: stats.lostBets },
              { id: 'all', label: 'All Bets', count: stats.totalBets }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nordic-flex items-center space-x-2 px-4 py-2 nordic-rounded nordic-transition ${
                  activeTab === tab.id
                    ? 'nordic-button-primary'
                    : 'nordic-button-ghost'
                }`}
              >
                <span className="font-medium">{tab.label}</span>
                <span className="nordic-status-info text-xs px-2 py-1">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bets List */}
        {filteredBets.length > 0 ? (
          <div className="space-y-4">
            {filteredBets.map((bet) => (
              <div key={bet.id} className="nordic-card">
                <div className="nordic-flex-between nordic-mb-md">
                  <div className="nordic-flex items-center space-x-3">
                    <span className="text-2xl">{getStatusIcon(bet.status)}</span>
                    <div>
                      <h3 className="nordic-heading-5">{bet.match}</h3>
                      <p className="nordic-body-small nordic-text-secondary">{bet.league}</p>
                    </div>
                  </div>
                  <div className={`${getStatusColor(bet.status)} text-sm px-3 py-1`}>
                    {bet.status.toUpperCase()}
                  </div>
                </div>

                <div className="nordic-grid-2 lg:grid-cols-4 nordic-gap-lg">
                  <div>
                    <div className="nordic-body-small nordic-text-secondary">Bet</div>
                    <div className="nordic-body font-semibold">{bet.bet}</div>
                  </div>
                  <div>
                    <div className="nordic-body-small nordic-text-secondary">Odds</div>
                    <div className="nordic-body font-semibold">{bet.odds.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="nordic-body-small nordic-text-secondary">Stake</div>
                    <div className="nordic-body font-semibold">{bet.stake.toLocaleString()} BP</div>
                  </div>
                  <div>
                    <div className="nordic-body-small nordic-text-secondary">Potential Win</div>
                    <div className="nordic-body font-semibold nordic-text-success">{bet.potentialWin.toLocaleString()} BP</div>
                  </div>
                </div>

                <div className="nordic-mt-md nordic-flex-between">
                  <div className="nordic-body-small nordic-text-secondary">
                    Placed: {new Date(bet.date).toLocaleDateString()}
                  </div>
                  {bet.status === 'active' && (
                    <div className="nordic-flex items-center space-x-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                      <span className="nordic-body-small">Live</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="nordic-text-center nordic-py-2xl">
            <div className="nordic-card max-w-md mx-auto">
              <div className="text-4xl nordic-mb-lg">🎯</div>
              <h3 className="nordic-heading-4 nordic-mb-md">
                {activeTab === 'active' ? 'No Active Bets' : 
                 activeTab === 'won' ? 'No Won Bets Yet' :
                 activeTab === 'lost' ? 'No Lost Bets' : 'No Bets Found'}
              </h3>
              <p className="nordic-body-small nordic-text-secondary nordic-mb-lg">
                {activeTab === 'active' 
                  ? 'Place your first bet to see it here!'
                  : 'Your betting history will appear here.'}
              </p>
              <a href="/matches" className="nordic-button-primary">
                Browse Matches
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}