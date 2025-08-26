'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Challenge, ChallengeDifficulty, DIFFICULTY_CONFIG, getChallengeProgress, getTimeRemaining } from '@/lib/daily-challenges'

interface DailyChallengesWidgetProps {
  challenges: (Challenge & { progress: number })[]
  onClaimReward?: (challengeId: string) => void
  isCompact?: boolean
}

export default function DailyChallengesWidget({
  challenges,
  onClaimReward,
  isCompact = false
}: DailyChallengesWidgetProps) {
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>({})
  const [completedAnimations, setCompletedAnimations] = useState<Set<string>>(new Set())

  useEffect(() => {
    const updateTimers = () => {
      const newTimes: { [key: string]: string } = {}
      challenges.forEach(challenge => {
        newTimes[challenge.id] = getTimeRemaining(challenge.endDate)
      })
      setTimeRemaining(newTimes)
    }

    updateTimers()
    const interval = setInterval(updateTimers, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [challenges])

  const handleClaimReward = (challengeId: string) => {
    setCompletedAnimations(prev => new Set([...prev, challengeId]))
    onClaimReward?.(challengeId)
  }

  if (challenges.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <span className="text-4xl mb-2 block">🎯</span>
        <h3 className="font-semibold text-gray-800 mb-2">Ei aktiivisia haasteita</h3>
        <p className="text-sm text-gray-600">Uudet haasteet ladataan pian!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <h2 className="text-lg font-semibold">Päivittäiset Haasteet</h2>
            <p className="text-sm opacity-90">
              {challenges.filter(c => c.progress >= c.requirement.target).length} / {challenges.length} valmis
            </p>
          </div>
        </div>
      </div>

      {/* Challenges List */}
      <div className={`p-4 space-y-4 ${isCompact ? 'max-h-96 overflow-y-auto' : ''}`}>
        <AnimatePresence>
          {challenges.map((challenge, index) => {
            const progressPercentage = getChallengeProgress(challenge.progress, challenge.requirement.target)
            const isCompleted = challenge.progress >= challenge.requirement.target
            const difficultyConfig = DIFFICULTY_CONFIG[challenge.difficulty]

            return (
              <motion.div
                key={challenge.id}
                className={`
                  relative border-2 rounded-lg p-4 transition-all duration-300
                  ${isCompleted 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={!isCompleted ? { scale: 1.02 } : {}}
              >
                {/* Completed Checkmark */}
                {isCompleted && (
                  <motion.div
                    className="absolute top-2 right-2"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring' }}
                  >
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </motion.div>
                )}

                {/* Challenge Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                    style={{ backgroundColor: difficultyConfig.color }}
                  >
                    {difficultyConfig.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {challenge.name}
                      </h3>
                      <span 
                        className="text-xs px-2 py-1 rounded-full text-white font-medium"
                        style={{ backgroundColor: difficultyConfig.color }}
                      >
                        {difficultyConfig.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {challenge.description}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Edistyminen</span>
                    <span className="text-sm font-medium">
                      {challenge.progress} / {challenge.requirement.target}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-green-400 to-green-600' 
                          : 'bg-gradient-to-r from-blue-400 to-purple-600'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                  
                  <div className="text-center mt-1">
                    <span className="text-xs text-gray-500">
                      {Math.floor(progressPercentage)}% valmis
                    </span>
                  </div>
                </div>

                {/* Rewards */}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-600">Palkinnot:</div>
                  <div className="flex items-center gap-2">
                    {challenge.reward.betPoints > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        {challenge.reward.betPoints} BP
                      </span>
                    )}
                    {challenge.reward.diamonds > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        💎 {challenge.reward.diamonds}
                      </span>
                    )}
                    {challenge.reward.xp > 0 && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {challenge.reward.xp} XP
                      </span>
                    )}
                  </div>
                </div>

                {/* Special Rewards */}
                {challenge.reward.specialReward && (
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-xs text-yellow-700 font-medium">
                      🌟 Erikoispalkinto: {challenge.reward.specialReward.type}
                    </div>
                  </div>
                )}

                {/* Bottom Section */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    ⏰ {timeRemaining[challenge.id] || 'Ladataan...'}
                  </div>
                  
                  {isCompleted && (
                    <motion.button
                      onClick={() => handleClaimReward(challenge.id)}
                      className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      whileTap={{ scale: 0.95 }}
                      disabled={completedAnimations.has(challenge.id)}
                    >
                      {completedAnimations.has(challenge.id) ? (
                        <span className="flex items-center gap-1">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Lunastetaan...
                        </span>
                      ) : (
                        '🎁 Lunasta'
                      )}
                    </motion.button>
                  )}
                </div>

                {/* Pulsing Border for Near Completion */}
                {!isCompleted && progressPercentage > 75 && (
                  <motion.div
                    className="absolute inset-0 border-2 border-yellow-400 rounded-lg pointer-events-none"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {!isCompact && (
        <div className="bg-gray-50 px-4 py-3 border-t">
          <p className="text-xs text-gray-600 text-center">
            Uudet haasteet päivittäin klo 00:00! 🌅
          </p>
        </div>
      )}
    </div>
  )
}