'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import MonetizationDashboard from '@/components/monetization/MonetizationDashboard'
import { STRIPE_PRODUCTS, STRIPE_SUBSCRIPTIONS } from '@/lib/stripe'

export default function MonetizationPage() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/login')
    }
    if (status === 'authenticated') {
      loadUserData()
    }
  }, [status])

  const loadUserData = async () => {
    try {
      // In a real implementation, you'd fetch user data from your API
      // For now, we'll simulate user data
      const mockUser = {
        id: 'user123',
        email: session?.user?.email || '',
        betPoints: 1250,
        diamonds: 15,
        level: 6,
        vipStatus: 'FREE',
        vipExpiresAt: null,
        emergencyGrantsUsed: 1
      }
      setUser(mockUser)
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBalanceUpdate = (newBalance: { betPoints: number; diamonds: number }) => {
    setUser((prev: any) => ({
      ...prev,
      ...newBalance
    }))
  }

  const handlePurchase = async (productId: string) => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: productId,
          successUrl: `${window.location.origin}/monetization?success=true`,
          cancelUrl: `${window.location.origin}/monetization?canceled=true`
        })
      })

      const data = await response.json()
      
      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to initiate purchase')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Purchase failed')
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Currency & Rewards
            </h1>
            <p className="text-gray-600">
              Manage your BetPoints, diamonds, and optional premium features
            </p>
          </div>

          {/* Success/Cancel Messages */}
          {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('success') && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                🎉 Purchase successful! Your rewards have been added to your account.
              </p>
            </div>
          )}
          
          {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('canceled') && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                ⏸️ Purchase canceled. No charges were made.
              </p>
            </div>
          )}

          {/* Main Monetization Dashboard */}
          <MonetizationDashboard 
            user={user} 
            onBalanceUpdate={handleBalanceUpdate}
          />

          {/* Purchase Options */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Optional Purchases</h2>
            <p className="text-gray-600 mb-6">
              Support Nordic Football Betting's development with optional currency packs and VIP memberships.
            </p>

            {/* Currency Packs */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">💰 Currency Packs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(STRIPE_PRODUCTS).map(([key, product]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-lg mb-2">{product.name}</h4>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      €{(product.price / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      <div>{product.betPoints.toLocaleString()} BetPoints</div>
                      <div>{product.diamonds} Diamonds 💎</div>
                    </div>
                    <button
                      onClick={() => handlePurchase(product.priceId)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Purchase
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* VIP Subscriptions */}
            <div>
              <h3 className="text-lg font-medium mb-4">👑 VIP Memberships</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(STRIPE_SUBSCRIPTIONS).map(([key, subscription]) => (
                  <div key={key} className="border border-purple-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-xl mb-2 flex items-center gap-2">
                      👑 {subscription.name}
                    </h4>
                    <div className="text-2xl font-bold text-purple-600 mb-3">
                      €{(subscription.price / 100).toFixed(2)}/{subscription.interval}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      <div>{subscription.betPoints.toLocaleString()} BP monthly</div>
                      <div>{subscription.diamonds} diamonds monthly 💎</div>
                    </div>
                    <div className="space-y-1 mb-4">
                      {subscription.perks.map((perk, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="text-green-500">✓</span>
                          {perk}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handlePurchase(subscription.priceId)}
                      className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      Subscribe
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fair Play Statement */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              🏆 Fair Play Guarantee
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>No pay-to-win mechanics</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Skill determines success</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Generous free experience</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Transparent pricing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Optional purchases only</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Supporting game development</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Nordic Football Betting is a free-to-play game. All purchases are optional and support ongoing development.
            </p>
            <p className="mt-1">
              Virtual currency has no real-world value and cannot be exchanged for cash.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}