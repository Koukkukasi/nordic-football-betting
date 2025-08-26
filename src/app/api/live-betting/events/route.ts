import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { apiFootball } from '@/lib/api-football'

const prisma = new PrismaClient()

// Cache for match events to avoid excessive API calls
let eventsCache = new Map<string, { events: any[], lastFetch: number }>()
const EVENTS_CACHE_DURATION = 15000 // 15 seconds

// GET /api/live-betting/events - Get real-time match events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')
    const externalId = searchParams.get('externalId')
    const since = searchParams.get('since') // Timestamp to get events since
    
    if (!matchId && !externalId) {
      return NextResponse.json(
        { success: false, error: 'matchId or externalId required' },
        { status: 400 }
      )
    }

    let match = null
    if (matchId) {
      match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          homeTeam: true,
          awayTeam: true,
          events: {
            orderBy: { minute: 'desc' },
            take: 20
          }
        }
      })
    } else if (externalId) {
      match = await prisma.match.findUnique({
        where: { externalId },
        include: {
          homeTeam: true,
          awayTeam: true,
          events: {
            orderBy: { minute: 'desc' },
            take: 20
          }
        }
      })
    }

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      )
    }

    // Get fresh events from API-Football if available
    let apiEvents = []
    if (match.externalId) {
      const cacheKey = match.externalId
      const now = Date.now()
      const cached = eventsCache.get(cacheKey)

      if (cached && (now - cached.lastFetch) < EVENTS_CACHE_DURATION) {
        apiEvents = cached.events
        console.log(`📋 Using cached events for match ${match.externalId}`)
      } else {
        try {
          apiEvents = await apiFootball.getFixtureEvents(parseInt(match.externalId))
          eventsCache.set(cacheKey, { events: apiEvents, lastFetch: now })
          console.log(`🔄 Fetched ${apiEvents.length} events for match ${match.externalId}`)
        } catch (apiError) {
          console.error('API-Football events error:', apiError)
          apiEvents = cached?.events || []
        }
      }
    }

    // Process and enhance events
    const processedEvents = await processMatchEvents(match, apiEvents)

    // Filter events since timestamp if provided
    let filteredEvents = processedEvents
    if (since) {
      const sinceTime = new Date(since)
      filteredEvents = processedEvents.filter(event => 
        new Date(event.timestamp) > sinceTime
      )
    }

    // Calculate match statistics
    const matchStats = calculateMatchStats(processedEvents, match)

    return NextResponse.json({
      success: true,
      match: {
        id: match.id,
        externalId: match.externalId,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        status: match.status,
        minute: match.minute,
        homeScore: match.homeScore,
        awayScore: match.awayScore
      },
      events: filteredEvents,
      stats: matchStats,
      lastUpdate: new Date().toISOString(),
      hasMoreEvents: processedEvents.length > 20
    })

  } catch (error) {
    console.error('Error fetching live events:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live events' },
      { status: 500 }
    )
  }
}

