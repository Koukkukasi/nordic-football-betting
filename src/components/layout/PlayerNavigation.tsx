'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useUserProfile } from '@/hooks/useUserProfile'

export default function PlayerNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { profile } = useUserProfile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Use session and profile data
  const user = session ? {
    ...session.user,
    ...profile
  } : null

  const navLinks = [
    { href: '/matches', label: 'Matches', icon: '⚽' },
    { href: '/live', label: 'Live', icon: '🔴' },
    { href: '/my-bets', label: 'My Bets', icon: '🎯' },
    { href: '/rewards', label: 'Rewards', icon: '🏆' },
    { href: '/profile', label: 'Profile', icon: '👤' },
  ]

  const handleLogout = async () => {
    localStorage.removeItem('nordic_user')
    localStorage.removeItem('authUser')
    localStorage.removeItem('userProfile')
    
    await signOut({ 
      callbackUrl: '/auth/login',
      redirect: true 
    })
  }

  return (
    <nav className="glass-header sticky top-0 z-50" style={{ zIndex: 50 }}>
      <div className="container-modern">
        <div className="flex-between h-20">
          {/* Logo - Premium Glass Design */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-4 group hover-lift">
              <div className="text-dark text-2xl font-black">
                Nordic Football
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🇫🇮</span>
                <span className="text-2xl">🇸🇪</span>
              </div>
              <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-cta to-dark-green text-white rounded-full text-xs font-bold animate-pulse">
                FREE
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Modern Glass Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 ${
                  pathname === link.href
                    ? 'btn-orange-gradient shadow-lg'
                    : 'glass-card text-dark hover:border-primary-orange'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="font-extrabold uppercase tracking-wide">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu - Premium Glass Cards */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Desktop User Info - Premium Currency Cards */}
                <div className="hidden sm:flex items-center gap-3">
                  {/* BetPoints Display */}
                  <div className="currency-card">
                    <div className="currency-display">
                      <div className="currency-value text-lg">
                        {(user.betPoints || user.balance || 10000).toLocaleString()}
                      </div>
                      <div className="currency-label">BP</div>
                    </div>
                  </div>
                  
                  {/* Diamonds Display */}
                  <div className="currency-card">
                    <div className="currency-display">
                      <span className="diamond-icon text-2xl">💎</span>
                      <div className="currency-value text-lg">
                        {user.diamonds || 50}
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="btn-orange-gradient btn-small hover-lift"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="btn-green-cta btn-small hover-lift"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button - Glass Morphism */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden glass-card p-3 hover-scale"
              aria-label="Toggle mobile menu"
            >
              <svg 
                className="w-6 h-6 text-dark" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Premium Glass Design */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 mt-4 pt-6 pb-6 animate-slide-up">
            <div className="flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-4 px-6 py-4 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 ${
                    pathname === link.href
                      ? 'btn-orange-gradient shadow-lg'
                      : 'glass-card text-dark hover:border-primary-orange'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-extrabold uppercase tracking-wide">{link.label}</span>
                </Link>
              ))}
              
              {/* Mobile User Info - Premium Currency Display */}
              {user && (
                <div className="glass-card-large mt-6 p-6">
                  <div className="flex-between">
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-muted text-xs font-semibold mb-1">BetPoints</div>
                        <div className="text-orange font-black text-xl">
                          {(user.betPoints || user.balance || 10000).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted text-xs font-semibold mb-1">Diamonds</div>
                        <div className="text-orange font-black text-xl">
                          <span className="diamond-icon">💎</span> {user.diamonds || 50}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="btn-orange-gradient btn-small hover-lift"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}