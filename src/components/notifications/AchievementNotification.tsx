'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Sparkles, Coins, Gem } from 'lucide-react'
import { AchievementData, TIER_DATA, CATEGORY_DATA } from '@/lib/achievement-system'

interface AchievementNotificationProps {
  isVisible: boolean
  onClose: () => void
  achievement: AchievementData
  showRewards?: boolean
}

export default function AchievementNotification({
  isVisible,
  onClose,
  achievement,
  showRewards = true
}: AchievementNotificationProps) {
  const [showGlow, setShowGlow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShowGlow(true)
      // Auto close after 6 seconds
      const timer = setTimeout(onClose, 6000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  const tierData = TIER_DATA[achievement.tier]
  const categoryData = CATEGORY_DATA[achievement.category]

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Achievement Modal */}
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ 
              scale: 1, 
              rotate: 0, 
              opacity: 1,
              transition: {
                type: "spring",
                damping: 12,
                stiffness: 200,
                delay: 0.1
              }
            }}
            exit={{ 
              scale: 0, 
              rotate: 180, 
              opacity: 0,
              transition: { duration: 0.4 }
            }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div 
              className="p-1 rounded-2xl shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${tierData.color}40, ${categoryData.color}40)`
              }}
            >
              <div className="bg-gray-900 rounded-xl p-6 max-w-sm relative overflow-hidden">
                {/* Background glow effect */}
                {showGlow && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 3, 
                      opacity: [0, 0.3, 0],
                      transition: { duration: 2, repeat: Infinity }
                    }}
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: `radial-gradient(circle, ${tierData.color}20 0%, transparent 70%)`
                    }}
                  />
                )}

                {/* Floating sparkles */}
                <div className="absolute inset-0 overflow-hidden">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-yellow-400"
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                      }}
                      animate={{
                        y: [-10, -30, -10],
                        opacity: [0, 1, 0],
                        scale: [0.8, 1.2, 0.8],
                        rotate: [0, 180, 360]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }}
                    >
                      <Sparkles size={12} />
                    </motion.div>
                  ))}
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10"
                >
                  <X size={18} />
                </button>

                {/* Achievement header */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ 
                    y: 0, 
                    opacity: 1,
                    transition: { delay: 0.3 }
                  }}
                  className="text-center mb-4"
                >
                  <div className="text-yellow-400 font-bold text-lg mb-1">
                    Saavutus avattu!
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg">{categoryData.icon}</span>
                    <span className="text-lg">{tierData.icon}</span>
                  </div>
                </motion.div>

                {/* Achievement icon and name */}
                <motion.div
                  initial={{ scale: 0, rotateY: 180 }}
                  animate={{ 
                    scale: 1, 
                    rotateY: 0,
                    transition: { delay: 0.5, type: "spring", damping: 10 }
                  }}
                  className="text-center mb-4"
                >
                  <div 
                    className="mx-auto mb-3 w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${tierData.color}, ${categoryData.color})`
                    }}
                  >
                    <Trophy className="text-white" size={32} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-1">
                    {achievement.name}
                  </h3>
                  <p className="text-gray-300 text-sm mb-2">
                    {achievement.description}
                  </p>
                  
                  {/* Tier badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: 1,
                      transition: { delay: 0.7, type: "spring" }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: `${tierData.color}20`,
                      color: tierData.color,
                      border: `1px solid ${tierData.color}40`
                    }}
                  >
                    {tierData.icon} {tierData.name}
                  </motion.div>
                </motion.div>

                {/* Rewards */}
                {showRewards && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ 
                      y: 0, 
                      opacity: 1,
                      transition: { delay: 0.9 }
                    }}
                    className="border-t border-gray-700 pt-4"
                  >
                    <div className="text-center text-yellow-400 font-semibold mb-3 text-sm">
                      Palkinnot
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {achievement.reward.betPoints > 0 && (
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ 
                            x: 0, 
                            opacity: 1,
                            transition: { delay: 1.1 }
                          }}
                          className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/20"
                        >
                          <Coins className="text-blue-400 mx-auto mb-1" size={16} />
                          <div className="text-blue-400 font-bold text-sm">
                            +{achievement.reward.betPoints.toLocaleString()}
                          </div>
                          <div className="text-gray-400 text-xs">BP</div>
                        </motion.div>
                      )}
                      
                      {achievement.reward.diamonds > 0 && (
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ 
                            y: 0, 
                            opacity: 1,
                            transition: { delay: 1.3 }
                          }}
                          className="bg-purple-500/10 rounded-lg p-2 border border-purple-500/20"
                        >
                          <Gem className="text-purple-400 mx-auto mb-1" size={16} />
                          <div className="text-purple-400 font-bold text-sm">
                            +{achievement.reward.diamonds}
                          </div>
                          <div className="text-gray-400 text-xs">Timantit</div>
                        </motion.div>
                      )}
                      
                      {achievement.reward.xp > 0 && (
                        <motion.div
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ 
                            x: 0, 
                            opacity: 1,
                            transition: { delay: 1.5 }
                          }}
                          className="bg-green-500/10 rounded-lg p-2 border border-green-500/20"
                        >
                          <Sparkles className="text-green-400 mx-auto mb-1" size={16} />
                          <div className="text-green-400 font-bold text-sm">
                            +{achievement.reward.xp}
                          </div>
                          <div className="text-gray-400 text-xs">XP</div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Continue button */}
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: 1,
                    transition: { delay: 1.7, type: "spring" }
                  }}
                  onClick={onClose}
                  className="mt-4 w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold py-2 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 text-sm"
                >
                  Mahtavaa!
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}