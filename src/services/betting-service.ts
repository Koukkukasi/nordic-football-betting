// Unified Betting Service integrating all F2P features
import { createClient } from '@/lib/supabase'
import { 
  VirtualCurrency, 
  calculateXP, 
  checkLevelUp,
  LEVEL_REWARDS,
  validateTransaction,
  checkLowBalance
} from '@/lib/currency-system'
import { 
  calculateEnhancedOdds, 
  getActiveSpecialEvents,
  applySpecialEventBoosts,
  formatOdds 
} from '@/lib/enhanced-odds-system'
import { 
  calculateLiveBetDiamonds,
  canAffordBoost,
  applyDiamondBoost,
  getActiveDiamondEvents,
  DIAMOND_BOOST_OPTIONS
} from '@/lib/diamond-economy'
import { 
  PitkavetoSelection,
  PitkavetoSlip,
  validatePitkaveto,
  calculatePitkavetoOdds,
  calculatePotentialWin
} from '@/lib/pitkaveto-system'

export class BettingService {
  private supabase = createClient()
  
  // Get user's current balance and level
  async getUserBalance(userId: string): Promise<{
    betPoints: number
    diamonds: number
    level: number
    xp: number
    warnings: any[]
  }> {
    const { data: user } = await this.supabase
      .from('users')
      .select('bet_points, diamonds, level, xp')
      .eq('id', userId)
      .single()
    
    if (!user) throw new Error('User not found')
    
    const warnings = checkLowBalance(user.bet_points, user.diamonds)
    
    return {
      betPoints: user.bet_points,
      diamonds: user.diamonds,
      level: user.level,
      xp: user.xp,
      warnings
    }
  }
  
  // Get enhanced odds for matches
  async getEnhancedMatchOdds(matchId: string, userId: string) {
    // Get match and standard odds
    const { data: match } = await this.supabase
      .from('matches')
      .select(`
        *,
        odds(*),
        home_team:teams!home_team_id(name, city, is_derby_team),
        away_team:teams!away_team_id(name, city, is_derby_team)
      `)
      .eq('id', matchId)
      .single()
    
    if (!match || !match.odds[0]) throw new Error('Match not found')
    
    // Get user info for boost factors
    const { data: user } = await this.supabase
      .from('users')
      .select('level, created_at, total_bets')
      .eq('id', userId)
      .single()
    
    const standardOdds = match.odds[0]
    const isDerby = match.is_derby
    const isFirstBet = user?.total_bets === 0
    
    // Calculate enhanced odds
    const enhanced = calculateEnhancedOdds(
      {
        homeWin: standardOdds.home_win,
        draw: standardOdds.draw,
        awayWin: standardOdds.away_win
      },
      {
        isFirstBet,
        isDerbyMatch: isDerby,
        isFeaturedMatch: match.is_featured,
        userLevel: user?.level || 1,
        hasActivePromo: false // Check active promos
      }
    )
    
    // Check for special events
    const specialEvents = getActiveSpecialEvents(new Date(), user?.created_at)
    
    // Apply special event boosts
    if (specialEvents.length > 0) {
      enhanced.enhancedHomeWin = applySpecialEventBoosts(enhanced.enhancedHomeWin, specialEvents)
      enhanced.enhancedDraw = applySpecialEventBoosts(enhanced.enhancedDraw, specialEvents)
      enhanced.enhancedAwayWin = applySpecialEventBoosts(enhanced.enhancedAwayWin, specialEvents)
    }
    
    return {
      match,
      standardOdds,
      enhanced,
      specialEvents,
      availableBoosts: this.getAvailableBoosts(user?.diamonds || 0)
    }
  }
  
  // Get available diamond boosts
  private getAvailableBoosts(diamonds: number) {
    return Object.entries(DIAMOND_BOOST_OPTIONS)
      .filter(([key, boost]) => boost.cost <= diamonds)
      .map(([key, boost]) => ({
        key,
        ...boost,
        canAfford: true
      }))
  }
  
