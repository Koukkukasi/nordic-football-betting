'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface TourStep {
  title: string
  description: string
  icon: string
  action?: string
  actionUrl?: string
}

export default function WelcomeTour() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showTour, setShowTour] = useState(false)

  const tourSteps: TourStep[] = [
    {
      title: 'Welcome to Nordic Football!',
      description: 'Experience the thrill of Nordic football betting with enhanced odds and diamond rewards. This is a free-to-play entertainment platform.',
      icon: '⚽',
    },
    {
      title: 'Your Starting Bonus',
      description: 'You\'ve received 10,000 BetPoints and 50 Diamonds to start your betting journey. BetPoints are for placing bets, Diamonds boost your winnings!',
      icon: '💎',
    },
    {
      title: 'Live Betting',
      description: 'Bet on real Nordic matches as they happen! Earn diamonds based on your bet odds - the riskier the bet, the more diamonds you earn.',
      icon: '📱',
      action: 'Try Live Betting',
      actionUrl: '/betting/live'
    },
    {
      title: 'Pitkäveto Builder',
      description: 'Create accumulator bets with minimum 3 selections. Use your diamonds to boost winnings up to 3× with our Diamond Boost feature!',
      icon: '🏆',
      action: 'Build Pitkäveto',
      actionUrl: '/betting/pitkaveto'
    },
    {
      title: 'League Table Challenges',
      description: 'No live matches? Earn diamonds by predicting final league table positions in our Table Challenge feature!',
      icon: '📊',
      action: 'Try Challenges',
      actionUrl: '/challenges'
    },
    {
      title: 'Level Up System',
      description: 'As you bet more, you level up! Higher levels unlock bigger betting limits and exclusive features. Currently Level 1 with 2 active bets max.',
      icon: '⭐',
    },
    {
      title: 'Get More BetPoints',
      description: 'Need more BetPoints? Visit our store for affordable packages starting at €4.99. All purchases support the platform development!',
      icon: '💰',
      action: 'Visit Store',
      actionUrl: '/store'
    }
  ]

  useEffect(() => {
    // Check if user has completed the tour
    const tourCompleted = localStorage.getItem('nordic-tour-completed')
    if (!tourCompleted) {
      setShowTour(true)
    }
  }, [])

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeTour = () => {
    localStorage.setItem('nordic-tour-completed', 'true')
    setShowTour(false)
  }

  const skipTour = () => {
    localStorage.setItem('nordic-tour-completed', 'true')
    setShowTour(false)
  }

  if (!showTour) return null

  const step = tourSteps[currentStep]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div className="text-2xl">{step.icon}</div>
            <div className="text-sm text-gray-500">
              {currentStep + 1} / {tourSteps.length}
            </div>
          </div>
          <h2 className="text-xl font-bold mt-2" style={{ color: 'var(--nordic-text-primary)' }}>
            {step.title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">
            {step.description}
          </p>

          {step.action && step.actionUrl && (
            <div className="mt-4">
              <Link
                href={step.actionUrl}
                onClick={completeTour}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {step.action} →
              </Link>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="px-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between">
          <div>
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Previous
              </button>
            )}
          </div>
          
          <div className="space-x-3">
            <button
              onClick={skipTour}
              className="text-gray-500 hover:text-gray-700"
            >
              Skip Tour
            </button>
            <button
              onClick={nextStep}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {currentStep === tourSteps.length - 1 ? 'Get Started!' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}