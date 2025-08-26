'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, Crown, Sparkles } from 'lucide-react'
import { XP_REQUIREMENTS, LEVEL_REWARDS } from '@/lib/currency-system'

interface XPProgressBarProps {
  currentLevel: number
  currentXP: number
  showNextLevel?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  showRewards?: boolean
}

export default function XPProgressBar({
  currentLevel,
  currentXP,
  showNextLevel = true,
  size = 'md',
  animated = true,
  showRewards = false
}: XPProgressBarProps) {
  const maxLevel = 10
  const isMaxLevel = currentLevel >= maxLevel
  
  const currentLevelXP = XP_REQUIREMENTS[currentLevel as keyof typeof XP_REQUIREMENTS] || 0
  const nextLevelXP = XP_REQUIREMENTS[(currentLevel + 1) as keyof typeof XP_REQUIREMENTS] || currentXP
  
  const xpForCurrentLevel = isMaxLevel ? currentXP : currentXP - currentLevelXP
  const xpNeededForNext = isMaxLevel ? 0 : nextLevelXP - currentLevelXP
  const progressPercentage = isMaxLevel ? 100 : Math.min((xpForCurrentLevel / xpNeededForNext) * 100, 100)
  
  const nextLevelRewards = !isMaxLevel 
    ? LEVEL_REWARDS[(currentLevel + 1) as keyof typeof LEVEL_REWARDS]
    : null

  const sizeClasses = {
    sm: {
      container: 'h-2',
      text: 'text-xs',
      level: 'text-sm',
      icon: 16
    },
    md: {
      container: 'h-3',
      text: 'text-sm',
      level: 'text-base',
      icon: 20
    },
    lg: {
      container: 'h-4',
      text: 'text-base',
      level: 'text-lg',
      icon: 24
    }
  }

  const classes = sizeClasses[size]

  const getLevelIcon = (level: number) => {
    if (level >= 8) return <Crown size={classes.icon} className="text-yellow-400" />
    if (level >= 5) return <Star size={classes.icon} className="text-purple-400" />
    return <Sparkles size={classes.icon} className="text-blue-400" />
  }

  const getLevelColor = (level: number) => {
    if (level >= 8) return 'from-yellow-400 to-orange-500'
    if (level >= 5) return 'from-purple-400 to-pink-500'
    if (level >= 3) return 'from-blue-400 to-cyan-500'
    return 'from-green-400 to-blue-500'
  }

  return (
    <div className="space-y-2">
      {/* Level indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getLevelIcon(currentLevel)}
          <span className={`font-bold text-white ${classes.level}`}>
            Taso {currentLevel}
          </span>
          {isMaxLevel && (
            <span className="text-yellow-400 text-xs font-semibold bg-yellow-400/20 px-2 py-1 rounded-full">
              MAX
            </span>
          )}
        </div>
        
        {showNextLevel && !isMaxLevel && (
          <span className={`text-gray-400 ${classes.text}`}>
            Seuraava: {currentLevel + 1}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${classes.container}`}>
          <motion.div
            className={`h-full bg-gradient-to-r ${getLevelColor(currentLevel)} relative overflow-hidden`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ 
              duration: animated ? 1.5 : 0, 
              ease: "easeOut",
              delay: animated ? 0.2 : 0
            }}
          >
            {animated && (
              <motion.div
                className="absolute inset-0 bg-white/30"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            )}
          </motion.div>
        </div>
        
        {/* XP text overlay */}
        <div className={`absolute inset-0 flex items-center justify-center ${classes.text} font-semibold text-white drop-shadow-lg`}>
          {isMaxLevel ? (
            <span>Maksimitaso saavutettu!</span>
          ) : (
            <span>
              {xpForCurrentLevel.toLocaleString()} / {xpNeededForNext.toLocaleString()} XP
            </span>
          )}
        </div>
      </div>

      {/* XP remaining */}
      {!isMaxLevel && (
        <div className={`text-center ${classes.text} text-gray-400`}>
          {(xpNeededForNext - xpForCurrentLevel).toLocaleString()} XP seuraavaan tasoon
        </div>
      )}

      {/* Next level rewards preview */}
      {showRewards && nextLevelRewards && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700"
        >
          <div className={`text-yellow-400 font-semibold mb-2 ${classes.text}`}>
            Tason {currentLevel + 1} palkinnot:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-blue-400">
              +{nextLevelRewards.betPoints.toLocaleString()} BP
            </div>
            <div className="text-purple-400">
              +{nextLevelRewards.diamonds} 💎
            </div>
            <div className="text-green-400 col-span-2">
              Max panos: {nextLevelRewards.maxStake.toLocaleString()} BP
            </div>
          </div>
        </motion.div>
      )}

      {/* Max level celebration */}
      {isMaxLevel && size === 'lg' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-3 p-4 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-lg border border-yellow-400/30 text-center"
        >
          <div className="text-yellow-400 font-bold mb-1">
            Onnittelut! 🎉
          </div>
          <div className="text-gray-300 text-sm">
            Olet saavuttanut maksimitason ja avoit kaikki ominaisuudet!
          </div>
        </motion.div>
      )}
    </div>
  )
}