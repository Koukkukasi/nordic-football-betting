'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PlayerNavigation from '@/components/layout/PlayerNavigation'
import CurrencyDisplay from '@/components/currency/CurrencyDisplay'
import { BettingService } from '@/services/betting-service'
import { calculateDailyBonus, XP_REQUIREMENTS } from '@/lib/currency-system'
import { getActiveDiamondEvents } from '@/lib/diamond-economy'
import { getActiveSpecialEvents } from '@/lib/enhanced-odds-system'

interface UserProfile {
  id: string
  email: string
  username: string
  betPoints: number
  diamonds: number
  level: number
  xp: number
  totalBets: number
  totalWins: number
  currentStreak: number
  bestStreak: number
  lastLoginAt: string | null
  createdAt: string
}

interface DailyBonus {
  available: boolean
  betPoints: number
  diamonds: number
  streak: number
}

interface Achievement {
  id: string
  name: string
  description: string
  progress: number
  completed: boolean
  reward: {
    betPoints: number
    diamonds: number
    xp: number
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [dailyBonus, setDailyBonus] = useState<DailyBonus | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activeEvents, setActiveEvents] = useState<string[]>([])
  const [diamondEvents, setDiamondEvents] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [claimingBonus, setClaimingBonus] = useState(false)
  const router = useRouter()
  const bettingService = new BettingService()

  useEffect(() => {
    loadUserData()
    loadAchievements()
    checkActiveEvents()
  }, [])

  const loadUserData = async () => {
    try {
      // Check if user is logged in
      const authUser = localStorage.getItem('authUser')
      
      if (!authUser) {
        router.push('/auth/login')
        return
      }

      // Load user profile from localStorage
      const storedProfile = localStorage.getItem('userProfile')
      const userProfile: UserProfile = storedProfile ? JSON.parse(storedProfile) : {
        id: '1',
        email: 'player@nordic.com',
        username: 'NordicPlayer',
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
      }

      setUser(userProfile)
      checkDailyBonus(userProfile)
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkDailyBonus = (userData: UserProfile) => {
    // Check if daily bonus is available
    const lastLogin = userData.lastLoginAt ? new Date(userData.lastLoginAt) : null
    const now = new Date()
    
    let canClaim = true
    let loginStreak = 1
    
    if (lastLogin) {
      const hoursSinceLastLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60)
      canClaim = hoursSinceLastLogin >= 24
      
      // Calculate streak
      if (hoursSinceLastLogin < 48) {
        loginStreak = (userData.currentStreak || 0) + 1
      }
    }
    
    const bonus = calculateDailyBonus(loginStreak)
    
    setDailyBonus({
      available: canClaim,
      betPoints: bonus.betPoints,
      diamonds: bonus.diamonds,
      streak: loginStreak
    })
  }

  const loadAchievements = async () => {
    // Mock achievements for demo
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        name: 'First Steps',
        description: 'Place your first bet',
        progress: 0,
        completed: false,
        reward: { betPoints: 500, diamonds: 10, xp: 100 }
      },
      {
        id: '2',
        name: 'Winning Start',
        description: 'Win your first bet',
        progress: 0,
        completed: false,
        reward: { betPoints: 1000, diamonds: 20, xp: 200 }
      },
      {
        id: '3',
        name: 'Live Action',
        description: 'Place 5 live bets',
        progress: 0,
        completed: false,
        reward: { betPoints: 750, diamonds: 15, xp: 150 }
      }
    ]
    
