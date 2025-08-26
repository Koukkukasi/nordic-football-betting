'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LevelProgressBarProps {
  level: number
  currentXP: number
  nextLevelXP: number
  showAnimation?: boolean
  onLevelUp?: () => void
}

export default function LevelProgressBar({
  level,
  currentXP,
  nextLevelXP,
  showAnimation = false,
  onLevelUp
}: LevelProgressBarProps) {
  const [displayXP, setDisplayXP] = useState(currentXP)
  const progressPercentage = Math.min((currentXP / nextLevelXP) * 100, 100)

  useEffect(() => {
    if (showAnimation) {
      // Animate XP counting up
      const duration = 2000 // 2 seconds
      const startTime = Date.now()
      const startXP = displayXP

      const animateXP = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Ease-out animation
        const easedProgress = 1 - Math.pow(1 - progress, 3)
        const newXP = Math.floor(startXP + (currentXP - startXP) * easedProgress)
        
        setDisplayXP(newXP)

        if (progress < 1) {
          requestAnimationFrame(animateXP)
        } else if (onLevelUp && progressPercentage >= 100) {
          onLevelUp()
        }
      }

      requestAnimationFrame(animateXP)
    } else {
      setDisplayXP(currentXP)
    }
  }, [currentXP, showAnimation, onLevelUp, progressPercentage, displayXP])

  return (
    <div className="relative">
      {/* Level Badge */}
      <div className="flex items-center gap-3 mb-2">
        <motion.div
          className="flex items-center gap-2"
          initial={{ scale: showAnimation ? 0.8 : 1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">{level}</span>
            </div>
            {progressPercentage >= 100 && (
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2, type: 'spring' }}
              >
                <span className="text-white text-xs">✓</span>
              </motion.div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800">Taso {level}</h3>
            <p className="text-sm text-gray-600">
              {displayXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
            </p>
          </div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full relative overflow-hidden"
            initial={{ width: showAnimation ? '0%' : `${progressPercentage}%` }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: showAnimation ? 2 : 0.3, ease: 'easeOut' }}
          >
            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{ width: '50%' }}
            />
          </motion.div>
        </div>

        {/* Progress Percentage */}
        <motion.div
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full px-2 py-1 text-xs font-semibold text-gray-700 shadow-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: showAnimation ? 1 : 0 }}
        >
          {Math.floor(progressPercentage)}%
        </motion.div>
      </div>

      {/* Next Level Preview */}
      {level < 10 && (
        <motion.div
          className="mt-2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: showAnimation ? 1.5 : 0 }}
        >
          <p className="text-xs text-gray-500">
            Seuraava taso: {nextLevelXP - currentXP} XP jäljellä
          </p>
        </motion.div>
      )}

      {/* Max Level Indicator */}
      {level >= 10 && (
        <motion.div
          className="mt-2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            <span>👑</span>
            <span>MAX TASO SAAVUTETTU!</span>
            <span>👑</span>
          </div>
        </motion.div>
      )}

      {/* Level Up Animation Overlay */}
      <AnimatePresence>
        {showAnimation && progressPercentage >= 100 && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2 }}
          >
            {/* Sparkles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                initial={{ 
                  scale: 0, 
                  x: '50%', 
                  y: '50%' 
                }}
                animate={{
                  scale: [0, 1, 0],
                  x: [
                    '50%',
                    `${50 + Math.cos((i / 8) * Math.PI * 2) * 100}%`
                  ],
                  y: [
                    '50%',
                    `${50 + Math.sin((i / 8) * Math.PI * 2) * 100}%`
                  ]
                }}
                transition={{
                  duration: 1,
                  delay: 2 + i * 0.1,
                  ease: 'easeOut'
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}