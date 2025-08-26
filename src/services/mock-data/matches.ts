// Mock match data generator
// Used when API key is not available or as fallback

import { Match } from '@/components/matches/ExpandedMatchList'
import { PREMIER_LEAGUE, PREMIER_LEAGUE_DERBIES } from '@/data/leagues/premier-league'
import { CHAMPIONSHIP, CHAMPIONSHIP_DERBIES } from '@/data/leagues/championship'

// Generate mock matches for demonstration
export function generateMockMatches(): Match[] {
  const matches: Match[] = []
  const now = new Date()
  
  // Premier League matches
  const premierTeams = PREMIER_LEAGUE.teams
  for (let i = 0; i < 5; i++) {
    const homeTeam = premierTeams[i * 2]
    const awayTeam = premierTeams[i * 2 + 1]
    
    // Check if it's a derby
    const derby = PREMIER_LEAGUE_DERBIES.find(d => 
      d.teams.includes(homeTeam.id) && d.teams.includes(awayTeam.id)
    )
    
    matches.push({
      id: `pl-${i}`,
      league: 'premier-league',
      leagueName: 'Premier League',
      homeTeam: homeTeam.name,
      awayTeam: awayTeam.name,
      homeTeamShort: homeTeam.shortName,
      awayTeamShort: awayTeam.shortName,
      date: new Date(now.getTime() + i * 3600000),
      odds: {
        home: 1.80 + Math.random(),
        draw: 3.20 + Math.random() * 0.5,
        away: 3.50 + Math.random() * 2
      },
      isDerby: !!derby,
      derbyName: derby?.name,
      isLive: i === 0,
      minute: i === 0 ? 34 : undefined,
      score: i === 0 ? { home: 1, away: 0 } : undefined
    })
  }
  
  // Championship matches
  const championshipTeams = CHAMPIONSHIP.teams
  for (let i = 0; i < 6; i++) {
    const homeTeam = championshipTeams[i * 2]
    const awayTeam = championshipTeams[i * 2 + 1]
    
    const derby = CHAMPIONSHIP_DERBIES.find(d => 
      d.teams.includes(homeTeam.id) && d.teams.includes(awayTeam.id)
    )
    
    matches.push({
      id: `ch-${i}`,
      league: 'championship',
      leagueName: 'Championship',
      homeTeam: homeTeam.name,
      awayTeam: awayTeam.name,
      homeTeamShort: homeTeam.shortName,
      awayTeamShort: awayTeam.shortName,
      date: new Date(now.getTime() + (i + 2) * 3600000),
      odds: {
        home: 2.10 + Math.random(),
        draw: 3.30 + Math.random() * 0.3,
        away: 3.00 + Math.random()
      },
      isDerby: !!derby,
      derbyName: derby?.name,
      isLive: i === 1,
      minute: i === 1 ? 67 : undefined,
      score: i === 1 ? { home: 2, away: 2 } : undefined
    })
  }
  
  // Nordic matches
  const nordicMatches: Match[] = [
    {
      id: 'nordic-1',
      league: 'veikkausliiga',
      leagueName: 'Veikkausliiga',
      homeTeam: 'HJK Helsinki',
      awayTeam: 'FC Inter Turku',
      homeTeamShort: 'HJK',
      awayTeamShort: 'INT',
      date: new Date(now.getTime() + 5400000),
      odds: { home: 1.65, draw: 3.60, away: 4.50 }
    },
    {
      id: 'nordic-2',
      league: 'allsvenskan',
      leagueName: 'Allsvenskan',
      homeTeam: 'AIK Stockholm',
      awayTeam: 'Malmö FF',
      homeTeamShort: 'AIK',
      awayTeamShort: 'MFF',
      date: new Date(now.getTime() + 7200000),
      odds: { home: 2.80, draw: 3.20, away: 2.40 }
    },
    {
      id: 'nordic-3',
      league: 'veikkausliiga',
      leagueName: 'Veikkausliiga',
      homeTeam: 'KuPS Kuopio',
      awayTeam: 'FC Haka',
      homeTeamShort: 'KuPS',
      awayTeamShort: 'HAK',
      date: new Date(now.getTime() + 9000000),
      odds: { home: 1.90, draw: 3.40, away: 3.80 },
      isLive: true,
      minute: 23,
      score: { home: 0, away: 0 }
    },
    {
      id: 'nordic-4',
      league: 'allsvenskan',
      leagueName: 'Allsvenskan',
      homeTeam: 'Djurgården',
      awayTeam: 'IFK Göteborg',
      homeTeamShort: 'DIF',
      awayTeamShort: 'IFK',
      date: new Date(now.getTime() + 10800000),
      odds: { home: 2.20, draw: 3.30, away: 3.10 }
    },
    {
      id: 'nordic-5',
      league: 'superettan',
      leagueName: 'Superettan',
      homeTeam: 'Helsingborg',
      awayTeam: 'Öster',
      homeTeamShort: 'HBG',
      awayTeamShort: 'ÖST',
      date: new Date(now.getTime() + 12600000),
      odds: { home: 2.50, draw: 3.20, away: 2.70 }
    },
    {
      id: 'nordic-6',
      league: 'ykkonen',
      leagueName: 'Ykkönen',
      homeTeam: 'AC Oulu',
      awayTeam: 'SJK Akatemia',
      homeTeamShort: 'ACO',
      awayTeamShort: 'SJK',
      date: new Date(now.getTime() + 14400000),
      odds: { home: 2.00, draw: 3.40, away: 3.40 }
    }
  ]
  
  return [...matches, ...nordicMatches]
}

// Generate mock standings
export function generateMockStandings(leagueId: string): any[] {
  // This would return mock standings data
  // For now, return empty array
  return []
}

// Generate mock top scorers
export function generateMockTopScorers(leagueId: string): any[] {
  // This would return mock top scorers data
  // For now, return empty array
  return []
}