import MiniGamesHub from '@/components/mini-games/MiniGamesHub'
import PlayerNavigation from '@/components/layout/PlayerNavigation'

export default function MiniGamesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <PlayerNavigation />
      
      <main className="container-modern py-8">
        <MiniGamesHub />
      </main>
    </div>
  )
}