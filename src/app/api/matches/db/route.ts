import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { matchSync } from '@/lib/match-sync'

// GET matches from database with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'upcoming'
    const leagueId = searchParams.get('leagueId')
    const teamId = searchParams.get('teamId')
    const featured = searchParams.get('featured') === 'true'
    const derby = searchParams.get('derby') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Build where clause
    const where: any = {}
    
    // Status filter
    if (status === 'upcoming') {
      where.status = 'SCHEDULED'
      where.startTime = { gte: new Date() }
    } else if (status === 'live') {
      where.status = 'LIVE'
    } else if (status === 'finished') {
      where.status = 'FINISHED'
    } else if (status === 'today') {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)
      where.startTime = {
        gte: todayStart,
        lte: todayEnd
      }
    }
    
    // League filter
    if (leagueId) {
      where.leagueId = leagueId
    }
    
    // Team filter
    if (teamId) {
      where.OR = [
        { homeTeamId: teamId },
        { awayTeamId: teamId }
      ]
    }
    
    // Featured matches
    if (featured) {
      where.isFeatured = true
    }
    
    // Derby matches
    if (derby) {
      where.isDerby = true
    }
    
    // Fetch matches with relations
    const matches = await prisma.match.findMany({
      where,
      include: {
        league: true,
        homeTeam: true,
        awayTeam: true,
        odds: {
          where: { market: 'MATCH_RESULT' }
        },
        events: {
          orderBy: { minute: 'desc' },
          take: 5
        },
        _count: {
          select: {
            selections: true,
            liveBets: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // Live first, then scheduled
        { startTime: 'asc' }
      ],
      skip: offset,
      take: limit
    })
    
    // Get total count for pagination
    const total = await prisma.match.count({ where })
    
    // Format response
    const formattedMatches = matches.map(match => ({
      id: match.id,
      externalId: match.externalId,
      startTime: match.startTime,
      status: match.status,
      minute: match.minute,
      isDerby: match.isDerby,
      isFeatured: match.isFeatured,
      league: {
        id: match.league.id,
        name: match.league.name,
        country: match.league.country,
        tier: match.league.tier,
        logoUrl: match.league.logoUrl
      },
      homeTeam: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        shortName: match.homeTeam.shortName,
        city: match.homeTeam.city,
        logoUrl: match.homeTeam.logoUrl
      },
      awayTeam: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        shortName: match.awayTeam.shortName,
        city: match.awayTeam.city,
        logoUrl: match.awayTeam.logoUrl
      },
      score: match.homeScore !== null ? {
        home: match.homeScore,
        away: match.awayScore
      } : null,
      odds: match.odds[0] ? {
        homeWin: match.odds[0].homeWin,
        draw: match.odds[0].draw,
        awayWin: match.odds[0].awayWin,
        over25: match.odds[0].over25,
        under25: match.odds[0].under25,
        bttsYes: match.odds[0].bttsYes,
        bttsNo: match.odds[0].bttsNo,
        enhancedHomeWin: match.odds[0].enhancedHomeWin,
        enhancedDraw: match.odds[0].enhancedDraw,
        enhancedAwayWin: match.odds[0].enhancedAwayWin
      } : null,
      recentEvents: match.events.map(event => ({
        minute: event.minute,
        type: event.eventType,
        team: event.team,
        player: event.player
      })),
      stats: {
        totalBets: match._count.selections,
        liveBets: match._count.liveBets
      }
    }))
    
    return NextResponse.json({
      success: true,
      matches: formattedMatches,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
    
  } catch (error) {
    console.error('Get matches error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}

// POST - Sync matches from API-Football (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    const user = session?.user?.email ? await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    }) : null
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }
    
    // Sync matches from API-Football
    const result = await matchSync.syncMatches()
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to sync matches', details: result.error },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${result.count} matches`,
      count: result.count
    })
    
  } catch (error) {
    console.error('Sync matches error:', error)
    return NextResponse.json(
      { error: 'Failed to sync matches' },
      { status: 500 }
    )
  }
}

// PUT - Update match (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    const user = session?.user?.email ? await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    }) : null
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }
    
    const { matchId, ...updateData } = await request.json()
    
    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID required' },
        { status: 400 }
      )
    }
    
    // Update match
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: updateData,
      include: {
        league: true,
        homeTeam: true,
        awayTeam: true,
        odds: true
      }
    })
    
    return NextResponse.json({
      success: true,
      match: updatedMatch
    })
    
  } catch (error) {
    console.error('Update match error:', error)
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    )
  }
}