import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { matchSimulatorManager } from '@/lib/live-match-simulation'

// Commentary templates for Nordic football
const COMMENTARY_TEMPLATES = {
  GOAL: {
    regular: [
      "MAALI! {player} iskee pallon verkkoon {team}lle!",
      "MÅL! {player} scorer for {team}!",
      "{player} finds the net! {team} takes the lead!",
      "Fantastic finish by {player}! The {venue} erupts!"
    ],
    derby: [
      "DERBY GOAL! {player} silences the away fans!",
      "What a moment in this derby! {player} scores for {team}!",
      "The rivalry intensifies! {player} puts {team} ahead!"
    ],
    late: [
      "LATE DRAMA! {player} scores in the {minute}th minute!",
      "Heartbreak or joy! {player} with a crucial late goal!",
      "Can you believe it? {player} scores with minutes to go!"
    ]
  },
  YELLOW_CARD: {
    regular: [
      "Yellow card for {player} after a reckless challenge",
      "{player} goes into the book for persistent fouling",
      "The referee shows {player} a yellow card"
    ],
    derby: [
      "Tempers flaring! {player} picks up a yellow in this heated derby",
      "The intensity shows as {player} is cautioned"
    ]
  },
  RED_CARD: {
    regular: [
      "RED CARD! {player} is sent off!",
      "Disaster for {team}! {player} sees red!",
      "{team} down to 10 men as {player} is dismissed!"
    ]
  },
  PENALTY: {
    scored: [
      "PENALTY CONVERTED! {player} keeps his cool from the spot!",
      "{player} sends the keeper the wrong way! GOAL!",
      "No mistake from {player}! Clinical penalty!"
    ],
    missed: [
      "MISSED! {player} fails from the penalty spot!",
      "Incredible save! The penalty is saved!",
      "Oh no! {player} hits the post!"
    ]
  },
  SUBSTITUTION: [
    "{playerOut} makes way for {playerIn}",
    "Tactical change: {playerIn} replaces {playerOut}",
    "{playerIn} comes on to freshen up the attack"
  ],
  CORNER: [
    "Corner kick for {team}",
    "{team} win a corner after sustained pressure",
    "Another corner for {team} as they push for a goal"
  ],
  SHOT: {
    onTarget: [
      "{player} forces a good save from the keeper!",
      "What a shot from {player}! The keeper does well to keep it out!",
      "{player} tests the goalkeeper with a powerful strike!"
    ],
    offTarget: [
      "{player} blazes over the bar!",
      "Wide from {player}! That was a good opportunity!",
      "{player} shoots but can't find the target"
    ]
  },
  MATCH_START: [
    "We're underway at {venue}!",
    "The match kicks off! {homeTeam} vs {awayTeam}!",
    "The Nordic battle begins!"
  ],
  HALF_TIME: [
    "Half-time: {homeTeam} {homeScore}-{awayScore} {awayTeam}",
    "The referee blows for half-time. What a first half!",
    "45 minutes played at {venue}"
  ],
  FULL_TIME: [
    "Full-time! {homeTeam} {homeScore}-{awayScore} {awayTeam}",
    "It's all over at {venue}!",
    "The final whistle blows!"
  ],
  MOMENTUM: {
    high: [
      "{team} are dominating possession now!",
      "All the pressure coming from {team}!",
      "{team} looking dangerous with every attack!"
    ],
    low: [
      "{team} struggling to get into the game",
      "{team} need to regroup and find their rhythm",
      "Difficult period for {team} right now"
    ]
  }
}

// GET live commentary for a match
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const matchId = searchParams.get('matchId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const language = searchParams.get('lang') || 'en'
    
    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID required' },
        { status: 400 }
      )
    }
    
    // Get match details
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
        events: {
          orderBy: { minute: 'desc' },
          take: limit
        }
      }
    })
    
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }
    
    // Check if match is live
    const simulator = matchSimulatorManager.getSimulator(matchId)
    let liveState = null
    
    if (simulator) {
      liveState = simulator.getState()
    }
    
    // Generate commentary from events
    const commentary = match.events.map(event => {
      const template = getCommentaryTemplate(event, match.isDerby, language)
      const text = template
        .replace('{player}', event.player || 'Unknown')
        .replace('{team}', event.team === 'HOME' ? match.homeTeam.name : match.awayTeam.name)
        .replace('{homeTeam}', match.homeTeam.name)
        .replace('{awayTeam}', match.awayTeam.name)
        .replace('{venue}', match.homeTeam.city || 'the stadium')
        .replace('{minute}', event.minute.toString())
        .replace('{homeScore}', match.homeScore?.toString() || '0')
        .replace('{awayScore}', match.awayScore?.toString() || '0')
      
      return {
        minute: event.minute,
        type: event.eventType,
        text,
        team: event.team,
        impact: getEventImpact(event.eventType),
        timestamp: event.createdAt
      }
    })
    
    // Add live commentary if match is running
    if (liveState) {
      const recentEvents = liveState.events.slice(-5).map((event: any) => ({
        minute: event.minute,
        type: event.type,
        text: event.description,
        team: event.team,
        impact: event.impact || 'LOW'
      }))
      
      commentary.unshift(...recentEvents)
    }
    
    return NextResponse.json({
      success: true,
      matchId,
      status: match.status,
      minute: liveState?.minute || match.minute,
      score: {
        home: liveState?.homeScore ?? match.homeScore,
        away: liveState?.awayScore ?? match.awayScore
      },
      commentary: commentary.slice(0, limit),
      stats: liveState ? {
        home: liveState.homeStats,
        away: liveState.awayStats
      } : null
    })
    
  } catch (error) {
    console.error('Get commentary error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commentary' },
      { status: 500 }
    )
  }
}

