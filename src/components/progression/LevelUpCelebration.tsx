'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LevelUpResult } from '@/lib/xp-progression-service'
import { formatCurrency } from '@/lib/currency-system'

interface LevelUpCelebrationProps {
  isVisible: boolean
  levelUpData: LevelUpResult
  onClose: () => void
  onClaimRewards: () => void
}

export default function LevelUpCelebration({
  isVisible,
  levelUpData,
  onClose,
  onClaimRewards
}: LevelUpCelebrationProps) {
  const [showRewards, setShowRewards] = useState(false)
  const [showFeatures, setShowFeatures] = useState(false)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

  // Sound effect functions
  const playLevelUpSound = () => {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      const ctx = audioContext || new AudioContext()
      if (!audioContext) setAudioContext(ctx)
      
      // Create a celebratory sound sequence
      const times = [0, 0.2, 0.4, 0.6]
      const frequencies = [523, 659, 784, 1047] // C, E, G, C (octave)
      
      times.forEach((time, index) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        oscillator.frequency.setValueAtTime(frequencies[index], ctx.currentTime + time)
        oscillator.type = 'triangle'
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime + time)
        gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + time + 0.1)
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.3)
        
        oscillator.start(ctx.currentTime + time)
        oscillator.stop(ctx.currentTime + time + 0.3)
      })
    }
  }

  const playRewardSound = () => {
    if (typeof window !== 'undefined' && audioContext) {
      // Coin collection sound
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1)
      oscillator.type = 'square'
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.2)
    }
  }

  useEffect(() => {
    if (isVisible) {
      // Play level up sound immediately
      playLevelUpSound()
      
      // Sequence the animations
      setTimeout(() => {
        setShowRewards(true)
        playRewardSound()
      }, 1500)
      setTimeout(() => setShowFeatures(true), 2500)
    } else {
      setShowRewards(false)
      setShowFeatures(false)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Celebration Content */}
        <motion.div
          className="relative bg-white rounded-3xl p-8 mx-4 max-w-md w-full shadow-2xl overflow-hidden"
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.5, y: 50 }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500" />
          </div>

          {/* Confetti Effect */}
          {Array.from({ length: 50 }).map((_, i) => {
            const colors = ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-red-400', 'bg-purple-400', 'bg-pink-400']
            const shapes = ['rounded-full', 'rounded-sm']
            return (
              <motion.div
                key={i}
                className={`absolute w-3 h-3 ${colors[i % colors.length]} ${shapes[i % shapes.length]} opacity-80`}
                initial={{ 
                  scale: 0,
                  x: 200,
                  y: 100,
                  rotate: 0
                }}
                animate={{
                  scale: [0, 1, 1, 0],
                  x: [200, Math.random() * 400 - 200, Math.random() * 400 - 200, Math.random() * 400 - 200],
                  y: [100, Math.random() * 200 + 300, Math.random() * 200 + 500, 800],
                  rotate: [0, Math.random() * 720, Math.random() * 1440]
                }}
                transition={{
                  duration: 4,
                  delay: Math.random() * 0.5,
                  ease: "easeOut"
                }}
              />
            )
          })}

          {/* Sparkle Effects */}
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute text-yellow-300"
              style={{
                fontSize: Math.random() * 10 + 10,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                rotate: 360
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 3,
                repeat: Infinity,
                repeatDelay: Math.random() * 4
              }}
            >
              ✨
            </motion.div>
          ))}

          {/* Main Content */}
          <div className="relative z-10 text-center">
            {/* Level Up Header */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <div className="mb-6">
                <span className="text-6xl">🎉</span>
                <h1 className="text-3xl font-bold text-gray-800 mt-2">
                  TASO YLÖS!
                </h1>
              </div>
            </motion.div>

            {/* Level Display */}
            <motion.div
              className="flex items-center justify-center gap-4 mb-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
                  {levelUpData.previousLevel}
                </div>
                <span className="text-sm text-gray-500 mt-1">Vanha</span>
              </div>

              <motion.span
                className="text-4xl"
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              >
                →
              </motion.span>

              <div className="text-center">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      '0 4px 6px rgba(0,0,0,0.1)',
                      '0 8px 25px rgba(255,193,7,0.4)',
                      '0 4px 6px rgba(0,0,0,0.1)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {levelUpData.newLevel}
                </motion.div>
                <span className="text-sm font-semibold text-yellow-600 mt-1">Uusi!</span>
              </div>
            </motion.div>

            {/* Rewards Section */}
            <AnimatePresence>
              {showRewards && (
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    🎁 Palkinnot
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {levelUpData.rewards.betPoints > 0 && (
                      <motion.div
                        className="bg-green-50 border-2 border-green-200 rounded-lg p-3"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-2xl mb-1">💰</div>
                        <div className="text-sm font-semibold text-green-700">
                          +{levelUpData.rewards.betPoints.toLocaleString()} BP
                        </div>
                      </motion.div>
                    )}
                    
                    {levelUpData.rewards.diamonds > 0 && (
                      <motion.div
                        className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="text-2xl mb-1">💎</div>
                        <div className="text-sm font-semibold text-blue-700">
                          +{levelUpData.rewards.diamonds} Timanttia
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Enhanced Limits */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                      <div className="text-xs text-purple-600">Maksimipanos</div>
                      <div className="text-sm font-semibold text-purple-700">
                        {levelUpData.rewards.maxStake.toLocaleString()} BP
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                      <div className="text-xs text-purple-600">Aktiivivetoja</div>
                      <div className="text-sm font-semibold text-purple-700">
                        {levelUpData.rewards.maxActiveBets} kpl
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Unlocked Features */}
            <AnimatePresence>
              {showFeatures && levelUpData.unlockedFeatures.length > 0 && (
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    ✨ Uudet Ominaisuudet
                  </h3>
                  
                  <div className="space-y-2">
                    {levelUpData.unlockedFeatures.map((feature, index) => (
                      <motion.div
                        key={feature}
                        className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                      >
                        <span className="text-sm font-medium text-purple-700">
                          🔓 {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: showFeatures ? 1 : 0.5 }}
            >
              <button
                onClick={onClaimRewards}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                🎁 Lunasta Palkinnot
              </button>
              
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                ✕
              </button>
            </motion.div>

            {/* Motivational Message */}
            <motion.p
              className="mt-4 text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              Jatka pelaamista ansaitaksesi lisää palkintoja! 🚀
            </motion.p>
          </div>

          {/* Floating Celebration Elements */}
          <motion.div
            className="absolute top-4 right-4"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-3xl">🌟</span>
          </motion.div>

          <motion.div
            className="absolute top-4 left-4"
            animate={{ rotate: -360, scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          >
            <span className="text-2xl">🎊</span>
          </motion.div>

          <motion.div
            className="absolute bottom-4 right-8"
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-2xl">🏆</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}