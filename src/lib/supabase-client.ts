// Enhanced Supabase client with full integration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Public client for frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Admin client for server-side operations (only use server-side)
export const getSupabaseAdmin = () => {
  if (!supabaseServiceKey) {
    throw new Error('Service role key not configured')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  })
}

// Auth helper functions
export const authHelpers = {
  signUpWithEmail: async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    })
    return { data, error }
  },

  signInWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signInWithProvider: async (provider: 'google' | 'github' | 'discord') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        scopes: provider === 'github' ? 'read:user user:email' : undefined
      }
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
    })
    return { data, error }
  },

  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    return { data, error }
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  updateProfile: async (updates: any) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    })
    return { data, error }
  }
}

// Real-time subscriptions
export const realtimeHelpers = {
  subscribeToMatch: (matchId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`match:${matchId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'Match',
          filter: `id=eq.${matchId}`
        }, 
        callback
      )
      .subscribe()
  },

  subscribeToLiveMatches: (callback: (payload: any) => void) => {
    return supabase
      .channel('live-matches')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Match',
          filter: 'status=eq.LIVE'
        },
        callback
      )
      .subscribe()
  },

  subscribeToUserBets: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`user-bets:${userId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Bet',
          filter: `userId=eq.${userId}`
        },
        callback
      )
      .subscribe()
  },

  subscribeToOdds: (matchId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`odds:${matchId}`)
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Odds',
          filter: `matchId=eq.${matchId}`
        },
        callback
      )
      .subscribe()
  },

  // Broadcast channel for live betting
  broadcastBet: (matchId: string, betData: any) => {
    const channel = supabase.channel(`betting:${matchId}`)
    channel.send({
      type: 'broadcast',
      event: 'new_bet',
      payload: betData
    })
    return channel
  },

  // Presence for live viewers count
  trackPresence: (matchId: string, userData: any) => {
    const channel = supabase.channel(`presence:${matchId}`)
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        console.log('Presence state', state)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(userData)
        }
      })
    
    return channel
  }
}

// Storage helpers
export const storageHelpers = {
  uploadAvatar: async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) return { error }
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
    
    return { url: publicUrl, error: null }
  },

  uploadTeamLogo: async (teamId: string, file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${teamId}.${fileExt}`
    const filePath = `teams/${fileName}`

    const { data, error } = await supabase.storage
      .from('teams')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) return { error }
    
    const { data: { publicUrl } } = supabase.storage
      .from('teams')
      .getPublicUrl(filePath)
    
    return { url: publicUrl, error: null }
  },

  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  },

  deleteFile: async (bucket: string, path: string) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    return { error }
  }
}

// Database query helpers
export const dbHelpers = {
  // User queries
  getUserById: async (userId: string) => {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', userId)
      .single()
    
    return { data, error }
  },

  updateUser: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('User')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  // Match queries
  getLiveMatches: async () => {
    const { data, error } = await supabase
      .from('Match')
      .select(`
        *,
        homeTeam:Team!Match_homeTeamId_fkey(*),
        awayTeam:Team!Match_awayTeamId_fkey(*),
        odds:Odds(*),
        league:League(*)
      `)
      .eq('status', 'LIVE')
      .order('startTime', { ascending: true })
    
    return { data, error }
  },

  getUpcomingMatches: async (limit = 20) => {
    const { data, error } = await supabase
      .from('Match')
      .select(`
        *,
        homeTeam:Team!Match_homeTeamId_fkey(*),
        awayTeam:Team!Match_awayTeamId_fkey(*),
        odds:Odds(*),
        league:League(*)
      `)
      .eq('status', 'SCHEDULED')
      .gte('startTime', new Date().toISOString())
      .order('startTime', { ascending: true })
      .limit(limit)
    
    return { data, error }
  },

  // Bet queries
  getUserBets: async (userId: string, status?: string) => {
    let query = supabase
      .from('Bet')
      .select(`
        *,
        selections:BetSelection(
          *,
          match:Match(
            *,
            homeTeam:Team!Match_homeTeamId_fkey(*),
            awayTeam:Team!Match_awayTeamId_fkey(*)
          )
        )
      `)
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    return { data, error }
  },

  // Statistics
  getUserStats: async (userId: string) => {
    const { data, error } = await supabase
      .from('UserStats')
      .select('*')
      .eq('userId', userId)
      .single()
    
    return { data, error }
  },

  getLeaderboard: async (limit = 10) => {
    const { data, error } = await supabase
      .from('User')
      .select('id, username, level, xp, totalWon, totalBets')
      .order('totalWon', { ascending: false })
      .limit(limit)
    
    return { data, error }
  }
}

// Export default client
export default supabase