  // Place a Pitkäveto bet
  async placePitkaveto(
    userId: string,
    selections: PitkavetoSelection[],
    stake: number,
    diamondBoostType?: keyof typeof DIAMOND_BOOST_OPTIONS
  ) {
    // Validate selections
    const validation = validatePitkaveto(selections)
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '))
    }
    
    // Get user balance
    const balance = await this.getUserBalance(userId)
    
    // Check if user can afford stake
    if (!validateTransaction(balance.betPoints, stake, 'SPEND')) {
      throw new Error('Insufficient BetPoints')
    }
    
    // Check if user can afford diamond boost
    let diamondCost = 0
    if (diamondBoostType) {
      if (!canAffordBoost(balance.diamonds, diamondBoostType)) {
        throw new Error('Insufficient diamonds for boost')
      }
      diamondCost = DIAMOND_BOOST_OPTIONS[diamondBoostType].cost
    }
    
    // Calculate total odds with bonuses
    const oddsCalc = calculatePitkavetoOdds(selections, diamondBoostType)
    const potentialWin = calculatePotentialWin(stake, oddsCalc.finalOdds)
    
    // Start transaction
    const { data: bet, error: betError } = await this.supabase
      .from('bets')
      .insert({
        user_id: userId,
        bet_type: 'pitkaveto',
        stake,
        total_odds: oddsCalc.finalOdds,
        potential_win: potentialWin,
        diamond_boost: diamondBoostType ? true : false,
        diamonds_used: diamondCost,
        status: 'pending'
      })
      .select()
      .single()
    
    if (betError) throw betError
    
    // Insert bet selections
    const selectionData = selections.map(sel => ({
      bet_id: bet.id,
      match_id: sel.matchId,
      market: sel.market,
      selection: sel.selection,
      odds: sel.enhancedOdds,
      result: 'pending'
    }))
    
    await this.supabase
      .from('bet_selections')
      .insert(selectionData)
    
    // Update user balance and XP
    const newBetPoints = balance.betPoints - stake
    const newDiamonds = balance.diamonds - diamondCost
    const xpEarned = calculateXP('PITKAVETO_PLACED')
    const newXP = balance.xp + xpEarned
    
    // Check for level up
    const newLevel = checkLevelUp(newXP, balance.level)
    let levelUpReward = null
    
    if (newLevel) {
      const rewards = LEVEL_REWARDS[newLevel as keyof typeof LEVEL_REWARDS]
      levelUpReward = {
        level: newLevel,
        betPoints: rewards.betPoints,
        diamonds: rewards.diamonds
      }
    }
    
    // Update user
    await this.supabase
      .from('users')
      .update({
        bet_points: newBetPoints + (levelUpReward?.betPoints || 0),
        diamonds: newDiamonds + (levelUpReward?.diamonds || 0),
        xp: newXP,
        level: newLevel || balance.level,
        // @ts-ignore - Supabase SQL template support
        total_bets: this.supabase.sql`total_bets + 1`,
        // @ts-ignore - Supabase SQL template support
        total_staked: this.supabase.sql`total_staked + ${stake}`,
        // @ts-ignore - Supabase SQL template support
        active_bets: this.supabase.sql`active_bets + 1`
      })
      .eq('id', userId)
    
    // Record transactions
    const transactions = [
      {
        user_id: userId,
        type: 'bet_placed',
        amount: stake,
        currency: 'betpoints',
        description: `Pitkäveto (${selections.length} selections)`,
        balance_before: balance.betPoints,
        balance_after: newBetPoints,
        reference: bet.id
      }
    ]
    
    if (diamondCost > 0) {
      transactions.push({
        user_id: userId,
        type: 'diamond_spent',
        amount: diamondCost,
        currency: 'diamonds',
        description: `${diamondBoostType} boost`,
        balance_before: balance.diamonds,
        balance_after: newDiamonds,
        reference: bet.id
      })
    }
    
    await this.supabase
      .from('transactions')
      .insert(transactions)
    
