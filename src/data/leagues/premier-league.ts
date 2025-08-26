// Premier League Data Structure
// 2024/25 Season

export interface Team {
  id: string
  name: string
  shortName: string
  stadium: string
  capacity: number
  city: string
  founded: number
  colors: string[]
  logo?: string
}

export interface League {
  id: string
  name: string
  country: string
  flag: string
  tier: number
  teams: Team[]
  matchesPerSeason: number
  xpMultiplier: number
  diamondMultiplier: number
}

export const PREMIER_LEAGUE: League = {
  id: 'premier-league',
  name: 'Premier League',
  country: 'England',
  flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  tier: 1,
  matchesPerSeason: 380,
  xpMultiplier: 1.5,
  diamondMultiplier: 1.5,
  teams: [
    {
      id: 'arsenal',
      name: 'Arsenal',
      shortName: 'ARS',
      stadium: 'Emirates Stadium',
      capacity: 60704,
      city: 'London',
      founded: 1886,
      colors: ['#EF0107', '#FFFFFF']
    },
    {
      id: 'aston-villa',
      name: 'Aston Villa',
      shortName: 'AVL',
      stadium: 'Villa Park',
      capacity: 42682,
      city: 'Birmingham',
      founded: 1874,
      colors: ['#95BFE5', '#670E36']
    },
    {
      id: 'bournemouth',
      name: 'AFC Bournemouth',
      shortName: 'BOU',
      stadium: 'Vitality Stadium',
      capacity: 11307,
      city: 'Bournemouth',
      founded: 1899,
      colors: ['#DA291C', '#000000']
    },
    {
      id: 'brentford',
      name: 'Brentford',
      shortName: 'BRE',
      stadium: 'Brentford Community Stadium',
      capacity: 17250,
      city: 'London',
      founded: 1889,
      colors: ['#FF0000', '#FFFFFF']
    },
    {
      id: 'brighton',
      name: 'Brighton & Hove Albion',
      shortName: 'BHA',
      stadium: 'American Express Stadium',
      capacity: 31876,
      city: 'Brighton',
      founded: 1901,
      colors: ['#0057B8', '#FFFFFF']
    },
    {
      id: 'chelsea',
      name: 'Chelsea',
      shortName: 'CHE',
      stadium: 'Stamford Bridge',
      capacity: 40343,
      city: 'London',
      founded: 1905,
      colors: ['#034694', '#FFFFFF']
    },
    {
      id: 'crystal-palace',
      name: 'Crystal Palace',
      shortName: 'CRY',
      stadium: 'Selhurst Park',
      capacity: 25486,
      city: 'London',
      founded: 1905,
      colors: ['#1B458F', '#C4122E']
    },
    {
      id: 'everton',
      name: 'Everton',
      shortName: 'EVE',
      stadium: 'Goodison Park',
      capacity: 39414,
      city: 'Liverpool',
      founded: 1878,
      colors: ['#003399', '#FFFFFF']
    },
    {
      id: 'fulham',
      name: 'Fulham',
      shortName: 'FUL',
      stadium: 'Craven Cottage',
      capacity: 24500,
      city: 'London',
      founded: 1879,
      colors: ['#FFFFFF', '#000000']
    },
    {
      id: 'ipswich',
      name: 'Ipswich Town',
      shortName: 'IPS',
      stadium: 'Portman Road',
      capacity: 30311,
      city: 'Ipswich',
      founded: 1878,
      colors: ['#0000FF', '#FFFFFF']
    },
    {
      id: 'leicester',
      name: 'Leicester City',
      shortName: 'LEI',
      stadium: 'King Power Stadium',
      capacity: 32261,
      city: 'Leicester',
      founded: 1884,
      colors: ['#003090', '#FDBE11']
    },
    {
      id: 'liverpool',
      name: 'Liverpool',
      shortName: 'LIV',
      stadium: 'Anfield',
      capacity: 61276,
      city: 'Liverpool',
      founded: 1892,
      colors: ['#C8102E', '#FFFFFF']
    },
    {
      id: 'man-city',
      name: 'Manchester City',
      shortName: 'MCI',
      stadium: 'Etihad Stadium',
      capacity: 53400,
      city: 'Manchester',
      founded: 1880,
      colors: ['#6CABDD', '#FFFFFF']
    },
    {
      id: 'man-united',
      name: 'Manchester United',
      shortName: 'MUN',
      stadium: 'Old Trafford',
      capacity: 74310,
      city: 'Manchester',
      founded: 1878,
      colors: ['#DA291C', '#FFFFFF']
    },
    {
      id: 'newcastle',
      name: 'Newcastle United',
      shortName: 'NEW',
      stadium: "St James' Park",
      capacity: 52305,
      city: 'Newcastle',
      founded: 1892,
      colors: ['#241F20', '#FFFFFF']
    },
    {
      id: 'nottm-forest',
      name: 'Nottingham Forest',
      shortName: 'NFO',
      stadium: 'The City Ground',
      capacity: 30332,
      city: 'Nottingham',
      founded: 1865,
      colors: ['#DD0000', '#FFFFFF']
    },
    {
      id: 'southampton',
      name: 'Southampton',
      shortName: 'SOU',
      stadium: "St Mary's Stadium",
      capacity: 32384,
      city: 'Southampton',
      founded: 1885,
      colors: ['#D71920', '#FFFFFF']
    },
    {
      id: 'tottenham',
      name: 'Tottenham Hotspur',
      shortName: 'TOT',
      stadium: 'Tottenham Hotspur Stadium',
      capacity: 62850,
      city: 'London',
      founded: 1882,
      colors: ['#132257', '#FFFFFF']
    },
    {
      id: 'west-ham',
      name: 'West Ham United',
      shortName: 'WHU',
      stadium: 'London Stadium',
      capacity: 62500,
      city: 'London',
      founded: 1895,
      colors: ['#7A263A', '#1BB1E7']
    },
    {
      id: 'wolves',
      name: 'Wolverhampton Wanderers',
      shortName: 'WOL',
      stadium: 'Molineux Stadium',
      capacity: 31750,
      city: 'Wolverhampton',
      founded: 1877,
      colors: ['#FDB913', '#231F20']
    }
  ]
}

