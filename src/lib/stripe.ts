import Stripe from 'stripe'

// Initialize Stripe with test key or empty string
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2024-11-20.acacia',
})

// Stripe product configuration
export const STRIPE_PRODUCTS = {
  STARTER_PACK: {
    priceId: 'price_starter_pack_499',
    name: 'Starter Pack',
    description: 'Perfect for beginners - 5000 BetPoints + 25 Diamonds',
    price: 499, // €4.99
    betPoints: 5000,
    diamonds: 25,
  },
  PLAYER_PACK: {
    priceId: 'price_player_pack_999',
    name: 'Player Pack',
    description: 'Most popular - 12000 BetPoints + 60 Diamonds',
    price: 999, // €9.99
    betPoints: 12000,
    diamonds: 60,
  },
  PRO_PACK: {
    priceId: 'price_pro_pack_1999',
    name: 'Pro Pack',
    description: 'Best value - 25000 BetPoints + 150 Diamonds',
    price: 1999, // €19.99
    betPoints: 25000,
    diamonds: 150,
  },
  CHAMPION_PACK: {
    priceId: 'price_champion_pack_3999',
    name: 'Champion Pack',
    description: 'Ultimate package - 55000 BetPoints + 350 Diamonds',
    price: 3999, // €39.99
    betPoints: 55000,
    diamonds: 350,
  },
}

export const STRIPE_SUBSCRIPTIONS = {
  VIP_MONTHLY: {
    priceId: 'price_vip_monthly_999',
    name: 'VIP Monthly',
    description: 'Monthly VIP benefits with recurring rewards',
    price: 999, // €9.99/month
    interval: 'month' as const,
    recurring: true,
    betPoints: 5000,
    diamonds: 50,
    perks: [
      'Monthly BetPoints allowance',
      'Diamond bonus',
      'Exclusive betting limits',
      'Priority support',
    ],
  },
  SEASON_PASS: {
    priceId: 'price_season_pass_2999',
    name: 'Season Pass',
    description: 'Full season access with premium benefits',
    price: 2999, // €29.99
    betPoints: 15000,
    diamonds: 200,
    perks: [
      'Full season access',
      'Bonus diamonds for big matches',
      'Special derby multipliers',
      'Exclusive challenges',
    ],
  },
}

// Helper function to get product details by price ID
export function getProductByPriceId(priceId: string) {
  // Check one-time products
  const product = Object.values(STRIPE_PRODUCTS).find(p => p.priceId === priceId)
  if (product) return { type: 'product', ...product }
  
  // Check subscriptions
  const subscription = Object.values(STRIPE_SUBSCRIPTIONS).find(s => s.priceId === priceId)
  if (subscription) return { type: 'subscription', ...subscription }
  
  return null
}