'use client'

import { useState, useEffect } from 'react'
import { useLiveMatches } from '@/hooks/useLiveMatches'

interface GoalPredictionProps {
  onComplete: (reward: number) => void
}

export default function GoalPrediction({ onComplete }: GoalPredictionProps) {
  const { liveMatches } = useLiveMatches({ pollInterval: 10000 })
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [prediction, setPrediction] = useState<'home' | 'away' | null>(null)
  const [timeLimit] = useState(30) // 30 seconds to make prediction
  const [timeRemaining, setTimeRemaining] = useState(30)
  const [gameState, setGameState] = useState<'selecting' | 'predicting' | 'waiting' | 'result'>('selecting')
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  
  useEffect(() => {
    if (gameState === 'predicting' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
      
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && gameState === 'predicting') {
      // Time's up - auto lose
      handleResult(false)
    }
  }, [timeRemaining, gameState])
  
  const handleSelectMatch = (match: any) => {
    setSelectedMatch(match)
    setGameState('predicting')
    setTimeRemaining(timeLimit)
  }
  
  const handlePrediction = (team: 'home' | 'away') => {
    setPrediction(team)
    setGameState('waiting')
    
    // Simulate waiting for next goal (in real app, would check actual data)
    setTimeout(() => {
      // Random result for demo (60% win rate)
      const won = Math.random() < 0.6
      handleResult(won)
    }, 3000)
  }
  
  const handleResult = (won: boolean) => {
    setResult(won ? 'win' : 'lose')
    setGameState('result')
    
    if (won) {
      setTimeout(() => {
        onComplete(1) // 1 diamond reward
      }, 2000)
    }
  }
  
  if (liveMatches.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-4xl mb-4">⚽</div>
        <h3 className="text-xl font-bold mb-2">No Live Matches</h3>
        <p className="text-gray-600 mb-4">
          Come back when matches are live to play this game!
        </p>
        <button 
          onClick={() => onComplete(0)}
          className="btn-gray"
        >
          Back to Games
        </button>
      </div>
    )
  }
  
  if (gameState === 'selecting') {
    return (
      <div className="space-y-4">
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-2">Next Goal Scorer</h3>
          <p className="text-gray-600 mb-4">
            Select a live match and predict which team will score next!
          </p>
        </div>
        
        <div className="space-y-3">
          {liveMatches.slice(0, 5).map((match) => (
            <div
              key={match.id}
              onClick={() => handleSelectMatch(match)}
              className="glass-card p-4 hover-lift cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-semibold">{match.homeTeam}</div>
                      <div className="text-2xl font-bold text-blue-600">{match.score?.home || 0}</div>
                    </div>
                    <div className="text-gray-500">vs</div>
                    <div>
                      <div className="font-semibold">{match.awayTeam}</div>
                      <div className="text-2xl font-bold text-blue-600">{match.score?.away || 0}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {match.leagueName} • {match.minute}'
                  </div>
                </div>
                <div className="text-blue-600">
                  Select →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (gameState === 'predicting') {
    return (
      <div className="glass-card p-6">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {timeRemaining}s
          </div>
          <h3 className="text-xl font-bold">Who scores next?</h3>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>{selectedMatch.homeTeam}</span>
            <span className="text-2xl text-blue-600">
              {selectedMatch.score?.home || 0} - {selectedMatch.score?.away || 0}
            </span>
            <span>{selectedMatch.awayTeam}</span>
          </div>
          <div className="text-sm text-gray-600 text-center mt-2">
            {selectedMatch.minute}' • {selectedMatch.leagueName}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handlePrediction('home')}
            className="btn-white border-2 border-blue-500 hover:bg-blue-50 py-4"
          >
            <div className="text-lg font-bold">{selectedMatch.homeTeam}</div>
            <div className="text-sm text-gray-600">scores next</div>
          </button>
          <button
            onClick={() => handlePrediction('away')}
            className="btn-white border-2 border-green-500 hover:bg-green-50 py-4"
          >
            <div className="text-lg font-bold">{selectedMatch.awayTeam}</div>
            <div className="text-sm text-gray-600">scores next</div>
          </button>
        </div>
      </div>
    )
  }
  
  if (gameState === 'waiting') {
    return (
      <div className="glass-card p-8 text-center">
        <div className="animate-spin text-4xl mb-4">⚽</div>
        <h3 className="text-xl font-bold mb-2">Waiting for next goal...</h3>
        <p className="text-gray-600">
          You predicted: <span className="font-bold">
            {prediction === 'home' ? selectedMatch.homeTeam : selectedMatch.awayTeam}
          </span>
        </p>
      </div>
    )
  }
  
  if (gameState === 'result') {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-6xl mb-4">
          {result === 'win' ? '🎉' : '😔'}
        </div>
        <h3 className="text-2xl font-bold mb-2">
          {result === 'win' ? 'Correct!' : 'Wrong!'}
        </h3>
        {result === 'win' ? (
          <div>
            <p className="text-gray-600 mb-4">You earned 1 diamond!</p>
            <div className="text-3xl">💎</div>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">Better luck next time!</p>
            <button 
              onClick={() => onComplete(0)}
              className="btn-gray"
            >
              Try Again Later
            </button>
          </div>
        )}
      </div>
    )
  }
  
  return null
}