// Process and enhance match events from multiple sources
async function processMatchEvents(match: any, apiEvents: any[]) {
  const events = []

  // Add database events
  for (const dbEvent of match.events) {
    events.push({
      id: dbEvent.id,
      minute: dbEvent.minute,
      type: dbEvent.eventType.toLowerCase(),
      team: dbEvent.team?.toLowerCase() || 'unknown',
      teamName: dbEvent.team === 'HOME' ? match.homeTeam.name : 
                dbEvent.team === 'AWAY' ? match.awayTeam.name : 'Unknown',
      player: dbEvent.player || extractPlayerFromDetails(dbEvent.details),
      description: formatEventDescription(dbEvent),
      source: 'database',
      timestamp: dbEvent.createdAt.toISOString(),
      details: dbEvent.details
    })
  }

  // Add API events (these are more detailed)
  for (const apiEvent of apiEvents) {
    const existingEvent = events.find(e => 
      e.minute === apiEvent.time?.elapsed && 
      e.type === apiEvent.type?.toLowerCase()
    )

    if (!existingEvent) {
      // Create event in database for persistence
      try {
        const dbEvent = await prisma.matchEvent.create({
          data: {
            matchId: match.id,
            minute: apiEvent.time?.elapsed || 0,
            eventType: mapApiEventType(apiEvent.type) as any,
            team: apiEvent.team?.name === match.homeTeam.name ? 'HOME' : 'AWAY',
            player: apiEvent.player?.name,
            details: {
              apiEvent: apiEvent,
              assist: apiEvent.assist?.name,
              comments: apiEvent.comments
            }
          }
        })

        events.push({
          id: dbEvent.id,
          minute: apiEvent.time?.elapsed || 0,
          type: apiEvent.type?.toLowerCase() || 'unknown',
          team: apiEvent.team?.name === match.homeTeam.name ? 'home' : 'away',
          teamName: apiEvent.team?.name || 'Unknown',
          player: apiEvent.player?.name,
          assist: apiEvent.assist?.name,
          description: formatApiEventDescription(apiEvent, match),
          source: 'api',
          timestamp: new Date().toISOString(),
          details: apiEvent
        })
      } catch (error) {
        console.error('Error creating event in database:', error)
        // Still add to response even if DB creation fails
        events.push({
          id: `api-${apiEvent.time?.elapsed}-${apiEvent.type}`,
          minute: apiEvent.time?.elapsed || 0,
          type: apiEvent.type?.toLowerCase() || 'unknown',
          team: apiEvent.team?.name === match.homeTeam.name ? 'home' : 'away',
          teamName: apiEvent.team?.name || 'Unknown',
          player: apiEvent.player?.name,
          assist: apiEvent.assist?.name,
          description: formatApiEventDescription(apiEvent, match),
          source: 'api',
          timestamp: new Date().toISOString(),
          details: apiEvent
        })
      }
    }
  }

  // Sort by minute (most recent first)
  return events.sort((a, b) => b.minute - a.minute)
}

// Map API event types to our database enum
function mapApiEventType(apiType: string): string {
  const typeMap: Record<string, string> = {
    'Goal': 'GOAL',
    'Own Goal': 'OWN_GOAL',
    'Penalty': 'PENALTY',
    'Yellow Card': 'YELLOW_CARD',
    'Red Card': 'RED_CARD',
    'Substitution': 'SUBSTITUTION',
    'VAR': 'VAR_DECISION',
    'Half Time': 'HALF_TIME',
    'Full Time': 'FULL_TIME'
  }
  
  return typeMap[apiType] || 'GOAL'
}

// Format event descriptions for display
function formatEventDescription(dbEvent: any): string {
  const type = dbEvent.eventType
  const player = dbEvent.player || 'Unknown Player'
  
  switch (type) {
    case 'GOAL':
      return `⚽ Goal by ${player}`
    case 'OWN_GOAL':
      return `⚽ Own goal by ${player}`
    case 'PENALTY':
      return `🥅 Penalty goal by ${player}`
    case 'YELLOW_CARD':
      return `🟨 Yellow card for ${player}`
    case 'RED_CARD':
      return `🟥 Red card for ${player}`
    case 'SUBSTITUTION':
      return `🔄 Substitution: ${player}`
    case 'VAR_DECISION':
      return `📺 VAR decision`
    case 'HALF_TIME':
      return `⏰ Half time`
    case 'FULL_TIME':
      return `🏁 Full time`
    default:
      return `Event: ${type}`
  }
}

function formatApiEventDescription(apiEvent: any, match: any): string {
  const type = apiEvent.type
  const player = apiEvent.player?.name || 'Unknown'
  const team = apiEvent.team?.name
  
  switch (type) {
    case 'Goal':
      const assist = apiEvent.assist?.name ? ` (assist: ${apiEvent.assist.name})` : ''
      return `⚽ Goal by ${player}${assist}`
    case 'Own Goal':
      return `⚽ Own goal by ${player}`
    case 'Penalty':
      return `🥅 Penalty goal by ${player}`
    case 'Yellow Card':
      return `🟨 Yellow card for ${player}`
    case 'Red Card':
      return `🟥 Red card for ${player}`
    case 'Substitution':
      const playerOut = apiEvent.player?.name
      const playerIn = apiEvent.assist?.name
      return `🔄 ${playerOut} substituted for ${playerIn}`
    case 'VAR':
      return `📺 VAR decision: ${apiEvent.comments || 'Under review'}`
    default:
      return `${type}: ${player} (${team})`
  }
}

