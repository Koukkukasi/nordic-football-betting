'use client'

import { useState, useEffect } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'
import Link from 'next/link'

export default function ProfilePage() {
  const { profile } = useUserProfile()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalBets: 15,
    wonBets: 9,
    lostBets: 4,
    activeBets: 2,
    winRate: 69,
    totalStaked: 25000,
    totalWon: 34500,
    profit: 9500,
    currentStreak: 3,
    bestStreak: 5,
    favoriteLeague: 'Veikkausliiga',
    favoriteTeam: 'HJK Helsinki'
  })

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'statistics', label: 'Statistics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'history', label: 'History', icon: '📝' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="nordic-card">
        <div className="nordic-flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full nordic-flex-center">
            <span className="text-white text-3xl">👤</span>
          </div>
          <div className="flex-1">
            <h2 className="nordic-heading-3 nordic-mb-sm">{profile?.username || 'Player'}</h2>
            <p className="nordic-body nordic-text-secondary nordic-mb-md">
              Level {profile?.level || 1} • Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}
            </p>
            <div className="nordic-flex items-center space-x-4">
              <div className="nordic-flex items-center space-x-2">
                <span className="nordic-text-brand font-bold">{(profile?.betPoints || 10000).toLocaleString()}</span>
                <span className="nordic-text-muted text-sm">BetPoints</span>
              </div>
              <div className="nordic-flex items-center space-x-2">
                <span className="text-lg">💎</span>
                <span className="nordic-text-purple font-bold">{profile?.diamonds || 50}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="nordic-grid-4 nordic-gap-lg">
        <div className="nordic-card nordic-text-center">
          <div className="nordic-text-brand text-2xl font-bold nordic-mb-sm">{stats.totalBets}</div>
          <div className="nordic-body-small nordic-text-secondary">Total Bets</div>
        </div>
        <div className="nordic-card nordic-text-center">
          <div className="nordic-text-success text-2xl font-bold nordic-mb-sm">{stats.winRate}%</div>
          <div className="nordic-body-small nordic-text-secondary">Win Rate</div>
        </div>
        <div className="nordic-card nordic-text-center">
          <div className="nordic-text-purple text-2xl font-bold nordic-mb-sm">{stats.currentStreak}</div>
          <div className="nordic-body-small nordic-text-secondary">Current Streak</div>
        </div>
        <div className="nordic-card nordic-text-center">
          <div className="nordic-text-warning text-2xl font-bold nordic-mb-sm">+{stats.profit.toLocaleString()}</div>
          <div className="nordic-body-small nordic-text-secondary">Profit (BP)</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="nordic-card">
        <h3 className="nordic-heading-4 nordic-mb-lg">Recent Activity</h3>
        <div className="space-y-3">
          <div className="nordic-flex items-center space-x-3 nordic-py-sm">
            <span className="text-xl">✅</span>
            <div className="flex-1">
              <p className="nordic-body">Won bet on HJK Helsinki vs FC Inter</p>
              <p className="nordic-body-small nordic-text-secondary">2 hours ago • +1,650 BP</p>
            </div>
          </div>
          <div className="nordic-flex items-center space-x-3 nordic-py-sm">
            <span className="text-xl">🎯</span>
            <div className="flex-1">
              <p className="nordic-body">Placed live bet on IFK Göteborg vs Malmö FF</p>
              <p className="nordic-body-small nordic-text-secondary">4 hours ago • 500 BP</p>
            </div>
          </div>
          <div className="nordic-flex items-center space-x-3 nordic-py-sm">
            <span className="text-xl">🏆</span>
            <div className="flex-1">
              <p className="nordic-body">Completed achievement: Live Master</p>
              <p className="nordic-body-small nordic-text-secondary">Yesterday • +500 BP + 25 💎</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStatistics = () => (
    <div className="space-y-6">
      {/* Betting Performance */}
      <div className="nordic-card">
        <h3 className="nordic-heading-4 nordic-mb-lg">Betting Performance</h3>
        <div className="nordic-grid-2 lg:grid-cols-4 nordic-gap-lg">
          <div className="nordic-text-center">
            <div className="nordic-text-brand text-3xl font-bold nordic-mb-sm">{stats.totalBets}</div>
            <div className="nordic-body-small nordic-text-secondary">Total Bets</div>
          </div>
          <div className="nordic-text-center">
            <div className="nordic-text-success text-3xl font-bold nordic-mb-sm">{stats.wonBets}</div>
            <div className="nordic-body-small nordic-text-secondary">Won</div>
          </div>
          <div className="nordic-text-center">
            <div className="nordic-text-error text-3xl font-bold nordic-mb-sm">{stats.lostBets}</div>
            <div className="nordic-body-small nordic-text-secondary">Lost</div>
          </div>
          <div className="nordic-text-center">
            <div className="nordic-text-warning text-3xl font-bold nordic-mb-sm">{stats.activeBets}</div>
            <div className="nordic-body-small nordic-text-secondary">Active</div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="nordic-card">
        <h3 className="nordic-heading-4 nordic-mb-lg">Financial Overview</h3>
        <div className="nordic-grid-3 nordic-gap-lg">
          <div className="nordic-text-center">
            <div className="nordic-text-blue text-2xl font-bold nordic-mb-sm">{stats.totalStaked.toLocaleString()}</div>
            <div className="nordic-body-small nordic-text-secondary">Total Staked (BP)</div>
          </div>
          <div className="nordic-text-center">
            <div className="nordic-text-green text-2xl font-bold nordic-mb-sm">{stats.totalWon.toLocaleString()}</div>
            <div className="nordic-body-small nordic-text-secondary">Total Won (BP)</div>
          </div>
          <div className="nordic-text-center">
            <div className={`text-2xl font-bold nordic-mb-sm ${stats.profit > 0 ? 'nordic-text-success' : 'nordic-text-error'}`}>
              {stats.profit > 0 ? '+' : ''}{stats.profit.toLocaleString()}
            </div>
            <div className="nordic-body-small nordic-text-secondary">Net Profit (BP)</div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="nordic-card">
        <h3 className="nordic-heading-4 nordic-mb-lg">Betting Preferences</h3>
        <div className="nordic-grid-2 nordic-gap-lg">
          <div>
            <div className="nordic-body-small nordic-text-secondary nordic-mb-sm">Favorite League</div>
            <div className="nordic-flex items-center space-x-2">
              <span className="nordic-flag-finland"></span>
              <span className="nordic-body font-semibold">{stats.favoriteLeague}</span>
            </div>
          </div>
          <div>
            <div className="nordic-body-small nordic-text-secondary nordic-mb-sm">Favorite Team</div>
            <div className="nordic-body font-semibold">{stats.favoriteTeam}</div>
          </div>
          <div>
            <div className="nordic-body-small nordic-text-secondary nordic-mb-sm">Best Streak</div>
            <div className="nordic-body font-semibold">{stats.bestStreak} wins</div>
          </div>
          <div>
            <div className="nordic-body-small nordic-text-secondary nordic-mb-sm">Current Streak</div>
            <div className="nordic-body font-semibold">{stats.currentStreak} wins</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="nordic-card">
        <h3 className="nordic-heading-4 nordic-mb-lg">Account Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="nordic-body-small nordic-text-secondary">Email</label>
            <input 
              type="email" 
              value={profile?.email || 'demo@nordic.com'} 
              className="w-full nordic-input nordic-mt-sm" 
              disabled 
            />
          </div>
          <div>
            <label className="nordic-body-small nordic-text-secondary">Username</label>
            <input 
              type="text" 
              value={profile?.username || 'DemoPlayer'} 
              className="w-full nordic-input nordic-mt-sm" 
            />
          </div>
        </div>
      </div>

      <div className="nordic-card">
        <h3 className="nordic-heading-4 nordic-mb-lg">Notifications</h3>
        <div className="space-y-4">
          <div className="nordic-flex-between">
            <div>
              <div className="nordic-body font-medium">Live Match Alerts</div>
              <div className="nordic-body-small nordic-text-secondary">Get notified when live matches start</div>
            </div>
            <button className="nordic-button-primary nordic-button-small">On</button>
          </div>
          <div className="nordic-flex-between">
            <div>
              <div className="nordic-body font-medium">Bet Results</div>
              <div className="nordic-body-small nordic-text-secondary">Notifications for bet outcomes</div>
            </div>
            <button className="nordic-button-primary nordic-button-small">On</button>
          </div>
          <div className="nordic-flex-between">
            <div>
              <div className="nordic-body font-medium">Daily Challenges</div>
              <div className="nordic-body-small nordic-text-secondary">Reminders for daily challenges</div>
            </div>
            <button className="nordic-button-ghost nordic-button-small">Off</button>
          </div>
        </div>
      </div>

      <div className="nordic-card">
        <h3 className="nordic-heading-4 nordic-mb-lg">Privacy</h3>
        <div className="space-y-4">
          <div className="nordic-flex-between">
            <div>
              <div className="nordic-body font-medium">Public Profile</div>
              <div className="nordic-body-small nordic-text-secondary">Show your profile on leaderboards</div>
            </div>
            <button className="nordic-button-primary nordic-button-small">On</button>
          </div>
          <div className="nordic-flex-between">
            <div>
              <div className="nordic-body font-medium">Share Statistics</div>
              <div className="nordic-body-small nordic-text-secondary">Allow others to see your betting stats</div>
            </div>
            <button className="nordic-button-ghost nordic-button-small">Off</button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderHistory = () => (
    <div className="nordic-card">
      <h3 className="nordic-heading-4 nordic-mb-lg">Account History</h3>
      <div className="space-y-3">
        <div className="nordic-flex-between nordic-py-sm nordic-border-b">
          <span className="nordic-body">Account created</span>
          <span className="nordic-body-small nordic-text-secondary">
            {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}
          </span>
        </div>
        <div className="nordic-flex-between nordic-py-sm nordic-border-b">
          <span className="nordic-body">First bet placed</span>
          <span className="nordic-body-small nordic-text-secondary">2 weeks ago</span>
        </div>
        <div className="nordic-flex-between nordic-py-sm nordic-border-b">
          <span className="nordic-body">Reached Level 2</span>
          <span className="nordic-body-small nordic-text-secondary">1 week ago</span>
        </div>
        <div className="nordic-flex-between nordic-py-sm nordic-border-b">
          <span className="nordic-body">First live bet</span>
          <span className="nordic-body-small nordic-text-secondary">5 days ago</span>
        </div>
        <div className="nordic-flex-between nordic-py-sm">
          <span className="nordic-body">Achievement unlocked: Live Master</span>
          <span className="nordic-body-small nordic-text-secondary">Yesterday</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen nordic-bg-secondary">
      <div className="nordic-container nordic-section-small">
        {/* Header */}
        <div className="nordic-text-center nordic-mb-2xl">
          <h1 className="nordic-heading-1 nordic-mb-md">My Profile</h1>
          <p className="nordic-body nordic-text-secondary">
            Manage your account and view your betting journey
          </p>
        </div>

        {/* Tabs */}
        <div className="nordic-mb-xl">
          <div className="nordic-flex nordic-gap-sm flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nordic-flex items-center space-x-2 px-4 py-2 nordic-rounded nordic-transition ${
                  activeTab === tab.id
                    ? 'nordic-button-primary'
                    : 'nordic-button-ghost'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'statistics' && renderStatistics()}
        {activeTab === 'settings' && renderSettings()}
        {activeTab === 'history' && renderHistory()}
      </div>
    </div>
  )
}