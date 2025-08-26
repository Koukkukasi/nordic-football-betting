import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'

// Get user's subscription details
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id, subscription_id, subscription_status')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let subscriptionData = null

    if (user.subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.subscription_id)
        subscriptionData = {
          id: subscription.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          plan_name: subscription.items.data[0]?.price.metadata?.name || 'VIP Monthly'
        }
      } catch (stripeError) {
        console.error('Failed to retrieve subscription:', stripeError)
      }
    }

    return NextResponse.json({
      hasActiveSubscription: user.subscription_status === 'active',
      subscription: subscriptionData
    })

  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

// Cancel user's subscription
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('subscription_id')
      .eq('id', userId)
      .single()

    if (userError || !user || !user.subscription_id) {
      return NextResponse.json(
        { error: 'User or subscription not found' },
        { status: 404 }
      )
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(user.subscription_id, {
      cancel_at_period_end: true
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current period',
      cancel_at: subscription.current_period_end
    })

  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}