import { NextRequest, NextResponse } from 'next/server'
import { liveMatchEngine } from '@/lib/live-match-engine'

// Start the live match engine
export async function POST(request: NextRequest) {
  try {
    // Start the API-Football integration
    await liveMatchEngine.startLiveMatchTracking()
    
    // Also start a few test simulations for demo purposes
    await liveMatchEngine.startTestLiveMatches()
    
    const activeSimulations = liveMatchEngine.getActiveSimulations()
    
    return NextResponse.json({
      success: true,
      message: 'Live match engine started successfully',
      activeSimulations: activeSimulations.length,
      features: [
        'API-Football integration',
        'Real-time odds updates',
        'Cash-out calculations',
        'Diamond rewards (2x for live)',
        'Match event tracking'
      ]
    })
    
  } catch (error) {
    console.error('Error starting live match engine:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to start live match engine',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// Get engine status
export async function GET(request: NextRequest) {
  try {
    const activeSimulations = liveMatchEngine.getActiveSimulations()
    
    return NextResponse.json({
      success: true,
      status: 'running',
      activeSimulations: activeSimulations.length,
      simulationIds: activeSimulations,
      lastCheck: new Date().toISOString(),
      features: {
        apiFootballIntegration: true,
        realTimeOdds: true,
        cashOutSystem: true,
        diamondRewards: '2x multiplier for live betting',
        liveMarkets: ['match_result', 'next_goal', 'next_corner', 'next_card', 'total_goals']
      }
    })
    
  } catch (error) {
    console.error('Error getting engine status:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get engine status' 
      },
      { status: 500 }
    )
  }
}