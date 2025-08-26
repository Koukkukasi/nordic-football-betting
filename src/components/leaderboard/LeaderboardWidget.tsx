'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Award, TrendingUp, Target, Zap, Crown, Star } from 'lucide-react'

interface LeaderboardEntry {
  id: string
  username: string
  level: number
  profileAvatar?: string
  // Type-specific fields
  xp?: number
  totalWins?: number
  totalBets?: number
  totalWon?: number
  totalStaked?: number
  bestStreak?: number
  currentStreak?: number
  completedAchievements?: number
  achievementScore?: number
  createdAt: Date
}

interface LeaderboardData {
  type: string
  leaderboard: LeaderboardEntry[]
  userPosition: number | null
  totalUsers: number
}

interface LeaderboardWidgetProps {
  userId?: string
  defaultType?: string
  compact?: boolean
  showUserPosition?: boolean
}

const LEADERBOARD_TYPES = [
  { id: 'level', label: 'Taso', icon: Crown, color: 'text-yellow-500' },
  { id: 'xp', label: 'XP', icon: Zap, color: 'text-purple-500' },
  { id: 'wins', label: 'Voitot', icon: Trophy, color: 'text-green-500' },
  { id: 'winnings', label: 'Voitot BP', icon: TrendingUp, color: 'text-blue-500' },
  { id: 'streak', label: 'Voittoputki', icon: Target, color: 'text-orange-500' },
  { id: 'achievements', label: 'Saavutukset', icon: Award, color: 'text-pink-500' }
]

export default function LeaderboardWidget({
  userId,
  defaultType = 'level',
  compact = false,
  showUserPosition = true
}: LeaderboardWidgetProps) {
  const [activeType, setActiveType] = useState(defaultType)
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaderboard(activeType)
  }, [activeType, userId])

  const fetchLeaderboard = async (type: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        type,
        limit: compact ? '5' : '10'
      })
      
      if (userId) {
        params.append('userId', userId)
      }

      const response = await fetch(`/api/leaderboard?${params}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch leaderboard')
      }
    } catch (err) {
      setError('Network error')
      console.error('Leaderboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="text-yellow-500" size={20} />
      case 2:
        return <Medal className="text-gray-400" size={20} />
      case 3:
        return <Award className="text-orange-600" size={20} />
      default:
        return <span className="text-gray-500 font-bold">#{position}</span>
    }
  }

  const getRankBadge = (position: number) => {
    const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
    
    switch (position) {
      case 1:
        return `${baseClasses} bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg`
      case 2:
        return `${baseClasses} bg-gradient-to-br from-gray-300 to-gray-500 shadow-lg`
      case 3:
        return `${baseClasses} bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg`
      default:
        return `${baseClasses} bg-gradient-to-br from-gray-200 to-gray-400 text-gray-700`
    }
  }

  const getStatValue = (entry: LeaderboardEntry, type: string) => {
    switch (type) {
      case 'level':
        return `Taso ${entry.level}`
      case 'xp':
        return `${entry.xp?.toLocaleString()} XP`
      case 'wins':
        return `${entry.totalWins} voittoa`
      case 'winnings':
        return `${entry.totalWon?.toLocaleString()} BP`
      case 'streak':
        return `${entry.bestStreak} putki`
      case 'achievements':
        return `${entry.completedAchievements} saavutusta`
      default:
        return ''
    }
  }

  const getStatSubValue = (entry: LeaderboardEntry, type: string) => {
    switch (type) {
      case 'level':
        return `${entry.xp?.toLocaleString()} XP`
      case 'xp':
        return `Taso ${entry.level}`
      case 'wins':
        const winRate = entry.totalBets ? Math.round((entry.totalWins! / entry.totalBets) * 100) : 0
        return `${winRate}% voittoprosentti`
      case 'winnings':
        return `Taso ${entry.level}`
      case 'streak':
        return `${entry.currentStreak} nykyinen`
      case 'achievements':
        return `${entry.achievementScore} pistettä`
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <div className="text-red-500 mb-2">Virhe ladattaessa tulostaulua</div>
        <button 
          onClick={() => fetchLeaderboard(activeType)}
          className="text-blue-500 hover:text-blue-700 font-medium"
        >
          Yritä uudelleen
        </button>
      </div>
    )
  }

  const currentTypeData = LEADERBOARD_TYPES.find(t => t.id === activeType)

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4">
        <div className="flex items-center gap-3 mb-3">
          <Trophy size={24} />
          <h2 className="text-lg font-semibold">Tulostaulu</h2>
        </div>
        
        {/* Type selector */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {LEADERBOARD_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeType === type.id 
                  ? 'bg-white/20 text-white shadow-md' 
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <type.icon size={16} />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard content */}
      <div className="p-4 space-y-3">
        <AnimatePresence mode="wait">
          {data?.leaderboard.map((entry, index) => (
            <motion.div
              key={`${activeType}-${entry.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all hover:bg-gray-50 ${
                entry.id === userId ? 'bg-blue-50 border-2 border-blue-200' : 'border border-gray-100'
              }`}
            >
              {/* Rank */}
              <div className={getRankBadge(index + 1)}>
                {index < 3 ? (
                  <span>{index + 1}</span>
                ) : (
                  <span>#{index + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                {entry.profileAvatar ? (
                  <img 
                    src={entry.profileAvatar} 
                    alt={entry.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 font-medium">
                    {entry.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 truncate">
                    {entry.username}
                  </span>
                  {entry.id === userId && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Sinä
                    </span>
                  )}
                  {entry.level >= 8 && (
                    <Crown className="text-yellow-500" size={16} />
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {getStatSubValue(entry, activeType)}
                </div>
              </div>

              {/* Stats */}
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {getStatValue(entry, activeType)}
                </div>
                {currentTypeData && (
                  <currentTypeData.icon 
                    className={`${currentTypeData.color} ml-auto`} 
                    size={16} 
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* User position (if not in top list) */}
        {showUserPosition && data?.userPosition && data.userPosition > (data.leaderboard?.length || 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="text-center text-sm">
              <span className="text-gray-600">Sinun sijaintisi: </span>
              <span className="font-bold text-blue-600">
                #{data.userPosition} / {data.totalUsers}
              </span>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {data?.leaderboard.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy size={48} className="mx-auto mb-3 opacity-30" />
            <p>Ei vielä tuloksia tässä kategoriassa</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {!compact && data && (
        <div className="bg-gray-50 px-4 py-3 border-t text-center">
          <p className="text-xs text-gray-600">
            Päivitetty viimeksi: {new Date().toLocaleTimeString('fi-FI')}
          </p>
        </div>
      )}
    </div>
  )
}