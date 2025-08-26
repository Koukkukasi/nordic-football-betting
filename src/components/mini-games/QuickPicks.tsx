'use client'

interface QuickPicksProps {
  onComplete: (reward: number) => void
}

export default function QuickPicks({ onComplete }: QuickPicksProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold mb-4">Quick Picks</h3>
      <p className="text-gray-600 mb-4">
        Make 5 rapid predictions in a row to earn 2 diamonds!
      </p>
      <button 
        onClick={() => onComplete(2)}
        className="btn-blue"
      >
        Complete (Demo)
      </button>
    </div>
  )
}