'use client'

import { useLiveMatches } from '@/hooks/useLiveMatches'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function LiveMatchTicker() {
  const { liveMatches, isLoading, lastUpdate, matchCount } = useLiveMatches({
    pollInterval: 20000, // Update every 20 seconds
    enabled: true
  })
  
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    // Show ticker only if there are live matches
    setIsVisible(matchCount > 0)
  }, [matchCount])
  
  if (!isVisible || isLoading) return null
  
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg">
      <div className="container-modern py-2">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="animate-pulse">🔴</span>
            <span className="font-bold text-sm">LIVE NOW</span>
            <span className="text-xs opacity-80">({matchCount})</span>
          </div>
          
          <div className="flex gap-4 flex-1">
            {liveMatches.slice(0, 5).map((match) => (
              <Link
                key={match.id}
                href={`/live/${match.id}`}
                className="flex items-center gap-3 px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors min-w-[250px] flex-shrink-0"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{match.homeTeamShort}</span>
                      <span className="text-lg font-bold">{match.score?.home || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{match.awayTeamShort}</span>
                      <span className="text-lg font-bold">{match.score?.away || 0}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs opacity-80">
                    {match.minute}'
                  </div>
                </div>
                
                <div className="text-xs bg-white/20 px-2 py-1 rounded">
                  {match.leagueName}
                </div>
              </Link>
            ))}
            
            {matchCount > 5 && (
              <Link
                href="/live"
                className="flex items-center justify-center px-4 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors min-w-[150px] flex-shrink-0"
              >
                <span className="text-sm">View all {matchCount} →</span>
              </Link>
            )}
          </div>
          
          {lastUpdate && (
            <div className="text-xs opacity-60 flex-shrink-0">
              Updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}