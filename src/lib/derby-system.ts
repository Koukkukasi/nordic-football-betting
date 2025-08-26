// Derby Match Detection and Bonus System
// Automatically detects Helsinki and Stockholm derbies with enhanced rewards

export interface DerbyMatch {
  matchId: string
  homeTeam: string
  awayTeam: string
  derbyType: DerbyType
  city: string
  rivalryLevel: 'LOCAL' | 'REGIONAL' | 'HISTORICAL' | 'CLASSIC'
  bonusMultiplier: number
  specialFeatures: string[]
}

export enum DerbyType {
  HELSINKI_DERBY = 'HELSINKI_DERBY',
  STOCKHOLM_DERBY = 'STOCKHOLM_DERBY',
  FINNISH_CLASICO = 'FINNISH_CLASICO',
  SWEDISH_CLASICO = 'SWEDISH_CLASICO',
  REGIONAL_DERBY = 'REGIONAL_DERBY'
}

// Derby team configurations
export const DERBY_TEAMS = {
  // Helsinki Derby teams
  HELSINKI: {
    'HJK Helsinki': {
      city: 'Helsinki',
      rivals: ['FC Honka', 'HIFK', 'PK-35 Vantaa'],
      derbyType: DerbyType.HELSINKI_DERBY,
      bonusMultiplier: 2.0
    },
    'FC Honka': {
      city: 'Espoo', // Greater Helsinki area
      rivals: ['HJK Helsinki', 'HIFK'],
      derbyType: DerbyType.HELSINKI_DERBY,
      bonusMultiplier: 2.0
    },
    'HIFK': {
      city: 'Helsinki',
      rivals: ['HJK Helsinki', 'FC Honka'],
      derbyType: DerbyType.HELSINKI_DERBY,
      bonusMultiplier: 1.8
    }
  },

  // Stockholm Derby teams
  STOCKHOLM: {
    'AIK': {
      city: 'Stockholm',
      rivals: ['Djurgården', 'Hammarby'],
      derbyType: DerbyType.STOCKHOLM_DERBY,
      bonusMultiplier: 2.0
    },
    'Djurgården': {
      city: 'Stockholm',
      rivals: ['AIK', 'Hammarby'],
      derbyType: DerbyType.STOCKHOLM_DERBY,
      bonusMultiplier: 2.0
    },
    'Hammarby': {
      city: 'Stockholm',
      rivals: ['AIK', 'Djurgården'],
      derbyType: DerbyType.STOCKHOLM_DERBY,
      bonusMultiplier: 2.0
    }
  },

  // Finnish big clubs
  FINNISH_BIG_CLUBS: {
    'HJK Helsinki': {
      city: 'Helsinki',
      rivals: ['KuPS Kuopio', 'FC Inter Turku', 'FC Lahti'],
      derbyType: DerbyType.FINNISH_CLASICO,
      bonusMultiplier: 1.5
    },
    'KuPS Kuopio': {
      city: 'Kuopio',
      rivals: ['HJK Helsinki', 'SJK Seinäjoki'],
      derbyType: DerbyType.FINNISH_CLASICO,
      bonusMultiplier: 1.5
    },
    'FC Inter Turku': {
      city: 'Turku',
      rivals: ['HJK Helsinki', 'TPS Turku'],
      derbyType: DerbyType.FINNISH_CLASICO,
      bonusMultiplier: 1.5
    }
  },

  // Regional derbies
  REGIONAL: {
    'TPS Turku': {
      city: 'Turku',
      rivals: ['FC Inter Turku'],
      derbyType: DerbyType.REGIONAL_DERBY,
      bonusMultiplier: 1.3
    },
    'MYPA': {
      city: 'Anjalankoski',
      rivals: ['KuPS Kuopio', 'SJK Seinäjoki'],
      derbyType: DerbyType.REGIONAL_DERBY,
      bonusMultiplier: 1.3
    }
  }
}

export interface DerbyBonusConfig {
  xpMultiplier: number
  rewardMultiplier: number
  specialChallenges: boolean
  enhancedOdds: boolean
  diamondBonus: number
  achievementBonus: boolean
}

