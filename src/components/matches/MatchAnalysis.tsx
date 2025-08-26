'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Users, Target, Shield, Calendar, Award, AlertCircle } from 'lucide-react'

interface TeamForm {
  team: string
  lastMatches: FormMatch[]
  stats: {
    wins: number
    draws: number
    losses: number
    goalsFor: number
    goalsAgainst: number
    cleanSheets: number
    btts: number
    avgGoalsScored: number
    avgGoalsConceded: number
  }
}

interface FormMatch {
  date: string
  opponent: string
  result: 'W' | 'D' | 'L'
  score: string
  home: boolean
  competition: string
}

interface HeadToHead {
  totalMatches: number
  homeWins: number
  draws: number
  awayWins: number
  totalGoals: number
  avgGoals: number
  lastMeetings: H2HMatch[]
}

interface H2HMatch {
  date: string
  homeTeam: string
  awayTeam: string
  score: string
  competition: string
  venue: string
}

interface KeyStats {
  title: string
  homeValue: string | number
  awayValue: string | number
  comparison: 'higher-better' | 'lower-better' | 'neutral'
}

interface MatchAnalysisProps {
  matchId: string
  homeTeam: string
  awayTeam: string
  league: string
  matchDate: string
}

export default function MatchAnalysis({ matchId, homeTeam, awayTeam, league, matchDate }: MatchAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'h2h' | 'stats' | 'predictions'>('form')

  // Mock data - would be fetched from API
  const homeForm: TeamForm = {
    team: homeTeam,
    lastMatches: [
      { date: '2025-01-20', opponent: 'FC Inter', result: 'W', score: '2-1', home: true, competition: league },
      { date: '2025-01-13', opponent: 'KuPS', result: 'D', score: '1-1', home: false, competition: league },
      { date: '2025-01-06', opponent: 'Ilves', result: 'W', score: '3-0', home: true, competition: league },
      { date: '2024-12-22', opponent: 'HIFK', result: 'L', score: '0-1', home: false, competition: league },
      { date: '2024-12-15', opponent: 'SJK', result: 'W', score: '2-0', home: true, competition: league }
    ],
    stats: {
      wins: 3,
      draws: 1,
      losses: 1,
      goalsFor: 8,
      goalsAgainst: 3,
      cleanSheets: 2,
      btts: 2,
      avgGoalsScored: 1.6,
      avgGoalsConceded: 0.6
    }
  }

  const awayForm: TeamForm = {
    team: awayTeam,
    lastMatches: [
      { date: '2025-01-19', opponent: 'Mariehamn', result: 'W', score: '1-0', home: false, competition: league },
      { date: '2025-01-12', opponent: 'VPS', result: 'W', score: '2-1', home: true, competition: league },
      { date: '2025-01-05', opponent: 'AC Oulu', result: 'L', score: '1-3', home: false, competition: league },
      { date: '2024-12-21', opponent: 'Honka', result: 'D', score: '2-2', home: true, competition: league },
      { date: '2024-12-14', opponent: 'Lahti', result: 'L', score: '0-2', home: false, competition: league }
    ],
    stats: {
      wins: 2,
      draws: 1,
      losses: 2,
      goalsFor: 6,
      goalsAgainst: 8,
      cleanSheets: 1,
      btts: 3,
      avgGoalsScored: 1.2,
      avgGoalsConceded: 1.6
    }
  }

  const headToHead: HeadToHead = {
    totalMatches: 15,
    homeWins: 7,
    draws: 3,
    awayWins: 5,
    totalGoals: 42,
    avgGoals: 2.8,
    lastMeetings: [
      { date: '2024-10-15', homeTeam, awayTeam, score: '2-1', competition: league, venue: 'Home Stadium' },
      { date: '2024-07-20', homeTeam: awayTeam, awayTeam: homeTeam, score: '1-1', competition: league, venue: 'Away Stadium' },
      { date: '2024-04-10', homeTeam, awayTeam, score: '3-2', competition: league, venue: 'Home Stadium' },
      { date: '2023-11-28', homeTeam: awayTeam, awayTeam: homeTeam, score: '0-0', competition: 'Cup', venue: 'Away Stadium' },
      { date: '2023-09-15', homeTeam, awayTeam, score: '1-2', competition: league, venue: 'Home Stadium' }
    ]
  }

  const keyStats: KeyStats[] = [
    { title: 'League Position', homeValue: '3rd', awayValue: '7th', comparison: 'lower-better' },
    { title: 'Points Per Game', homeValue: '1.8', awayValue: '1.3', comparison: 'higher-better' },
    { title: 'Goals Per Game', homeValue: '1.9', awayValue: '1.4', comparison: 'higher-better' },
    { title: 'Goals Conceded', homeValue: '0.8', awayValue: '1.5', comparison: 'lower-better' },
    { title: 'Clean Sheets', homeValue: '40%', awayValue: '20%', comparison: 'higher-better' },
    { title: 'BTTS %', homeValue: '55%', awayValue: '65%', comparison: 'neutral' },
    { title: 'Possession Avg', homeValue: '52%', awayValue: '48%', comparison: 'higher-better' },
    { title: 'Shots Per Game', homeValue: '14.2', awayValue: '11.8', comparison: 'higher-better' }
  ]

  const predictions = {
    outcome: {
      home: 48,
      draw: 27,
      away: 25
    },
    goals: {
      over25: 62,
      under25: 38,
      btts: 58
    },
    corners: {
      over10: 45,
      under10: 55
    },
    recommendedBets: [
      { market: 'Home Win', odds: 2.10, confidence: 'High', reason: 'Strong home form and H2H record' },
      { market: 'Over 2.5 Goals', odds: 1.85, confidence: 'Medium', reason: 'High scoring H2H history' },
      { market: 'BTTS Yes', odds: 1.75, confidence: 'Medium', reason: 'Both teams scoring regularly' }
    ]
  }

  const getFormIcon = (result: 'W' | 'D' | 'L') => {
    switch (result) {
      case 'W': return <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">W</div>
      case 'D': return <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">D</div>
      case 'L': return <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">L</div>
    }
  }

  const getStatComparison = (homeVal: string | number, awayVal: string | number, comparison: string) => {
    const homeNum = parseFloat(homeVal.toString())
    const awayNum = parseFloat(awayVal.toString())
    
    if (isNaN(homeNum) || isNaN(awayNum)) return 'neutral'
    
    if (comparison === 'higher-better') {
      if (homeNum > awayNum) return 'home'
      if (awayNum > homeNum) return 'away'
    } else if (comparison === 'lower-better') {
      if (homeNum < awayNum) return 'home'
      if (awayNum < homeNum) return 'away'
    }
    return 'neutral'
  }

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <h3 className="text-xl font-bold">{homeTeam}</h3>
            <p className="text-sm text-gray-600">Home</p>
          </div>
          <div className="px-6">
            <div className="text-2xl font-bold text-gray-400">VS</div>
            <p className="text-xs text-gray-500 mt-1">{new Date(matchDate).toLocaleDateString()}</p>
          </div>
          <div className="text-center flex-1">
            <h3 className="text-xl font-bold">{awayTeam}</h3>
            <p className="text-sm text-gray-600">Away</p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 border-t pt-4">
          {[
            { id: 'form', label: 'Form', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'h2h', label: 'Head to Head', icon: <Users className="w-4 h-4" /> },
            { id: 'stats', label: 'Statistics', icon: <Target className="w-4 h-4" /> },
            { id: 'predictions', label: 'Predictions', icon: <Award className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Tab */}
      {activeTab === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Home Team Form */}
          <div className="glass-card p-6">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              {homeTeam} - Recent Form
            </h4>
            
            <div className="flex gap-1 mb-4">
              {homeForm.lastMatches.map((match, idx) => (
                <div key={idx} className="group relative">
                  {getFormIcon(match.result)}
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {match.score} vs {match.opponent}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Win Rate</span>
                <span className="font-medium">{(homeForm.stats.wins / 5 * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Goals Scored</span>
                <span className="font-medium">{homeForm.stats.avgGoalsScored}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Goals Conceded</span>
                <span className="font-medium">{homeForm.stats.avgGoalsConceded}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Clean Sheets</span>
                <span className="font-medium">{homeForm.stats.cleanSheets}/5</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h5 className="text-sm font-medium mb-2">Last 5 Matches</h5>
              <div className="space-y-2">
                {homeForm.lastMatches.map((match, idx) => (
                  <div key={idx} className="text-xs flex justify-between">
                    <span className="text-gray-600">{match.date.split('-').slice(1).join('/')}</span>
                    <span>{match.home ? 'H' : 'A'}</span>
                    <span className="font-medium">{match.opponent}</span>
                    <span className={`font-bold ${
                      match.result === 'W' ? 'text-green-600' : 
                      match.result === 'L' ? 'text-red-600' : 'text-gray-600'
                    }`}>{match.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Away Team Form */}
          <div className="glass-card p-6">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              {awayTeam} - Recent Form
            </h4>
            
            <div className="flex gap-1 mb-4">
              {awayForm.lastMatches.map((match, idx) => (
                <div key={idx} className="group relative">
                  {getFormIcon(match.result)}
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {match.score} vs {match.opponent}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Win Rate</span>
                <span className="font-medium">{(awayForm.stats.wins / 5 * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Goals Scored</span>
                <span className="font-medium">{awayForm.stats.avgGoalsScored}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Goals Conceded</span>
                <span className="font-medium">{awayForm.stats.avgGoalsConceded}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Clean Sheets</span>
                <span className="font-medium">{awayForm.stats.cleanSheets}/5</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h5 className="text-sm font-medium mb-2">Last 5 Matches</h5>
              <div className="space-y-2">
                {awayForm.lastMatches.map((match, idx) => (
                  <div key={idx} className="text-xs flex justify-between">
                    <span className="text-gray-600">{match.date.split('-').slice(1).join('/')}</span>
                    <span>{match.home ? 'H' : 'A'}</span>
                    <span className="font-medium">{match.opponent}</span>
                    <span className={`font-bold ${
                      match.result === 'W' ? 'text-green-600' : 
                      match.result === 'L' ? 'text-red-600' : 'text-gray-600'
                    }`}>{match.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Head to Head Tab */}
      {activeTab === 'h2h' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h4 className="font-bold mb-4">Overall Head to Head Record</h4>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{headToHead.homeWins}</div>
                <div className="text-sm text-gray-600">{homeTeam} Wins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{headToHead.draws}</div>
                <div className="text-sm text-gray-600">Draws</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{headToHead.awayWins}</div>
                <div className="text-sm text-gray-600">{awayTeam} Wins</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
              <div>
                <span className="text-sm text-gray-600">Total Matches</span>
                <p className="font-bold">{headToHead.totalMatches}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Avg Goals Per Match</span>
                <p className="font-bold">{headToHead.avgGoals}</p>
              </div>
            </div>

            <h5 className="font-medium mb-3">Last 5 Meetings</h5>
            <div className="space-y-2">
              {headToHead.lastMeetings.map((match, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{match.date}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${match.homeTeam === homeTeam ? 'text-blue-600' : ''}`}>
                      {match.homeTeam}
                    </span>
                    <span className="font-bold px-2 py-1 bg-white rounded">
                      {match.score}
                    </span>
                    <span className={`font-medium ${match.awayTeam === awayTeam ? 'text-red-600' : ''}`}>
                      {match.awayTeam}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{match.competition}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="glass-card p-6">
          <h4 className="font-bold mb-4">Key Statistics Comparison</h4>
          
          <div className="space-y-3">
            {keyStats.map((stat, idx) => {
              const winner = getStatComparison(stat.homeValue, stat.awayValue, stat.comparison)
              return (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className={`flex-1 text-right ${winner === 'home' ? 'font-bold text-blue-600' : ''}`}>
                    {stat.homeValue}
                  </div>
                  <div className="px-4 text-center">
                    <div className="text-sm font-medium">{stat.title}</div>
                  </div>
                  <div className={`flex-1 text-left ${winner === 'away' ? 'font-bold text-red-600' : ''}`}>
                    {stat.awayValue}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Match Predictions
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <h5 className="text-sm font-medium mb-3">Match Outcome</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{homeTeam}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${predictions.outcome.home}%` }} />
                      </div>
                      <span className="text-sm font-bold">{predictions.outcome.home}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Draw</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-600 h-2 rounded-full" style={{ width: `${predictions.outcome.draw}%` }} />
                      </div>
                      <span className="text-sm font-bold">{predictions.outcome.draw}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>{awayTeam}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full" style={{ width: `${predictions.outcome.away}%` }} />
                      </div>
                      <span className="text-sm font-bold">{predictions.outcome.away}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium mb-3">Goals</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Over 2.5</span>
                    <span className="font-bold">{predictions.goals.over25}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Under 2.5</span>
                    <span className="font-bold">{predictions.goals.under25}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BTTS</span>
                    <span className="font-bold">{predictions.goals.btts}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium mb-3">Corners</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Over 10.5</span>
                    <span className="font-bold">{predictions.corners.over10}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Under 10.5</span>
                    <span className="font-bold">{predictions.corners.under10}%</span>
                  </div>
                </div>
              </div>
            </div>

            <h5 className="font-medium mb-3">Recommended Bets</h5>
            <div className="space-y-2">
              {predictions.recommendedBets.map((bet, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{bet.market}</div>
                    <div className="text-sm text-gray-600">{bet.reason}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">@{bet.odds}</div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      bet.confidence === 'High' ? 'bg-green-600 text-white' :
                      bet.confidence === 'Medium' ? 'bg-yellow-500 text-white' :
                      'bg-gray-400 text-white'
                    }`}>
                      {bet.confidence}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4 bg-yellow-50 border border-yellow-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Disclaimer</p>
                <p>These predictions are based on statistical analysis and should be used for entertainment purposes only. 
                   Always bet responsibly and within your limits.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}