function extractPlayerFromDetails(details: any): string | null {
  if (!details) return null
  if (typeof details === 'string') return details
  if (details.scorer) return details.scorer
  if (details.player) return details.player
  return null
}

// Calculate match statistics for live display
function calculateMatchStats(events: any[], match: any) {
  const stats = {
    goals: { home: 0, away: 0 },
    corners: { home: 0, away: 0 },
    cards: { 
      home: { yellow: 0, red: 0 }, 
      away: { yellow: 0, red: 0 } 
    },
    substitutions: { home: 0, away: 0 },
    lastGoalMinute: null as number | null,
    timeWithoutGoal: 0,
    isHighScoringGame: false,
    tempo: 'normal' as 'slow' | 'normal' | 'fast'
  }

  let goalMinutes: number[] = []

  for (const event of events) {
    const isHome = event.team === 'home'
    
    switch (event.type) {
      case 'goal':
      case 'penalty':
        if (isHome) stats.goals.home++
        else stats.goals.away++
        goalMinutes.push(event.minute)
        stats.lastGoalMinute = Math.max(stats.lastGoalMinute || 0, event.minute)
        break
        
      case 'corner':
        // Note: We don't track corners in events yet, but we can estimate
        break
        
      case 'yellow_card':
        if (isHome) stats.cards.home.yellow++
        else stats.cards.away.yellow++
        break
        
      case 'red_card':
        if (isHome) stats.cards.home.red++
        else stats.cards.away.red++
        break
        
      case 'substitution':
        if (isHome) stats.substitutions.home++
        else stats.substitutions.away++
        break
    }
  }

  // Calculate derived stats
  const totalGoals = stats.goals.home + stats.goals.away
  stats.isHighScoringGame = totalGoals > 2
  
  if (stats.lastGoalMinute) {
    stats.timeWithoutGoal = (match.minute || 0) - stats.lastGoalMinute
  }

  // Calculate tempo based on events frequency
  const eventsPerMinute = events.length / Math.max(match.minute || 1, 1)
  if (eventsPerMinute > 0.3) stats.tempo = 'fast'
  else if (eventsPerMinute < 0.1) stats.tempo = 'slow'

  return stats
}

// POST /api/live-betting/events - Create manual event (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { matchId, minute, eventType, team, player, details } = body

    if (!matchId || !minute || !eventType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify match exists and is live
    const match = await prisma.match.findUnique({
      where: { id: matchId }
    })

    if (!match || match.status !== 'LIVE') {
      return NextResponse.json(
        { success: false, error: 'Match not found or not live' },
        { status: 404 }
      )
    }

    // Create the event
    const event = await prisma.matchEvent.create({
      data: {
        matchId,
        minute,
        eventType: eventType.toUpperCase(),
        team: team?.toUpperCase(),
        player,
        details: details || {}
      }
    })

    // Update match score if it's a goal
    if (eventType.toUpperCase() === 'GOAL') {
      const isHome = team?.toUpperCase() === 'HOME'
      await prisma.match.update({
        where: { id: matchId },
        data: {
          homeScore: isHome ? (match.homeScore || 0) + 1 : match.homeScore,
          awayScore: !isHome ? (match.awayScore || 0) + 1 : match.awayScore
        }
      })
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        minute: event.minute,
        type: event.eventType.toLowerCase(),
        team: event.team?.toLowerCase(),
        player: event.player,
        description: formatEventDescription(event),
        timestamp: event.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error creating manual event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    )
  }
}