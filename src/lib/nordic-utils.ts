import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Nordic locales
export const nordicLocales = {
  finnish: 'fi-FI',
  swedish: 'sv-SE',
  english: 'en-US'
} as const;

export type NordicLocale = keyof typeof nordicLocales;
export type Currency = 'EUR' | 'SEK' | 'BetPoints' | 'Diamonds';

// Nordic terminology system
export const terminology = {
  finnish: {
    // Betting terms
    bet: 'veto',
    odds: 'kertoimet',
    stake: 'panos',
    winnings: 'voitto',
    balance: 'saldo',
    place_bet: 'Aseta veto',
    cancel_bet: 'Peruuta veto',
    confirm_bet: 'Vahvista veto',
    
    // Match terms
    match: 'ottelu',
    live_match: 'live-ottelu',
    league: 'sarja',
    team: 'joukkue',
    goal: 'maali',
    
    // Time periods
    first_half: '1. puoliaika',
    second_half: '2. puoliaika',
    full_time: 'kokopeli',
    
    // Match results
    home_win: 'Kotijoukkue voittaa',
    draw: 'Tasapeli',
    away_win: 'Vierasjoukkue voittaa',
    
    // Enhanced features
    enhanced_odds: 'Korotetut kertoimet',
    diamond_boost: 'Timantti boost',
    live_betting: 'Live-veto',
    
    // UI elements
    loading: 'Ladataan...',
    finnish_leagues: 'Suomen sarjat',
    search: 'Haku',
    filter: 'Suodata',
    
    // Currency
    betpoints: 'VetoPisteet',
    diamonds: 'Timantit',
    
    // Countries
    finland: 'Suomi',
    sweden: 'Ruotsi',
  },
  
  swedish: {
    // Betting terms
    bet: 'spel',
    odds: 'odds',
    stake: 'insats',
    winnings: 'vinst',
    balance: 'saldo',
    place_bet: 'Placera spel',
    cancel_bet: 'Avbryt spel',
    confirm_bet: 'Bekräfta spel',
    
    // Match terms
    match: 'match',
    live_match: 'live match',
    league: 'liga',
    team: 'lag',
    goal: 'mål',
    
    // Time periods
    first_half: '1:a halvlek',
    second_half: '2:a halvlek',
    full_time: 'slutresultat',
    
    // Match results
    home_win: 'Hemmaseger',
    draw: 'Oavgjort',
    away_win: 'Bortaseger',
    
    // Enhanced features
    enhanced_odds: 'Förbättrade odds',
    diamond_boost: 'Diamant boost',
    live_betting: 'Live betting',
    
    // UI elements
    loading: 'Laddar...',
    swedish_leagues: 'Svenska ligor',
    search: 'Sök',
    filter: 'Filtrera',
    
    // Currency
    betpoints: 'SpelPoäng',
    diamonds: 'Diamanter',
    
    // Countries
    finland: 'Finland',
    sweden: 'Sverige',
  },
  
  english: {
    // Betting terms
    bet: 'bet',
    odds: 'odds',
    stake: 'stake',
    winnings: 'winnings',
    balance: 'balance',
    place_bet: 'Place Bet',
    cancel_bet: 'Cancel Bet',
    confirm_bet: 'Confirm Bet',
    
    // Match terms
    match: 'match',
    live_match: 'live match',
    league: 'league',
    team: 'team',
    goal: 'goal',
    
    // Time periods
    first_half: '1st Half',
    second_half: '2nd Half',
    full_time: 'Full Time',
    
    // Match results
    home_win: 'Home Win',
    draw: 'Draw',
    away_win: 'Away Win',
    
    // Enhanced features
    enhanced_odds: 'Enhanced Odds',
    diamond_boost: 'Diamond Boost',
    live_betting: 'Live Betting',
    
    // UI elements
    loading: 'Loading...',
    nordic_leagues: 'Nordic Leagues',
    search: 'Search',
    filter: 'Filter',
    
    // Currency
    betpoints: 'BetPoints',
    diamonds: 'Diamonds',
    
    // Countries
    finland: 'Finland',
    sweden: 'Sweden',
  }
} as const;

