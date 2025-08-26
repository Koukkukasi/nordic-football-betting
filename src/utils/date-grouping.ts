// Date grouping utilities for organizing matches

import { Match } from '@/components/matches/ExpandedMatchList'

export interface MatchGroup {
  id: string
  title: string
  subtitle?: string
  matches: Match[]
  date: Date
  isToday?: boolean
  isTomorrow?: boolean
  isThisWeek?: boolean
  isLive?: boolean
}

// Group matches by date
export function groupMatchesByDate(matches: Match[]): MatchGroup[] {
  const groups = new Map<string, MatchGroup>()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 7)
  
  matches.forEach(match => {
    const matchDate = new Date(match.date)
    const dateKey = matchDate.toDateString()
    const dayStart = new Date(matchDate)
    dayStart.setHours(0, 0, 0, 0)
    
    if (!groups.has(dateKey)) {
      const isToday = dayStart.getTime() === today.getTime()
      const isTomorrow = dayStart.getTime() === tomorrow.getTime()
      const isThisWeek = dayStart.getTime() <= weekEnd.getTime()
      
      let title = ''
      if (isToday) {
        title = 'Today'
      } else if (isTomorrow) {
        title = 'Tomorrow'
      } else {
        title = matchDate.toLocaleDateString('en-US', { 
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        })
      }
      
      groups.set(dateKey, {
        id: dateKey,
        title,
        subtitle: !isToday && !isTomorrow ? matchDate.toLocaleDateString('en-US', { year: 'numeric' }) : undefined,
        matches: [],
        date: dayStart,
        isToday,
        isTomorrow,
        isThisWeek
      })
    }
    
    groups.get(dateKey)!.matches.push(match)
  })
  
  // Sort groups by date
  const sortedGroups = Array.from(groups.values()).sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  )
  
  // Sort matches within each group by time
  sortedGroups.forEach(group => {
    group.matches.sort((a, b) => a.date.getTime() - b.date.getTime())
    
    // Check if any matches are live
    group.isLive = group.matches.some(m => m.isLive)
  })
  
  return sortedGroups
}

// Group matches by gameweek/round
export function groupMatchesByGameweek(matches: Match[]): Map<string, MatchGroup[]> {
  const leagueGroups = new Map<string, Match[]>()
  
  // First, group by league
  matches.forEach(match => {
    if (!leagueGroups.has(match.league)) {
      leagueGroups.set(match.league, [])
    }
    leagueGroups.get(match.league)!.push(match)
  })
  
  // Then group each league's matches by gameweek
  const gameweekGroups = new Map<string, MatchGroup[]>()
  
  leagueGroups.forEach((leagueMatches, leagueId) => {
    // For now, we'll group by week number
    // In real implementation, this would use actual round/gameweek data from API
    const weekGroups = new Map<number, Match[]>()
    
    leagueMatches.forEach(match => {
      const weekNumber = getWeekNumber(match.date)
      if (!weekGroups.has(weekNumber)) {
        weekGroups.set(weekNumber, [])
      }
      weekGroups.get(weekNumber)!.push(match)
    })
    
    const leagueName = leagueMatches[0]?.leagueName || leagueId
    const groups: MatchGroup[] = []
    
    weekGroups.forEach((weekMatches, weekNumber) => {
      const startDate = new Date(weekMatches[0].date)
      const endDate = new Date(weekMatches[weekMatches.length - 1].date)
      
      groups.push({
        id: `${leagueId}-week-${weekNumber}`,
        title: `Gameweek ${weekNumber}`,
        subtitle: formatDateRange(startDate, endDate),
        matches: weekMatches.sort((a, b) => a.date.getTime() - b.date.getTime()),
        date: startDate,
        isLive: weekMatches.some(m => m.isLive)
      })
    })
    
    gameweekGroups.set(leagueName, groups.sort((a, b) => a.date.getTime() - b.date.getTime()))
  })
  
  return gameweekGroups
}

// Get week number of the year
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// Format date range for display
function formatDateRange(start: Date, end: Date): string {
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const startStr = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
  const endStr = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
  
  return `${startStr} - ${endStr}`
}

// Get match time display
export function getMatchTimeDisplay(match: Match): string {
  if (match.isLive) {
    return `${match.minute}'`
  }
  
  const now = new Date()
  const matchDate = new Date(match.date)
  const diffHours = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  if (diffHours < 0) {
    return 'Finished'
  } else if (diffHours < 1) {
    const diffMinutes = Math.floor(diffHours * 60)
    return `In ${diffMinutes} min`
  } else if (diffHours < 24) {
    return matchDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else {
    return matchDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// Check if match is upcoming soon (within 1 hour)
export function isMatchUpcomingSoon(match: Match): boolean {
  if (match.isLive) return false
  
  const now = new Date()
  const matchDate = new Date(match.date)
  const diffHours = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  return diffHours > 0 && diffHours <= 1
}