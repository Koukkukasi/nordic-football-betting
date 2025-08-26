'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [demoMode, setDemoMode] = useState(true) // Enable demo mode by default
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        isDemo: demoMode.toString(),
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        // Get the session to verify login
        const session = await getSession()
        if (session) {
          // For demo mode, also set localStorage for compatibility with existing components
          if (demoMode) {
            localStorage.setItem('authUser', JSON.stringify({
              id: session.user.id,
              email: session.user.email,
              username: session.user.name
            }))
            
            localStorage.setItem('userProfile', JSON.stringify({
              id: session.user.id,
              email: session.user.email,
              username: session.user.name,
              bet_points: 10000,
              diamonds: 50,
              level: 1,
              xp: 0,
              active_bets: 0,
              max_active_bets: 3,
              max_stake_per_bet: 50,
              totalBets: 0,
              totalWins: 0,
              currentStreak: 0,
              bestStreak: 0,
              lastLoginAt: null,
              createdAt: new Date().toISOString()
            }))
          }
          
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-green-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white mb-2">
              Nordic Football Betting
            </h1>
          </Link>
          <p className="text-gray-300">Welcome back! Sign in to continue betting.</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            {/* Demo Mode Toggle */}
            <div className="flex items-center space-x-3">
              <input
                id="demoMode"
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="w-4 h-4 text-yellow-400 bg-white/10 border-gray-600 rounded focus:ring-yellow-400 focus:ring-2"
              />
              <label htmlFor="demoMode" className="text-sm text-gray-200">
                Demo Mode (accepts any email/password for testing)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-400">New to Nordic Football Betting?</span>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/register"
              className="text-yellow-400 hover:text-yellow-300 font-medium"
            >
              Create Free Account - Get 10,000 BetPoints
            </Link>
          </div>

          {/* Features Reminder */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center text-gray-300 text-sm">
              <span className="text-yellow-400 mr-2">✓</span>
              Enhanced odds for free-to-play
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <span className="text-yellow-400 mr-2">✓</span>
              Earn diamonds from live betting
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <span className="text-yellow-400 mr-2">✓</span>
              Progress through 10 levels
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-gray-400 hover:text-white text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}