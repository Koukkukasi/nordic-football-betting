// Championship Data Structure
// 2024/25 Season

import { League, Team } from './premier-league'

export const CHAMPIONSHIP: League = {
  id: 'championship',
  name: 'Championship',
  country: 'England',
  flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  tier: 2,
  matchesPerSeason: 552,
  xpMultiplier: 1.0,
  diamondMultiplier: 1.2,
  teams: [
    {
      id: 'blackburn',
      name: 'Blackburn Rovers',
      shortName: 'BLA',
      stadium: 'Ewood Park',
      capacity: 31367,
      city: 'Blackburn',
      founded: 1875,
      colors: ['#009EE0', '#FFFFFF']
    },
    {
      id: 'bristol-city',
      name: 'Bristol City',
      shortName: 'BRC',
      stadium: 'Ashton Gate',
      capacity: 27000,
      city: 'Bristol',
      founded: 1894,
      colors: ['#E4002B', '#FFFFFF']
    },
    {
      id: 'burnley',
      name: 'Burnley',
      shortName: 'BUR',
      stadium: 'Turf Moor',
      capacity: 21944,
      city: 'Burnley',
      founded: 1882,
      colors: ['#6C1D45', '#99D6EA']
    },
    {
      id: 'cardiff',
      name: 'Cardiff City',
      shortName: 'CAR',
      stadium: 'Cardiff City Stadium',
      capacity: 33280,
      city: 'Cardiff',
      founded: 1899,
      colors: ['#0070B5', '#FFFFFF']
    },
    {
      id: 'coventry',
      name: 'Coventry City',
      shortName: 'COV',
      stadium: 'Coventry Building Society Arena',
      capacity: 32609,
      city: 'Coventry',
      founded: 1883,
      colors: ['#1E90FF', '#FFFFFF']
    },
    {
      id: 'derby',
      name: 'Derby County',
      shortName: 'DER',
      stadium: 'Pride Park Stadium',
      capacity: 33597,
      city: 'Derby',
      founded: 1884,
      colors: ['#FFFFFF', '#000000']
    },
    {
      id: 'hull',
      name: 'Hull City',
      shortName: 'HUL',
      stadium: 'MKM Stadium',
      capacity: 25586,
      city: 'Hull',
      founded: 1904,
      colors: ['#F5971D', '#000000']
    },
    {
      id: 'leeds',
      name: 'Leeds United',
      shortName: 'LEE',
      stadium: 'Elland Road',
      capacity: 37792,
      city: 'Leeds',
      founded: 1919,
      colors: ['#FFFFFF', '#1D428A']
    },
    {
      id: 'luton',
      name: 'Luton Town',
      shortName: 'LUT',
      stadium: 'Kenilworth Road',
      capacity: 10356,
      city: 'Luton',
      founded: 1885,
      colors: ['#F78F1E', '#002D62']
    },
    {
      id: 'middlesbrough',
      name: 'Middlesbrough',
      shortName: 'MID',
      stadium: 'Riverside Stadium',
      capacity: 34742,
      city: 'Middlesbrough',
      founded: 1876,
      colors: ['#E4002B', '#FFFFFF']
    },
    {
      id: 'millwall',
      name: 'Millwall',
      shortName: 'MIL',
      stadium: 'The Den',
      capacity: 20146,
      city: 'London',
      founded: 1885,
      colors: ['#003366', '#FFFFFF']
    },
    {
      id: 'norwich',
      name: 'Norwich City',
      shortName: 'NOR',
      stadium: 'Carrow Road',
      capacity: 27359,
      city: 'Norwich',
      founded: 1902,
      colors: ['#FFF200', '#00A650']
    },
    {
      id: 'oxford-united',
      name: 'Oxford United',
      shortName: 'OXF',
      stadium: 'Kassam Stadium',
      capacity: 12500,
      city: 'Oxford',
      founded: 1893,
      colors: ['#FFDD00', '#003366']
    },
    {
      id: 'plymouth',
      name: 'Plymouth Argyle',
      shortName: 'PLY',
      stadium: 'Home Park',
      capacity: 18600,
      city: 'Plymouth',
      founded: 1886,
      colors: ['#004F3E', '#FFFFFF']
    },
    {
      id: 'portsmouth',
      name: 'Portsmouth',
      shortName: 'POR',
      stadium: 'Fratton Park',
      capacity: 20899,
      city: 'Portsmouth',
      founded: 1898,
      colors: ['#001489', '#FFFFFF']
    },
    {
      id: 'preston',
      name: 'Preston North End',
      shortName: 'PRE',
      stadium: 'Deepdale',
      capacity: 23404,
      city: 'Preston',
      founded: 1880,
      colors: ['#FFFFFF', '#1B458F']
    },
    {
      id: 'qpr',
      name: 'Queens Park Rangers',
      shortName: 'QPR',
      stadium: 'Loftus Road',
      capacity: 18439,
      city: 'London',
      founded: 1882,
      colors: ['#1D5BA4', '#FFFFFF']
    },
    {
      id: 'sheffield-united',
      name: 'Sheffield United',
      shortName: 'SHU',
      stadium: 'Bramall Lane',
      capacity: 32050,
      city: 'Sheffield',
      founded: 1889,
      colors: ['#ED1C24', '#FFFFFF']
    },
    {
      id: 'sheffield-wed',
      name: 'Sheffield Wednesday',
      shortName: 'SHW',
      stadium: 'Hillsborough',
      capacity: 34835,
      city: 'Sheffield',
      founded: 1867,
      colors: ['#0064B6', '#FFFFFF']
    },
    {
      id: 'stoke',
      name: 'Stoke City',
      shortName: 'STO',
      stadium: 'bet365 Stadium',
      capacity: 30089,
      city: 'Stoke-on-Trent',
      founded: 1863,
      colors: ['#E03A3E', '#FFFFFF']
    },
    {
      id: 'sunderland',
      name: 'Sunderland',
      shortName: 'SUN',
      stadium: 'Stadium of Light',
      capacity: 49000,
      city: 'Sunderland',
      founded: 1879,
      colors: ['#EB172B', '#FFFFFF']
    },
    {
      id: 'swansea',
      name: 'Swansea City',
      shortName: 'SWA',
      stadium: 'Swansea.com Stadium',
      capacity: 21088,
      city: 'Swansea',
      founded: 1912,
      colors: ['#FFFFFF', '#000000']
    },
    {
      id: 'watford',
      name: 'Watford',
      shortName: 'WAT',
      stadium: 'Vicarage Road',
      capacity: 22200,
      city: 'Watford',
      founded: 1881,
      colors: ['#FBEE23', '#ED2127']
    },
    {
      id: 'wba',
      name: 'West Bromwich Albion',
      shortName: 'WBA',
      stadium: 'The Hawthorns',
      capacity: 26688,
      city: 'West Bromwich',
      founded: 1878,
      colors: ['#122F67', '#FFFFFF']
    }
  ]
}

