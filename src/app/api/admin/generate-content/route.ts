import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

const NORDIC_TEAMS = [
  // Finnish Veikkausliiga
  { name: 'HJK Helsinki', city: 'Helsinki', country: 'Finland', league: 'Veikkausliiga' },
  { name: 'KuPS Kuopio', city: 'Kuopio', country: 'Finland', league: 'Veikkausliiga' },
  { name: 'FC Inter Turku', city: 'Turku', country: 'Finland', league: 'Veikkausliiga' },
  { name: 'IFK Mariehamn', city: 'Mariehamn', country: 'Finland', league: 'Veikkausliiga' },
  { name: 'HIFK Helsinki', city: 'Helsinki', country: 'Finland', league: 'Veikkausliiga' },
  { name: 'SJK Seinäjoki', city: 'Seinäjoki', country: 'Finland', league: 'Veikkausliiga' },
  { name: 'FC Haka', city: 'Valkeakoski', country: 'Finland', league: 'Veikkausliiga' },
  { name: 'FC Honka', city: 'Espoo', country: 'Finland', league: 'Veikkausliiga' },
  { name: 'Ilves Tampere', city: 'Tampere', country: 'Finland', league: 'Veikkausliiga' },
  { name: 'VPS Vaasa', city: 'Vaasa', country: 'Finland', league: 'Veikkausliiga' },
  { name: 'AC Oulu', city: 'Oulu', country: 'Finland', league: 'Veikkausliiga' },
  { name: 'FC Lahti', city: 'Lahti', country: 'Finland', league: 'Veikkausliiga' },

  // Finnish Ykkösliiga
  { name: 'FC Jazz', city: 'Pori', country: 'Finland', league: 'Ykkösliiga' },
  { name: 'FF Jaro', city: 'Jakobstad', country: 'Finland', league: 'Ykkösliiga' },
  { name: 'KTP Kotka', city: 'Kotka', country: 'Finland', league: 'Ykkösliiga' },
  { name: 'MP Mikkeli', city: 'Mikkeli', country: 'Finland', league: 'Ykkösliiga' },
  { name: 'PK-35 Vantaa', city: 'Vantaa', country: 'Finland', league: 'Ykkösliiga' },
  { name: 'RoPS Rovaniemi', city: 'Rovaniemi', country: 'Finland', league: 'Ykkösliiga' },
  { name: 'TPS Turku', city: 'Turku', country: 'Finland', league: 'Ykkösliiga' },
  { name: 'TPV Tampere', city: 'Tampere', country: 'Finland', league: 'Ykkösliiga' },
  { name: 'KuFu-98', city: 'Kuopio', country: 'Finland', league: 'Ykkösliiga' },
  { name: 'GrIFK Gransholmen', city: 'Helsinki', country: 'Finland', league: 'Ykkösliiga' },

  // Swedish Allsvenskan
  { name: 'Malmö FF', city: 'Malmö', country: 'Sweden', league: 'Allsvenskan' },
  { name: 'AIK Stockholm', city: 'Stockholm', country: 'Sweden', league: 'Allsvenskan' },
  { name: 'Djurgården Stockholm', city: 'Stockholm', country: 'Sweden', league: 'Allsvenskan' },
  { name: 'Hammarby Stockholm', city: 'Stockholm', country: 'Sweden', league: 'Allsvenskan' },
  { name: 'IFK Göteborg', city: 'Göteborg', country: 'Sweden', league: 'Allsvenskan' },
  { name: 'BK Häcken', city: 'Göteborg', country: 'Sweden', league: 'Allsvenskan' },
  { name: 'IF Elfsborg', city: 'Borås', country: 'Sweden', league: 'Allsvenskan' },
  { name: 'IFK Norrköping', city: 'Norrköping', country: 'Sweden', league: 'Allsvenskan' },
  { name: 'Kalmar FF', city: 'Kalmar', country: 'Sweden', league: 'Allsvenskan' },
  { name: 'Mjällby AIF', city: 'Hällevik', country: 'Sweden', league: 'Allsvenskan' },
  { name: 'Sirius IK', city: 'Uppsala', country: 'Sweden', league: 'Allsvenskan' },
  { name: 'Västerås SK', city: 'Västerås', country: 'Sweden', league: 'Allsvenskan' },
  { name: 'GAIS Göteborg', city: 'Göteborg', country: 'Sweden', league: 'Allsvenskan' },
  { name: 'IFK Värnamo', city: 'Värnamo', country: 'Sweden', league: 'Allsvenskan' },
  { name: 'Brommapojkarna', city: 'Stockholm', country: 'Sweden', league: 'Allsvenskan' },
  { name: 'Halmstads BK', city: 'Halmstad', country: 'Sweden', league: 'Allsvenskan' },

  // Swedish Superettan
  { name: 'Örebro SK', city: 'Örebro', country: 'Sweden', league: 'Superettan' },
  { name: 'Gefle IF', city: 'Gävle', country: 'Sweden', league: 'Superettan' },
  { name: 'Helsingborgs IF', city: 'Helsingborg', country: 'Sweden', league: 'Superettan' },
  { name: 'Landskrona BoIS', city: 'Landskrona', country: 'Sweden', league: 'Superettan' },
  { name: 'Östers IF', city: 'Växjö', country: 'Sweden', league: 'Superettan' },
  { name: 'Sandvikens IF', city: 'Sandviken', country: 'Sweden', league: 'Superettan' },
  { name: 'Trelleborgs FF', city: 'Trelleborg', country: 'Sweden', league: 'Superettan' },
  { name: 'Utsiktens BK', city: 'Göteborg', country: 'Sweden', league: 'Superettan' },
  { name: 'Varbergs BoIS', city: 'Varberg', country: 'Sweden', league: 'Superettan' },
  { name: 'Åtvidabergs FF', city: 'Åtvidaberg', country: 'Sweden', league: 'Superettan' },
  { name: 'Degerfors IF', city: 'Degerfors', country: 'Sweden', league: 'Superettan' },
  { name: 'Falkenbergs FF', city: 'Falkenberg', country: 'Sweden', league: 'Superettan' },
  { name: 'IK Brage', city: 'Borlänge', country: 'Sweden', league: 'Superettan' },
  { name: 'Skövde AIK', city: 'Skövde', country: 'Sweden', league: 'Superettan' },
  { name: 'Örgryte IS', city: 'Göteborg', country: 'Sweden', league: 'Superettan' },
  { name: 'GIF Sundsvall', city: 'Sundsvall', country: 'Sweden', league: 'Superettan' }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    // Simple password check (in production, use proper authentication)
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Invalid admin password' }, { status: 401 })
    }

    const supabase = createClient()

    // Get league IDs
    const { data: leagues, error: leagueError } = await supabase
      .from('leagues')
      .select('id, name')

    if (leagueError) {
      console.error('Error fetching leagues:', leagueError)
      return NextResponse.json({ success: false, error: 'Failed to fetch leagues' }, { status: 500 })
    }

    const leagueMap = (leagues as Array<{ id: string; name: string }>)?.reduce((acc: Record<string, string>, league: { id: string; name: string }) => {
      acc[league.name] = league.id
      return acc
    }, {}) || {}

    // Create teams
    let teamsCreated = 0
    for (const team of NORDIC_TEAMS) {
      const leagueId = leagueMap[team.league]
      if (!leagueId) {
        console.warn(`League not found: ${team.league}`)
        continue
      }

      const result = await supabase
        .from('teams')
        .insert({
          name: team.name,
          city: team.city,
          country: team.country,
          league_id: leagueId
        })
        .select() as any
      
      const teamError = result.error

      if (teamError) {
        console.error(`Error creating team ${team.name}:`, teamError)
      } else {
        teamsCreated++
      }
    }

    // Create a sample live match for testing
    const result2 = await (supabase
      .from('teams')
      .select('id, name') as any)
      .limit(2)
    
    const teams = result2.data
    const teamsError = result2.error

    if (!teamsError && teams && teams.length >= 2) {
      const result3 = await supabase
        .from('matches')
        .insert({
          league_id: leagueMap['Veikkausliiga'],
          home_team_id: teams[0].id,
          away_team_id: teams[1].id,
          start_time: new Date(Date.now() - 78 * 60 * 1000).toISOString(),
          status: 'live',
          home_score: 2,
          away_score: 1,
          minute: 78,
          is_live: true,
          is_derby: false
        })
        .select() as any

      const matchError = result3.error

      if (matchError) {
        console.error('Error creating sample match:', matchError)
      }
    }

    return NextResponse.json({
      success: true,
      teamsCreated,
      message: `Successfully created ${teamsCreated} Nordic teams and sample match`
    })

  } catch (error) {
    console.error('Error in generate-content:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}