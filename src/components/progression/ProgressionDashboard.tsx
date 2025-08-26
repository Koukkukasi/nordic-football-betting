'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Target, Zap, TrendingUp, Award, Calendar } from 'lucide-react'
import XPProgressBar from './XPProgressBar'
import DailyChallengesWidget from './DailyChallengesWidget'
import AchievementCard from './AchievementCard'
import LevelProgressBar from './LevelProgressBar'
import { ACHIEVEMENTS, AchievementData } from '@/lib/achievement-system'
import { XPService } from '@/lib/xp-progression-service'

interface ProgressionDashboardProps {
  userId: string
  userLevel: number
  userXP: number
  userAchievements: any[]
  activeChallenges: any[]
}

interface UserStats {
  totalBets: number
  totalWins: number
  totalWon: number
  biggestWin: number
  currentStreak: number
  bestStreak: number
  level: number
  xp: number
  nextLevelXP: number
  recentActivities: Activity[]
}

interface Activity {
  id: string
  type: 'XP_GAINED' | 'ACHIEVEMENT_UNLOCKED' | 'LEVEL_UP' | 'CHALLENGE_COMPLETED'
  description: string
  xpGained?: number
  achievement?: AchievementData
  timestamp: Date
}

export default function ProgressionDashboard({
  userId,
  userLevel,
  userXP,
  userAchievements,
  activeChallenges
}: ProgressionDashboardProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'challenges' | 'stats'>('overview')

  useEffect(() => {
    fetchUserStats()
  }, [userId])

  const fetchUserStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/progression/xp?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setUserStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClaimChallenge = async (challengeId: string) => {
    try {
      const response = await fetch('/api/challenges/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, challengeId })
      })
      
      if (response.ok) {
        fetchUserStats() // Refresh data
      }
    } catch (error) {
      console.error('Error claiming challenge:', error)
    }
  }

  // Get achievements organized by category
  const achievementsByCategory = ACHIEVEMENTS.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = []
    }
    acc[achievement.category].push(achievement)
    return acc
  }, {} as Record<string, AchievementData[]>)

  // Calculate completion rates
  const totalAchievements = ACHIEVEMENTS.length
  const completedAchievements = userAchievements.filter(ua => ua.completed).length
  const achievementProgress = Math.round((completedAchievements / totalAchievements) * 100)

  const totalChallenges = activeChallenges.length
  const completedChallenges = activeChallenges.filter(c => c.progress >= c.requirement.target).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-200 rounded-xl"></div>
              <div className="h-64 bg-gray-200 rounded-xl"></div>
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header with Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Edistymisesi</h1>
              <p className="text-blue-100">Seuraa tasojasi, saavutuksiasi ja haasteita</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{userLevel}</div>
              <div className="text-sm text-blue-200">Taso</div>
            </div>
          </div>
          
          {userStats && (
            <LevelProgressBar
              level={userLevel}
              currentXP={userXP}
              nextLevelXP={userStats.nextLevelXP}
              showAnimation={false}
            />
          )}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-2"
        >
          <div className="flex gap-2">
            {[
              { id: 'overview', label: 'Yleiskatsaus', icon: TrendingUp },
              { id: 'achievements', label: 'Saavutukset', icon: Trophy },
              { id: 'challenges', label: 'Haasteet', icon: Target },
              { id: 'stats', label: 'Tilastot', icon: Award }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <div className="space-y-6">
          
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* XP Progress Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="text-purple-500" size={24} />
                  <h3 className="text-lg font-semibold">XP Edistyminen</h3>
                </div>
                {userStats && (
                  <XPProgressBar
                    currentLevel={userLevel}
                    currentXP={userXP}
                    size="lg"
                    showRewards={true}
                  />
                )}
              </div>

              {/* Achievement Overview */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="text-yellow-500" size={24} />
                  <h3 className="text-lg font-semibold">Saavutukset</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Suoritettu</span>
                    <span className="font-bold text-2xl">{completedAchievements}/{totalAchievements}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${achievementProgress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    {achievementProgress}% valmiina
                  </div>
                </div>
              </div>

              {/* Daily Challenges Overview */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="text-green-500" size={24} />
                  <h3 className="text-lg font-semibold">Päivän Haasteet</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Suoritettu</span>
                    <span className="font-bold text-2xl">{completedChallenges}/{totalChallenges}</span>
                  </div>
                  {totalChallenges > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedChallenges / totalChallenges) * 100}%` }}
                        transition={{ duration: 1, delay: 0.7 }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Viimeaikaiset Aktiviteetit</h3>
                <div className="space-y-3">
                  {userStats?.recentActivities?.slice(0, 5).map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {activity.type === 'XP_GAINED' && <Zap className="text-purple-500" size={20} />}
                        {activity.type === 'ACHIEVEMENT_UNLOCKED' && <Trophy className="text-yellow-500" size={20} />}
                        {activity.type === 'LEVEL_UP' && <TrendingUp className="text-green-500" size={20} />}
                        {activity.type === 'CHALLENGE_COMPLETED' && <Target className="text-blue-500" size={20} />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{activity.description}</div>
                        <div className="text-sm text-gray-500">
                          {activity.timestamp.toLocaleDateString('fi-FI')}
                        </div>
                      </div>
                      {activity.xpGained && (
                        <div className="text-purple-600 font-semibold">
                          +{activity.xpGained} XP
                        </div>
                      )}
                    </motion.div>
                  )) || (
                    <div className="text-center text-gray-500 py-8">
                      <Calendar size={48} className="mx-auto mb-2 opacity-30" />
                      <p>Ei viimeaikaisia aktiviteetteja</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Achievements Tab */}
          {selectedTab === 'achievements' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {Object.entries(achievementsByCategory).map(([category, achievements]) => (
                <div key={category} className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map(achievement => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        userProgress={userAchievements.find(ua => ua.achievementId === achievement.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Challenges Tab */}
          {selectedTab === 'challenges' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <DailyChallengesWidget
                challenges={activeChallenges}
                onClaimReward={handleClaimChallenge}
              />
            </motion.div>
          )}

          {/* Stats Tab */}
          {selectedTab === 'stats' && userStats && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                { label: 'Vetoja yhteensä', value: userStats.totalBets, icon: Target },
                { label: 'Voittoja', value: userStats.totalWins, icon: Trophy },
                { label: 'Voitettu yhteensä', value: `${userStats.totalWon.toLocaleString()} BP`, icon: Award },
                { label: 'Suurin voitto', value: `${userStats.biggestWin.toLocaleString()} BP`, icon: TrendingUp },
                { label: 'Nykyinen putki', value: userStats.currentStreak, icon: Zap },
                { label: 'Paras putki', value: userStats.bestStreak, icon: Zap },
                { label: 'Taso', value: userStats.level, icon: Trophy },
                { label: 'Kokonais XP', value: userStats.xp.toLocaleString(), icon: Award }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6 text-center"
                >
                  <stat.icon className="mx-auto mb-3 text-blue-500" size={32} />
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}