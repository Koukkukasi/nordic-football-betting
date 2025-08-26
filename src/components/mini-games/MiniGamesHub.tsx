'use client'

import { useState } from 'react'
import GoalPrediction from './GoalPrediction'
import MatchResultPredictor from './MatchResultPredictor'
import PlayerStatsChallenge from './PlayerStatsChallenge'
import QuickPicks from './QuickPicks'

export interface MiniGame {
  id: string
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  diamondReward: number
  cooldownMinutes: number
  icon: string
}

const MINI_GAMES: MiniGame[] = [
  {
    id: 'goal-prediction',
    name: 'Next Goal Scorer',
    description: 'Predict which team scores next in live matches',
    difficulty: 'easy',
    diamondReward: 1,
    cooldownMinutes: 5,
    icon: '⚽'
  },
  {
    id: 'match-result',
    name: 'Match Result Predictor',
    description: 'Predict the final result of upcoming matches',
    difficulty: 'medium',
    diamondReward: 3,
    cooldownMinutes: 30,
    icon: '🎯'
  },
  {
    id: 'player-stats',
    name: 'Player Stats Challenge',
    description: 'Guess player statistics correctly',
    difficulty: 'hard',
    diamondReward: 5,
    cooldownMinutes: 60,
    icon: '📊'
  },
  {
    id: 'quick-picks',
    name: 'Quick Picks',
    description: 'Make 5 rapid predictions in a row',
    difficulty: 'easy',
    diamondReward: 2,
    cooldownMinutes: 15,
    icon: '⚡'
  }
]

export default function MiniGamesHub() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [diamonds, setDiamonds] = useState(10) // Starting diamonds
  const [lastPlayed, setLastPlayed] = useState<Record<string, Date>>({})
  
  const isGameAvailable = (gameId: string, cooldownMinutes: number) => {
    const lastPlayedTime = lastPlayed[gameId]
    if (!lastPlayedTime) return true
    
    const now = new Date()
    const cooldownMs = cooldownMinutes * 60 * 1000
    return now.getTime() - lastPlayedTime.getTime() >= cooldownMs
  }
  
  const getTimeUntilAvailable = (gameId: string, cooldownMinutes: number) => {
    const lastPlayedTime = lastPlayed[gameId]
    if (!lastPlayedTime) return 0
    
    const now = new Date()
    const cooldownMs = cooldownMinutes * 60 * 1000
    const timePassed = now.getTime() - lastPlayedTime.getTime()
    const timeRemaining = Math.max(0, cooldownMs - timePassed)
    
    return Math.ceil(timeRemaining / 60000) // Convert to minutes
  }
  
  const handleGameComplete = (gameId: string, reward: number) => {
    setDiamonds(prev => prev + reward)
    setLastPlayed(prev => ({ ...prev, [gameId]: new Date() }))
    setSelectedGame(null)
  }
  
  const renderGame = () => {
    switch (selectedGame) {
      case 'goal-prediction':
        return <GoalPrediction onComplete={(reward) => handleGameComplete('goal-prediction', reward)} />
      case 'match-result':
        return <MatchResultPredictor onComplete={(reward) => handleGameComplete('match-result', reward)} />
      case 'player-stats':
        return <PlayerStatsChallenge onComplete={(reward) => handleGameComplete('player-stats', reward)} />
      case 'quick-picks':
        return <QuickPicks onComplete={(reward) => handleGameComplete('quick-picks', reward)} />
      default:
        return null
    }
  }
  
  if (selectedGame) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedGame(null)}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← Back to Mini Games
        </button>
        {renderGame()}
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Diamond Balance */}
      <div className="glass-card p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Mini Games Hub</h2>
            <p className="text-gray-600">Earn diamonds by making predictions!</p>
          </div>
          <div className="text-center">
            <div className="text-3xl">💎</div>
            <div className="text-2xl font-bold text-blue-600">{diamonds}</div>
            <div className="text-sm text-gray-600">Diamonds</div>
          </div>
        </div>
      </div>
      
      {/* Game Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {MINI_GAMES.map((game) => {
          const available = isGameAvailable(game.id, game.cooldownMinutes)
          const minutesRemaining = getTimeUntilAvailable(game.id, game.cooldownMinutes)
          
          return (
            <div
              key={game.id}
              className={`glass-card p-6 ${
                available 
                  ? 'hover-lift cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => available && setSelectedGame(game.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{game.icon}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    game.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    game.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {game.difficulty}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    +{game.diamondReward} 💎
                  </span>
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-2">{game.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{game.description}</p>
              
              {available ? (
                <button className="w-full btn-blue">
                  Play Now
                </button>
              ) : (
                <div className="w-full text-center">
                  <div className="text-sm text-gray-500">
                    Available in {minutesRemaining} minutes
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.max(0, 100 - (minutesRemaining / game.cooldownMinutes) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Info Section */}
      <div className="glass-card p-4 bg-yellow-50 border border-yellow-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">How to earn diamonds:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Complete mini-games successfully</li>
              <li>Higher difficulty = More diamonds</li>
              <li>Each game has a cooldown period</li>
              <li>Use diamonds for live betting boosts!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}