// Championship Special Matches
export const CHAMPIONSHIP_DERBIES = [
  {
    id: 'steel-city-derby',
    name: 'Steel City Derby',
    teams: ['sheffield-united', 'sheffield-wed'],
    xpMultiplier: 2,
    diamondBonus: 2
  },
  {
    id: 'yorkshire-derby-leeds',
    name: 'Yorkshire Derby',
    teams: ['leeds', 'sheffield-united', 'sheffield-wed'],
    xpMultiplier: 1.5,
    diamondBonus: 1
  },
  {
    id: 'london-derby-championship',
    name: 'London Derby',
    teams: ['millwall', 'qpr'],
    xpMultiplier: 1.5,
    diamondBonus: 1
  },
  {
    id: 'south-wales-derby',
    name: 'South Wales Derby',
    teams: ['cardiff', 'swansea'],
    xpMultiplier: 2,
    diamondBonus: 2
  },
  {
    id: 'tyne-wear-derby',
    name: 'Tyne-Wear Derby',
    teams: ['sunderland', 'middlesbrough'],
    xpMultiplier: 1.5,
    diamondBonus: 1
  }
]

// Promotion Contenders (for special predictions)
export const PROMOTION_FAVORITES = [
  'burnley',
  'leeds',
  'sheffield-united',
  'luton',
  'sunderland',
  'middlesbrough',
  'coventry',
  'wba'
]

// Playoff Positions (3rd to 6th place)
export const PLAYOFF_POSITIONS = [3, 4, 5, 6]

// Championship Markets
export const CHAMPIONSHIP_MARKETS = {
  basic: ['1X2', 'OVER_UNDER_2_5', 'BTTS'],
  advanced: ['CORRECT_SCORE', 'FIRST_SCORER', 'HALF_TIME_RESULT'],
  live: ['NEXT_GOAL', 'NEXT_CORNER', 'NEXT_CARD'],
  special: ['PROMOTION', 'PLAYOFF_WINNER', 'TOP_SCORER', 'RELEGATION']
}