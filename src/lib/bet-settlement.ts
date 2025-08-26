import { createClient } from '@/lib/supabase'

interface BetSelection {
  id: string
  bet_id: string
  match_id: string
  market: string
  selection: string
  odds: number
  enhanced_odds: number
  result: string
}

interface Bet {
  id: string
  user_id: string
  type: string
  stake: number
  total_odds: number
  status: string
  diamond_boost: number | null
  diamond_cost: number | null
  diamond_reward: number | null
  payout: number | null
  placed_at: string
  settled_at: string | null
  selections: BetSelection[]
}

interface Match {
  id: string
  home_score: number
  away_score: number
  status: string
}

export class BetSettlementService {
  private supabase = createClient()

  async settleBet(betId: string): Promise<boolean> {
    try {
      // Get bet with selections
      const { data: bet, error: betError } = await this.supabase
        .from('bets')
        .select(`
          *,
          selections:bet_selections(*)
        `)
        .eq('id', betId)
        .single()

      if (betError || !bet) {
        console.error('Error fetching bet:', betError)
        return false
      }

      // Check if bet is already settled
      if (bet.status !== 'pending') {
        return true
      }

      // Get match results for all selections
      const matchIds = bet.selections.map((sel: BetSelection) => sel.match_id).filter(Boolean)
      const { data: matches, error: matchError } = await this.supabase
        .from('matches')
        .select('id, home_score, away_score, status')
        .in('id', matchIds)

      if (matchError) {
        console.error('Error fetching matches:', matchError)
        return false
      }

      // Check if all matches are finished
      const allMatchesFinished = matches?.every((match: Match) => match.status === 'finished')
      if (!allMatchesFinished) {
        return false // Wait for all matches to finish
      }

      // Settle each selection
      let allSelectionsWon = true
      for (const selection of bet.selections) {
        const match = matches?.find((m: Match) => m.id === selection.match_id)
        if (!match) continue

        const selectionResult = this.evaluateSelection(selection, match)
        
        // Update selection result
        await this.supabase
          .from('bet_selections')
          .update({ result: selectionResult })
          .eq('id', selection.id)

        if (selectionResult !== 'won') {
          allSelectionsWon = false
        }
      }

      // Calculate payout and settlement
      const betStatus = allSelectionsWon ? 'won' : 'lost'
      let payout = 0
      let diamondReward = 0

      if (allSelectionsWon) {
        // Calculate payout with diamond boost
        const totalOdds = bet.total_odds / 100 // Convert from integer format
        const boostMultiplier = bet.diamond_boost || 1.0
        payout = Math.round(bet.stake * totalOdds * boostMultiplier)

        // Calculate diamond reward for live bets
        if (bet.type === 'live_single' && bet.diamond_reward) {
          diamondReward = bet.diamond_reward
        }
      }

      // Update bet status
      await this.supabase
        .from('bets')
        .update({
          status: betStatus,
          payout: payout,
          settled_at: new Date().toISOString()
        })
        .eq('id', betId)

      // Update user balance and stats
      await this.updateUserBalance(bet.user_id, payout, diamondReward, betStatus)

      // Record transaction
      if (payout > 0) {
        await this.recordWinTransaction(bet.user_id, bet.id, payout, bet.stake)
      }

      if (diamondReward > 0) {
        await this.recordDiamondReward(bet.user_id, bet.id, diamondReward)
      }

      return true
    } catch (error) {
      console.error('Error settling bet:', error)
      return false
    }
  }

  private evaluateSelection(selection: BetSelection, match: Match): string {
    const { market, selection: betSelection } = selection
    const { home_score, away_score } = match

    switch (market) {
      case 'match_result':
        if (betSelection === 'home' && home_score > away_score) return 'won'
        if (betSelection === 'draw' && home_score === away_score) return 'won'
        if (betSelection === 'away' && away_score > home_score) return 'won'
        return 'lost'

      case 'total_goals':
        const totalGoals = home_score + away_score
        if (betSelection === 'over_2.5' && totalGoals > 2.5) return 'won'
        if (betSelection === 'under_2.5' && totalGoals < 2.5) return 'won'
        return 'lost'

      case 'btts':
        const bothTeamsScored = home_score > 0 && away_score > 0
        if (betSelection === 'yes' && bothTeamsScored) return 'won'
        if (betSelection === 'no' && !bothTeamsScored) return 'won'
        return 'lost'

      default:
        // For live markets (next_goal, next_corner, next_card), assume manual settlement
        return 'pending'
    }
  }

