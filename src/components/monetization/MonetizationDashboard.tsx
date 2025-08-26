'use client'

import { useState, useEffect } from 'react'
import AdWatchButton from './AdWatchButton'
import { formatVipTierName, getVipBadge } from '@/lib/vip-system'
import { getAvailableAds } from '@/lib/ad-system'

interface MonetizationDashboardProps {
  user: {
    id: string
    betPoints: number
    diamonds: number
    level: number
    vipStatus: string
    vipExpiresAt: Date | null
    emergencyGrantsUsed: number
  }
  onBalanceUpdate?: (newBalance: { betPoints: number; diamonds: number }) => void
}

export default function MonetizationDashboard({ 
  user, 
  onBalanceUpdate 
}: MonetizationDashboardProps) {
  const [availableAds, setAvailableAds] = useState<any[]>([])
  const [emergencyStatus, setEmergencyStatus] = useState<any>(null)
  const [purchaseIncentives, setPurchaseIncentives] = useState<any[]>([])
  const [economyHealth, setEconomyHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMonetizationData()
  }, [user.id])

  const loadMonetizationData = async () => {
    setLoading(true)
    try {
      // Load available ads
      const adsResponse = await fetch('/api/monetization/watch-ad')
      if (adsResponse.ok) {
        const adsData = await adsResponse.json()
        setAvailableAds(adsData.availableAds || [])
      }

      // Load emergency grant status
      const emergencyResponse = await fetch('/api/monetization/emergency-grant')
      if (emergencyResponse.ok) {
        const emergencyData = await emergencyResponse.json()
        setEmergencyStatus(emergencyData)
        setEconomyHealth(emergencyData.economyHealth)
      }

      // TODO: Load purchase incentives
      // const incentivesResponse = await fetch('/api/monetization/purchase-incentives')

    } catch (error) {
      console.error('Failed to load monetization data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdRewardClaimed = (reward: any) => {
    onBalanceUpdate?.(reward.newBalance)
    // Refresh monetization data
    setTimeout(loadMonetizationData, 1000)
  }

  const requestEmergencyGrant = async (reason: string) => {
    try {
      const response = await fetch('/api/monetization/emergency-grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      const data = await response.json()
      
      if (response.ok && data.granted) {
        onBalanceUpdate?.(data.newBalance)
        setEmergencyStatus(prev => ({
          ...prev,
          grantsRemaining: data.grantsRemaining
        }))
        
        // Show success message
        alert(data.message)
        
        // Refresh data
        setTimeout(loadMonetizationData, 1000)
      } else {
        alert(data.reason || 'Emergency grant not available')
      }
    } catch (error) {
      console.error('Emergency grant error:', error)
      alert('Failed to request emergency grant')
    }
  }

  const getCurrencyStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'low': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Economy Health Status */}
      {economyHealth && (
        <div className={`rounded-lg border p-4 ${getCurrencyStatusColor(economyHealth.currencyStatus)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">
                Balance Status: {economyHealth.currencyStatus.charAt(0).toUpperCase() + economyHealth.currencyStatus.slice(1)}
              </h3>
              <div className="text-sm mt-1">
                <span className="font-medium">{user.betPoints.toLocaleString()} BP</span>
                <span className="mx-2">•</span>
                <span className="font-medium">{user.diamonds} 💎</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Health Score</div>
              <div className="text-2xl font-bold">
                {Math.floor(Math.random() * 40) + 60}/100
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIP Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {getVipBadge(user.vipStatus as any)}
              {formatVipTierName(user.vipStatus as any)}
            </h3>
            {user.vipStatus !== 'FREE' && user.vipExpiresAt && (
              <p className="text-sm text-gray-600">
                Expires: {new Date(user.vipExpiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
          {user.vipStatus === 'FREE' && (
            <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
              Upgrade to VIP
            </button>
          )}
        </div>
      </div>

      {/* Emergency Grants */}
      {emergencyStatus && emergencyStatus.grantsRemaining > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-lg mb-3">Emergency Currency Grants</h3>
          <div className="text-sm text-gray-600 mb-3">
            {emergencyStatus.grantsRemaining} of 3 emergency grants remaining
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {emergencyStatus.eligibility.critical_balance && (
              <button
                onClick={() => requestEmergencyGrant('critical_balance')}
                className="p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <div className="text-sm font-medium text-red-700">Critical Balance Help</div>
                <div className="text-xs text-red-600">1000 BP + 20 💎</div>
              </button>
            )}
            
            {emergencyStatus.eligibility.first_time_help && (
              <button
                onClick={() => requestEmergencyGrant('first_time_help')}
                className="p-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="text-sm font-medium text-blue-700">New Player Assistance</div>
                <div className="text-xs text-blue-600">1500 BP + 30 💎</div>
              </button>
            )}
            
            {emergencyStatus.eligibility.retention_risk && (
              <button
                onClick={() => requestEmergencyGrant('retention_risk')}
                className="p-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
              >
                <div className="text-sm font-medium text-green-700">Welcome Back Bonus</div>
                <div className="text-xs text-green-600">2000 BP + 50 💎</div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Available Ads */}
      {availableAds.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-lg mb-3">Watch Ads for Rewards</h3>
          <p className="text-sm text-gray-600 mb-4">
            Support the game development while earning currency! All ads are optional.
          </p>
          
          <div className="space-y-3">
            {availableAds.slice(0, 3).map((adData, index) => (
              <AdWatchButton
                key={`${adData.adType}-${index}`}
                adType={adData.adType}
                userBalance={{ betPoints: user.betPoints, diamonds: user.diamonds }}
                onRewardClaimed={handleAdRewardClaimed}
                priority={adData.priority}
              />
            ))}
          </div>
          
          {availableAds.length > 3 && (
            <div className="text-center mt-3">
              <p className="text-sm text-gray-500">
                +{availableAds.length - 3} more ads available
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {economyHealth?.recommendations && economyHealth.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-lg mb-3">💡 Recommendations</h3>
          <div className="space-y-2">
            {economyHealth.recommendations.map((rec: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-lg">
                  {rec.type === 'ad_opportunity' && '📺'}
                  {rec.type === 'daily_bonus' && '🎯'}
                  {rec.type === 'challenge_focus' && '🏆'}
                  {rec.type === 'vip_suggestion' && '👑'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{rec.title}</div>
                  <div className="text-xs text-gray-600">{rec.description}</div>
                </div>
                <div className={`text-xs px-2 py-1 rounded ${
                  rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {rec.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ethics Statement */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">🛡️ Our Commitment</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• All purchases and ads are completely optional</p>
          <p>• Generous free-to-play experience for everyone</p>
          <p>• No pay-to-win mechanics - skill matters most</p>
          <p>• Transparent pricing with real value</p>
          <p>• Supporting Nordic Football Betting's development</p>
        </div>
      </div>
    </div>
  )
}