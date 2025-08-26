import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create Finnish leagues
  const veikkausliiga = await prisma.league.upsert({
    where: { name_country: { name: 'Veikkausliiga', country: 'Finland' } },
    update: {},
    create: {
      name: 'Veikkausliiga',
      country: 'Finland',
      tier: 1,
      shortName: 'VL',
    },
  })

  const ykkosliiga = await prisma.league.upsert({
    where: { name_country: { name: 'Ykkösliiga', country: 'Finland' } },
    update: {},
    create: {
      name: 'Ykkösliiga',
      country: 'Finland',
      tier: 2,
      shortName: 'YL',
    },
  })

  // Create Swedish leagues
  const allsvenskan = await prisma.league.upsert({
    where: { name_country: { name: 'Allsvenskan', country: 'Sweden' } },
    update: {},
    create: {
      name: 'Allsvenskan',
      country: 'Sweden',
      tier: 1,
      shortName: 'AS',
    },
  })

  const superettan = await prisma.league.upsert({
    where: { name_country: { name: 'Superettan', country: 'Sweden' } },
    update: {},
    create: {
      name: 'Superettan',
      country: 'Sweden',
      tier: 2,
      shortName: 'SE',
    },
  })

  // Create Finnish teams
  const finnishTeams = [
    // Veikkausliiga
    { name: 'HJK Helsinki', shortName: 'HJK', city: 'Helsinki', venue: 'Bolt Arena', isDerbyTeam: true, leagueId: veikkausliiga.id },
    { name: 'KuPS Kuopio', shortName: 'KuPS', city: 'Kuopio', venue: 'Savon Sanomat Areena', leagueId: veikkausliiga.id },
    { name: 'FC Inter Turku', shortName: 'Inter', city: 'Turku', venue: 'Veritas Stadion', leagueId: veikkausliiga.id },
    { name: 'FC Haka', shortName: 'Haka', city: 'Valkeakoski', venue: 'Tehtaan kenttä', leagueId: veikkausliiga.id },
    { name: 'SJK Seinäjoki', shortName: 'SJK', city: 'Seinäjoki', venue: 'OmaSp Stadion', leagueId: veikkausliiga.id },
    { name: 'FC Honka', shortName: 'Honka', city: 'Espoo', venue: 'Tapiolan Urheilupuisto', isDerbyTeam: true, leagueId: veikkausliiga.id },
    { name: 'FC Lahti', shortName: 'Lahti', city: 'Lahti', venue: 'Lahden Stadion', leagueId: veikkausliiga.id },
    { name: 'AC Oulu', shortName: 'Oulu', city: 'Oulu', venue: 'Raatti', leagueId: veikkausliiga.id },
    { name: 'VPS Vaasa', shortName: 'VPS', city: 'Vaasa', venue: 'Hietalahti', leagueId: veikkausliiga.id },
    { name: 'FC Ilves', shortName: 'Ilves', city: 'Tampere', venue: 'Tammelan Stadion', leagueId: veikkausliiga.id },
    { name: 'IFK Mariehamn', shortName: 'MIFK', city: 'Mariehamn', venue: 'Wiklöf Holding Arena', leagueId: veikkausliiga.id },
    { name: 'HIFK Helsinki', shortName: 'HIFK', city: 'Helsinki', venue: 'Bolt Arena', isDerbyTeam: true, leagueId: veikkausliiga.id },
    // Ykkösliiga
    { name: 'TPS Turku', shortName: 'TPS', city: 'Turku', venue: 'Veritas Stadion', leagueId: ykkosliiga.id },
    { name: 'RoPS Rovaniemi', shortName: 'RoPS', city: 'Rovaniemi', venue: 'Keskuskenttä', leagueId: ykkosliiga.id },
    { name: 'JJK Jyväskylä', shortName: 'JJK', city: 'Jyväskylä', venue: 'Harjun stadion', leagueId: ykkosliiga.id },
    { name: 'KTP Kotka', shortName: 'KTP', city: 'Kotka', venue: 'Arto Tolsa Areena', leagueId: ykkosliiga.id },
  ]

  // Create Swedish teams
  const swedishTeams = [
    // Allsvenskan
    { name: 'Malmö FF', shortName: 'MFF', city: 'Malmö', venue: 'Eleda Stadion', leagueId: allsvenskan.id },
    { name: 'AIK Stockholm', shortName: 'AIK', city: 'Stockholm', venue: 'Friends Arena', isDerbyTeam: true, leagueId: allsvenskan.id },
    { name: 'Djurgården Stockholm', shortName: 'DIF', city: 'Stockholm', venue: 'Tele2 Arena', isDerbyTeam: true, leagueId: allsvenskan.id },
    { name: 'Hammarby Stockholm', shortName: 'HIF', city: 'Stockholm', venue: 'Tele2 Arena', isDerbyTeam: true, leagueId: allsvenskan.id },
    { name: 'IFK Göteborg', shortName: 'IFK', city: 'Göteborg', venue: 'Gamla Ullevi', leagueId: allsvenskan.id },
    { name: 'BK Häcken', shortName: 'Häcken', city: 'Göteborg', venue: 'Bravida Arena', leagueId: allsvenskan.id },
    { name: 'IF Elfsborg', shortName: 'Elfsborg', city: 'Borås', venue: 'Borås Arena', leagueId: allsvenskan.id },
    { name: 'IFK Norrköping', shortName: 'Norrköping', city: 'Norrköping', venue: 'Östgötaporten', leagueId: allsvenskan.id },
    { name: 'Kalmar FF', shortName: 'KFF', city: 'Kalmar', venue: 'Guldfågeln Arena', leagueId: allsvenskan.id },
    { name: 'IK Sirius', shortName: 'Sirius', city: 'Uppsala', venue: 'Studenternas IP', leagueId: allsvenskan.id },
    { name: 'Mjällby AIF', shortName: 'MAIF', city: 'Mjällby', venue: 'Strandvallen', leagueId: allsvenskan.id },
    { name: 'Varbergs BoIS', shortName: 'Varberg', city: 'Varberg', venue: 'Påskbergsvallen', leagueId: allsvenskan.id },
    { name: 'Halmstads BK', shortName: 'HBK', city: 'Halmstad', venue: 'Örjans Vall', leagueId: allsvenskan.id },
    { name: 'IFK Värnamo', shortName: 'Värnamo', city: 'Värnamo', venue: 'Finnvedsvallen', leagueId: allsvenskan.id },
    { name: 'Degerfors IF', shortName: 'Degerfors', city: 'Degerfors', venue: 'Stora Valla', leagueId: allsvenskan.id },
    { name: 'IF Brommapojkarna', shortName: 'BP', city: 'Stockholm', venue: 'Grimsta IP', leagueId: allsvenskan.id },
    // Superettan
    { name: 'GIF Sundsvall', shortName: 'GIF', city: 'Sundsvall', venue: 'NP3 Arena', leagueId: superettan.id },
    { name: 'Östersunds FK', shortName: 'ÖFK', city: 'Östersund', venue: 'Jämtkraft Arena', leagueId: superettan.id },
    { name: 'GAIS Göteborg', shortName: 'GAIS', city: 'Göteborg', venue: 'Gamla Ullevi', leagueId: superettan.id },
    { name: 'Helsingborgs IF', shortName: 'HIF', city: 'Helsingborg', venue: 'Olympia', leagueId: superettan.id },
  ]

  // Create all teams
  for (const teamData of [...finnishTeams, ...swedishTeams]) {
    await prisma.team.create({
      data: {
        name: teamData.name,
        shortName: teamData.shortName,
        city: teamData.city,
        country: teamData.leagueId === veikkausliiga.id || teamData.leagueId === ykkosliiga.id ? 'Finland' : 'Sweden',
        venue: teamData.venue,
        isDerbyTeam: teamData.isDerbyTeam || false,
        leagueId: teamData.leagueId,
      },
    })
  }

  // Create a demo user with starting currency
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@nordic.com',
      username: 'DemoPlayer',
      passwordHash: await hash('demo123', 10),
      betPoints: 10000, // Starting bonus
      diamonds: 50,     // Starting diamonds
      level: 1,
      xp: 0,
    },
  })

  // Create sample achievements
  const achievements = [
    // Betting achievements
    { name: 'First Bet', description: 'Place your first bet', category: 'BETTING', tier: 1, requirement: { type: 'BETS_PLACED', count: 1 }, reward: { betPoints: 100, diamonds: 5, xp: 50 } },
    { name: 'Betting Regular', description: 'Place 50 bets', category: 'BETTING', tier: 2, requirement: { type: 'BETS_PLACED', count: 50 }, reward: { betPoints: 500, diamonds: 20, xp: 200 } },
    { name: 'Betting Master', description: 'Place 500 bets', category: 'BETTING', tier: 3, requirement: { type: 'BETS_PLACED', count: 500 }, reward: { betPoints: 2000, diamonds: 100, xp: 1000 } },
    
    // Winning achievements
    { name: 'First Win', description: 'Win your first bet', category: 'WINNING', tier: 1, requirement: { type: 'BETS_WON', count: 1 }, reward: { betPoints: 200, diamonds: 10, xp: 100 } },
    { name: 'Winning Streak', description: 'Win 5 bets in a row', category: 'WINNING', tier: 2, requirement: { type: 'STREAK', count: 5 }, reward: { betPoints: 1000, diamonds: 50, xp: 500 } },
    { name: 'Big Winner', description: 'Win a bet with 10x return', category: 'WINNING', tier: 3, requirement: { type: 'BIG_WIN', multiplier: 10 }, reward: { betPoints: 5000, diamonds: 200, xp: 2000 } },
    
    // Loyalty achievements
    { name: 'Daily Player', description: 'Login 7 days in a row', category: 'LOYALTY', tier: 1, requirement: { type: 'LOGIN_STREAK', days: 7 }, reward: { betPoints: 500, diamonds: 25, xp: 250 } },
    { name: 'Monthly Regular', description: 'Login 30 days in a row', category: 'LOYALTY', tier: 2, requirement: { type: 'LOGIN_STREAK', days: 30 }, reward: { betPoints: 2000, diamonds: 100, xp: 1000 } },
    { name: 'Nordic Veteran', description: 'Reach level 10', category: 'LOYALTY', tier: 3, requirement: { type: 'LEVEL', level: 10 }, reward: { betPoints: 10000, diamonds: 500, xp: 5000 } },
    
    // Special achievements
    { name: 'Derby Master', description: 'Win 10 derby bets', category: 'SPECIAL', tier: 2, requirement: { type: 'DERBY_WINS', count: 10 }, reward: { betPoints: 1500, diamonds: 75, xp: 750 } },
    { name: 'Live Betting Pro', description: 'Win 25 live bets', category: 'SPECIAL', tier: 2, requirement: { type: 'LIVE_WINS', count: 25 }, reward: { betPoints: 2000, diamonds: 100, xp: 1000 } },
    { name: 'Diamond Collector', description: 'Accumulate 1000 diamonds', category: 'SPECIAL', tier: 3, requirement: { type: 'DIAMONDS', count: 1000 }, reward: { betPoints: 5000, diamonds: 0, xp: 2500 } },
  ]

  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: {
        name: achievement.name,
        description: achievement.description,
        category: achievement.category as any,
        tier: achievement.tier,
        requirement: achievement.requirement,
        reward: achievement.reward,
      },
    })
  }

  // Create sample matches with odds
  const teams = await prisma.team.findMany()
  const now = new Date()
  
  // Create matches for the next 7 days
  for (let day = 0; day < 7; day++) {
    const matchDate = new Date(now)
    matchDate.setDate(matchDate.getDate() + day)
    matchDate.setHours(18, 0, 0, 0)
    
    // Create 4-6 matches per day
    const matchesPerDay = 4 + Math.floor(Math.random() * 3)
    
    for (let i = 0; i < matchesPerDay; i++) {
      const leagueTeams = teams.filter(t => t.leagueId === (i % 2 === 0 ? veikkausliiga.id : allsvenskan.id))
      const shuffled = leagueTeams.sort(() => 0.5 - Math.random())
      
      if (shuffled.length >= 2) {
        const homeTeam = shuffled[0]
        const awayTeam = shuffled[1]
        
        const match = await prisma.match.create({
          data: {
            leagueId: homeTeam.leagueId,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            startTime: new Date(matchDate.getTime() + i * 2 * 60 * 60 * 1000), // Stagger by 2 hours
            status: 'SCHEDULED',
            isDerby: homeTeam.isDerbyTeam && awayTeam.isDerbyTeam && homeTeam.city === awayTeam.city,
            isFeatured: Math.random() > 0.8,
          },
        })
        
        // Create odds for the match
        const homeWinBase = 150 + Math.floor(Math.random() * 200)
        const drawBase = 280 + Math.floor(Math.random() * 120)
        const awayWinBase = 180 + Math.floor(Math.random() * 220)
        
        await prisma.odds.create({
          data: {
            matchId: match.id,
            market: 'MATCH_RESULT',
            homeWin: homeWinBase,
            draw: drawBase,
            awayWin: awayWinBase,
            // Enhanced odds for F2P (1.5x to 2.1x multiplier)
            enhancedHomeWin: Math.floor(homeWinBase * (1.5 + Math.random() * 0.6)),
            enhancedDraw: Math.floor(drawBase * (1.5 + Math.random() * 0.6)),
            enhancedAwayWin: Math.floor(awayWinBase * (1.5 + Math.random() * 0.6)),
            // Over/Under 2.5
            over25: 165 + Math.floor(Math.random() * 70),
            under25: 195 + Math.floor(Math.random() * 70),
            // BTTS
            bttsYes: 170 + Math.floor(Math.random() * 60),
            bttsNo: 190 + Math.floor(Math.random() * 60),
          },
        })
      }
    }
  }

  // Create a sample live match
  const liveTeams = teams.filter(t => t.leagueId === veikkausliiga.id).slice(0, 2)
  if (liveTeams.length === 2) {
    const liveMatch = await prisma.match.create({
      data: {
        leagueId: veikkausliiga.id,
        homeTeamId: liveTeams[0].id,
        awayTeamId: liveTeams[1].id,
        startTime: new Date(now.getTime() - 45 * 60 * 1000), // Started 45 minutes ago
        status: 'LIVE',
        homeScore: 1,
        awayScore: 0,
        minute: 45,
      },
    })
    
    // Create live odds
    await prisma.odds.create({
      data: {
        matchId: liveMatch.id,
        market: 'MATCH_RESULT',
        homeWin: 120,
        draw: 450,
        awayWin: 650,
        enhancedHomeWin: 180,
        enhancedDraw: 675,
        enhancedAwayWin: 975,
        isLive: true,
        // Live betting markets
        nextGoalHome: 165,
        nextGoalAway: 220,
        nextGoalNone: 350,
      },
    })
    
    // Create match events
    await prisma.matchEvent.create({
      data: {
        matchId: liveMatch.id,
        minute: 23,
        eventType: 'GOAL',
        team: 'HOME',
        player: 'J. Virtanen',
      },
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Created: ${finnishTeams.length + swedishTeams.length} teams, ${achievements.length} achievements`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })