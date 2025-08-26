'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Lock, CheckCircle, Coins, Gem, Sparkles } from 'lucide-react'
import { AchievementData, TIER_DATA, CATEGORY_DATA } from '@/lib/achievement-system'

interface AchievementCardProps {
  achievement: AchievementData
  progress: number
  isCompleted: boolean
  isLocked?: boolean
  onClick?: () => void
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function AchievementCard({
  achievement,
  progress,
  isCompleted,
  isLocked = false,
  onClick,
  showProgress = true,
  size = 'md'
}: AchievementCardProps) {
  // Add defensive checks
  if (!achievement) {
    console.warn('AchievementCard: achievement prop is undefined')
    return null
  }
  
  const tierData = TIER_DATA[achievement.tier] || { color: '#CD7F32', name: 'Bronze', icon: Trophy }
  const categoryData = CATEGORY_DATA[achievement.category] || { color: '#3B82F6', name: 'Betting', icon: Trophy }
  
  const target = achievement.requirement?.target || 1
  const progressPercentage = Math.min((progress / target) * 100, 100)
  
  const sizeClasses = {
    sm: {
      container: 'p-3',
      icon: 'w-8 h-8',
      iconSize: 16,
      title: 'text-sm',
      description: 'text-xs',
      progress: 'h-1.5',
      rewards: 'text-xs'
    },
    md: {
      container: 'p-4',
      icon: 'w-10 h-10',
      iconSize: 20,
      title: 'text-base',
      description: 'text-sm',
      progress: 'h-2',
      rewards: 'text-sm'
    },
    lg: {
      container: 'p-6',
      icon: 'w-12 h-12',
      iconSize: 24,
      title: 'text-lg',
      description: 'text-base',
      progress: 'h-3',
      rewards: 'text-base'
    }
  }
  
  const classes = sizeClasses[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: onClick ? 1.02 : 1,
        transition: { type: "spring", stiffness: 400, damping: 17 }
      }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl transition-all duration-300
        ${classes.container}
        ${onClick ? 'cursor-pointer' : ''}
        ${isCompleted 
          ? `bg-gradient-to-br from-${tierData.color}/20 to-${categoryData.color}/20 border-2`
          : 'bg-gray-800 border'
        }
        ${isCompleted 
          ? `border-${tierData.color}/50` 
          : isLocked 
            ? 'border-gray-600' 
            : 'border-gray-700 hover:border-gray-600'
        }
        ${isLocked ? 'opacity-60' : ''}
      `}
      style={{
        background: isCompleted 
          ? `linear-gradient(135deg, ${tierData.color}15, ${categoryData.color}15)`
          : undefined
      }}
    >
      {/* Completion glow effect */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(circle at center, ${tierData.color}20 0%, transparent 70%)`
          }}
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div 
              className={`
                ${classes.icon} rounded-lg flex items-center justify-center relative
                ${isCompleted 
                  ? `bg-gradient-to-br from-${tierData.color} to-${categoryData.color} shadow-lg`
                  : isLocked
                    ? 'bg-gray-700'
                    : 'bg-gray-600'
                }
              `}
              style={{
                background: isCompleted 
                  ? `linear-gradient(135deg, ${tierData.color}, ${categoryData.color})`
                  : undefined
              }}
            >
              {isLocked ? (
                <Lock size={classes.iconSize} className="text-gray-400" />
              ) : isCompleted ? (
                <CheckCircle size={classes.iconSize} className="text-white" />
              ) : (
                <Trophy size={classes.iconSize} className="text-gray-300" />
              )}
              
              {/* Category indicator */}
              <div className="absolute -top-1 -right-1 text-xs">
                {categoryData.icon}
              </div>
            </div>

            {/* Title and tier */}
            <div>
              <h3 className={`font-bold text-white ${classes.title}`}>
                {achievement.name}
              </h3>
              <div className="flex items-center gap-2">
                <span 
                  className={`text-xs font-medium px-2 py-0.5 rounded-full`}
                  style={{
                    backgroundColor: `${tierData.color}20`,
                    color: tierData.color
                  }}
                >
                  {tierData.icon} {tierData.name}
                </span>
                <span 
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${categoryData.color}20`,
                    color: categoryData.color
                  }}
                >
                  {categoryData.name}
                </span>
              </div>
            </div>
          </div>

          {/* Completion status */}
          {isCompleted && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-green-400"
            >
              <CheckCircle size={20} />
            </motion.div>
          )}
        </div>

        {/* Description */}
        <p className={`text-gray-300 mb-3 ${classes.description}`}>
          {achievement.description}
        </p>

        {/* Progress */}
        {showProgress && !isLocked && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-gray-400 ${classes.rewards}`}>
                Edistyminen
              </span>
              <span className={`font-semibold ${classes.rewards}`}>
                {progress.toLocaleString()} / {target.toLocaleString()}
              </span>
            </div>
            
            <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${classes.progress}`}>
              <motion.div
                className={`h-full bg-gradient-to-r transition-all duration-500`}
                style={{
                  width: `${progressPercentage}%`,
                  background: isCompleted 
                    ? `linear-gradient(90deg, ${tierData.color}, ${categoryData.color})`
                    : `linear-gradient(90deg, ${categoryData.color}80, ${tierData.color}80)`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>
        )}

        {/* Rewards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Coins size={16} className="text-blue-400" />
            </div>
            <div className={`text-blue-400 font-bold ${classes.rewards}`}>
              {(achievement.reward?.betPoints || 0).toLocaleString()}
            </div>
            <div className="text-gray-500 text-xs">BP</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Gem size={16} className="text-purple-400" />
            </div>
            <div className={`text-purple-400 font-bold ${classes.rewards}`}>
              {achievement.reward?.diamonds || 0}
            </div>
            <div className="text-gray-500 text-xs">Timanttia</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Sparkles size={16} className="text-green-400" />
            </div>
            <div className={`text-green-400 font-bold ${classes.rewards}`}>
              {achievement.reward?.xp || 0}
            </div>
            <div className="text-gray-500 text-xs">XP</div>
          </div>
        </div>

        {/* Secret achievement indicator */}
        {achievement.isSecret && !isCompleted && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </motion.div>
  )
}