'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PlayerNavigation from '@/components/layout/PlayerNavigation'
import AchievementSystem, { Achievement } from '@/components/achievements/AchievementSystem'
import { Trophy, Star, Zap } from 'lucide-react'

export default function AchievementsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recentUnlocks, setRecentUnlocks] = useState<Achievement[]>([])

  const handleAchievementUnlock = (achievement: Achievement) => {
    setRecentUnlocks(prev => [achievement, ...prev].slice(0, 5))
    
    // Would call API to claim rewards
    console.log('Achievement unlocked:', achievement)
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <PlayerNavigation />
      
      <main className="container-modern py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Achievements</h1>
          <p className="text-gray-600">Complete challenges and earn rewards</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Total Earned</p>
                <p className="text-xl font-bold">12,500 BP</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Diamonds Earned</p>
                <p className="text-xl font-bold">💎 85</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">XP Gained</p>
                <p className="text-xl font-bold">2,450 XP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Unlocks */}
        {recentUnlocks.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Recently Unlocked</h2>
            <div className="space-y-2">
              {recentUnlocks.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                  <span className="text-2xl">🎉</span>
                  <div className="flex-1">
                    <p className="font-medium text-green-800">{achievement.name}</p>
                    <p className="text-sm text-green-600">{achievement.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      +{achievement.reward.betPoints} BP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievement System */}
        <AchievementSystem 
          userId={session?.user?.id}
          onAchievementUnlock={handleAchievementUnlock}
        />
      </main>
    </div>
  )
}