// POST generate AI commentary for an event
export async function POST(request: NextRequest) {
  try {
    const { matchId, eventType, minute, team, player, details } = await request.json()
    
    if (!matchId || !eventType) {
      return NextResponse.json(
        { error: 'Match ID and event type required' },
        { status: 400 }
      )
    }
    
    // Get match details for context
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true
      }
    })
    
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }
    
    // Generate contextual commentary
    const commentary = generateContextualCommentary({
      eventType,
      minute: minute || match.minute || 0,
      team,
      player,
      details,
      match,
      isDerby: match.isDerby,
      score: {
        home: match.homeScore || 0,
        away: match.awayScore || 0
      }
    })
    
    // Save event to database
    const event = await prisma.matchEvent.create({
      data: {
        matchId,
        minute: minute || match.minute || 0,
        eventType,
        team,
        player,
        details: commentary
      }
    })
    
    return NextResponse.json({
      success: true,
      event,
      commentary
    })
    
  } catch (error) {
    console.error('Generate commentary error:', error)
    return NextResponse.json(
      { error: 'Failed to generate commentary' },
      { status: 500 }
    )
  }
}

// Helper functions

function getCommentaryTemplate(event: any, isDerby: boolean, language: string) {
  const templates = COMMENTARY_TEMPLATES[event.eventType as keyof typeof COMMENTARY_TEMPLATES]
  
  if (!templates) {
    return `${event.eventType} at minute ${event.minute}`
  }
  
  // For goals, check if it's a derby or late goal
  if (event.eventType === 'GOAL') {
    if (isDerby && templates.derby) {
      return templates.derby[Math.floor(Math.random() * templates.derby.length)]
    }
    if (event.minute > 80 && templates.late) {
      return templates.late[Math.floor(Math.random() * templates.late.length)]
    }
    return templates.regular[Math.floor(Math.random() * templates.regular.length)]
  }
  
  // For other events with sub-categories
  if (typeof templates === 'object' && !Array.isArray(templates)) {
    const subTemplates = isDerby && templates.derby ? templates.derby : templates.regular
    if (Array.isArray(subTemplates)) {
      return subTemplates[Math.floor(Math.random() * subTemplates.length)]
    }
  }
  
  // For simple event arrays
  if (Array.isArray(templates)) {
    return templates[Math.floor(Math.random() * templates.length)]
  }
  
  return `${event.eventType} at minute ${event.minute}`
}

function getEventImpact(eventType: string): 'HIGH' | 'MEDIUM' | 'LOW' {
  const highImpact = ['GOAL', 'RED_CARD', 'PENALTY']
  const mediumImpact = ['YELLOW_CARD', 'SUBSTITUTION', 'VAR']
  
  if (highImpact.includes(eventType)) return 'HIGH'
  if (mediumImpact.includes(eventType)) return 'MEDIUM'
  return 'LOW'
}

function generateContextualCommentary(params: any) {
  const { eventType, minute, team, player, details, match, isDerby, score } = params
  
  // Build context-aware commentary
  let commentary = ''
  
  // Add time context
  if (minute < 10) {
    commentary += 'Early in the match, '
  } else if (minute > 80) {
    commentary += 'In the dying minutes, '
  } else if (minute === 45 || minute === 90) {
    commentary += 'Right at the whistle, '
  }
  
  // Add score context
  const scoreDiff = team === 'HOME' ? 
    score.home - score.away : 
    score.away - score.home
  
  if (eventType === 'GOAL') {
    if (scoreDiff === 0) {
      commentary += 'an equalizer! '
    } else if (scoreDiff === 1) {
      commentary += 'taking the lead! '
    } else if (scoreDiff > 1) {
      commentary += 'extending their advantage! '
    }
  }
  
  // Add team and player
  const teamName = team === 'HOME' ? match.homeTeam.name : match.awayTeam.name
  commentary += `${player || 'A player'} from ${teamName} `
  
  // Add event description
  switch (eventType) {
    case 'GOAL':
      commentary += isDerby ? 
        'scores a crucial derby goal!' : 
        'finds the back of the net!'
      break
    case 'YELLOW_CARD':
      commentary += 'receives a yellow card for ' + (details || 'a tactical foul')
      break
    case 'RED_CARD':
      commentary += 'is sent off! ' + teamName + ' down to 10 men!'
      break
    case 'SUBSTITUTION':
      commentary += 'is substituted ' + (details || '')
      break
    default:
      commentary += eventType.toLowerCase().replace('_', ' ')
  }
  
  // Add atmosphere for derby matches
  if (isDerby && eventType === 'GOAL') {
    commentary += ` The ${match.homeTeam.city} derby is on fire!`
  }
  
  return commentary
}