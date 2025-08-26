import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, getProductByPriceId } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = headers()
  const sig = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServerClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session, supabase)
        break
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleSubscriptionPayment(invoice, supabase)
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription, supabase)
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancelled(subscription, supabase)
        break
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: any,
  eventId: string
) {
  const { customer, line_items, payment_intent } = session
  
  if (!customer || !line_items?.data?.[0]) {
    throw new Error('Missing required session data')
  }

  // Get the price ID from line items
  const priceId = line_items.data[0].price?.id
  if (!priceId) {
    throw new Error('No price ID found in session')
  }

  // Get product details
  const product = getProductByPriceId(priceId)
  if (!product) {
    throw new Error(`Unknown product for price ID: ${priceId}`)
  }

  // Security: Validate customer ID format
  if (typeof customer !== 'string' || !customer.startsWith('cus_')) {
    await logSecurityViolation('stripe_invalid_customer_id', {
      customerId: customer,
      sessionId: session.id,
      eventId
    })
    throw new Error('Invalid customer ID format')
  }

  // Find user by Stripe customer ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, bet_points, diamonds, stripe_customer_id')
    .eq('stripe_customer_id', customer)
    .single()

  if (userError || !user) {
    await logPaymentEvent('payment_user_not_found', undefined, {
      customerId: customer,
      sessionId: session.id,
      eventId
    })
    throw new Error('User not found for customer ID')
  }

  // Security: Verify user owns the customer ID
  if (user.stripe_customer_id !== customer) {
    await logSecurityViolation('stripe_customer_mismatch', {
      userId: user.id,
      customerId: customer,
      sessionId: session.id,
      eventId
    })
    throw new Error('Customer ID mismatch')
  }

  // Process the purchase based on product type
  if ('betPoints' in product && 'diamonds' in product) {
    // One-time purchase
    await processBetPointPurchase(user, product, payment_intent as string, supabase)
  } else if ('recurring' in product && !product.recurring) {
    // Season pass (one-time but special)
    await processSeasonPassPurchase(user, product, payment_intent as string, supabase)
  }
}

async function processBetPointPurchase(
  user: any,
  product: any,
  paymentIntentId: string,
  supabase: any
) {
  const newBetPoints = user.bet_points + product.betPoints
  const newDiamonds = user.diamonds + product.diamonds

  // Update user balances
  const { error: updateError } = await supabase
    .from('users')
    .update({
      bet_points: newBetPoints,
      diamonds: newDiamonds,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (updateError) {
    throw new Error('Failed to update user balances')
  }

  // Record transactions
  await recordTransaction(
    user.id,
    'purchase',
    product.betPoints,
    'betpoints',
    `Purchased ${product.name}`,
    user.bet_points,
    newBetPoints,
    paymentIntentId,
    supabase
  )

  if (product.diamonds > 0) {
    await recordTransaction(
      user.id,
      'purchase',
      product.diamonds,
      'diamonds',
      `Bonus diamonds from ${product.name}`,
      user.diamonds,
      newDiamonds,
      paymentIntentId,
      supabase
    )
  }
}

async function processSeasonPassPurchase(
  user: any,
  product: any,
  paymentIntentId: string,
  supabase: any
) {
  const newBetPoints = user.bet_points + product.betPointsTotal
  const newDiamonds = user.diamonds + product.diamondsTotal

  // Update user balances
  const { error: updateError } = await supabase
    .from('users')
    .update({
      bet_points: newBetPoints,
      diamonds: newDiamonds,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (updateError) {
    throw new Error('Failed to update user balances')
  }

  // Record transactions
  await recordTransaction(
    user.id,
    'purchase',
    product.betPointsTotal,
    'betpoints',
    `Season Pass: ${product.betPointsTotal} BetPoints`,
    user.bet_points,
    newBetPoints,
    paymentIntentId,
    supabase
  )

  await recordTransaction(
    user.id,
    'purchase',
    product.diamondsTotal,
    'diamonds',
    `Season Pass: ${product.diamondsTotal} Diamonds`,
    user.diamonds,
    newDiamonds,
    paymentIntentId,
    supabase
  )
}

async function handleSubscriptionPayment(
  invoice: Stripe.Invoice,
  supabase: any
) {
  const { customer, subscription, payment_intent } = invoice
  
  if (!customer || !subscription) {
    throw new Error('Missing required invoice data')
  }

  // Get subscription details
  const sub = await stripe.subscriptions.retrieve(subscription as string)
  const priceId = sub.items.data[0]?.price.id

  if (!priceId) {
    throw new Error('No price ID found in subscription')
  }

  // Get product details (VIP Monthly)
  const product = getProductByPriceId(priceId)
  if (!product || !('recurring' in product)) {
    throw new Error('Invalid subscription product')
  }

  // Find user by Stripe customer ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('stripe_customer_id', customer)
    .single()

  if (userError || !user) {
    throw new Error('User not found for customer ID')
  }

  // Add monthly allowances
  const newBetPoints = user.bet_points + product.betPointsMonthly
  const newDiamonds = user.diamonds + product.diamondsMonthly

  // Update user balances and subscription status
  const { error: updateError } = await supabase
    .from('users')
    .update({
      bet_points: newBetPoints,
      diamonds: newDiamonds,
      subscription_status: 'active',
      subscription_id: subscription,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (updateError) {
    throw new Error('Failed to update user subscription')
  }

  // Record transactions
  await recordTransaction(
    user.id,
    'subscription',
    product.betPointsMonthly,
    'betpoints',
    `VIP Monthly: ${product.betPointsMonthly} BetPoints`,
    user.bet_points,
    newBetPoints,
    payment_intent as string,
    supabase
  )

  await recordTransaction(
    user.id,
    'subscription',
    product.diamondsMonthly,
    'diamonds',
    `VIP Monthly: ${product.diamondsMonthly} Diamonds`,
    user.diamonds,
    newDiamonds,
    payment_intent as string,
    supabase
  )
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const { customer, status } = subscription

  // Update user subscription status
  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: status,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customer)

  if (error) {
    throw new Error('Failed to update subscription status')
  }
}

async function handleSubscriptionCancelled(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const { customer } = subscription

  // Update user subscription status
  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: 'cancelled',
      subscription_id: null,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customer)

  if (error) {
    throw new Error('Failed to cancel subscription')
  }
}

async function recordTransaction(
  userId: string,
  type: string,
  amount: number,
  currency: string,
  description: string,
  balanceBefore: number,
  balanceAfter: number,
  stripePaymentIntentId: string,
  supabase: any
) {
  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type,
      amount,
      currency,
      description,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      stripe_payment_intent_id: stripePaymentIntentId
    })

  if (error) {
    console.error('Failed to record transaction:', error)
    throw new Error('Transaction recording failed')
  }
}