// Special Matches
export const PREMIER_LEAGUE_DERBIES = [
  {
    id: 'north-london-derby',
    name: 'North London Derby',
    teams: ['arsenal', 'tottenham'],
    xpMultiplier: 2,
    diamondBonus: 2
  },
  {
    id: 'manchester-derby',
    name: 'Manchester Derby',
    teams: ['man-city', 'man-united'],
    xpMultiplier: 2,
    diamondBonus: 2
  },
  {
    id: 'merseyside-derby',
    name: 'Merseyside Derby',
    teams: ['liverpool', 'everton'],
    xpMultiplier: 2,
    diamondBonus: 2
  },
  {
    id: 'london-derby-chelsea-arsenal',
    name: 'London Derby',
    teams: ['chelsea', 'arsenal'],
    xpMultiplier: 1.5,
    diamondBonus: 1
  },
  {
    id: 'london-derby-chelsea-tottenham',
    name: 'London Derby',
    teams: ['chelsea', 'tottenham'],
    xpMultiplier: 1.5,
    diamondBonus: 1
  }
]

// Top 6 Teams (for special predictions)
export const TOP_6_TEAMS = [
  'arsenal',
  'chelsea',
  'liverpool',
  'man-city',
  'man-united',
  'tottenham'
]

// Match Markets
export const PREMIER_LEAGUE_MARKETS = {
  basic: ['1X2', 'OVER_UNDER_2_5', 'BTTS'],
  advanced: ['CORRECT_SCORE', 'FIRST_SCORER', 'HALF_TIME_RESULT'],
  live: ['NEXT_GOAL', 'NEXT_CORNER', 'NEXT_CARD'],
  special: ['TOP_4_FINISH', 'RELEGATION', 'TOP_SCORER', 'GOLDEN_BOOT']
}