export const DERBY_BONUS_CONFIG: Record<DerbyType, DerbyBonusConfig> = {
  [DerbyType.HELSINKI_DERBY]: {
    xpMultiplier: 2.0,
    rewardMultiplier: 2.0,
    specialChallenges: true,
    enhancedOdds: true,
    diamondBonus: 10,
    achievementBonus: true
  },
  [DerbyType.STOCKHOLM_DERBY]: {
    xpMultiplier: 2.0,
    rewardMultiplier: 2.0,
    specialChallenges: true,
    enhancedOdds: true,
    diamondBonus: 10,
    achievementBonus: true
  },
  [DerbyType.FINNISH_CLASICO]: {
    xpMultiplier: 1.5,
    rewardMultiplier: 1.5,
    specialChallenges: true,
    enhancedOdds: false,
    diamondBonus: 5,
    achievementBonus: true
  },
  [DerbyType.SWEDISH_CLASICO]: {
    xpMultiplier: 1.5,
    rewardMultiplier: 1.5,
    specialChallenges: true,
    enhancedOdds: false,
    diamondBonus: 5,
    achievementBonus: true
  },
  [DerbyType.REGIONAL_DERBY]: {
    xpMultiplier: 1.3,
    rewardMultiplier: 1.3,
    specialChallenges: false,
    enhancedOdds: false,
    diamondBonus: 2,
    achievementBonus: false
  }
}

export class DerbyDetectionService {
  
  static detectDerbyMatch(homeTeam: string, awayTeam: string): DerbyMatch | null {
    // Check all derby configurations
    const allTeams = {
      ...DERBY_TEAMS.HELSINKI,
      ...DERBY_TEAMS.STOCKHOLM,
      ...DERBY_TEAMS.FINNISH_BIG_CLUBS,
      ...DERBY_TEAMS.REGIONAL
    }

    const homeTeamConfig = allTeams[homeTeam as keyof typeof allTeams]
    const awayTeamConfig = allTeams[awayTeam as keyof typeof allTeams]

    if (!homeTeamConfig || !awayTeamConfig) {
      return null
    }

    // Check if teams are rivals
    const isRivalry = homeTeamConfig.rivals.includes(awayTeam) || 
                     awayTeamConfig.rivals.includes(homeTeam)

    if (!isRivalry) {
      return null
    }

    // Determine derby type and details
    const derbyType = this.determineDerbyType(homeTeam, awayTeam, homeTeamConfig, awayTeamConfig)
    const rivalryLevel = this.determineRivalryLevel(derbyType, homeTeam, awayTeam)
    const bonusMultiplier = Math.max(homeTeamConfig.bonusMultiplier, awayTeamConfig.bonusMultiplier)
    
    return {
      matchId: '', // Will be set by caller
      homeTeam,
      awayTeam,
      derbyType,
      city: homeTeamConfig.city,
      rivalryLevel,
      bonusMultiplier,
      specialFeatures: this.getSpecialFeatures(derbyType, homeTeam, awayTeam)
    }
  }

  static isDerbyDay(matches: Array<{ homeTeam: string, awayTeam: string }>): boolean {
    return matches.some(match => 
      this.detectDerbyMatch(match.homeTeam, match.awayTeam) !== null
    )
  }

  static getDerbyMatches(matches: Array<{ id: string, homeTeam: string, awayTeam: string }>): DerbyMatch[] {
    return matches
      .map(match => {
        const derby = this.detectDerbyMatch(match.homeTeam, match.awayTeam)
        if (derby) {
          derby.matchId = match.id
        }
        return derby
      })
      .filter(derby => derby !== null) as DerbyMatch[]
  }

  static calculateDerbyBonus(
    baseReward: number,
    derbyType: DerbyType,
    rewardType: 'XP' | 'BETPOINTS' | 'DIAMONDS'
  ): number {
    const config = DERBY_BONUS_CONFIG[derbyType]
    
    switch (rewardType) {
      case 'XP':
        return Math.floor(baseReward * config.xpMultiplier)
      case 'BETPOINTS':
        return Math.floor(baseReward * config.rewardMultiplier)
      case 'DIAMONDS':
        return baseReward + config.diamondBonus
      default:
        return baseReward
    }
  }

