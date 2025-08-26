'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PlayerNavigation from '@/components/layout/PlayerNavigation'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const router = useRouter()
  const [currentLevel, setCurrentLevel] = useState(1)
  const [currentXP, setCurrentXP] = useState(0)
  const [nextLevelXP, setNextLevelXP] = useState(100)

  useEffect(() => {
    // Check if user has profile
    const profile = localStorage.getItem('userProfile')
    if (profile) {
      const userData = JSON.parse(profile)
      setCurrentLevel(userData.level || 1)
      setCurrentXP(userData.xp || 0)
      // Calculate next level XP requirement
      const xpLevels = [0, 100, 300, 600, 1000, 2000, 3500, 5500, 8500, 12500]
      setNextLevelXP(xpLevels[userData.level] || 100)
    }
  }, [])

  const handleDemoAccess = () => {
    // Create demo user for instant access
    localStorage.setItem('authUser', JSON.stringify({
      id: 'demo',
      email: 'demo@nordic.com',
      username: 'DemoPlayer'
    }))
    
    localStorage.setItem('userProfile', JSON.stringify({
      id: 'demo',
      email: 'demo@nordic.com',
      username: 'DemoPlayer',
      betPoints: 10000,
      diamonds: 50,
      level: 1,
      xp: 0,
      totalBets: 0,
      totalWins: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastLoginAt: null,
      createdAt: new Date().toISOString()
    }))
    
    router.push('/matches')
  }

  const progressPercentage = Math.min((currentXP / nextLevelXP) * 100, 100)
  
  return (
    <div className="min-h-screen">
      <PlayerNavigation />

      <main className="animate-fade-in">
        {/* Hero Section with Progression */}
        <section className="py-16 px-4">
          <div className="container-modern">
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              {/* Main Hero Content */}
              <div className="lg:col-span-2">
                <div className="mb-8 animate-bounce-in">
                  <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-dark-green font-bold text-sm shadow-lg">
                    🎉 100% Free to Play - No Real Money Required
                  </span>
                </div>

                <h1 className="heading-1 mb-6 animate-slide-up">
                  Nordic Football Betting
                </h1>
                
                <p className="text-xl text-muted mb-8 max-w-2xl animate-slide-up">
                  Experience the thrill of football betting on Finnish and Swedish leagues without any financial risk. 
                  Level up from Rookie to Legend!
                </p>

                <div className="flex gap-6 mb-8 flex-wrap animate-slide-up">
                  <button 
                    onClick={handleDemoAccess}
                    className="relative overflow-hidden btn-green-cta btn-large hover-lift group"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      🚀 Start at Level 1
                      <span className="text-xs opacity-80">(3 bets allowed)</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  </button>
                  
                  <Link href="/matches" className="btn-orange-gradient btn-large hover-lift">
                    <span className="flex items-center gap-2">
                      👀 Preview Matches
                      <span className="text-xs opacity-80">(Demo mode)</span>
                    </span>
                  </Link>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-8 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇫🇮</span>
                    <span className="text-2xl">🇸🇪</span>
                    <span className="text-muted">Nordic Leagues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎮</span>
                    <span className="text-muted">Free Gaming</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    <span className="text-muted">10 Levels</span>
                  </div>
                </div>
              </div>

              {/* Progression Preview Card */}
              <div className="lg:col-span-1">
                <div className="glass-card-large p-6 hover-lift">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-dark mb-2">Your Journey Awaits</h3>
                    <div className="flex justify-center items-center gap-2 mb-4">
                      <span className="text-2xl">🌱</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-2xl">⚽</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-2xl">🏅</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-2xl">👑</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-2xl">🏆</span>
                    </div>
                  </div>
                  
                  {/* Progression highlights */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Level 1 Rookie:</span>
                      <span className="text-dark font-semibold">3 bets/day</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Level 5 Veteran:</span>
                      <span className="text-green-600 font-semibold">15 bets/day</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Level 10 Legend:</span>
                      <span className="text-purple-600 font-semibold">20 bets + Crown</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="text-xs text-gray-600 mb-2">All game modes available from Day 1!</div>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Tulosveto</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Pitkäveto</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">Live Betting</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                    <div className="text-xs text-green-800 font-semibold text-center">
                      💎 Earn diamonds through mini-games!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Level Progression Bar */}
        <section className="py-8 px-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="container-modern">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-6">10 Levels to Master</h2>
              
              {/* Level Progress Bar */}
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                  {/* Background segments for each level */}
                  <div className="absolute inset-0 flex">
                    {[1,2,3,4,5,6,7,8,9,10].map((level, idx) => (
                      <div key={level} className={`flex-1 border-r border-white ${
                        idx < currentLevel ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        idx === currentLevel - 1 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                        'bg-gray-300'
                      }`} />
                    ))}
                  </div>
                  
                  {/* Level markers */}
                  <div className="absolute inset-0 flex justify-between items-center px-2">
                    {[1,2,3,4,5,6,7,8,9,10].map((level) => (
                      <div key={level} className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${
                        level <= currentLevel ? 'bg-green-500 text-white' : 'bg-gray-400 text-gray-600'
                      }`}>
                        {level}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Level names */}
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>Rookie</span>
                  <span>Amateur</span>
                  <span>Regular</span>
                  <span>Expert</span>
                  <span>Legend</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Level Benefits Showcase */}
        <section className="py-16 px-4">
          <div className="container-modern">
            <div className="text-center mb-12">
              <h2 className="heading-2 mb-4">Level Up Benefits</h2>
              <p className="text-lg text-muted">Every level unlocks new betting power</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Bronze Tier */}
              <div className="glass-card-large text-center hover-lift">
                <div className="text-4xl mb-4">🥉</div>
                <h3 className="text-xl font-bold mb-4">Levels 1-3: Bronze</h3>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 3-8 simultaneous bets</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Stakes up to 500 BP</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 2-5 game parlays</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Mini-games unlock</li>
                </ul>
                <div className="mt-4 p-2 bg-blue-100 rounded text-sm text-blue-800">
                  Most players reach Silver
                </div>
              </div>
              
              {/* Silver/Gold Tier */}
              <div className="glass-card-large text-center hover-lift border-2 border-purple-200">
                <div className="text-4xl mb-4">🥇</div>
                <h3 className="text-xl font-bold mb-4">Levels 4-7: Gold</h3>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> 12-25 simultaneous bets</li>
                  <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> Stakes up to 5,000 BP</li>
                  <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> 6-12 game parlays</li>
                  <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> Cash out feature</li>
                </ul>
                <div className="mt-4 p-2 bg-purple-100 rounded text-sm text-purple-800">
                  Top 20% of players
                </div>
              </div>
              
              {/* Legend Tier */}
              <div className="glass-card-large text-center hover-lift bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-bold mb-4">Levels 8-10: Legend</h3>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center"><span className="text-yellow-600 mr-2">✓</span> 30-40 simultaneous bets</li>
                  <li className="flex items-center"><span className="text-yellow-600 mr-2">✓</span> Stakes up to 25,000 BP</li>
                  <li className="flex items-center"><span className="text-yellow-600 mr-2">✓</span> 15-20 game parlays</li>
                  <li className="flex items-center"><span className="text-yellow-600 mr-2">✓</span> Legend badge & crown</li>
                </ul>
                <div className="mt-4 p-2 bg-gradient-to-r from-yellow-200 to-orange-200 rounded text-sm text-orange-800 font-bold">
                  Elite 1% - Ultimate prestige
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How Diamonds Work */}
        <section className="py-16 px-4 bg-gradient-to-br from-purple-900 to-blue-900 text-white">
          <div className="container-modern">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">💎 Diamond Economy</h2>
              <p className="text-lg opacity-90">Earn diamonds through stats mini-games, use for live betting!</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-bold mb-1">Check Stats</div>
                <div className="text-sm opacity-80">Browse standings between matches</div>
              </div>
              
              <div className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">🎮</div>
                <div className="font-bold mb-1">Play Mini-Games</div>
                <div className="text-sm opacity-80">Test your football knowledge</div>
              </div>
              
              <div className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">💎</div>
                <div className="font-bold mb-1">Earn Diamonds</div>
                <div className="text-sm opacity-80">1-5 diamonds per game</div>
              </div>
              
              <div className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">🔴</div>
                <div className="font-bold mb-1">Live Betting</div>
                <div className="text-sm opacity-80">Use diamonds for live action</div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Mini-Games Preview */}
        <section className="py-16 px-4">
          <div className="container-modern">
            <div className="text-center mb-12">
              <h2 className="heading-2 mb-4">Mini-Games Between Matches</h2>
              <p className="text-lg text-muted">Test your knowledge, earn diamonds!</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className="glass-card p-4 hover-lift cursor-pointer">
                <div className="text-2xl mb-2">⚽</div>
                <div className="font-bold text-sm">Top Scorer Quiz</div>
                <div className="text-xs text-muted">1-2 💎</div>
              </div>
              
              <div className="glass-card p-4 hover-lift cursor-pointer">
                <div className="text-2xl mb-2">📈</div>
                <div className="font-bold text-sm">Standings Predictor</div>
                <div className="text-xs text-muted">2-3 💎</div>
              </div>
              
              <div className="glass-card p-4 hover-lift cursor-pointer">
                <div className="text-2xl mb-2">🔥</div>
                <div className="font-bold text-sm">Form Finder</div>
                <div className="text-xs text-muted">1-2 💎</div>
              </div>
              
              <div className="glass-card p-4 hover-lift cursor-pointer">
                <div className="text-2xl mb-2">🏟️</div>
                <div className="font-bold text-sm">Derby History</div>
                <div className="text-xs text-muted">2-4 💎</div>
              </div>
              
              <div className="glass-card p-4 hover-lift cursor-pointer">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-bold text-sm">Team Stats</div>
                <div className="text-xs text-muted">2-3 💎</div>
              </div>
              
              <div className="glass-card p-4 hover-lift cursor-pointer">
                <div className="text-2xl mb-2">👤</div>
                <div className="font-bold text-sm">Player Performance</div>
                <div className="text-xs text-muted">2-3 💎</div>
              </div>
              
              <div className="glass-card p-4 hover-lift cursor-pointer">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-bold text-sm">Goal Memory</div>
                <div className="text-xs text-muted">1 💎</div>
              </div>
              
              <div className="glass-card p-4 hover-lift cursor-pointer bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="text-2xl mb-2">🏆</div>
                <div className="font-bold text-sm">League Master</div>
                <div className="text-xs text-purple-600 font-bold">3-5 💎</div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="container-modern text-center">
            <h2 className="heading-2 mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
              Join the Nordic football betting revolution. Start as a Rookie, become a Legend!
            </p>
            <div className="flex-center gap-4">
              <button onClick={handleDemoAccess} className="btn-green-cta btn-large hover-lift">
                🚀 Start Playing Now
              </button>
              <Link href="/live" className="btn-orange-gradient btn-large hover-lift">
                Try Live Betting
              </Link>
            </div>
            
            {/* Progress motivator */}
            <div className="glass-card p-4 max-w-md mx-auto mt-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Your first win unlocks:</span>
                <span className="font-bold text-blue-600">+15 XP towards Level 2</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000" 
                     style={{width: `${progressPercentage}%`}}></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}