  private async updateUserBalance(userId: string, payout: number, diamondReward: number, betStatus: string) {
    try {
      // Get current user data
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('bet_points, diamonds, active_bets, total_staked')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        console.error('Error fetching user:', userError)
        return
      }

      // Calculate new balances
      const newBetPoints = user.bet_points + payout
      const newDiamonds = user.diamonds + diamondReward
      const newActiveBets = Math.max(0, user.active_bets - 1)

      // Update user
      await this.supabase
        .from('users')
        .update({
          bet_points: newBetPoints,
          diamonds: newDiamonds,
          active_bets: newActiveBets
        })
        .eq('id', userId)

      // Check for level progression
      await this.checkLevelProgression(userId, user.total_staked)
    } catch (error) {
      console.error('Error updating user balance:', error)
    }
  }

  private async checkLevelProgression(userId: string, totalStaked: number) {
    // Level thresholds based on total staked
    const levelThresholds = [0, 5000, 15000, 35000, 70000, 125000, 200000, 300000, 450000, 650000]
    
    let newLevel = 1
    for (let i = levelThresholds.length - 1; i >= 0; i--) {
      if (totalStaked >= levelThresholds[i]) {
        newLevel = i + 1
        break
      }
    }

    // Get current user level
    const { data: user } = await this.supabase
      .from('users')
      .select('level, max_active_bets, max_stake_per_bet')
      .eq('id', userId)
      .single()

    if (!user || user.level >= newLevel) return

    // Calculate new limits based on level
    const maxActiveBets = Math.min(2 + newLevel - 1, 10) // Level 1: 2, Level 2: 3, ..., Level 10: 11
    const maxStakePerBet = Math.min(50 * newLevel, 500) // Level 1: 50, Level 2: 100, ..., Level 10: 500

    // Update user level and limits
    await this.supabase
      .from('users')
      .update({
        level: newLevel,
        max_active_bets: maxActiveBets,
        max_stake_per_bet: maxStakePerBet
      })
      .eq('id', userId)

    // Record level progression bonus
    const levelBonus = newLevel * 1000 // 1000 BP per level
    await this.supabase
      .from('users')
      .update({
        bet_points: user.bet_points + levelBonus
      })
      .eq('id', userId)

    // Record level bonus transaction
    await this.supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'level_bonus',
        amount: levelBonus,
        currency: 'betpoints',
        description: `Level ${newLevel} progression bonus`,
        balance_before: user.bet_points,
        balance_after: user.bet_points + levelBonus
      })
  }

  private async recordWinTransaction(userId: string, betId: string, payout: number, stake: number) {
    // Get current balance
    const { data: user } = await this.supabase
      .from('users')
      .select('bet_points')
      .eq('id', userId)
      .single()

    if (!user) return

    await this.supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'bet_won',
        amount: payout,
        currency: 'betpoints',
        description: `Bet won - payout ${payout} BP (stake: ${stake} BP)`,
        balance_before: user.bet_points - payout,
        balance_after: user.bet_points,
        related_bet_id: betId
      })
  }

  private async recordDiamondReward(userId: string, betId: string, diamonds: number) {
    // Get current balance
    const { data: user } = await this.supabase
      .from('users')
      .select('diamonds')
      .eq('id', userId)
      .single()

    if (!user) return

    await this.supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'diamond_earned',
        amount: diamonds,
        currency: 'diamonds',
        description: `Diamonds earned from live betting`,
        balance_before: user.diamonds - diamonds,
        balance_after: user.diamonds,
        related_bet_id: betId
      })
  }

  // Method to settle multiple bets (can be called by a cron job)
  async settleAllPendingBets(): Promise<number> {
    try {
      const { data: pendingBets, error } = await this.supabase
        .from('bets')
        .select('id')
        .eq('status', 'pending')

      if (error || !pendingBets) {
        console.error('Error fetching pending bets:', error)
        return 0
      }

      let settledCount = 0
      for (const bet of pendingBets) {
        const settled = await this.settleBet(bet.id)
        if (settled) settledCount++
      }

      return settledCount
    } catch (error) {
      console.error('Error settling all pending bets:', error)
      return 0
    }
  }
}

export const betSettlement = new BetSettlementService()