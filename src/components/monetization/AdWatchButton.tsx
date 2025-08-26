'use client'

import { useState, useEffect } from 'react'
import { AdType, AD_REWARDS, getRandomEncouragementMessage } from '@/lib/ad-system'

interface AdWatchButtonProps {
  adType: AdType
  userBalance: {
    betPoints: number
    diamonds: number
  }
  onRewardClaimed?: (reward: any) => void
  priority?: 'high' | 'medium' | 'low'
  className?: string
}

export default function AdWatchButton({
  adType,
  userBalance,
  onRewardClaimed,
  priority = 'medium',
  className = ''
}: AdWatchButtonProps) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'watching' | 'completed' | 'unavailable'>('idle')
  const [availability, setAvailability] = useState<any>(null)
  const [watchId, setWatchId] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  const reward = AD_REWARDS[adType]

  useEffect(() => {
    checkAvailability()
  }, [adType])

  // Countdown for "watching" state
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (status === 'watching' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setStatus('completed')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [status, countdown])

  const checkAvailability = async () => {
    setStatus('checking')
    try {
      const response = await fetch('/api/monetization/watch-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adType,
          action: 'CHECK_AVAILABILITY'
        })
      })

      const data = await response.json()
      
      if (response.ok && data.canWatch) {
        setAvailability(data)
        setStatus('available')
      } else {
        setStatus('unavailable')
        setError(data.reason || 'Not available')
      }
    } catch (err) {
      setStatus('unavailable')
      setError('Failed to check availability')
    }
  }

  const startWatching = async () => {
    setStatus('watching')
    setError(null)
    
    try {
      const response = await fetch('/api/monetization/watch-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adType,
          action: 'START_WATCH'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setWatchId(data.watchId)
        setCountdown(30) // 30 second simulated ad
      } else {
        setStatus('available')
        setError(data.error || 'Failed to start ad')
      }
    } catch (err) {
      setStatus('available')
      setError('Network error')
    }
  }

  const claimReward = async () => {
    if (!watchId) return

    try {
      const response = await fetch('/api/monetization/watch-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adType,
          action: 'CLAIM_REWARD',
          watchId
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        onRewardClaimed?.(data)
        setStatus('idle')
        setWatchId(null)
        // Refresh availability after claiming
        setTimeout(checkAvailability, 1000)
      } else {
        setError(data.error || 'Failed to claim reward')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return 'bg-red-500 hover:bg-red-600 text-white'
      case 'medium': return 'bg-blue-500 hover:bg-blue-600 text-white'
      case 'low': return 'bg-gray-500 hover:bg-gray-600 text-white'
      default: return 'bg-blue-500 hover:bg-blue-600 text-white'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'checking': return '⏳'
      case 'available': return '📺'
      case 'watching': return '▶️'
      case 'completed': return '✨'
      case 'unavailable': return '⏰'
      default: return '📺'
    }
  }

  const getButtonText = () => {
    switch (status) {
      case 'checking': return 'Checking...'
      case 'available': return `Watch Ad for ${reward.betPoints > 0 ? `${reward.betPoints} BP` : ''}${reward.betPoints > 0 && reward.diamonds > 0 ? ' + ' : ''}${reward.diamonds > 0 ? `${reward.diamonds} 💎` : ''}`
      case 'watching': return `Watching... ${countdown}s`
      case 'completed': return 'Claim Reward!'
      case 'unavailable': return getUnavailableReason()
      default: return 'Watch Ad'
    }
  }

  const getUnavailableReason = () => {
    if (!error) return 'Not Available'
    
    switch (error) {
      case 'COOLDOWN': return `Available in ${availability?.cooldownMinutes || 0}m`
      case 'NOT_NEEDED': return 'You have enough currency'
      case 'NOT_WEEKEND': return 'Weekend only'
      case 'DAILY_LIMIT_REACHED': return 'Daily limit reached'
      default: return 'Not Available'
    }
  }

  const isButtonDisabled = () => {
    return status === 'checking' || status === 'watching' || status === 'unavailable'
  }

  const handleClick = () => {
    switch (status) {
      case 'available':
        startWatching()
        break
      case 'completed':
        claimReward()
        break
      case 'unavailable':
        checkAvailability()
        break
    }
  }

  return (
    <div className={`ad-watch-button ${className}`}>
      <button
        onClick={handleClick}
        disabled={isButtonDisabled()}
        className={`
          w-full px-4 py-3 rounded-lg font-medium transition-all duration-200
          flex items-center justify-center gap-2
          ${isButtonDisabled() 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : getPriorityColor()
          }
          ${status === 'completed' ? 'animate-pulse' : ''}
        `}
      >
        <span className="text-lg">{getStatusIcon()}</span>
        <span>{getButtonText()}</span>
      </button>

      {/* Ad Description */}
      {status === 'available' && (
        <div className="mt-2 text-sm text-gray-600 text-center">
          <p>{reward.description}</p>
          <p className="text-xs mt-1 text-gray-500">
            {getRandomEncouragementMessage()}
          </p>
        </div>
      )}

      {/* Watching Progress */}
      {status === 'watching' && (
        <div className="mt-3">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-1000"
              style={{ width: `${((30 - countdown) / 30) * 100}%` }}
            />
          </div>
          <p className="text-xs text-center mt-1 text-gray-600">
            Thank you for supporting the game! 🎯
          </p>
        </div>
      )}

      {/* Completion Message */}
      {status === 'completed' && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-center">
          <p className="text-sm text-green-800">
            Ad complete! Click to claim your reward.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && status !== 'unavailable' && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-center">
          <p className="text-sm text-red-800">{error}</p>
          <button 
            onClick={checkAvailability}
            className="text-xs text-red-600 hover:text-red-800 mt-1"
          >
            Try again
          </button>
        </div>
      )}

      {/* Cooldown Info */}
      {status === 'unavailable' && availability?.cooldownMinutes && (
        <div className="mt-2 text-xs text-center text-gray-500">
          Next ad available in {availability.cooldownMinutes} minutes
        </div>
      )}

      {/* Daily Progress */}
      {availability?.todayWatchCount !== undefined && (
        <div className="mt-2 text-xs text-center text-gray-500">
          Today: {availability.todayWatchCount}/{availability.dailyLimit} ads watched
        </div>
      )}
    </div>
  )
}