// Date and time formatting for Nordic countries
export function formatNordicDate(date: Date, locale: NordicLocale = 'english'): string {
  const localeString = nordicLocales[locale];
  return new Intl.DateTimeFormat(localeString, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export function formatNordicTime(date: Date, locale: NordicLocale = 'english'): string {
  const localeString = nordicLocales[locale];
  return new Intl.DateTimeFormat(localeString, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatNordicDateTime(date: Date, locale: NordicLocale = 'english'): string {
  const localeString = nordicLocales[locale];
  return new Intl.DateTimeFormat(localeString, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Currency formatting for Nordic markets
export function formatNordicCurrency(
  amount: number, 
  currency: Currency = 'EUR', 
  locale: NordicLocale = 'english'
): string {
  const localeString = nordicLocales[locale];
  
  if (currency === 'BetPoints') {
    const formatted = new Intl.NumberFormat(localeString).format(amount);
    const suffix = locale === 'finnish' ? ' VP' : locale === 'swedish' ? ' SP' : ' BP';
    return formatted + suffix;
  }
  
  if (currency === 'Diamonds') {
    const formatted = new Intl.NumberFormat(localeString).format(amount);
    return formatted + ' 💎';
  }
  
  // Handle EUR and SEK
  const currencyCode = currency;
  return new Intl.NumberFormat(localeString, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: currency === 'SEK' ? 0 : 2,
    maximumFractionDigits: currency === 'SEK' ? 0 : 2,
  }).format(amount);
}

// Odds formatting
export function formatOdds(odds: number, format: 'decimal' | 'fractional' = 'decimal'): string {
  if (format === 'decimal') {
    return odds.toFixed(2);
  }
  
  // Convert decimal to fractional (simplified)
  const fractional = odds - 1;
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const denominator = 100;
  const numerator = Math.round(fractional * denominator);
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
}

// Enhanced odds calculation
export function calculateEnhancedOdds(originalOdds: number, enhancementLevel: 1 | 2 | 3 | 5 = 1): number {
  const enhancements = {
    1: 1.15, // 15% boost
    2: 1.30, // 30% boost
    3: 1.50, // 50% boost
    5: 2.00  // 100% boost (premium)
  };
  
  const enhancement = enhancements[enhancementLevel];
  const enhancedOdds = originalOdds * enhancement;
  
  // Ensure enhanced odds don't go below 1.01
  return Math.max(1.01, enhancedOdds);
}

// Get enhanced odds with F2P multiplier (1.5x to 2.1x)
export function getEnhancedOdds(originalOdds: number): number {
  // F2P enhancement: 1.5x to 2.1x based on odds range
  let multiplier = 1.5;
  
  if (originalOdds <= 1.50) {
    multiplier = 2.1; // Highest boost for low odds
  } else if (originalOdds <= 2.00) {
    multiplier = 1.9;
  } else if (originalOdds <= 3.00) {
    multiplier = 1.7;
  } else if (originalOdds <= 5.00) {
    multiplier = 1.6;
  } else {
    multiplier = 1.5; // Standard boost for high odds
  }
  
  return originalOdds * multiplier;
}

// Betting calculations
export function calculatePotentialWinnings(stake: number, odds: number): number {
  return stake * odds;
}

export function calculateProfit(stake: number, odds: number): number {
  return (stake * odds) - stake;
}

// Diamond boost calculations
export function calculateDiamondCost(enhancementLevel: 1 | 2 | 3 | 5): number {
  const costs = {
    1: 5,   // 5 diamonds for 15% boost
    2: 15,  // 15 diamonds for 30% boost
    3: 30,  // 30 diamonds for 50% boost
    5: 75   // 75 diamonds for 100% boost
  };
  
  return costs[enhancementLevel];
}

// Nordic team data
export const nordicTeams = {
  // Finnish teams
  finnish: {
    'HJK': 'HJK Helsinki',
    'KuPS': 'KuPS Kuopio',
    'Inter': 'FC Inter Turku',
    'Honka': 'FC Honka Espoo',
    'Lahti': 'FC Lahti',
    'Mariehamn': 'IFK Mariehamn',
    'SJK': 'SJK Seinäjoki',
    'Haka': 'FC Haka Valkeakoski',
    'Ilves': 'Tampereen Ilves',
    'VPS': 'VPS Vaasa',
    'HIFK': 'HIFK Helsinki',
    'Gnistan': 'IF Gnistan Helsinki'
  },
  
  // Swedish teams
  swedish: {
    'AIK': 'AIK Stockholm',
    'Djurgården': 'Djurgårdens IF',
    'Hammarby': 'Hammarby IF',
    'Malmö': 'Malmö FF',
    'Göteborg': 'IFK Göteborg',
    'Elfsborg': 'IF Elfsborg',
    'Häcken': 'BK Häcken',
    'Kalmar': 'Kalmar FF',
    'Norrköping': 'IFK Norrköping',
    'Sirius': 'IK Sirius FK',
    'Varberg': 'Varbergs BoIS',
    'Degerfors': 'Degerfors IF'
  }
} as const;

export function getFullTeamName(shortName: string, country: 'finnish' | 'swedish'): string {
  const teams = nordicTeams[country];
  return teams[shortName as keyof typeof teams] || shortName;
}

// League information
export const nordicLeagues = {
  finnish: [
    { id: 'veikkausliiga', name: 'Veikkausliiga', tier: 1, teams: 12, matches: 216 },
    { id: 'ykkosliiga', name: 'Ykkösliiga', tier: 2, teams: 10, matches: 135 },
    { id: 'ykkonen', name: 'Ykkönen', tier: 3, teams: 10, matches: 135 }
  ],
  swedish: [
    { id: 'allsvenskan', name: 'Allsvenskan', tier: 1, teams: 16, matches: 240 },
    { id: 'superettan', name: 'Superettan', tier: 2, teams: 16, matches: 240 }
  ]
} as const;

// Derby detection
export const derbies = {
  helsinki: ['HJK', 'HIFK', 'Honka'],
  stockholm: ['AIK', 'Djurgården', 'Hammarby'],
  gothenburg: ['Göteborg', 'Häcken'],
  turku: ['Inter', 'TPS'] // TPS if added
} as const;

export function isDerbyMatch(homeTeam: string, awayTeam: string): boolean {
  return Object.values(derbies).some(derbyTeams => 
    derbyTeams.includes(homeTeam) && derbyTeams.includes(awayTeam)
  );
}

export function getDerbyType(homeTeam: string, awayTeam: string): string | null {
  for (const [city, teams] of Object.entries(derbies)) {
    if (teams.includes(homeTeam) && teams.includes(awayTeam)) {
      return city;
    }
  }
  return null;
}

// Validation utilities
export function isValidStake(stake: number, minStake: number = 1, maxStake: number = 10000): boolean {
  return stake >= minStake && stake <= maxStake && stake > 0;
}

export function isValidOdds(odds: number): boolean {
  return odds >= 1.01 && odds <= 100;
}

export function isValidDiamondAmount(amount: number, userDiamonds: number): boolean {
  return amount > 0 && amount <= userDiamonds;
}

// Country detection from team
export function getTeamCountry(teamShortName: string): 'finnish' | 'swedish' | 'unknown' {
  if (teamShortName in nordicTeams.finnish) return 'finnish';
  if (teamShortName in nordicTeams.swedish) return 'swedish';
  return 'unknown';
}

// Match classification
export type MatchType = 'regular' | 'derby' | 'international' | 'cup';

export function classifyMatch(homeTeam: string, awayTeam: string): {
  type: MatchType;
  country: 'finnish' | 'swedish' | 'mixed';
  isDerby: boolean;
  derbyType?: string;
} {
  const homeCountry = getTeamCountry(homeTeam);
  const awayCountry = getTeamCountry(awayTeam);
  const isDerby = isDerbyMatch(homeTeam, awayTeam);
  const derbyType = getDerbyType(homeTeam, awayTeam);
  
  let country: 'finnish' | 'swedish' | 'mixed';
  if (homeCountry === awayCountry && homeCountry !== 'unknown') {
    country = homeCountry;
  } else {
    country = 'mixed';
  }
  
  let type: MatchType = 'regular';
  if (isDerby) type = 'derby';
  if (homeCountry !== awayCountry && homeCountry !== 'unknown' && awayCountry !== 'unknown') {
    type = 'international';
  }
  
  return {
    type,
    country,
    isDerby,
    derbyType: derbyType || undefined
  };
}

// BetPoints package information
export const betPointsPackages = [
  { id: 'starter', amount: 5000, price: 4.99, bonus: 0, popular: false },
  { id: 'regular', amount: 15000, price: 12.99, bonus: 2000, popular: true },
  { id: 'premium', amount: 35000, price: 24.99, bonus: 7000, popular: false },
  { id: 'ultimate', amount: 75000, price: 39.99, bonus: 20000, popular: false }
] as const;

// VIP levels
export const vipLevels = [
  { level: 1, name: 'Bronze', requirement: 0, benefits: ['5% bonus on winnings'] },
  { level: 2, name: 'Silver', requirement: 10000, benefits: ['10% bonus on winnings', '+1 diamond daily'] },
  { level: 3, name: 'Gold', requirement: 50000, benefits: ['15% bonus on winnings', '+2 diamonds daily', 'Priority support'] },
  { level: 4, name: 'Platinum', requirement: 150000, benefits: ['20% bonus on winnings', '+3 diamonds daily', 'Exclusive tournaments'] },
  { level: 5, name: 'Diamond', requirement: 500000, benefits: ['25% bonus on winnings', '+5 diamonds daily', 'Personal account manager'] }
] as const;

export function getVipLevel(totalWagered: number): typeof vipLevels[number] {
  return [...vipLevels].reverse().find(level => totalWagered >= level.requirement) || vipLevels[0];
}

// Helper for generating consistent IDs
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}