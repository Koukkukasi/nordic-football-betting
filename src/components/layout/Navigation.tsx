'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useUserProfile } from '@/hooks/useUserProfile'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { profile } = useUserProfile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Use session and profile data instead of localStorage
  const user = session ? {
    ...session.user,
    ...profile
  } : null

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/betting/pitkaveto', label: 'Betting', icon: '🎯' },
    { href: '/betting/live', label: 'Live', icon: '⚡' },
    { href: '/leagues', label: 'Leagues', icon: '🏆' },
    { href: '/leaderboards', label: 'Leaderboard', icon: '👑' },
  ]

  const handleLogout = async () => {
    // Clear localStorage data
    localStorage.removeItem('nordic_user')
    localStorage.removeItem('authUser')
    localStorage.removeItem('userProfile')
    
    // Sign out using NextAuth
    await signOut({ 
      callbackUrl: '/auth/login',
      redirect: true 
    })
  }

  return (
    <nav className="nordic-card sticky top-0 z-50 nordic-transition" style={{ zIndex: 'var(--nordic-z-fixed)' }}>
      <div className="nordic-container">
        <div className="nordic-flex-between h-16">
          {/* Logo */}
          <div className="nordic-flex items-center">
            <Link href="/" className="nordic-flex items-center space-x-3 group">
              <div className="nordic-text-brand text-2xl font-bold">
                Nordic Football
              </div>
              <div className="nordic-flex items-center space-x-2">
                <span className="nordic-flag-finland"></span>
                <span className="nordic-flag-sweden"></span>
              </div>
              <span className="nordic-status-success text-xs px-2 py-1">
                FREE
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nordic-flex items-center space-x-2 px-4 py-2 nordic-rounded nordic-transition ${
                  pathname === link.href
                    ? 'nordic-button-primary'
                    : 'nordic-button-ghost nordic-text-secondary hover:nordic-text-primary'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="nordic-flex items-center space-x-4">
            {user ? (
              <>
                {/* Desktop User Info */}
                <div className="hidden sm:flex items-center space-x-3">
                  {/* BetPoints Display */}
                  <div className="nordic-card px-3 py-2">
                    <div className="nordic-flex items-center space-x-2">
                      <span className="nordic-text-muted text-xs font-medium">BP:</span>
                      <span className="nordic-text-primary font-bold">
                        {(user.betPoints || user.balance || 10000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Diamonds Display */}
                  <div className="nordic-card px-3 py-2">
                    <div className="nordic-flex items-center space-x-2">
                      <span className="text-lg">💎</span>
                      <span className="nordic-text-primary font-bold">
                        {user.diamonds || 50}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="nordic-button-secondary nordic-button-small"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="nordic-button-primary nordic-button-small"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden nordic-button-ghost p-2"
              aria-label="Toggle mobile menu"
            >
              <svg 
                className="w-6 h-6" 
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

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden nordic-border-t nordic-mt-lg pt-4 pb-4">
            <div className="nordic-flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nordic-flex items-center space-x-3 px-4 py-3 nordic-rounded nordic-transition ${
                    pathname === link.href
                      ? 'nordic-button-primary'
                      : 'nordic-button-ghost'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
              
              {/* Mobile User Info */}
              {user && (
                <div className="nordic-card nordic-mt-lg p-4">
                  <div className="nordic-flex-between">
                    <div className="nordic-flex items-center space-x-6">
                      <div className="nordic-text-center">
                        <div className="nordic-text-muted text-xs">BetPoints</div>
                        <div className="nordic-text-primary font-bold">
                          {(user.betPoints || user.balance || 10000).toLocaleString()}
                        </div>
                      </div>
                      <div className="nordic-text-center">
                        <div className="nordic-text-muted text-xs">Diamonds</div>
                        <div className="nordic-text-primary font-bold">
                          💎 {user.diamonds || 50}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="nordic-button-secondary nordic-button-small"
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