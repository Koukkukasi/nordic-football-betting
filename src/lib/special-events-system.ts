// Special Events System for Nordic Football Betting
// Seasonal promotions, limited-time features, and holiday events

export interface SpecialEvent {
  id: string
  name: string
  description: string
  type: EventType
  category: EventCategory
  status: EventStatus
  
  startDate: Date
  endDate: Date
  
  // Visual branding
  theme: EventTheme
  bannerImage?: string
  backgroundColor: string
  accentColor: string
  
  // Features
  features: EventFeature[]
  rewards: EventReward[]
  bonuses: EventBonus[]
  
  // Requirements
  eligibility: EventEligibility
  
  // Progress tracking
  participantCount: number
  globalProgress?: number
  globalGoal?: number
}

export enum EventType {
  SEASONAL = 'SEASONAL',           // Christmas, Midsummer, etc.
  SPORTS_CALENDAR = 'SPORTS_CALENDAR', // World Cup, Euros, etc.
  PLATFORM_MILESTONE = 'PLATFORM_MILESTONE', // Anniversary, user milestones
  HOLIDAY = 'HOLIDAY',             // National holidays
  SPECIAL_PROMOTION = 'SPECIAL_PROMOTION', // Limited time offers
  COMMUNITY = 'COMMUNITY'          // Community challenges
}

export enum EventCategory {
  BETTING_BOOST = 'BETTING_BOOST',
  REWARD_MULTIPLIER = 'REWARD_MULTIPLIER',
  SPECIAL_CHALLENGES = 'SPECIAL_CHALLENGES',
  EXCLUSIVE_TOURNAMENT = 'EXCLUSIVE_TOURNAMENT',
  COSMETIC_UNLOCK = 'COSMETIC_UNLOCK',
  COMMUNITY_GOAL = 'COMMUNITY_GOAL'
}

export enum EventStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  ENDING_SOON = 'ENDING_SOON',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED'
}

export interface EventTheme {
  name: string
  primaryColor: string
  secondaryColor: string
  backgroundPattern?: string
  iconSet: {
    main: string
    secondary: string
    accent: string
  }
  soundEffects?: {
    success: string
    notification: string
    ambient?: string
  }
}

export interface EventFeature {
  type: 'ODDS_BOOST' | 'FREE_BETS' | 'BONUS_CURRENCY' | 'SPECIAL_MARKET' | 'EXCLUSIVE_CHALLENGES'
  name: string
  description: string
  value: number
  duration?: number // hours
  conditions?: string[]
  isActive: boolean
}

export interface EventReward {
  id: string
  name: string
  description: string
  type: 'CURRENCY' | 'COSMETIC' | 'BOOST' | 'TITLE' | 'BADGE'
  value: number
  currency?: 'BETPOINTS' | 'DIAMONDS'
  requirement: EventRequirement
  isExclusive: boolean
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
}

export interface EventBonus {
  type: 'XP_MULTIPLIER' | 'REWARD_MULTIPLIER' | 'STREAK_PROTECTION' | 'ENHANCED_ODDS'
  multiplier: number
  description: string
  conditions: string[]
  duration: number // hours
}

export interface EventRequirement {
  type: 'BET_COUNT' | 'WIN_COUNT' | 'SPEND_AMOUNT' | 'LOGIN_STREAK' | 'COMMUNITY_PARTICIPATION'
  target: number
  timeframe?: number // hours
  conditions?: Record<string, any>
}

export interface EventEligibility {
  minLevel: number
  maxLevel?: number
  requiresVerification: boolean
  regionRestrictions?: string[]
  firstTimeOnly?: boolean
}