  static getDerbySpecialChallenges(derbyType: DerbyType, homeTeam: string, awayTeam: string) {
    const config = DERBY_BONUS_CONFIG[derbyType]
    
    if (!config.specialChallenges) {
      return []
    }

    const baseReward = {
      betPoints: 1000,
      diamonds: 20,
      xp: 300
    }

    const challenges = [
      {
        id: `derby_winner_${derbyType}`,
        name: 'Derby Voittaja',
        description: `Voita veto ${homeTeam} vs ${awayTeam} ottelusta`,
        requirement: {
          type: 'WIN_DERBY_BET',
          target: 1,
          conditions: {
            homeTeam,
            awayTeam,
            isDerby: true
          }
        },
        reward: {
          betPoints: this.calculateDerbyBonus(baseReward.betPoints, derbyType, 'BETPOINTS'),
          diamonds: this.calculateDerbyBonus(baseReward.diamonds, derbyType, 'DIAMONDS'),
          xp: this.calculateDerbyBonus(baseReward.xp, derbyType, 'XP')
        },
        specialEvent: true
      },
      {
        id: `derby_correct_score_${derbyType}`,
        name: 'Derby Tarkkuusampuja',
        description: `Arvaa ${homeTeam} vs ${awayTeam} lopputulos oikein`,
        requirement: {
          type: 'CORRECT_SCORE_DERBY',
          target: 1,
          conditions: {
            homeTeam,
            awayTeam,
            isDerby: true,
            market: 'CORRECT_SCORE'
          }
        },
        reward: {
          betPoints: this.calculateDerbyBonus(baseReward.betPoints * 3, derbyType, 'BETPOINTS'),
          diamonds: this.calculateDerbyBonus(baseReward.diamonds * 2, derbyType, 'DIAMONDS'),
          xp: this.calculateDerbyBonus(baseReward.xp * 2, derbyType, 'XP'),
          specialReward: {
            type: 'FREE_BET',
            value: 500,
            duration: 48
          }
        },
        specialEvent: true
      }
    ]

    return challenges
  }

  static getDerbyDisplayInfo(derbyType: DerbyType): {
    icon: string
    name: string
    description: string
    color: string
  } {
    const derbyInfo = {
      [DerbyType.HELSINKI_DERBY]: {
        icon: '🇫🇮',
        name: 'Helsingin Derby',
        description: 'Pääkaupunkiseudun klassikko',
        color: '#0066CC'
      },
      [DerbyType.STOCKHOLM_DERBY]: {
        icon: '🇸🇪',
        name: 'Tukholman Derby',
        description: 'Ruotsin pääkaupungin taistelu',
        color: '#FFCD00'
      },
      [DerbyType.FINNISH_CLASICO]: {
        icon: '⭐',
        name: 'Suomen Clasico',
        description: 'Suurseurojen kohtaaminen',
        color: '#FF6600'
      },
      [DerbyType.SWEDISH_CLASICO]: {
        icon: '👑',
        name: 'Ruotsin Clasico',
        description: 'Kuninkaan klassikko',
        color: '#FFD700'
      },
      [DerbyType.REGIONAL_DERBY]: {
        icon: '🏟️',
        name: 'Paikallinen Derby',
        description: 'Alueen ylpeys vaakalaudalla',
        color: '#666666'
      }
    }

    return derbyInfo[derbyType]
  }

  private static determineDerbyType(
    homeTeam: string, 
    awayTeam: string, 
    homeConfig: any, 
    awayConfig: any
  ): DerbyType {
    // Helsinki derby check
    if ((homeConfig.city === 'Helsinki' || homeConfig.city === 'Espoo') && 
        (awayConfig.city === 'Helsinki' || awayConfig.city === 'Espoo')) {
      return DerbyType.HELSINKI_DERBY
    }

    // Stockholm derby check
    if (homeConfig.city === 'Stockholm' && awayConfig.city === 'Stockholm') {
      return DerbyType.STOCKHOLM_DERBY
    }

    // Big club clashes
    const bigClubs = ['HJK Helsinki', 'KuPS Kuopio', 'FC Inter Turku', 'FC Lahti']
    if (bigClubs.includes(homeTeam) && bigClubs.includes(awayTeam)) {
      return DerbyType.FINNISH_CLASICO
    }

    // Default to regional derby
    return DerbyType.REGIONAL_DERBY
  }

