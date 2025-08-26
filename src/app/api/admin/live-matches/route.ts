import { NextRequest, NextResponse } from 'next/server'
import { liveMatchEngine } from '@/lib/live-match-engine'

export async function POST(request: NextRequest) {
  try {
    const { action, password, matchId } = await request.json()
    
    // Simple admin protection
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let result
    switch (action) {
      case 'start_test_matches':
        const startedCount = await liveMatchEngine.startTestLiveMatches()
        result = {
          success: true,
          message: `Started ${startedCount} live match simulations`,
          startedMatches: startedCount
        }
        break

      case 'start_specific_match':
        if (!matchId) {
          return NextResponse.json({ error: 'Match ID required' }, { status: 400 })
        }
        const success = await liveMatchEngine.startMatchSimulation(matchId)
        result = {
          success,
          message: success ? 'Match simulation started' : 'Failed to start match simulation',
          matchId
        }
        break

      case 'stop_all':
        liveMatchEngine.stopAllSimulations()
        result = {
          success: true,
          message: 'All simulations stopped'
        }
        break

      case 'status':
        const activeMatches = liveMatchEngine.getActiveSimulations()
        result = {
          success: true,
          activeSimulations: activeMatches.length,
          matchIds: activeMatches
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Live match control error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET() {
  const activeMatches = liveMatchEngine.getActiveSimulations()
  return NextResponse.json({
    status: 'Live Match Engine Ready',
    activeSimulations: activeMatches.length,
    matchIds: activeMatches,
    timestamp: new Date().toISOString()
  })
}