'use client'

interface PlayerStatsChallengeProps {
  onComplete: (reward: number) => void
}

export default function PlayerStatsChallenge({ onComplete }: PlayerStatsChallengeProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold mb-4">Player Stats Challenge</h3>
      <p className="text-gray-600 mb-4">
        Guess player statistics correctly to earn 5 diamonds!
      </p>
      <button 
        onClick={() => onComplete(5)}
        className="btn-blue"
      >
        Complete (Demo)
      </button>
    </div>
  )
}