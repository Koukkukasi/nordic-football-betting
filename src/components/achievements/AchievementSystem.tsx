'use client'

import { useState, useEffect } from 'react'
import { Trophy, Star, Target, Zap, Shield, Award, TrendingUp, Users, Clock, DollarSign } from 'lucide-react'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'betting' | 'streak' | 'profit' | 'activity' | 'special'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  progress: number
  maxProgress: number
  unlocked: boolean
  unlockedAt?: string
  reward: {
    betPoints?: number
    diamonds?: number
    xp?: number
  }
}

interface AchievementSystemProps {
  userId?: string
  onAchievementUnlock?: (achievement: Achievement) => void
}

export default function AchievementSystem({ userId, onAchievementUnlock }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [selectedCategory, setSelectedCategory] = useState<'all' | Achievement['category']>('all')
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false)
  const [notification, setNotification] = useState<Achievement | null>(null)

  const achievementsList: Achievement[] = [
    // Betting Achievements
    {
      id: 'first_bet',
      name: 'First Steps',
      description: 'Place your first bet',
      icon: <Trophy className="w-6 h-6" />,
      category: 'betting',
      tier: 'bronze',
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedAt: '2025-01-15',
      reward: { betPoints: 100, xp: 10 }
    },
    {
      id: 'bet_10',
      name: 'Regular Bettor',
      description: 'Place 10 bets',
      icon: <Target className="w-6 h-6" />,
      category: 'betting',
      tier: 'bronze',
      progress: 10,
      maxProgress: 10,
      unlocked: true,
      reward: { betPoints: 500, xp: 50 }
    },
    {
      id: 'bet_50',
      name: 'Experienced Bettor',
      description: 'Place 50 bets',
      icon: <Target className="w-6 h-6" />,
      category: 'betting',
      tier: 'silver',
      progress: 42,
      maxProgress: 50,
      unlocked: false,
      reward: { betPoints: 2000, diamonds: 10, xp: 200 }
    },
    {
      id: 'bet_100',
      name: 'Veteran Bettor',
      description: 'Place 100 bets',
      icon: <Target className="w-6 h-6" />,
      category: 'betting',
      tier: 'gold',
      progress: 42,
      maxProgress: 100,
      unlocked: false,
      reward: { betPoints: 5000, diamonds: 25, xp: 500 }
    },
    {
      id: 'bet_500',
      name: 'Betting Legend',
      description: 'Place 500 bets',
      icon: <Target className="w-6 h-6" />,
      category: 'betting',
      tier: 'platinum',
      progress: 42,
      maxProgress: 500,
      unlocked: false,
      reward: { betPoints: 20000, diamonds: 100, xp: 2000 }
    },

    // Streak Achievements
    {
      id: 'win_3',
      name: 'Hot Streak',
      description: 'Win 3 bets in a row',
      icon: <Zap className="w-6 h-6" />,
      category: 'streak',
      tier: 'bronze',
      progress: 3,
      maxProgress: 3,
      unlocked: true,
      reward: { betPoints: 300, xp: 30 }
    },
    {
      id: 'win_5',
      name: 'On Fire',
      description: 'Win 5 bets in a row',
      icon: <Zap className="w-6 h-6" />,
      category: 'streak',
      tier: 'silver',
      progress: 3,
      maxProgress: 5,
      unlocked: false,
      reward: { betPoints: 1000, diamonds: 5, xp: 100 }
    },
    {
      id: 'win_10',
      name: 'Unstoppable',
      description: 'Win 10 bets in a row',
      icon: <Zap className="w-6 h-6" />,
      category: 'streak',
      tier: 'gold',
      progress: 3,
      maxProgress: 10,
      unlocked: false,
      reward: { betPoints: 3000, diamonds: 20, xp: 300 }
    },

    // Profit Achievements
    {
      id: 'profit_1000',
      name: 'Profitable Start',
      description: 'Earn 1,000 BetPoints profit',
      icon: <DollarSign className="w-6 h-6" />,
      category: 'profit',
      tier: 'bronze',
      progress: 1000,
      maxProgress: 1000,
      unlocked: true,
      reward: { betPoints: 200, xp: 20 }
    },
    {
      id: 'profit_5000',
      name: 'Money Maker',
      description: 'Earn 5,000 BetPoints profit',
      icon: <DollarSign className="w-6 h-6" />,
      category: 'profit',
      tier: 'silver',
      progress: 3500,
      maxProgress: 5000,
      unlocked: false,
      reward: { betPoints: 1000, diamonds: 10, xp: 100 }
    },
    {
      id: 'profit_10000',
      name: 'Profit Master',
      description: 'Earn 10,000 BetPoints profit',
      icon: <DollarSign className="w-6 h-6" />,
      category: 'profit',
      tier: 'gold',
      progress: 3500,
      maxProgress: 10000,
      unlocked: false,
      reward: { betPoints: 2500, diamonds: 30, xp: 250 }
    },

    // Activity Achievements
    {
      id: 'daily_login_7',
      name: 'Week Warrior',
      description: 'Log in for 7 consecutive days',
      icon: <Clock className="w-6 h-6" />,
      category: 'activity',
      tier: 'bronze',
      progress: 5,
      maxProgress: 7,
      unlocked: false,
      reward: { betPoints: 500, diamonds: 5, xp: 50 }
    },
    {
      id: 'daily_login_30',
      name: 'Dedicated Player',
      description: 'Log in for 30 consecutive days',
      icon: <Clock className="w-6 h-6" />,
      category: 'activity',
      tier: 'silver',
      progress: 5,
      maxProgress: 30,
      unlocked: false,
      reward: { betPoints: 2000, diamonds: 20, xp: 200 }
    },
    {
      id: 'live_bet_master',
      name: 'Live Betting Master',
      description: 'Win 20 live bets',
      icon: <Shield className="w-6 h-6" />,
      category: 'activity',
      tier: 'gold',
      progress: 12,
      maxProgress: 20,
      unlocked: false,
      reward: { betPoints: 3000, diamonds: 25, xp: 300 }
    },

    // Special Achievements
    {
      id: 'nordic_specialist',
      name: 'Nordic Specialist',
      description: 'Win 25 bets on Nordic matches',
      icon: <Star className="w-6 h-6" />,
      category: 'special',
      tier: 'gold',
      progress: 18,
      maxProgress: 25,
      unlocked: false,
      reward: { betPoints: 5000, diamonds: 50, xp: 500 }
    },
    {
      id: 'high_odds_hero',
      name: 'High Odds Hero',
      description: 'Win a bet with odds over 5.0',
      icon: <Award className="w-6 h-6" />,
      category: 'special',
      tier: 'gold',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      reward: { betPoints: 2000, diamonds: 20, xp: 200 }
    },
    {
      id: 'perfect_week',
      name: 'Perfect Week',
      description: 'Win all bets in a week (min 7 bets)',
      icon: <TrendingUp className="w-6 h-6" />,
      category: 'special',
      tier: 'platinum',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      reward: { betPoints: 10000, diamonds: 100, xp: 1000 }
    }
  ]

  useEffect(() => {
    // Load achievements (would fetch from API)
    setAchievements(achievementsList)
    
    // Check for newly unlocked achievements
    checkAchievements()
  }, [userId])

  const checkAchievements = async () => {
    // This would check user stats and unlock achievements accordingly
    // For demo, we'll simulate an achievement unlock
    const randomUnlock = Math.random() > 0.8
    if (randomUnlock && !showUnlockedOnly) {
      const lockedAchievements = achievementsList.filter(a => !a.unlocked)
      if (lockedAchievements.length > 0) {
        const achievement = lockedAchievements[0]
        achievement.unlocked = true
        achievement.unlockedAt = new Date().toISOString()
        achievement.progress = achievement.maxProgress
        
        setNotification(achievement)
        if (onAchievementUnlock) {
          onAchievementUnlock(achievement)
        }
        
        setTimeout(() => setNotification(null), 5000)
      }
    }
  }

  const getTierColor = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'bronze': return 'from-orange-400 to-orange-600'
      case 'silver': return 'from-gray-400 to-gray-600'
      case 'gold': return 'from-yellow-400 to-yellow-600'
      case 'platinum': return 'from-purple-400 to-purple-600'
    }
  }

  const getTierBorder = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'bronze': return 'border-orange-400'
      case 'silver': return 'border-gray-400'
      case 'gold': return 'border-yellow-400'
      case 'platinum': return 'border-purple-400'
    }
  }

  const filteredAchievements = achievements.filter(a => {
    if (showUnlockedOnly && !a.unlocked) return false
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false
    return true
  })

  const categories = [
    { id: 'all', name: 'All', count: achievements.length },
    { id: 'betting', name: 'Betting', count: achievements.filter(a => a.category === 'betting').length },
    { id: 'streak', name: 'Streaks', count: achievements.filter(a => a.category === 'streak').length },
    { id: 'profit', name: 'Profit', count: achievements.filter(a => a.category === 'profit').length },
    { id: 'activity', name: 'Activity', count: achievements.filter(a => a.category === 'activity').length },
    { id: 'special', name: 'Special', count: achievements.filter(a => a.category === 'special').length }
  ]

  const totalUnlocked = achievements.filter(a => a.unlocked).length
  const totalAchievements = achievements.length
  const overallProgress = (totalUnlocked / totalAchievements) * 100

  return (
    <div className="space-y-6">
      {/* Achievement Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-4 rounded-lg shadow-xl max-w-sm">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🏆</div>
              <div>
                <p className="font-bold">Achievement Unlocked!</p>
                <p className="text-sm">{notification.name}</p>
                <p className="text-xs mt-1">
                  +{notification.reward.betPoints} BP
                  {notification.reward.diamonds && ` • +${notification.reward.diamonds} 💎`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overall Progress */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Achievement Progress</h2>
          <span className="text-2xl font-bold text-blue-600">
            {totalUnlocked}/{totalAchievements}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {overallProgress.toFixed(0)}% Complete • Earn rewards by unlocking achievements!
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
                <span className="ml-2 text-xs">({cat.count})</span>
              </button>
            ))}
          </div>
          
          <div className="ml-auto">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnlockedOnly}
                onChange={(e) => setShowUnlockedOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Show unlocked only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`glass-card p-4 border-2 transition-all ${
              achievement.unlocked 
                ? getTierBorder(achievement.tier) 
                : 'border-transparent opacity-75'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${getTierColor(achievement.tier)}`}>
                <div className="text-white">
                  {achievement.icon}
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{achievement.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                
                {!achievement.unlocked ? (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${getTierColor(achievement.tier)} h-2 rounded-full`}
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs text-green-600 font-medium">✓ Unlocked</span>
                    {achievement.unlockedAt && (
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Rewards */}
                <div className="flex gap-2 mt-2">
                  {achievement.reward.betPoints && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      +{achievement.reward.betPoints} BP
                    </span>
                  )}
                  {achievement.reward.diamonds && (
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                      +{achievement.reward.diamonds} 💎
                    </span>
                  )}
                  {achievement.reward.xp && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                      +{achievement.reward.xp} XP
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="glass-card p-8 text-center">
          <p className="text-gray-600">No achievements found</p>
        </div>
      )}
    </div>
  )
}