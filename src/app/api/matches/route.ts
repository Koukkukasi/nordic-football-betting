import { NextRequest, NextResponse } from 'next/server'
import { apiFootball } from '@/lib/api-football'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'upcoming'
    const days = parseInt(searchParams.get('days') || '7')
    
    let matches = []
    
    if (type === 'live') {
      // Get live matches
      const liveMatches = await apiFootball.getLiveMatches()
      matches = await Promise.all(
        liveMatches.map(async (match) => {
          const odds = await apiFootball.getOdds(match.fixture.id)
          return apiFootball.convertToMatchFormat(match, odds || undefined)
        })
      )
    } else {
      // Get upcoming matches
      const upcomingMatches = await apiFootball.getUpcomingMatches(days)
      matches = await Promise.all(
        upcomingMatches.map(async (match) => {
          const odds = await apiFootball.getOdds(match.fixture.id)
          return apiFootball.convertToMatchFormat(match, odds || undefined)
        })
      )
    }
    
    return NextResponse.json({
      success: true,
      matches,
      count: matches.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch matches',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get single match details
export async function POST(request: NextRequest) {
  try {
    const { fixtureId } = await request.json()
    
    if (!fixtureId) {
      return NextResponse.json(
        { success: false, error: 'Fixture ID required' },
        { status: 400 }
      )
    }
    
    // Get match events
    const events = await apiFootball.getFixtureEvents(fixtureId)
    
    return NextResponse.json({
      success: true,
      events,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching match details:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch match details'
      },
      { status: 500 }
    )
  }
}