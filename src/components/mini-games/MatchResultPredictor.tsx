'use client'

interface MatchResultPredictorProps {
  onComplete: (reward: number) => void
}

export default function MatchResultPredictor({ onComplete }: MatchResultPredictorProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold mb-4">Match Result Predictor</h3>
      <p className="text-gray-600 mb-4">
        Predict the final result of upcoming matches to earn 3 diamonds!
      </p>
      <button 
        onClick={() => onComplete(3)}
        className="btn-blue"
      >
        Complete (Demo)
      </button>
    </div>
  )
}