    return {
      bet,
      oddsCalc,
      potentialWin,
      xpEarned,
      levelUpReward,
      newBalance: {
        betPoints: newBetPoints + (levelUpReward?.betPoints || 0),
        diamonds: newDiamonds + (levelUpReward?.diamonds || 0)
      }
    }
  }
  
  // Place a live bet with diamond earning potential
  async placeLiveBet(
    userId: string,
    matchId: string,
    market: string,
    selection: string,
    odds: number,
    stake: number
  ) {
    const balance = await this.getUserBalance(userId)
    
    if (!validateTransaction(balance.betPoints, stake, 'SPEND')) {
      throw new Error('Insufficient BetPoints')
    }
    
    // Check if double diamond time
    const diamondEvents = getActiveDiamondEvents()
    const isDoubleTime = diamondEvents.includes('LIVE_BETTING_RUSH')
    
    // Calculate potential diamond earning
    const potentialDiamonds = calculateLiveBetDiamonds(true, false, odds, isDoubleTime)
    
    // Place the live bet
    const { data: liveBet, error } = await this.supabase
      .from('live_bets')
      .insert({
        user_id: userId,
        match_id: matchId,
        market,
        selection,
        odds,
        stake,
        potential_win: calculatePotentialWin(stake, odds),
        placed_at_minute: 0, // Get from match
        status: 'pending'
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Update balance and potentially earn diamonds
    let diamondsEarned = 0
    if (Math.random() < 0.3) { // 30% chance
      diamondsEarned = isDoubleTime ? 2 : 1
    }
    
    await this.supabase
      .from('users')
      .update({
        bet_points: balance.betPoints - stake,
        diamonds: balance.diamonds + diamondsEarned,
        xp: balance.xp + calculateXP('LIVE_BET_PLACED'),
        // @ts-ignore - Supabase SQL template support
        active_bets: this.supabase.sql`active_bets + 1`
      })
      .eq('id', userId)
    
    return {
      liveBet,
      diamondsEarned,
      isDoubleTime,
      newBalance: {
        betPoints: balance.betPoints - stake,
        diamonds: balance.diamonds + diamondsEarned
      }
    }
  }
  
  // Settle a bet (win/loss)
  async settleBet(betId: string, won: boolean) {
    const { data: bet } = await this.supabase
      .from('bets')
      .select('*, user:users(*)')
      .eq('id', betId)
      .single()
    
    if (!bet) throw new Error('Bet not found')
    
    const winAmount = won ? bet.potential_win : 0
    const xpEarned = won ? calculateXP('BET_WON', winAmount) : 0
    
    // Update bet status
    await this.supabase
      .from('bets')
      .update({
        status: won ? 'won' : 'lost',
        settled_at: new Date(),
        win_amount: winAmount
      })
      .eq('id', betId)
    
    // Update user stats
    const updates: any = {
      // @ts-ignore - Supabase SQL template support
      active_bets: this.supabase.sql`active_bets - 1`,
      // @ts-ignore - Supabase SQL template support
      xp: this.supabase.sql`xp + ${xpEarned}`
    }
    
    if (won) {
      // @ts-ignore - Supabase SQL template support
      updates.bet_points = this.supabase.sql`bet_points + ${winAmount}`
      // @ts-ignore - Supabase SQL template support
      updates.total_wins = this.supabase.sql`total_wins + 1`
      // @ts-ignore - Supabase SQL template support
      updates.total_won = this.supabase.sql`total_won + ${winAmount}`
      // @ts-ignore - Supabase SQL template support
      updates.current_streak = this.supabase.sql`current_streak + 1`
      
      if (winAmount > bet.user.biggest_win) {
        updates.biggest_win = winAmount
      }
    } else {
      updates.current_streak = 0
    }
    
    await this.supabase
      .from('users')
      .update(updates)
      .eq('id', bet.user_id)
    
    // Record win transaction
    if (won) {
      await this.supabase
        .from('transactions')
        .insert({
          user_id: bet.user_id,
          type: 'bet_won',
          amount: winAmount,
          currency: 'betpoints',
          description: `Bet won (${bet.bet_type})`,
          balance_before: bet.user.bet_points,
          balance_after: bet.user.bet_points + winAmount,
          reference: betId
        })
    }
    
    return {
      won,
      winAmount,
      xpEarned
    }
  }
}