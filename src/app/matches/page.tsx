'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import LeagueSelector from '@/components/leagues/LeagueSelector'
import ExpandedMatchList from '@/components/matches/ExpandedMatchList'
import PlayerNavigation from '@/components/layout/PlayerNavigation'

export default function MatchesPage() {
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(['premier-league'])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  
  const handleLeagueToggle = (leagueId: string) => {
    setSelectedLeagues(prev => {
      if (prev.includes(leagueId)) {
        return prev.filter(id => id !== leagueId)
      }
      return [...prev, leagueId]
    })
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <PlayerNavigation />
      
      <main className="container-modern py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="heading-1 mb-4">Match Center</h1>
          <p className="text-lg text-muted">
            Select leagues and place your predictions. All matches in one place!
          </p>
        </div>
        
        {/* Stats Bar */}
        <div className="glass-card p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">7</div>
              <div className="text-sm text-gray-600">Leagues Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">50+</div>
              <div className="text-sm text-gray-600">Today's Matches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">8</div>
              <div className="text-sm text-gray-600">Live Now</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">1.5x</div>
              <div className="text-sm text-gray-600">Premier League XP</div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <ExpandedMatchList />
        
        {/* Tips Section */}
        <div className="mt-8 glass-card p-6">
          <h2 className="text-lg font-bold mb-4">💡 Pro Tips</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <div className="font-semibold">Mixed Leagues</div>
                <div className="text-sm text-gray-600">
                  Combine leagues in Pitkäveto for 1.3x bonus!
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">⭐</span>
              <div>
                <div className="font-semibold">Premier League</div>
                <div className="text-sm text-gray-600">
                  Get 1.5x XP on all Premier League predictions
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="font-semibold">Derby Matches</div>
                <div className="text-sm text-gray-600">
                  Look for derby badges - 2x XP rewards!
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}