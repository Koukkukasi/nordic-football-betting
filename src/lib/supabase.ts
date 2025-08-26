import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const mockUsers = [
  {
    id: '1',
    email: 'demo@nordic.com',
    username: 'DemoUser',
    bet_points: 9750,
    diamonds: 73,
    level: 2,
    max_active_bets: 3,
    max_stake_per_bet: 100,
    total_staked: 5250,
    active_bets: 1,
    favorite_team_id: null,
    subscription_status: null,
    created_at: new Date().toISOString()
  }
]

const mockTeams = [
  { id: '1', name: 'HJK Helsinki', league: 'Veikkausliiga', country: 'Finland' },
  { id: '2', name: 'FC Inter Turku', league: 'Veikkausliiga', country: 'Finland' },
  { id: '3', name: 'KuPS Kuopio', league: 'Veikkausliiga', country: 'Finland' },
  { id: '4', name: 'Malmö FF', league: 'Allsvenskan', country: 'Sweden' },
  { id: '5', name: 'AIK Stockholm', league: 'Allsvenskan', country: 'Sweden' },
  { id: '6', name: 'Djurgården Stockholm', league: 'Allsvenskan', country: 'Sweden' },
]

const mockMatches = [
  {
    id: '1',
    league_id: '1',
    home_team_id: '1',
    away_team_id: '2',
    home_score: 2,
    away_score: 1,
    status: 'live',
    minute: 78,
    is_live: true,
    is_derby: false,
    start_time: new Date(Date.now() - 78 * 60 * 1000).toISOString(),
    league: {
      name: 'Veikkausliiga',
      country: 'Finland',
      tier: 1
    },
    home_team: {
      name: 'HJK Helsinki',
      city: 'Helsinki',
      is_derby_team: false
    },
    away_team: {
      name: 'FC Inter Turku',
      city: 'Turku',
      is_derby_team: false
    },
    odds: [
      {
        id: '1',
        market: 'match_result',
        home_win: 145,
        draw: 420,
        away_win: 850,
        over_25: 175,
        under_25: 210,
        next_goal: 210,
        next_corner: 185,
        next_card: 340,
        enhanced_home_win: 175,
        enhanced_draw: 525,
        enhanced_away_win: 1275
      }
    ]
  }
]

export function createClient() {
  // Check if Supabase is configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-supabase-url' &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key') {
    
    try {
      console.log('✅ Attempting to use Supabase database')
      return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    } catch (error) {
      console.error('❌ Supabase initialization failed:', error)
      console.log('🔄 Falling back to mock database')
      return createMockClient()
    }
  }
  
  // Fallback to mock client
  console.log('🔄 Using mock database (Supabase not configured)')
  return createMockClient()
}

export function createServerClient() {
  return createClient()
}

// Mock client for testing without Supabase
function createMockClient() {
  return {
    auth: {
      getUser: async () => ({ 
        data: { user: { id: '1', email: 'demo@nordic.com' } }, 
        error: null 
      }),
      signUp: async () => ({ 
        data: { user: { id: '1', email: 'demo@nordic.com' } }, 
        error: null 
      }),
      signInWithPassword: async () => ({ 
        data: { user: { id: '1', email: 'demo@nordic.com' } }, 
        error: null 
      }),
      signOut: async () => ({ error: null }),
    },
    from: (table: string) => {
      const getData = () => {
        if (table === 'users') return mockUsers
        if (table === 'teams') return mockTeams
        if (table === 'matches') return mockMatches
        return []
      }

      return {
        select: (columns = '*') => ({
          eq: (column: string, value: any) => ({
            order: (orderColumn: string, options?: any) => ({
              data: getData(),
              error: null,
            }),
            single: async () => {
              if (table === 'users' && column === 'id' && value === '1') {
                return { data: mockUsers[0], error: null }
              }
              return { data: null, error: null }
            },
            data: getData(),
            error: null,
          }),
          order: (orderColumn: string, options?: any) => ({
            data: getData(),
            error: null,
          }),
          single: async () => {
            if (table === 'users') return { data: mockUsers[0], error: null }
            return { data: null, error: null }
          },
          data: getData(),
          error: null,
        }),
        insert: (data: any) => ({
          select: () => ({
            single: async () => ({ data: data, error: null }),
          }),
        }),
        update: (data: any) => ({
          eq: (column: string, value: any) => ({ 
            data: { ...data, id: value }, 
            error: null 
          }),
        }),
        delete: () => ({
          eq: (column: string, value: any) => ({ data: null, error: null }),
        }),
      }
    },
    channel: (channelName: string) => ({
      on: (event: string, filter: any, callback: Function) => ({
        subscribe: () => ({
          unsubscribe: () => {},
        }),
      }),
    }),
  }
}