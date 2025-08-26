'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

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

export function useUserProfile() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) {
      setLoading(false)
      return
    }

    // For demo mode, use localStorage data if available, otherwise create default profile
    const storedProfile = localStorage.getItem('userProfile')
    
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile)
        setProfile({
          ...parsedProfile,
          id: session.user.id,
          email: session.user.email || parsedProfile.email,
          username: session.user.name || parsedProfile.username
        })
      } catch (error) {
        console.error('Error parsing stored profile:', error)
        // Create default profile
        setProfile({
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.name || '',
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
        })
      }
    } else {
      // Create default profile
      const defaultProfile = {
        id: session.user.id,
        email: session.user.email || '',
        username: session.user.name || '',
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
      
      setProfile(defaultProfile)
      localStorage.setItem('userProfile', JSON.stringify(defaultProfile))
    }
    
    setLoading(false)
  }, [session])

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (profile) {
      const updatedProfile = { ...profile, ...updates }
      setProfile(updatedProfile)
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile))
    }
  }

  return {
    profile,
    loading,
    updateProfile,
    isAuthenticated: !!session
  }
}