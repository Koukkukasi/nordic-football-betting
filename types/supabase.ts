// Supabase Database Types for Nordic Football Betting
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          bet_points: number
          diamonds: number
          level: number
          total_staked: number
          active_bets: number
          max_active_bets: number
          max_stake_per_bet: number
          favorite_team_id: string | null
          created_at: string
          updated_at: string
          last_active: string
          stripe_customer_id: string | null
          subscription_status: string | null
          subscription_id: string | null
        }
        Insert: {
          id?: string
          email: string
          username: string
          bet_points?: number
          diamonds?: number
          level?: number
          total_staked?: number
          active_bets?: number
          max_active_bets?: number
          max_stake_per_bet?: number
          favorite_team_id?: string | null
          created_at?: string
          updated_at?: string
          last_active?: string
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          username?: string
          bet_points?: number
          diamonds?: number
          level?: number
          total_staked?: number
          active_bets?: number
          max_active_bets?: number
          max_stake_per_bet?: number
          favorite_team_id?: string | null
          created_at?: string
          updated_at?: string
          last_active?: string
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_id?: string | null
        }
      }
      leagues: {
        Row: {
          id: string
          name: string
          country: string
          tier: number
          teams: number
          matches: number
          season_start: string | null
          season_end: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country: string
          tier: number
          teams: number
          matches: number
          season_start?: string | null
          season_end?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string
          tier?: number
          teams?: number
          matches?: number
          season_start?: string | null
          season_end?: string | null
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          city: string
          country: string
          league_id: string
          position: number | null
          points: number
          played: number
          won: number
          drawn: number
          lost: number
          goals_for: number
          goals_against: number
          is_derby_team: boolean
          is_popular: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          city: string
          country: string
          league_id: string
          position?: number | null
          points?: number
          played?: number
          won?: number
          drawn?: number
          lost?: number
          goals_for?: number
          goals_against?: number
          is_derby_team?: boolean
          is_popular?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string
          country?: string
          league_id?: string
          position?: number | null
          points?: number
          played?: number
          won?: number
          drawn?: number
          lost?: number
          goals_for?: number
          goals_against?: number
          is_derby_team?: boolean
          is_popular?: boolean
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          league_id: string
          home_team_id: string
          away_team_id: string
          start_time: string
          status: 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed' | 'cancelled'
          round: number | null
          home_score: number | null
          away_score: number | null
          minute: number | null
          is_live: boolean
          is_derby: boolean
          odds_boost: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          league_id: string
          home_team_id: string
          away_team_id: string
          start_time: string
          status?: 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed' | 'cancelled'
          round?: number | null
          home_score?: number | null
          away_score?: number | null
          minute?: number | null
          is_live?: boolean
          is_derby?: boolean
          odds_boost?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          league_id?: string
          home_team_id?: string
          away_team_id?: string
          start_time?: string
          status?: 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed' | 'cancelled'
          round?: number | null
          home_score?: number | null
          away_score?: number | null
          minute?: number | null
          is_live?: boolean
          is_derby?: boolean
          odds_boost?: number
          created_at?: string
          updated_at?: string
        }
      }
      odds: {
        Row: {
          id: string
          match_id: string
          market: 'match_result' | 'over_under' | 'btts' | 'live_next_goal' | 'live_next_corner' | 'live_next_card'
          home_win: number | null
          draw: number | null
          away_win: number | null
          over_25: number | null
          under_25: number | null
          btts: number | null
          next_goal: number | null
          next_corner: number | null
          next_card: number | null
          enhanced_home_win: number | null
          enhanced_draw: number | null
          enhanced_away_win: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          match_id: string
          market: 'match_result' | 'over_under' | 'btts' | 'live_next_goal' | 'live_next_corner' | 'live_next_card'
          home_win?: number | null
          draw?: number | null
          away_win?: number | null
          over_25?: number | null
          under_25?: number | null
          btts?: number | null
          next_goal?: number | null
          next_corner?: number | null
          next_card?: number | null
          enhanced_home_win?: number | null
          enhanced_draw?: number | null
          enhanced_away_win?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          market?: 'match_result' | 'over_under' | 'btts' | 'live_next_goal' | 'live_next_corner' | 'live_next_card'
          home_win?: number | null
          draw?: number | null
          away_win?: number | null
          over_25?: number | null
          under_25?: number | null
          btts?: number | null
          next_goal?: number | null
          next_corner?: number | null
          next_card?: number | null
          enhanced_home_win?: number | null
          enhanced_draw?: number | null
          enhanced_away_win?: number | null
          updated_at?: string
        }
      }
      bets: {
        Row: {
          id: string
          user_id: string
          type: 'pitkaveto' | 'live_single'
          stake: number
          total_odds: number
          status: 'pending' | 'won' | 'lost' | 'cancelled'
          diamond_boost: number | null
          diamond_cost: number | null
          diamond_reward: number | null
          payout: number | null
          placed_at: string
          settled_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'pitkaveto' | 'live_single'
          stake: number
          total_odds: number
          status?: 'pending' | 'won' | 'lost' | 'cancelled'
          diamond_boost?: number | null
          diamond_cost?: number | null
          diamond_reward?: number | null
          payout?: number | null
          placed_at?: string
          settled_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'pitkaveto' | 'live_single'
          stake?: number
          total_odds?: number
          status?: 'pending' | 'won' | 'lost' | 'cancelled'
          diamond_boost?: number | null
          diamond_cost?: number | null
          diamond_reward?: number | null
          payout?: number | null
          placed_at?: string
          settled_at?: string | null
        }
      }
      table_challenge_bets: {
        Row: {
          id: string
          user_id: string
          league_id: string
          challenge_type: 'weekly_positions' | 'final_table' | 'position_movement' | 'points_milestone'
          prediction: Json
          stake: number
          diamond_reward: number | null
          status: 'active' | 'won' | 'lost' | 'expired'
          expires_at: string
          settled_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          league_id: string
          challenge_type: 'weekly_positions' | 'final_table' | 'position_movement' | 'points_milestone'
          prediction: Json
          stake: number
          diamond_reward?: number | null
          status?: 'active' | 'won' | 'lost' | 'expired'
          expires_at: string
          settled_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          league_id?: string
          challenge_type?: 'weekly_positions' | 'final_table' | 'position_movement' | 'points_milestone'
          prediction?: Json
          stake?: number
          diamond_reward?: number | null
          status?: 'active' | 'won' | 'lost' | 'expired'
          expires_at?: string
          settled_at?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'bet_placed' | 'bet_won' | 'bet_lost' | 'diamond_earned' | 'diamond_spent' | 'level_bonus' | 'purchase' | 'subscription'
          amount: number
          currency: 'betpoints' | 'diamonds'
          description: string
          balance_before: number
          balance_after: number
          related_bet_id: string | null
          stripe_payment_intent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'bet_placed' | 'bet_won' | 'bet_lost' | 'diamond_earned' | 'diamond_spent' | 'level_bonus' | 'purchase' | 'subscription'
          amount: number
          currency: 'betpoints' | 'diamonds'
          description: string
          balance_before: number
          balance_after: number
          related_bet_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'bet_placed' | 'bet_won' | 'bet_lost' | 'diamond_earned' | 'diamond_spent' | 'level_bonus' | 'purchase' | 'subscription'
          amount?: number
          currency?: 'betpoints' | 'diamonds'
          description?: string
          balance_before?: number
          balance_after?: number
          related_bet_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}