  private static determineRivalryLevel(
    derbyType: DerbyType, 
    homeTeam: string, 
    awayTeam: string
  ): 'LOCAL' | 'REGIONAL' | 'HISTORICAL' | 'CLASSIC' {
    switch (derbyType) {
      case DerbyType.HELSINKI_DERBY:
      case DerbyType.STOCKHOLM_DERBY:
        return 'CLASSIC'
      case DerbyType.FINNISH_CLASICO:
      case DerbyType.SWEDISH_CLASICO:
        return 'HISTORICAL'
      case DerbyType.REGIONAL_DERBY:
        return 'REGIONAL'
      default:
        return 'LOCAL'
    }
  }

  private static getSpecialFeatures(
    derbyType: DerbyType, 
    homeTeam: string, 
    awayTeam: string
  ): string[] {
    const features = []

    const config = DERBY_BONUS_CONFIG[derbyType]
    
    if (config.xpMultiplier > 1) {
      features.push(`${config.xpMultiplier}x XP Bonus`)
    }
    
    if (config.rewardMultiplier > 1) {
      features.push(`${config.rewardMultiplier}x Reward Multiplier`)
    }
    
    if (config.enhancedOdds) {
      features.push('Enhanced Odds Available')
    }
    
    if (config.specialChallenges) {
      features.push('Special Derby Challenges')
    }
    
    if (config.diamondBonus > 0) {
      features.push(`+${config.diamondBonus} Bonus Diamonds`)
    }
    
    if (config.achievementBonus) {
      features.push('Derby Achievement Progress')
    }

    return features
  }
}

// Derby-specific achievements
export const DERBY_ACHIEVEMENTS = [
  {
    id: 'helsinki_derby_master',
    name: 'Helsingin Derby Mestari',
    description: 'Voita 10 vetoa Helsingin derby -otteluista',
    category: 'SPECIAL',
    requirement: {
      type: 'WIN_DERBY_BETS',
      target: 10,
      conditions: { derbyType: DerbyType.HELSINKI_DERBY }
    },
    reward: {
      betPoints: 5000,
      diamonds: 100,
      xp: 1000,
      badge: 'helsinki_derby_master'
    }
  },
  {
    id: 'stockholm_derby_legend',
    name: 'Tukholman Derby Legenda',
    description: 'Voita 10 vetoa Tukholman derby -otteluista',
    category: 'SPECIAL',
    requirement: {
      type: 'WIN_DERBY_BETS',
      target: 10,
      conditions: { derbyType: DerbyType.STOCKHOLM_DERBY }
    },
    reward: {
      betPoints: 5000,
      diamonds: 100,
      xp: 1000,
      badge: 'stockholm_derby_legend'
    }
  },
  {
    id: 'derby_prophet',
    name: 'Derby Profeetta',
    description: 'Arvaa 5 derby-ottelun lopputulos oikein',
    category: 'SPECIAL',
    requirement: {
      type: 'CORRECT_SCORE_DERBIES',
      target: 5,
      conditions: { isDerby: true, market: 'CORRECT_SCORE' }
    },
    reward: {
      betPoints: 10000,
      diamonds: 200,
      xp: 2000,
      badge: 'derby_prophet',
      title: 'Derby Profeetta'
    }
  }
]

// Utility functions for UI
export function getDerbyBadgeDisplay(derbyType: DerbyType): string {
  const info = DerbyDetectionService.getDerbyDisplayInfo(derbyType)
  return `${info.icon} ${info.name}`
}

export function formatDerbyBonus(multiplier: number): string {
  return `${multiplier}x`
}

export function isDerbyMatch(homeTeam: string, awayTeam: string): boolean {
  return DerbyDetectionService.detectDerbyMatch(homeTeam, awayTeam) !== null
}