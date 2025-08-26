'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DAILY_LOGIN_REWARDS, 
  DailyLoginBonus, 
  LoginStreakData,
  formatTimeRemaining,
  getStreakMotivationMessage 
} from '@/lib/daily-login-system'

interface DailyLoginWidgetProps {
  userId: string
  className?: string
  isCompact?: boolean
}

export default function DailyLoginWidget({ 
  userId, 
  className = '',
  isCompact = false 
}: DailyLoginWidgetProps) {
  const [loginData, setLoginData] = useState<LoginStreakData | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    fetchLoginStatus()
  }, [userId])

  useEffect(() => {
    if (loginData?.timeUntilReset) {
      const interval = setInterval(() => {
        setTimeRemaining(formatTimeRemaining(loginData.timeUntilReset))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [loginData?.timeUntilReset])

  const fetchLoginStatus = async () => {
    try {
      const response = await fetch('/api/daily-bonus')
      const result = await response.json()
      
      if (result.success) {
        setLoginData(result.data)
      }
    } catch (error) {
      console.error('Error fetching login status:', error)
    } finally {
      setLoading(false)
    }
  }

  const claimDailyBonus = async () => {
    if (!loginData?.canClaimBonus || claiming) return

    setClaiming(true)
    try {
      const response = await fetch('/api/daily-bonus', {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Show celebration animation
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)
        
        // Refresh login status
        await fetchLoginStatus()
      } else {
        alert(result.error || 'Failed to claim bonus')
      }
    } catch (error) {
      console.error('Error claiming bonus:', error)
      alert('Failed to claim bonus')
    } finally {
      setClaiming(false)
    }
  }

  if (loading) {
    return (
      <div className={`nordic-card ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!loginData) {
    return (
      <div className={`nordic-card ${className}`}>
        <div className="text-center text-gray-500">
          <span className="text-2xl block mb-2">😔</span>
          <p>Päivittäiset bonukset eivät ole saatavilla</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`nordic-card relative overflow-hidden ${className}`}>
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.95 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring' }}
          >
            <div className="text-center text-white">
              <motion.div
                className="text-6xl mb-2"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
              >
                🎉
              </motion.div>
              <h3 className="text-xl font-bold">Bonus lunastettu!</h3>
              <p>+{loginData.nextBonus.betPoints} BP, +{loginData.nextBonus.diamonds} 💎</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">🎁</span>
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--nordic-text-primary)' }}>
              Päivittäinen Bonus
            </h3>
            <p className="text-sm" style={{ color: 'var(--nordic-text-secondary)' }}>
              {getStreakMotivationMessage(loginData.currentStreak)}
            </p>
          </div>
        </div>
        
        {loginData.currentStreak > 0 && (
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--nordic-primary)' }}>
              {loginData.currentStreak}
            </div>
            <div className="text-xs" style={{ color: 'var(--nordic-text-muted)' }}>
              päivää putkeen
            </div>
          </div>
        )}
      </div>

      {/* Current Bonus */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium" style={{ color: 'var(--nordic-text-primary)' }}>
            Tänään ({loginData.weekProgress}/7):
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm px-2 py-1 rounded" 
                  style={{ backgroundColor: 'var(--nordic-success)', color: 'white' }}>
              Päivä {loginData.nextBonus.day}
            </span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r p-4 rounded-lg" 
             style={{ 
               background: loginData.todaysClaimed 
                 ? 'linear-gradient(to right, #10B981, #059669)' 
                 : 'linear-gradient(to right, #3B82F6, #1D4ED8)' 
             }}>
          <div className="flex items-center justify-between text-white">
            <div>
              <div className="flex items-center gap-4">
                <span className="font-bold">{loginData.nextBonus.betPoints} BP</span>
                <span className="font-bold">{loginData.nextBonus.diamonds} 💎</span>
                <span className="font-bold">{loginData.nextBonus.xp} XP</span>
              </div>
              {loginData.nextBonus.specialReward && (
                <div className="text-sm mt-1 opacity-90">
                  ⭐ {loginData.nextBonus.specialReward.type} +{loginData.nextBonus.specialReward.value}%
                </div>
              )}
            </div>
            
            <button
              onClick={claimDailyBonus}
              disabled={!loginData.canClaimBonus || claiming || loginData.todaysClaimed}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                loginData.todaysClaimed
                  ? 'bg-green-600 cursor-not-allowed'
                  : loginData.canClaimBonus
                  ? 'bg-white text-blue-600 hover:bg-gray-100'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              {claiming ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Lunastetaan...
                </span>
              ) : loginData.todaysClaimed ? (
                '✓ Lunastettu'
              ) : loginData.canClaimBonus ? (
                'Lunasta'
              ) : (
                'Ei saatavilla'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: 'var(--nordic-text-secondary)' }}>Viikon edistyminen:</span>
          <span style={{ color: 'var(--nordic-text-primary)' }}>
            {loginData.weekProgress}/7 päivää
          </span>
        </div>
        
        <div className="flex gap-1 mb-2">
          {DAILY_LOGIN_REWARDS.map((reward, index) => {
            const dayNumber = index + 1
            const isCompleted = dayNumber < loginData.weekProgress || 
                              (dayNumber === loginData.weekProgress && loginData.todaysClaimed)
            const isCurrent = dayNumber === loginData.weekProgress && !loginData.todaysClaimed
            
            return (
              <div
                key={dayNumber}
                className={`flex-1 h-2 rounded-full transition-all ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : isCurrent 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300'
                }`}
                title={`Päivä ${dayNumber}: ${reward.betPoints} BP, ${reward.diamonds} 💎`}
              />
            )
          })}
        </div>
        
        {loginData.weekProgress === 7 && (
          <div className="text-center py-2 px-3 rounded-lg" 
               style={{ backgroundColor: 'var(--nordic-warning)', color: 'white' }}>
            <span className="text-sm font-medium">🏆 Viikko täynnä! Aloita uusi kierros huomenna</span>
          </div>
        )}
      </div>

      {/* Next Rewards Preview */}
      {!isCompact && loginData.weekProgress < 7 && (
        <div>
          <h4 className="font-medium mb-2" style={{ color: 'var(--nordic-text-primary)' }}>
            Tulevat palkinnot:
          </h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {DAILY_LOGIN_REWARDS.slice(loginData.weekProgress).slice(0, 3).map((reward, index) => (
              <div key={index} className="text-center p-2 rounded" 
                   style={{ backgroundColor: 'var(--nordic-bg-secondary)' }}>
                <div className="font-medium mb-1" style={{ color: 'var(--nordic-text-primary)' }}>
                  Päivä {loginData.weekProgress + index + 1}
                </div>
                <div style={{ color: 'var(--nordic-text-secondary)' }}>
                  {reward.betPoints} BP<br/>
                  {reward.diamonds} 💎
                </div>
                {reward.specialReward && (
                  <div className="text-xs mt-1" style={{ color: 'var(--nordic-warning)' }}>
                    ⭐ Bonus
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timer */}
      <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--nordic-secondary-light)' }}>
        <div className="flex justify-between items-center text-sm">
          <span style={{ color: 'var(--nordic-text-muted)' }}>
            Uudistuu:
          </span>
          <span className="font-mono" style={{ color: 'var(--nordic-primary)' }}>
            {timeRemaining || formatTimeRemaining(loginData.timeUntilReset)}
          </span>
        </div>
      </div>
    </div>
  )
}