    setAchievements(mockAchievements)
  }

  const checkActiveEvents = () => {
    const now = new Date()
    const specialEvents = getActiveSpecialEvents(now, user?.createdAt ? new Date(user.createdAt) : undefined)
    const diamondEvts = getActiveDiamondEvents(now)
    
    setActiveEvents(specialEvents)
    setDiamondEvents(diamondEvts)
  }

  const claimDailyBonus = async () => {
    if (!dailyBonus?.available || !user || claimingBonus) return
    
    setClaimingBonus(true)
    
    try {
      // Update user balance
      const newUser = {
        ...user,
        betPoints: user.betPoints + dailyBonus.betPoints,
        diamonds: user.diamonds + dailyBonus.diamonds,
        lastLoginAt: new Date().toISOString(),
        currentStreak: dailyBonus.streak
      }
      
      setUser(newUser)
      setDailyBonus({ ...dailyBonus, available: false })
      
      // Show success message
      alert(`Daily bonus claimed! +${dailyBonus.betPoints} BP, +${dailyBonus.diamonds} 💎`)
    } catch (error) {
      console.error('Failed to claim bonus:', error)
    } finally {
      setClaimingBonus(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <PlayerNavigation />
        <div className="flex-center h-96">
          <div className="glass-card-large text-center hover-lift">
            <div className="spinner-modern mx-auto mb-6"></div>
            <p className="text-lg text-muted font-semibold">Loading your amazing dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const xpRequired = XP_REQUIREMENTS[(user?.level || 1) + 1 as keyof typeof XP_REQUIREMENTS] || 10000

  return (
    <div className="min-h-screen">
      <PlayerNavigation />
      
      <main className="container-modern py-8 animate-fade-in">
        {/* Welcome Header - Glass Morphism */}
        <div className="mb-12">
          <div className="glass-card-large text-center hover-lift animate-bounce-in">
            <h1 className="heading-1 mb-4 text-dark">
              Welcome back, {user?.username || 'Player'}! 🎉
            </h1>
            <p className="text-lg text-muted leading-relaxed max-w-2xl mx-auto">
              Ready to dominate Nordic football betting? Your dashboard is loaded with exciting opportunities!
            </p>
          </div>
        </div>

        {/* Active Events - Premium Glass Cards */}
        {(activeEvents.length > 0 || diamondEvents.length > 0) && (
          <div className="glass-card-large mb-12 hover-lift">
            <h3 className="heading-3 mb-6 text-center text-dark">🔥 Active Events</h3>
            <div className="grid-modern grid-2">
              {activeEvents.map((event) => (
                <div key={event} className="glass-card hover-scale">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-cta to-dark-green rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-dark">
                      {event.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              ))}
              {diamondEvents.map((event) => (
                <div key={event} className="glass-card hover-scale border-primary-orange">
                  <div className="flex items-center gap-3">
                    <span className="text-xl diamond-icon">💎</span>
                    <span className="text-sm font-bold text-orange">
                      {event.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Bonus - Spectacular Glass Card */}
        {dailyBonus?.available && (
          <div className="glass-card-large mb-12 text-center hover-lift animate-slide-up">
            <div className="text-6xl mb-6 animate-bounce-in">🎁</div>
            <h3 className="heading-2 mb-8 text-dark">Daily Bonus Available!</h3>
            
            <div className="grid-modern grid-3 mb-8">
              <div className="currency-card">
                <div className="currency-display">
                  <div className="currency-value">
                    {dailyBonus.betPoints}
                  </div>
                  <div className="currency-label">BetPoints</div>
                </div>
              </div>
              
              <div className="currency-card">
                <div className="currency-display">
                  <span className="diamond-icon text-3xl">💎</span>
                  <div className="currency-value">
                    {dailyBonus.diamonds}
                  </div>
                  <div className="currency-label">Diamonds</div>
                </div>
              </div>
              
              <div className="currency-card">
                <div className="currency-display">
                  <div className="currency-value">
                    {dailyBonus.streak}
                  </div>
                  <div className="currency-label">Day Streak</div>
                </div>
                {dailyBonus.streak > 1 && (
                  <div className="mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                    🔥 Streak Bonus Active
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={claimDailyBonus}
              disabled={claimingBonus}
              className="btn-green-cta btn-large hover-lift"
            >
              {claimingBonus ? (
                <span className="flex items-center gap-3">
                  <div className="spinner-modern"></div>
                  <span>Processing...</span>
                </span>
              ) : '🚀 Claim Daily Bonus'}
            </button>
          </div>
        )}

        {/* User Balance & Currency Display */}
        {user && (
          <div className="mb-12">
            <CurrencyDisplay
              betPoints={user.betPoints}
              diamonds={user.diamonds}
              level={user.level}
              xp={user.xp}
              xpRequired={xpRequired}
              showTips={true}
            />
          </div>
        )}

        {/* Statistics Overview - Bright Glass Cards */}
        <div className="mb-12">
          <h2 className="heading-2 text-center mb-8 text-dark">Your Epic Statistics 📊</h2>
          
          <div className="grid-modern grid-4 animate-slide-up">
            <div className="glass-card text-center hover-scale">
              <div className="text-5xl mb-4">📊</div>
              <div className="text-sm text-muted mb-2 font-semibold">
                Total Bets
              </div>
              <div className="text-orange text-3xl font-black mb-2">
                {user?.totalBets || 0}
              </div>
              <div className="text-xs font-bold px-3 py-1 bg-gradient-to-r from-green-cta to-dark-green text-white rounded-full">
                {user?.totalBets > 0 ? 'Active Player' : 'Get Started'}
              </div>
            </div>
            
            <div className="glass-card text-center hover-scale">
              <div className="text-5xl mb-4">✅</div>
              <div className="text-sm text-muted mb-2 font-semibold">
                Wins
              </div>
              <div className="text-orange text-3xl font-black mb-2">
                {user?.totalWins || 0}
              </div>
              <div className="text-xs font-bold px-3 py-1 bg-gradient-to-r from-primary-orange to-golden-yellow text-white rounded-full">
                {user?.totalBets > 0 ? `${Math.round(((user?.totalWins || 0) / user?.totalBets) * 100)}% win rate` : 'Place first bet'}
              </div>
            </div>
            
            <div className="glass-card text-center hover-scale">
              <div className="text-5xl mb-4">🔥</div>
              <div className="text-sm text-muted mb-2 font-semibold">
                Current Streak
              </div>
              <div className="text-orange text-3xl font-black mb-2">
                {user?.currentStreak || 0}
              </div>
              <div className="text-xs font-bold px-3 py-1 bg-gradient-to-r from-green-cta to-dark-green text-white rounded-full">
                {user?.currentStreak > 0 ? 'On Fire!' : 'Start a streak'}
              </div>
            </div>
            
            <div className="glass-card text-center hover-scale">
              <div className="text-5xl mb-4">🏆</div>
              <div className="text-sm text-muted mb-2 font-semibold">
                Best Streak
              </div>
              <div className="text-orange text-3xl font-black mb-2">
                {user?.bestStreak || 0}
              </div>
              <div className="text-xs font-bold px-3 py-1 bg-gradient-to-r from-primary-orange to-golden-yellow text-white rounded-full">
                {user?.bestStreak > 0 ? 'Personal Record' : 'Reach new heights'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Premium Glass Cards */}
        <div className="mb-12">
          <h2 className="heading-2 mb-8 text-center text-dark">Quick Actions ⚡</h2>
          <div className="grid-modern grid-4 animate-slide-up">
            <Link href="/betting/pitkaveto" className="glass-card-large hover-lift group">
              <div className="flex-between items-start mb-4">
                <div className="text-4xl">🎯</div>
                <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-cta to-dark-green text-white rounded-full text-xs font-bold">
                  Enhanced Odds
                </span>
              </div>
              <h3 className="heading-4 mb-3 text-dark">Pitkäveto</h3>
              <p className="text-sm text-muted mb-4 leading-relaxed">
                Multi-match accumulator betting with bonus odds
              </p>
              <div className="text-orange font-black text-sm">
                Up to 65% bonus odds!
              </div>
            </Link>
            
            <Link href="/betting/live" className="glass-card-large hover-lift group">
              <div className="flex-between items-start mb-4">
                <div className="text-4xl">⚡</div>
                {diamondEvents.includes('LIVE_BETTING_RUSH') && (
                  <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-primary-orange to-golden-yellow text-white rounded-full text-xs font-bold">
                    <span className="diamond-icon mr-1">💎</span>2x
                  </span>
                )}
              </div>
              <h3 className="heading-4 mb-3 text-dark">Live Betting</h3>
              <p className="text-sm text-muted mb-4 leading-relaxed">
                Real-time odds and in-game betting opportunities
              </p>
              <div className="text-orange font-black text-sm">
                Cash out available
              </div>
            </Link>
            
            <Link href="/challenges" className="glass-card-large hover-lift group">
              <div className="flex-between items-start mb-4">
                <div className="text-4xl">🎁</div>
                <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-primary-orange to-golden-yellow text-white rounded-full text-xs font-bold">
                  NEW
                </span>
              </div>
              <h3 className="heading-4 mb-3 text-dark">Daily Challenges</h3>
              <p className="text-sm text-muted mb-4 leading-relaxed">
                Complete daily tasks and earn bonus rewards
              </p>
              <div className="text-orange font-black text-sm">
                3 challenges today!
              </div>
            </Link>
            
            <Link href="/leaderboards" className="glass-card-large hover-lift group">
              <div className="flex-between items-start mb-4">
                <div className="text-4xl">🏆</div>
                <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-cta to-dark-green text-white rounded-full text-xs font-bold">
                  Weekly
                </span>
              </div>
              <h3 className="heading-4 mb-3 text-dark">Leaderboards</h3>
              <p className="text-sm text-muted mb-4 leading-relaxed">
                Compete with other players for top rankings
              </p>
              <div className="text-orange font-black text-sm">
                You're ranked #42
              </div>
            </Link>
          </div>
        </div>

        {/* Achievement Progress - Modern Glass */}
        <div className="glass-card-large mb-12 hover-lift">
          <h2 className="heading-3 mb-8 text-center text-dark">Achievement Progress 🏅</h2>
          <div className="space-y-6">
            {achievements.slice(0, 3).map(achievement => (
              <div key={achievement.id} className="glass-card">
                <div className="flex-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-dark mb-2">{achievement.name}</h4>
                    <p className="text-sm text-muted mb-4 leading-relaxed">{achievement.description}</p>
                    <div className="w-full bg-white/30 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-primary-orange to-golden-yellow h-3 rounded-full transition-all duration-500"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-center ml-6">
                    <div className="text-xs text-muted font-semibold mb-2">Rewards:</div>
                    <div className="text-sm font-bold text-orange">{achievement.reward.betPoints} BP</div>
                    <div className="text-sm font-bold text-orange">
                      <span className="diamond-icon">💎</span> {achievement.reward.diamonds}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/achievements" className="btn-orange-gradient hover-lift">
              View All Achievements →
            </Link>
          </div>
        </div>

        {/* Today's Matches - Live Glass Cards */}
        <div className="glass-card-large hover-lift">
          <div className="flex-between mb-8">
            <h2 className="heading-3 text-dark">Today's Hot Matches 🔥</h2>
            <span className="live-indicator">
              2 LIVE
            </span>
          </div>
          
          <div className="space-y-6">
            {/* Live Match */}
            <div className="match-card-live">
              <div className="flex-between mb-4">
                <span className="live-indicator">
                  LIVE 78'
                </span>
                <span className="text-xs font-bold text-orange uppercase tracking-wide">Veikkausliiga</span>
              </div>
              <div className="text-center mb-6">
                <div className="flex items-center justify-between text-xl font-black text-dark">
                  <span>HJK Helsinki</span>
                  <span className="mx-6 text-3xl font-black text-orange">2 - 1</span>
                  <span>FC Inter Turku</span>
                </div>
              </div>
              <div className="text-center">
                <Link href="/betting/live" className="btn-green-cta btn-large hover-lift">
                  🔴 Live Bet Now →
                </Link>
              </div>
            </div>

            {/* Upcoming Match */}
            <div className="match-card-modern">
              <div className="flex-between mb-4">
                <span className="text-xs font-semibold text-muted">Today 19:00</span>
                <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-cta to-dark-green text-white rounded-full text-xs font-bold">
                  ⚡ Enhanced Odds
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-black text-dark">AIK Stockholm</span>
                  <span className="text-muted mx-6 font-bold">VS</span>
                  <span className="font-black text-dark">Malmö FF</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <button className="odds-button hover-lift">
                  <div className="odds-value">4.13</div>
                  <div className="odds-label">1</div>
                </button>
                <button className="odds-button hover-lift">
                  <div className="odds-value">4.80</div>
                  <div className="odds-label">X</div>
                </button>
                <button className="odds-button hover-lift">
                  <div className="odds-value">3.90</div>
                  <div className="odds-label">2</div>
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/matches" className="btn-orange-gradient btn-large hover-lift">
              View All Matches →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}