// Predefined event themes
export const EVENT_THEMES: Record<string, EventTheme> = {
  CHRISTMAS: {
    name: 'Joulukauden Ihme',
    primaryColor: '#DC2626',
    secondaryColor: '#059669',
    backgroundPattern: 'snowflakes',
    iconSet: {
      main: '🎄',
      secondary: '❄️',
      accent: '🎁'
    },
    soundEffects: {
      success: 'jingle_bells_short.mp3',
      notification: 'sleigh_bell.mp3',
      ambient: 'christmas_background.mp3'
    }
  },

  MIDSUMMER: {
    name: 'Juhannusyö',
    primaryColor: '#FCD34D',
    secondaryColor: '#3B82F6',
    backgroundPattern: 'midnight_sun',
    iconSet: {
      main: '🌞',
      secondary: '🔥',
      accent: '🌙'
    },
    soundEffects: {
      success: 'summer_chime.mp3',
      notification: 'birdsong.mp3'
    }
  },

  WORLD_CUP: {
    name: 'Maailmanmestaruus',
    primaryColor: '#FFD700',
    secondaryColor: '#1E40AF',
    backgroundPattern: 'football_pattern',
    iconSet: {
      main: '🏆',
      secondary: '⚽',
      accent: '🌍'
    },
    soundEffects: {
      success: 'stadium_cheer.mp3',
      notification: 'whistle.mp3',
      ambient: 'crowd_background.mp3'
    }
  },

  ANNIVERSARY: {
    name: 'Vuosipäivä',
    primaryColor: '#8B5CF6',
    secondaryColor: '#F59E0B',
    backgroundPattern: 'celebration',
    iconSet: {
      main: '🎉',
      secondary: '⭐',
      accent: '💎'
    },
    soundEffects: {
      success: 'fanfare.mp3',
      notification: 'celebration.mp3'
    }
  },

  INDEPENDENCE_DAY: {
    name: 'Itsenäisyyspäivä',
    primaryColor: '#1E40AF',
    secondaryColor: '#FFFFFF',
    backgroundPattern: 'finnish_flag',
    iconSet: {
      main: '🇫🇮',
      secondary: '🕯️',
      accent: '❄️'
    },
    soundEffects: {
      success: 'patriotic_fanfare.mp3',
      notification: 'bell_chime.mp3'
    }
  }
}

// Event templates for automatic generation
export const EVENT_TEMPLATES = {
  CHRISTMAS_2024: {
    name: 'Joulukauden Mega-arpajaiset',
    description: 'Voita joulupukki-arvonnassa! Massiiviset palkinnot joka päivä.',
    type: EventType.SEASONAL,
    category: EventCategory.SPECIAL_CHALLENGES,
    theme: EVENT_THEMES.CHRISTMAS,
    duration: 14, // days
    features: [
      {
        type: 'ODDS_BOOST' as const,
        name: 'Joulun Kertoimet',
        description: '25% korotus kaikkiin kertoimiin',
        value: 25,
        duration: 24 * 14,
        conditions: ['Min odds 1.5'],
        isActive: true
      },
      {
        type: 'FREE_BETS' as const,
        name: 'Päivittäinen Lahja',
        description: 'Ilmainen 100 BP veto joka päivä',
        value: 100,
        duration: 24,
        conditions: ['Daily login required'],
        isActive: true
      }
    ],
    rewards: [
      {
        id: 'christmas_title',
        name: 'Joulupukki',
        description: 'Exclusive Christmas title',
        type: 'TITLE' as const,
        value: 1,
        requirement: {
          type: 'WIN_COUNT' as const,
          target: 25,
          timeframe: 14 * 24
        },
        isExclusive: true,
        rarity: 'LEGENDARY' as const
      },
      {
        id: 'christmas_diamonds',
        name: 'Joulukimallus',
        description: '500 exclusive Christmas diamonds',
        type: 'CURRENCY' as const,
        value: 500,
        currency: 'DIAMONDS' as const,
        requirement: {
          type: 'LOGIN_STREAK' as const,
          target: 14
        },
        isExclusive: true,
        rarity: 'EPIC' as const
      }
    ],
    eligibility: {
      minLevel: 1,
      requiresVerification: false
    }
  },

  WORLD_CUP_SPECIAL: {
    name: 'Maailmanmestaruus Kisat',
    description: 'Seuraa MM-kisoja ja voita upeita palkintoja!',
    type: EventType.SPORTS_CALENDAR,
    category: EventCategory.EXCLUSIVE_TOURNAMENT,
    theme: EVENT_THEMES.WORLD_CUP,
    duration: 28, // days
    features: [
      {
        type: 'SPECIAL_MARKET' as const,
        name: 'MM-erikoisvedot',
        description: 'Exclusive World Cup betting markets',
        value: 1,
        isActive: true,
        conditions: ['World Cup matches only']
      },
      {
        type: 'BONUS_CURRENCY' as const,
        name: 'MM-kultakolikot',
        description: 'Earn special World Cup coins',
        value: 10,
        isActive: true,
        conditions: ['Win World Cup bets']
      }
    ],
    rewards: [
      {
        id: 'world_cup_champion',
        name: 'MM-mestari',
        description: 'World Cup prediction champion badge',
        type: 'BADGE' as const,
        value: 1,
        requirement: {
          type: 'WIN_COUNT' as const,
          target: 50,
          conditions: { worldCupOnly: true }
        },
        isExclusive: true,
        rarity: 'LEGENDARY' as const
      }
    ],
    eligibility: {
      minLevel: 3,
      requiresVerification: true
    }
  },

  MIDSUMMER_CELEBRATION: {
    name: 'Juhannusjuhla',
    description: 'Celebrate the bright Nordic summer with special rewards!',
    type: EventType.SEASONAL,
    category: EventCategory.REWARD_MULTIPLIER,
    theme: EVENT_THEMES.MIDSUMMER,
    duration: 7, // days
    features: [
      {
        type: 'ODDS_BOOST' as const,
        name: 'Keskiyön Aurinko',
        description: 'Double XP during midnight sun hours (20:00-04:00)',
        value: 100,
        duration: 8,
        conditions: ['Active between 20:00-04:00'],
        isActive: true
      }
    ],
    bonuses: [
      {
        type: 'XP_MULTIPLIER' as const,
        multiplier: 2.0,
        description: 'Double XP during event',
        conditions: ['All bets qualify'],
        duration: 7 * 24
      }
    ],
    eligibility: {
      minLevel: 1,
      requiresVerification: false,
      regionRestrictions: ['Finland', 'Sweden', 'Norway']
    }
  }
}

