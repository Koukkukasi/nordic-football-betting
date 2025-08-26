'use client'

import { useState, useEffect } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'
import AchievementCard from '@/components/progression/AchievementCard'
import DailyChallengesWidget from '@/components/progression/DailyChallengesWidget'
import LevelProgressBar from '@/components/progression/LevelProgressBar'

export default function RewardsPage() {
  const { profile } = useUserProfile()
  const [activeTab, setActiveTab] = useState('achievements')
  const [achievements, setAchievements] = useState<any[]>([])
  const [challenges, setChallenges] = useState<any[]>([])

  useEffect(() => {
    // Demo achievements
    setAchievements([
      {
        id: 'first_bet',
        title: 'First Bet',
        description: 'Place your first bet',
        icon: '🎯',
        progress: 100,
        maxProgress: 100,
        reward: '100 BP + 5 💎',
        unlocked: true,
        claimed: true
      },
      {
        id: 'live_master',
        title: 'Live Master',
        description: 'Win 5 live bets',
        icon: '⚡',
        progress: 3,
        maxProgress: 5,
        reward: '500 BP + 25 💎',
        unlocked: false,
        claimed: false
      },
      {
        id: 'nordic_expert',
        title: 'Nordic Expert',
        description: 'Bet on all Nordic leagues',
        icon: '🏆',
        progress: 2,
        maxProgress: 5,
        reward: '1000 BP + 50 💎',
        unlocked: false,
        claimed: false
      },
      {
        id: 'diamond_collector',
        title: 'Diamond Collector',
        description: 'Collect 100 diamonds',
        icon: '💎',
        progress: 50,
        maxProgress: 100,
        reward: '2000 BP',
        unlocked: false,
        claimed: false
      }
    ])

    // Demo challenges
    setChallenges([
      {
        id: 'daily_bet',
        title: 'Daily Bet',
        description: 'Place a bet today',
        progress: 1,
        maxProgress: 1,
        reward: '50 BP',
        timeLeft: '18h 32m',
        completed: true
      },
      {
        id: 'live_betting',
        title: 'Live Betting',
        description: 'Place 3 live bets',
        progress: 1,
        maxProgress: 3,
        reward: '100 BP + 10 💎',
        timeLeft: '18h 32m',
        completed: false
      },
      {
        id: 'accumulator',
        title: 'Accumulator',
        description: 'Win an accumulator bet',
        progress: 0,
        maxProgress: 1,
        reward: '200 BP + 20 💎',
        timeLeft: '18h 32m',
        completed: false
      }
    ])
  }, [])

  const userLevel = profile?.level || 1
  const userXP = profile?.xp || 250
  const xpForNext = userLevel * 1000
  const xpProgress = (userXP % 1000) / 10

  const tabs = [
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'challenges', label: 'Daily Challenges', icon: '🎯' },
    { id: 'level', label: 'Level Progress', icon: '⭐' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '👑' }
  ]

  const renderAchievements = () => (
    <div className="space-y-6">
      <div className="nordic-grid-2 nordic-gap-lg">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  )

  const renderChallenges = () => (
    <div className="space-y-6">
      <div className="nordic-card">
        <h3 className="nordic-heading-4 nordic-mb-lg">Today's Challenges</h3>
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="nordic-flex-between nordic-py-md nordic-border-b">
              <div className="nordic-flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg nordic-flex-center">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <div>
                  <h4 className="nordic-heading-5">{challenge.title}</h4>
                  <p className="nordic-body-small nordic-text-secondary">{challenge.description}</p>
                  <div className="nordic-flex items-center space-x-4 nordic-mt-sm">
                    <div className="nordic-flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                        ></div>
                      </div>
                      <span className="nordic-body-small">{challenge.progress}/{challenge.maxProgress}</span>
                    </div>
                    <span className="nordic-text-muted text-xs">⏰ {challenge.timeLeft}</span>
                  </div>
                </div>
              </div>
              <div className="nordic-text-right">
                <div className="nordic-status-success text-sm nordic-mb-sm">{challenge.reward}</div>
                {challenge.completed ? (
                  <button className="nordic-button-primary nordic-button-small">Claim</button>
                ) : (
                  <span className="nordic-text-muted text-sm">In Progress</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderLevelProgress = () => (
    <div className="space-y-6">
      <div className="nordic-card nordic-text-center">
        <h3 className="nordic-heading-3 nordic-mb-lg">Level {userLevel}</h3>
        <div className="max-w-md mx-auto">
          <LevelProgressBar currentXP={userXP} level={userLevel} />
        </div>
        <p className="nordic-body-small nordic-text-secondary nordic-mt-lg">
          {Math.max(0, xpForNext - userXP)} XP until Level {userLevel + 1}
        </p>
      </div>

      <div className="nordic-card">
        <h4 className="nordic-heading-4 nordic-mb-lg">How to Earn XP</h4>
        <div className="nordic-grid-2 nordic-gap-lg">
          <div className="nordic-flex items-center space-x-3">
            <span className="text-2xl">🎯</span>
            <div>
              <div className="nordic-body font-semibold">Place a Bet</div>
              <div className="nordic-body-small nordic-text-secondary">+10 XP per bet</div>
            </div>
          </div>
          <div className="nordic-flex items-center space-x-3">
            <span className="text-2xl">✅</span>
            <div>
              <div className="nordic-body font-semibold">Win a Bet</div>
              <div className="nordic-body-small nordic-text-secondary">+25 XP per win</div>
            </div>
          </div>
          <div className="nordic-flex items-center space-x-3">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="nordic-body font-semibold">Live Betting</div>
              <div className="nordic-body-small nordic-text-secondary">+15 XP per live bet</div>
            </div>
          </div>
          <div className="nordic-flex items-center space-x-3">
            <span className="text-2xl">🏆</span>
            <div>
              <div className="nordic-body font-semibold">Daily Login</div>
              <div className="nordic-body-small nordic-text-secondary">+5 XP per day</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderLeaderboard = () => (
    <div className="nordic-card">
      <h3 className="nordic-heading-4 nordic-mb-lg">Top Players This Week</h3>
      <div className="space-y-3">
        {[
          { rank: 1, name: 'NordicPro', points: 15420, badge: '👑' },
          { rank: 2, name: 'FinlandFan', points: 12350, badge: '🥈' },
          { rank: 3, name: 'SwedenMaster', points: 11800, badge: '🥉' },
          { rank: 4, name: 'HJKLover', points: 9450, badge: '' },
          { rank: 5, name: 'AllsvenskanAce', points: 8920, badge: '' },
          { rank: 6, name: profile?.username || 'You', points: 5250, badge: '' }
        ].map((player) => (
          <div key={player.rank} className={`nordic-flex-between nordic-py-md nordic-px-lg nordic-rounded ${
            player.name === (profile?.username || 'You') ? 'bg-blue-50 border border-blue-200' : ''
          }`}>
            <div className="nordic-flex items-center space-x-3">
              <span className="nordic-body font-bold w-8">#{player.rank}</span>
              <span className="text-xl">{player.badge}</span>
              <span className="nordic-body font-medium">{player.name}</span>
              {player.name === (profile?.username || 'You') && (
                <span className="nordic-status-info text-xs px-2 py-1">You</span>
              )}
            </div>
            <span className="nordic-body font-bold">{player.points.toLocaleString()} pts</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen nordic-bg-secondary">
      <div className="nordic-container nordic-section-small">
        {/* Header */}
        <div className="nordic-text-center nordic-mb-2xl">
          <h1 className="nordic-heading-1 nordic-mb-md">Rewards</h1>
          <p className="nordic-body nordic-text-secondary">
            Earn achievements, complete challenges, and climb the leaderboard
          </p>
        </div>

        {/* Quick Stats */}
        <div className="nordic-grid-4 nordic-gap-lg nordic-mb-2xl">
          <div className="nordic-card nordic-text-center">
            <div className="nordic-text-brand text-3xl font-bold nordic-mb-sm">Lv.{userLevel}</div>
            <div className="nordic-body-small nordic-text-secondary">Current Level</div>
          </div>
          <div className="nordic-card nordic-text-center">
            <div className="nordic-text-purple text-3xl font-bold nordic-mb-sm">{profile?.diamonds || 50}</div>
            <div className="nordic-body-small nordic-text-secondary">💎 Diamonds</div>
          </div>
          <div className="nordic-card nordic-text-center">
            <div className="nordic-text-success text-3xl font-bold nordic-mb-sm">
              {achievements.filter(a => a.claimed).length}
            </div>
            <div className="nordic-body-small nordic-text-secondary">Achievements</div>
          </div>
          <div className="nordic-card nordic-text-center">
            <div className="nordic-text-warning text-3xl font-bold nordic-mb-sm">
              {challenges.filter(c => c.completed).length}
            </div>
            <div className="nordic-body-small nordic-text-secondary">Daily Complete</div>
          </div>
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
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'challenges' && renderChallenges()}
        {activeTab === 'level' && renderLevelProgress()}
        {activeTab === 'leaderboard' && renderLeaderboard()}
      </div>
    </div>
  )
}