import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { 
  generateDailyChallenges, 
  updateChallengeProgress,
  checkChallengeCompletion
} from '@/lib/challenge-system'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user level for challenge generation
    const { data: userProfile } = await supabase
      .from('users')
      .select('level, total_bets')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get today's date
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    // Check for existing challenges for today
    const { data: existingChallenges } = await (supabase
      .from('challenges')
      .select(`
        *,
        progress:challenge_progress(
          progress,
          completed,
          completed_at,
          claimed_at
        )
      `) as any)
      .eq('is_daily', true)
      .eq('is_active', true)
      .gte('start_date', startOfDay.toISOString())
      .lte('start_date', endOfDay.toISOString())
      .eq('progress.user_id', user.id)

    let challenges = existingChallenges || []

    // Generate new challenges if none exist for today
    if (challenges.length === 0) {
      const newChallenges = generateDailyChallenges(today, userProfile.level, {
        isDerbyDay: false, // TODO: Check for derby matches
        availableLeagues: ['veikkausliiga', 'ykkosliiga', 'kakkonen'],
        liveMatchesCount: 0 // TODO: Get live matches count
      })

      // Insert new challenges into database
      const challengeInserts = newChallenges.map(challenge => ({
        name: challenge.name,
        description: challenge.description,
        start_date: startOfDay.toISOString(),
        end_date: endOfDay.toISOString(),
        requirement: challenge.requirement,
        reward: challenge.reward,
        is_daily: true,
        is_active: true
      }))

      const result4 = await supabase
        .from('challenges')
        .insert(challengeInserts)
        .select('*') as any
      
      const insertedChallenges = result4.data
      const insertError = result4.error

      if (insertError) {
        console.error('Error inserting challenges:', insertError)
        return NextResponse.json(
          { error: 'Failed to generate challenges' },
          { status: 500 }
        )
      }

      // Create progress records for each challenge
      const progressInserts = insertedChallenges.map((challenge: any) => ({
        user_id: user.id,
        challenge_id: challenge.id,
        progress: 0,
        completed: false
      }))

      await supabase
        .from('challenge_progress')
        .insert(progressInserts)

      challenges = insertedChallenges.map((challenge: any) => ({
        ...challenge,
        progress: [{ progress: 0, completed: false, completed_at: null, claimed_at: null }]
      }))
    }

    // Format challenges for response
    const formattedChallenges = challenges.map((challenge: any) => ({
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      requirement: challenge.requirement,
      reward: challenge.reward,
      startDate: challenge.start_date,
      endDate: challenge.end_date,
      progress: challenge.progress?.[0]?.progress || 0,
      completed: challenge.progress?.[0]?.completed || false,
      completedAt: challenge.progress?.[0]?.completed_at,
      claimedAt: challenge.progress?.[0]?.claimed_at
    }))

    return NextResponse.json({
      success: true,
      data: {
        daily: formattedChallenges,
        weekly: [] // TODO: Implement weekly challenges
      }
    })

  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, challengeId, context } = body

    if (action === 'update_progress') {
      // Update challenge progress based on user action
      const { data: challengeProgress } = await (supabase
        .from('challenge_progress')
        .select(`
          *,
          challenge:challenges(*)
        `) as any)
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .single()

      if (!challengeProgress) {
        return NextResponse.json(
          { error: 'Challenge progress not found' },
          { status: 404 }
        )
      }

      const newProgress = updateChallengeProgress(
        challengeProgress.challenge.requirement.type,
        context,
        challengeProgress.progress
      )

      const isCompleted = checkChallengeCompletion(
        challengeProgress.challenge,
        newProgress
      )

      // Update progress
      const updateData: any = { progress: newProgress }
      if (isCompleted && !challengeProgress.completed) {
        updateData.completed = true
        updateData.completed_at = new Date().toISOString()
      }

      await supabase
        .from('challenge_progress')
        .update(updateData)
        .eq('id', challengeProgress.id)

      return NextResponse.json({
        success: true,
        data: {
          progress: newProgress,
          completed: isCompleted,
          challenge: challengeProgress.challenge
        }
      })

    } else if (action === 'claim_reward') {
      // Claim challenge reward
      const { data: challengeProgress } = await (supabase
        .from('challenge_progress')
        .select(`
          *,
          challenge:challenges(*)
        `) as any)
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .single()

      if (!challengeProgress) {
        return NextResponse.json(
          { error: 'Challenge progress not found' },
          { status: 404 }
        )
      }

      if (!challengeProgress.completed) {
        return NextResponse.json(
          { error: 'Challenge not completed' },
          { status: 400 }
        )
      }

      if (challengeProgress.claimed_at) {
        return NextResponse.json(
          { error: 'Reward already claimed' },
          { status: 400 }
        )
      }

      // Get user current balance
      const { data: userProfile } = await supabase
        .from('users')
        .select('bet_points, diamonds, xp, level')
        .eq('id', user.id)
        .single()

      if (!userProfile) {
        return NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 }
        )
      }

      const reward = challengeProgress.challenge.reward
      const newBetPoints = userProfile.bet_points + (reward.betPoints || 0)
      const newDiamonds = userProfile.diamonds + (reward.diamonds || 0)
      const newXP = ((userProfile as any).xp || 0) + (reward.xp || 0)

      // Update user balance
      await supabase
        .from('users')
        .update({
          bet_points: newBetPoints,
          diamonds: newDiamonds,
          xp: newXP
        })
        .eq('id', user.id)

      // Mark reward as claimed
      await supabase
        .from('challenge_progress')
        .update({
          claimed_at: new Date().toISOString()
        })
        .eq('id', challengeProgress.id)

      // Record transactions
      if (reward.betPoints > 0) {
        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'CHALLENGE_REWARD',
          amount: reward.betPoints,
          currency: 'BETPOINTS',
          description: `Challenge Reward: ${challengeProgress.challenge.name}`,
          balance_before: userProfile.bet_points,
          balance_after: newBetPoints
        })
      }

      if (reward.diamonds > 0) {
        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'CHALLENGE_REWARD',
          amount: reward.diamonds,
          currency: 'DIAMONDS',
          description: `Challenge Reward: ${challengeProgress.challenge.name}`,
          balance_before: userProfile.diamonds,
          balance_after: newDiamonds
        })
      }

      // Create notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'CHALLENGE_COMPLETED',
        title: 'Haaste suoritettu!',
        message: `${challengeProgress.challenge.name} - Sait ${reward.betPoints} BP, ${reward.diamonds} 💎`,
        data: { challenge: challengeProgress.challenge, reward }
      })

      return NextResponse.json({
        success: true,
        data: {
          reward,
          newBalance: {
            betPoints: newBetPoints,
            diamonds: newDiamonds,
            xp: newXP
          }
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error processing challenge action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}