export class SpecialEventsService {
  
  static async getActiveEvents(): Promise<SpecialEvent[]> {
    const now = new Date()
    
    // Check for seasonal events
    const seasonalEvents = this.generateSeasonalEvents(now)
    
    // Check for sports calendar events
    const sportsEvents = this.generateSportsCalendarEvents(now)
    
    // Combine all events
    const allEvents = [...seasonalEvents, ...sportsEvents]
    
    // Filter active events
    return allEvents.filter(event => 
      event.startDate <= now && event.endDate >= now
    )
  }

  static async getUserEventProgress(userId: string, eventId: string): Promise<{
    participation: boolean
    progress: Record<string, number>
    claimedRewards: string[]
    currentTier: number
  }> {
    // Get user's progress in specific event
    // Implementation would query database
    return {
      participation: true,
      progress: {},
      claimedRewards: [],
      currentTier: 1
    }
  }

  static async participateInEvent(userId: string, eventId: string): Promise<{
    success: boolean
    message: string
    event?: SpecialEvent
  }> {
    const event = await this.getEventById(eventId)
    
    if (!event) {
      return { success: false, message: 'Event not found' }
    }

    if (event.status !== EventStatus.ACTIVE) {
      return { success: false, message: 'Event is not active' }
    }

    // Check user eligibility
    const isEligible = await this.checkUserEligibility(userId, event.eligibility)
    
    if (!isEligible) {
      return { success: false, message: 'User not eligible for this event' }
    }

    // Register user for event
    await this.registerUserForEvent(userId, eventId)

    return { 
      success: true, 
      message: 'Successfully joined event!',
      event 
    }
  }

  static async updateEventProgress(
    userId: string, 
    eventId: string, 
    action: string, 
    context: any
  ): Promise<void> {
    // Update user's progress in event based on action
    const event = await this.getEventById(eventId)
    
    if (!event || event.status !== EventStatus.ACTIVE) {
      return
    }

    // Process action based on event rewards requirements
    for (const reward of event.rewards) {
      await this.checkRewardProgress(userId, eventId, reward, action, context)
    }
  }

  static async claimEventReward(
    userId: string, 
    eventId: string, 
    rewardId: string
  ): Promise<{
    success: boolean
    message: string
    reward?: EventReward
  }> {
    const event = await this.getEventById(eventId)
    
    if (!event) {
      return { success: false, message: 'Event not found' }
    }

    const reward = event.rewards.find(r => r.id === rewardId)
    
    if (!reward) {
      return { success: false, message: 'Reward not found' }
    }

    // Check if user has completed requirement
    const hasCompleted = await this.checkRewardCompletion(userId, eventId, reward)
    
    if (!hasCompleted) {
      return { success: false, message: 'Reward requirements not met' }
    }

    // Check if already claimed
    const alreadyClaimed = await this.isRewardClaimed(userId, eventId, rewardId)
    
    if (alreadyClaimed) {
      return { success: false, message: 'Reward already claimed' }
    }

    // Award the reward
    await this.awardEventReward(userId, reward)
    await this.markRewardClaimed(userId, eventId, rewardId)

    return { 
      success: true, 
      message: 'Reward claimed successfully!',
      reward 
    }
  }

