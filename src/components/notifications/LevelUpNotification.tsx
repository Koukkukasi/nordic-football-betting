'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Crown, Sparkles, Gift } from 'lucide-react'
import { LEVEL_REWARDS } from '@/lib/currency-system'

interface LevelUpNotificationProps {
  isVisible: boolean
  onClose: () => void
  oldLevel: number
  newLevel: number
  rewards: typeof LEVEL_REWARDS[keyof typeof LEVEL_REWARDS]
}

export default function LevelUpNotification({
  isVisible,
  onClose,
  oldLevel,
  newLevel,
  rewards
}: LevelUpNotificationProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true)
      // Auto close after 8 seconds
      const timer = setTimeout(onClose, 8000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  const confettiPieces = Array.from({ length: 50 }, (_, i) => i)

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Confetti */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-40">
              {confettiPieces.map((piece) => (
                <motion.div
                  key={piece}
                  className={`absolute w-2 h-2 rounded-full ${
                    ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-red-400'][
                      piece % 5
                    ]
                  }`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: -10
                  }}
                  initial={{ y: -10, rotate: 0, opacity: 1 }}
                  animate={{
                    y: window.innerHeight + 10,
                    rotate: 360,
                    opacity: 0,
                    x: Math.random() * 200 - 100
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    ease: 'easeOut',
                    delay: Math.random() * 1
                  }}
                />
              ))}
            </div>
          )}

          {/* Main Notification */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              transition: {
                type: "spring",
                damping: 15,
                stiffness: 300
              }
            }}
            exit={{ 
              scale: 0.8, 
              opacity: 0, 
              y: -50,
              transition: { duration: 0.3 }
            }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 p-1 rounded-2xl shadow-2xl">
              <div className="bg-gray-900 rounded-xl p-8 text-center max-w-md relative overflow-hidden">
                {/* Background sparkles */}
                <div className="absolute inset-0 opacity-10">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-yellow-400"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                        rotate: [0, 180, 360]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }}
                    >
                      <Sparkles size={16} />
                    </motion.div>
                  ))}
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                {/* Crown icon */}
                <motion.div
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ 
                    rotate: 0, 
                    scale: 1,
                    transition: { delay: 0.2, type: "spring" }
                  }}
                  className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                >
                  <Crown className="text-white" size={32} />
                </motion.div>

                {/* Level up text */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ 
                    y: 0, 
                    opacity: 1,
                    transition: { delay: 0.4 }
                  }}
                >
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Taso ylös!
                  </h2>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-gray-300">
                      {oldLevel}
                    </span>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ 
                        x: 0, 
                        opacity: 1,
                        transition: { delay: 0.6 }
                      }}
                      className="text-yellow-400"
                    >
                      →
                    </motion.div>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: 1,
                        transition: { delay: 0.8, type: "spring" }
                      }}
                      className="text-3xl font-bold text-yellow-400"
                    >
                      {newLevel}
                    </motion.span>
                  </div>
                </motion.div>

                {/* Rewards */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ 
                    y: 0, 
                    opacity: 1,
                    transition: { delay: 1.0 }
                  }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-center gap-2 text-yellow-400 mb-3">
                    <Gift size={20} />
                    <span className="font-semibold">Palkinnot</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {rewards.betPoints > 0 && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ 
                          x: 0, 
                          opacity: 1,
                          transition: { delay: 1.2 }
                        }}
                        className="bg-blue-500/20 rounded-lg p-3"
                      >
                        <div className="text-blue-400 font-bold text-lg">
                          +{rewards.betPoints.toLocaleString()}
                        </div>
                        <div className="text-gray-300 text-sm">BetPoints</div>
                      </motion.div>
                    )}
                    
                    {rewards.diamonds > 0 && (
                      <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ 
                          x: 0, 
                          opacity: 1,
                          transition: { delay: 1.4 }
                        }}
                        className="bg-purple-500/20 rounded-lg p-3"
                      >
                        <div className="text-purple-400 font-bold text-lg">
                          +{rewards.diamonds}
                        </div>
                        <div className="text-gray-300 text-sm">Timanttia</div>
                      </motion.div>
                    )}
                  </div>

                  {/* New benefits */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ 
                      y: 0, 
                      opacity: 1,
                      transition: { delay: 1.6 }
                    }}
                    className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                  >
                    <h4 className="text-green-400 font-semibold mb-2">Uudet edut</h4>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div>• Max panos: {rewards.maxStake.toLocaleString()} BP</div>
                      <div>• Aktiivisia vetoja: {rewards.maxActiveBets}</div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Continue button */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ 
                    y: 0, 
                    opacity: 1,
                    transition: { delay: 1.8 }
                  }}
                  onClick={onClose}
                  className="mt-6 w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold py-3 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105"
                >
                  Jatka pelaamista
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}