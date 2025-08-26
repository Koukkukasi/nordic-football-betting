import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRODUCTS } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { priceId, userId } = await req.json()

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Validate product exists
    const product = Object.values(STRIPE_PRODUCTS).find(p => p.priceId === priceId)
    if (!product) {
      return NextResponse.json(
        { error: 'Invalid product' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create or get Stripe customer
    let customerId = user.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          username: user.username
        }
      })

      customerId = customer.id

      // Update user with Stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.name,
              description: product.description,
              metadata: {
                productType: 'recurring' in product && product.recurring ? 'subscription' : 'one_time'
              }
            },
            unit_amount: product.price,
            ...('recurring' in product && product.recurring && {
              recurring: {
                interval: product.interval as 'month'
              }
            })
          },
          quantity: 1
        }
      ],
      mode: 'recurring' in product && product.recurring ? 'subscription' : 'payment',
      success_url: `${req.headers.get('origin')}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/dashboard?cancelled=true`,
      metadata: {
        userId,
        priceId,
        productName: product.name
      }
    })

    return NextResponse.json({ sessionId: session.id })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}