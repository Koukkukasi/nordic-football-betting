import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { DailyLoginService } from '@/lib/daily-login-system'

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

    // Get login status
    const loginStatus = await DailyLoginService.getLoginStatus(user.id)
    
    return NextResponse.json({
      success: true,
      data: loginStatus
    })

  } catch (error) {
    console.error('Error fetching daily bonus status:', error)
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

    // Claim daily bonus
    const result = await DailyLoginService.claimDailyBonus(user.id)
    
    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error claiming daily bonus:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('already claimed')) {
        return NextResponse.json(
          { error: 'Daily bonus already claimed today' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('not available')) {
        return NextResponse.json(
          { error: 'Daily bonus not available' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to claim daily bonus' },
      { status: 500 }
    )
  }
}