  private static generateSeasonalEvents(date: Date): SpecialEvent[] {
    const events: SpecialEvent[] = []
    const month = date.getMonth()
    const day = date.getDate()

    // Christmas event (December)
    if (month === 11) {
      const template = EVENT_TEMPLATES.CHRISTMAS_2024
      events.push(this.createEventFromTemplate(template, new Date(date.getFullYear(), 11, 10), 14))
    }

    // Midsummer event (June)
    if (month === 5 && day >= 15) {
      const template = EVENT_TEMPLATES.MIDSUMMER_CELEBRATION
      events.push(this.createEventFromTemplate(template, new Date(date.getFullYear(), 5, 18), 7))
    }

    return events
  }

  private static generateSportsCalendarEvents(date: Date): SpecialEvent[] {
    // Check for major sports events
    // Implementation would check against sports calendar
    return []
  }

  private static createEventFromTemplate(template: any, startDate: Date, durationDays: number): SpecialEvent {
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + durationDays)

    return {
      id: `${template.type}_${startDate.getFullYear()}_${startDate.getMonth()}`,
      name: template.name,
      description: template.description,
      type: template.type,
      category: template.category,
      status: EventStatus.ACTIVE,
      startDate,
      endDate,
      theme: template.theme,
      backgroundColor: template.theme.primaryColor,
      accentColor: template.theme.secondaryColor,
      features: template.features || [],
      rewards: template.rewards || [],
      bonuses: template.bonuses || [],
      eligibility: template.eligibility,
      participantCount: Math.floor(Math.random() * 1000) + 100 // Simulated
    }
  }

  private static async getEventById(eventId: string): Promise<SpecialEvent | null> {
    const activeEvents = await this.getActiveEvents()
    return activeEvents.find(e => e.id === eventId) || null
  }

  private static async checkUserEligibility(userId: string, eligibility: EventEligibility): Promise<boolean> {
    // Implementation would check user level, verification status, etc.
    return true
  }

  private static async registerUserForEvent(userId: string, eventId: string): Promise<void> {
    // Implementation would add user to event participants table
    console.log('Registering user for event:', userId, eventId)
  }

  private static async checkRewardProgress(
    userId: string,
    eventId: string,
    reward: EventReward,
    action: string,
    context: any
  ): Promise<void> {
    // Implementation would update progress towards reward requirement
    console.log('Checking reward progress:', userId, eventId, reward.id, action)
  }

  private static async checkRewardCompletion(
    userId: string,
    eventId: string,
    reward: EventReward
  ): Promise<boolean> {
    // Implementation would check if user has met reward requirements
    return true
  }

  private static async isRewardClaimed(
    userId: string,
    eventId: string,
    rewardId: string
  ): Promise<boolean> {
    // Implementation would check if reward has been claimed
    return false
  }

  private static async awardEventReward(userId: string, reward: EventReward): Promise<void> {
    // Implementation would award the reward to user
    console.log('Awarding event reward:', userId, reward)
  }

  private static async markRewardClaimed(
    userId: string,
    eventId: string,
    rewardId: string
  ): Promise<void> {
    // Implementation would mark reward as claimed
    console.log('Marking reward claimed:', userId, eventId, rewardId)
  }
}

// Utility functions for UI
export function getEventStatusColor(status: EventStatus): string {
  const colors = {
    [EventStatus.UPCOMING]: '#6B7280',
    [EventStatus.ACTIVE]: '#10B981',
    [EventStatus.ENDING_SOON]: '#F59E0B',
    [EventStatus.FINISHED]: '#8B5CF6',
    [EventStatus.CANCELLED]: '#EF4444'
  }
  return colors[status]
}

export function getEventTypeIcon(type: EventType): string {
  const icons = {
    [EventType.SEASONAL]: '🎄',
    [EventType.SPORTS_CALENDAR]: '⚽',
    [EventType.PLATFORM_MILESTONE]: '🎉',
    [EventType.HOLIDAY]: '🎊',
    [EventType.SPECIAL_PROMOTION]: '🎁',
    [EventType.COMMUNITY]: '👥'
  }
  return icons[type]
}

export function formatEventDuration(startDate: Date, endDate: Date): string {
  const now = new Date()
  const diffMs = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays < 1) {
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
    return `${diffHours}h left`
  }
  
  return `${diffDays} days left`
}

export function getRarityColor(rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'): string {
  const colors = {
    COMMON: '#9CA3AF',
    RARE: '#3B82F6',
    EPIC: '#8B5CF6',
    LEGENDARY: '#F59E0B'
  }
  return colors[rarity]
}