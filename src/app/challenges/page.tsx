'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface League {
  id: string
  name: string
  country: string
  tier: number
}

interface Team {
  id: string
  name: string
  city: string
  league_id: string
  league: League
}

interface TableChallengeBet {
  id: string
  user_id: string
  league_id: string
  challenge_type: string
  prediction: Record<string, number> // team_id -> predicted_position
  stake: number
  diamond_reward: number
  status: string
  league: League
}

interface User {
  id: string
  bet_points: number
  diamonds: number
  level: number
  max_stake_per_bet: number
}

// Component definitions
function DailyLoginWidget({ userId }: { userId: string }) {
  return (
    <div className="nordic-card">
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--nordic-text-primary)' }}>
        Daily Login Bonus
      </h3>
      <p style={{ color: 'var(--nordic-text-secondary)' }}>Login bonus system coming soon!</p>
    </div>
  )
}

function DailyChallengesWidget({ challenges, onClaimReward }: { 
  challenges: any[]; 
  onClaimReward: (challengeId: string) => void 
}) {
  return (
    <div className="nordic-card">
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--nordic-text-primary)' }}>
        Daily Challenges
      </h3>
      <p style={{ color: 'var(--nordic-text-secondary)' }}>Daily challenges coming soon!</p>
    </div>
  )
}

// Data
const dailyChallenges: any[] = []

const tournaments = [
  {
    id: '1',
    name: 'Nordic Championship',
    description: 'Compete for the biggest prize pool',
    status: 'REGISTRATION_OPEN',
    entryFee: 500,
    entryCurrency: 'BETPOINTS',
    prizePool: {
      totalValue: 50000,
      currency: 'BETPOINTS'
    },
    currentParticipants: 142,
    maxParticipants: 200,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'Diamond League',
    description: 'Elite tournament for diamond rewards',
    status: 'ACTIVE',
    entryFee: 50,
    entryCurrency: 'DIAMONDS',
    prizePool: {
      totalValue: 1000,
      currency: 'DIAMONDS'
    },
    currentParticipants: 48,
    maxParticipants: 50,
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  }
]

// Handler function
function handleClaimChallenge(challengeId: string) {
  console.log('Claiming challenge:', challengeId)
}

export default function ChallengesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [leagues, setLeagues] = useState<League[]>([])
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [predictions, setPredictions] = useState<Record<string, number>>({})
  const [stake, setStake] = useState<number>(100)
  const [existingBets, setExistingBets] = useState<TableChallengeBet[]>([])
  const [loading, setLoading] = useState(true)
  const [liveMatches, setLiveMatches] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<'challenges' | 'tournaments' | 'sarjataulukko'>('sarjataulukko')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUserData()
    loadLeagues()
    loadExistingBets()
    checkLiveMatches()
  }, [])

  useEffect(() => {
    if (selectedLeague) {
      loadLeagueTeams()
    }
  }, [selectedLeague])

  const loadUserData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/auth/login')
      return
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('id, bet_points, diamonds, level, max_stake_per_bet')
      .eq('id', authUser.id)
      .single()

    if (userProfile) {
      setUser(userProfile)
      setStake(Math.min(100, userProfile.max_stake_per_bet))
    }
  }

  const loadLeagues = async () => {
    const { data: leagueData, error } = await supabase
      .from('leagues')
      .select('*')
      .order('country')
      .order('tier')

    if (!error && leagueData) {
      setLeagues(leagueData)
    }
  }

  const loadLeagueTeams = async () => {
    if (!selectedLeague) return

    const { data: teamData, error } = await supabase
      .from('teams')
      .select(`
        *,
        league:leagues(*)
      `)
      .eq('league_id', selectedLeague)
      .order('name')

    if (!error && teamData) {
      setTeams(teamData)
      // Initialize predictions with empty positions
      const initialPredictions: Record<string, number> = {}
      teamData.forEach((team: any) => {
        initialPredictions[team.id] = 0
      })
      setPredictions(initialPredictions)
    }
  }

  const loadExistingBets = async () => {
    if (!user) return

    const { data: bets, error } = await supabase
      .from('table_challenge_bets')
      .select(`
        *,
        league:leagues(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (!error && bets) {
      setExistingBets(bets)
    }
  }

  const checkLiveMatches = async () => {
    const { data: matches, error } = await supabase
      .from('matches')
      .select('id')
      .eq('is_live', true)

    if (!error && matches) {
      setLiveMatches(matches.length)
    }
    setLoading(false)
  }

  const updatePrediction = (teamId: string, position: number) => {
    // Check if position is already taken
    const existingTeamAtPosition = Object.entries(predictions).find(
      ([tId, pos]) => pos === position && tId !== teamId
    )

    if (existingTeamAtPosition) {
      // Swap positions
      setPredictions(prev => ({
        ...prev,
        [teamId]: position,
        [existingTeamAtPosition[0]]: prev[teamId] || 0
      }))
    } else {
      setPredictions(prev => ({
        ...prev,
        [teamId]: position
      }))
    }
  }

  const calculatePotentialDiamonds = () => {
    const validPredictions = Object.values(predictions).filter(pos => pos > 0).length
    const totalTeams = teams.length
    
    if (validPredictions < totalTeams) return 0
    
    // Base diamonds based on stake and league tier
    const selectedLeagueData = leagues.find(l => l.id === selectedLeague)
    const tierMultiplier = selectedLeagueData?.tier === 1 ? 3 : selectedLeagueData?.tier === 2 ? 2 : 1
    
    return Math.floor((stake / 10) * tierMultiplier)
  }

  const canPlaceBet = () => {
    if (!user || !selectedLeague) return false
    if (stake < 50 || stake > user.max_stake_per_bet) return false
    if (stake > user.bet_points) return false
    
    // Check if all positions are filled
    const validPredictions = Object.values(predictions).filter(pos => pos > 0).length
    if (validPredictions !== teams.length) return false

    // Check if user already has bet for this league
    const existingBet = existingBets.find(bet => bet.league_id === selectedLeague)
    return !existingBet
  }

  const placeTableChallengeBet = async () => {
    if (!canPlaceBet() || !user || !selectedLeague) return

    try {
      // Place the bet
      const betData = {
        user_id: user.id,
        league_id: selectedLeague,
        challenge_type: 'final_table',
        prediction: predictions,
        stake,
        diamond_reward: calculatePotentialDiamonds(),
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      }

      const { data: bet, error: betError } = await supabase
        .from('table_challenge_bets')
        .insert(betData)
        .select()
        .single()

      if (betError) {
        alert('Failed to place challenge bet: ' + betError.message)
        return
      }

      // Update user balance
      const newBetPoints = user.bet_points - stake

      const { error: updateError } = await supabase
        .from('users')
        .update({
          bet_points: newBetPoints
        })
        .eq('id', user.id)

      if (updateError) {
        alert('Failed to update balance: ' + updateError.message)
        return
      }

      // Record transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'bet_placed',
        amount: stake,
        currency: 'betpoints',
        description: `League Table Challenge - ${leagues.find(l => l.id === selectedLeague)?.name}`,
        balance_before: user.bet_points,
        balance_after: newBetPoints
      })

      // Reset form
      setSelectedLeague(null)
      setPredictions({})
      setStake(100)
      
      // Reload data
      loadUserData()
      loadExistingBets()

      alert(`League Table Challenge placed! Potential reward: ${calculatePotentialDiamonds()} 💎`)
      
    } catch (error) {
      console.error('Error placing table challenge bet:', error)
      alert('Failed to place challenge bet. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--nordic-bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" 
                 style={{ borderColor: 'var(--nordic-primary)' }}></div>
            <p className="mt-4" style={{ color: 'var(--nordic-text-secondary)' }}>
              Loading league challenges...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--nordic-bg-secondary)' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'var(--nordic-bg-primary)' }} className="shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--nordic-primary)' }}>
                  Nordic Football
                </h1>
                <span className="ml-2 px-2 py-1 text-xs rounded-full font-semibold"
                      style={{ backgroundColor: 'var(--nordic-warning)', color: 'var(--nordic-text-primary)' }}>
                  CHALLENGES
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="text-sm">
                    <span style={{ color: 'var(--nordic-text-muted)' }}>BP:</span>
                    <span className="font-bold ml-1" style={{ color: 'var(--nordic-primary)' }}>
                      {user.bet_points.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span style={{ color: 'var(--nordic-text-muted)' }}>💎:</span>
                    <span className="font-bold ml-1" style={{ color: 'var(--nordic-warning)' }}>
                      {user.diamonds}
                    </span>
                  </div>
                </>
              )}
              <Link
                href="/dashboard"
                className="text-sm hover:underline"
                style={{ color: 'var(--nordic-primary)' }}
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--nordic-text-primary)' }}>
            Haasteet & Kilpailut
          </h2>
          <p style={{ color: 'var(--nordic-text-secondary)' }}>
            {liveMatches > 0 
              ? `⚡ ${liveMatches} live matches ongoing • Perfect time for live betting challenges!`
              : '✅ No live matches • Ideal time for prediction challenges and tournaments'
            }
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 p-1 rounded-lg" style={{ backgroundColor: 'var(--nordic-bg-secondary)' }}>
          {[
            { key: 'challenges', label: 'Päivittäiset Haasteet', icon: '🎯' },
            { key: 'tournaments', label: 'Turnaukset', icon: '🏆' },
            { key: 'sarjataulukko', label: 'Sarjataulukko', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'nordic-button-primary'
                  : 'hover:bg-white/50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live Match Warning */}
        {liveMatches > 0 && (
          <div className="nordic-card mb-8 border-l-4" style={{ borderColor: 'var(--nordic-warning)' }}>
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚽</span>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--nordic-text-primary)' }}>
                  Live Matches Available!
                </h3>
                <p style={{ color: 'var(--nordic-text-secondary)' }}>
                  {liveMatches} live matches are currently available for betting with diamond rewards.
                </p>
                <Link href="/betting/live" className="text-sm font-medium hover:underline mt-2 inline-block"
                      style={{ color: 'var(--nordic-primary)' }}>
                  Go to Live Betting →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'challenges' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Daily Login & Challenges */}
            <div className="lg:col-span-2 space-y-6">
              {/* Daily Login Bonus */}
              {user && (
                <DailyLoginWidget userId={user.id} />
              )}
              
              {/* Daily Challenges */}
              <DailyChallengesWidget 
                challenges={dailyChallenges}
                onClaimReward={handleClaimChallenge}
              />
            </div>
            
            {/* Quick Stats & Live Matches */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Live Matches Card */}
                {liveMatches > 0 && (
                  <div className="nordic-card border-l-4" style={{ borderColor: 'var(--nordic-warning)' }}>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">⚽</span>
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--nordic-text-primary)' }}>
                          Live Matches!
                        </h3>
                        <p style={{ color: 'var(--nordic-text-secondary)' }}>
                          {liveMatches} live matches with diamond rewards
                        </p>
                        <Link href="/betting/live" className="text-sm font-medium hover:underline mt-2 inline-block"
                              style={{ color: 'var(--nordic-primary)' }}>
                          Go to Live Betting →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* User Stats */}
                {user && (
                  <div className="nordic-card">
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--nordic-text-primary)' }}>
                      Your Progress
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--nordic-text-secondary)' }}>Level:</span>
                        <span className="font-bold" style={{ color: 'var(--nordic-primary)' }}>
                          {user.level}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--nordic-text-secondary)' }}>BetPoints:</span>
                        <span className="font-bold" style={{ color: 'var(--nordic-primary)' }}>
                          {user.bet_points.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--nordic-text-secondary)' }}>Diamonds:</span>
                        <span className="font-bold" style={{ color: 'var(--nordic-warning)' }}>
                          💎 {user.diamonds}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'tournaments' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tournaments.map(tournament => (
              <div key={tournament.id} className="nordic-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--nordic-text-primary)' }}>
                      {tournament.name}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--nordic-text-secondary)' }}>
                      {tournament.description}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded font-medium ${
                    tournament.status === 'REGISTRATION_OPEN' 
                      ? 'bg-green-100 text-green-700'
                      : tournament.status === 'ACTIVE'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {tournament.status === 'REGISTRATION_OPEN' ? 'Ilmoittautuminen auki' :
                     tournament.status === 'ACTIVE' ? 'Käynnissä' : tournament.status}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--nordic-text-secondary)' }}>Entry Fee:</span>
                    <span className="font-medium">
                      {tournament.entryFee} {tournament.entryCurrency === 'BETPOINTS' ? 'BP' : '💎'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--nordic-text-secondary)' }}>Prize Pool:</span>
                    <span className="font-bold" style={{ color: 'var(--nordic-warning)' }}>
                      {tournament.prizePool.totalValue.toLocaleString()} {tournament.prizePool.currency === 'BETPOINTS' ? 'BP' : '💎'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--nordic-text-secondary)' }}>Participants:</span>
                    <span>
                      {tournament.currentParticipants}{tournament.maxParticipants ? `/${tournament.maxParticipants}` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--nordic-text-secondary)' }}>Ends:</span>
                    <span>
                      {new Date(tournament.endDate).toLocaleDateString('fi-FI')}
                    </span>
                  </div>
                </div>
                
                <button 
                  className="w-full mt-4 nordic-button-primary"
                  disabled={tournament.status !== 'REGISTRATION_OPEN'}
                >
                  {tournament.status === 'REGISTRATION_OPEN' ? 'Join Tournament' :
                   tournament.status === 'ACTIVE' ? 'View Leaderboard' : 'View Results'}
                </button>
              </div>
            ))}
            
            {tournaments.length === 0 && (
              <div className="lg:col-span-2 text-center py-12">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--nordic-text-primary)' }}>
                  No Tournaments Available
                </h3>
                <p style={{ color: 'var(--nordic-text-secondary)' }}>
                  Check back soon for exciting tournaments!
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'sarjataulukko' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* League Selection */}
            <div className="nordic-card mb-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--nordic-text-primary)' }}>
                Select League
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {leagues.map(league => {
                  const hasExistingBet = existingBets.some(bet => bet.league_id === league.id)
                  return (
                    <button
                      key={league.id}
                      onClick={() => !hasExistingBet && setSelectedLeague(league.id)}
                      disabled={hasExistingBet}
                      className={`p-4 rounded-lg text-left transition-all ${
                        selectedLeague === league.id ? 'nordic-button-primary' : ''
                      } ${hasExistingBet ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={selectedLeague !== league.id && !hasExistingBet ? { 
                        backgroundColor: 'var(--nordic-secondary-light)', 
                        border: '1px solid var(--nordic-secondary-light)'
                      } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">
                              {league.country === 'Finland' ? '🇫🇮' : '🇸🇪'}
                            </span>
                            <span className="font-medium">{league.name}</span>
                          </div>
                          <div className="text-sm" style={{ color: 'var(--nordic-text-muted)' }}>
                            Tier {league.tier} • {league.country}
                          </div>
                        </div>
                        {hasExistingBet && (
                          <span className="text-xs px-2 py-1 rounded"
                                style={{ backgroundColor: 'var(--nordic-success)', color: 'var(--nordic-text-light)' }}>
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Team Positioning */}
            {selectedLeague && teams.length > 0 && (
              <div className="nordic-card">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--nordic-text-primary)' }}>
                  Predict Final League Positions
                </h3>
                <p className="text-sm mb-6" style={{ color: 'var(--nordic-text-secondary)' }}>
                  Drag teams or click position numbers to predict the final league table
                </p>
                
                <div className="space-y-3">
                  {Array.from({ length: teams.length }, (_, index) => {
                    const position = index + 1
                    const teamAtPosition = teams.find(team => predictions[team.id] === position)
                    
                    return (
                      <div key={position} className="flex items-center space-x-4 p-3 rounded-lg"
                           style={{ backgroundColor: 'var(--nordic-bg-secondary)' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                             style={{ backgroundColor: 'var(--nordic-primary)', color: 'var(--nordic-text-light)' }}>
                          {position}
                        </div>
                        
                        {teamAtPosition ? (
                          <div className="flex-1 flex items-center justify-between">
                            <div>
                              <div className="font-medium" style={{ color: 'var(--nordic-text-primary)' }}>
                                {teamAtPosition.name}
                              </div>
                              <div className="text-sm" style={{ color: 'var(--nordic-text-muted)' }}>
                                {teamAtPosition.city}
                              </div>
                            </div>
                            <button
                              onClick={() => updatePrediction(teamAtPosition.id, 0)}
                              className="text-sm hover:underline"
                              style={{ color: 'var(--nordic-text-muted)' }}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <select
                              value=""
                              onChange={(e) => e.target.value && updatePrediction(e.target.value, position)}
                              className="nordic-input"
                            >
                              <option value="">Select team for position {position}</option>
                              {teams
                                .filter(team => !predictions[team.id] || predictions[team.id] === 0)
                                .map(team => (
                                <option key={team.id} value={team.id}>
                                  {team.name} ({team.city})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Challenge Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="nordic-card">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--nordic-text-primary)' }}>
                  Challenge Summary
                </h3>

                {!selectedLeague ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🏆</div>
                    <p style={{ color: 'var(--nordic-text-secondary)' }}>
                      Select a league to start your table challenge
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Selected League */}
                    <div className="border-b pb-4" style={{ borderColor: 'var(--nordic-secondary-light)' }}>
                      <div className="font-medium" style={{ color: 'var(--nordic-text-primary)' }}>
                        {leagues.find(l => l.id === selectedLeague)?.name}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--nordic-text-secondary)' }}>
                        {teams.length} teams to position
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="border-b pb-4" style={{ borderColor: 'var(--nordic-secondary-light)' }}>
                      <div className="flex justify-between mb-2">
                        <span style={{ color: 'var(--nordic-text-secondary)' }}>Progress:</span>
                        <span className="font-bold" style={{ color: 'var(--nordic-primary)' }}>
                          {Object.values(predictions).filter(pos => pos > 0).length}/{teams.length}
                        </span>
                      </div>
                      <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--nordic-secondary-light)' }}>
                        <div 
                          className="h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${(Object.values(predictions).filter(pos => pos > 0).length / teams.length) * 100}%`,
                            backgroundColor: 'var(--nordic-primary)'
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Stake */}
                    <div className="border-b pb-4" style={{ borderColor: 'var(--nordic-secondary-light)' }}>
                      <label className="block font-medium mb-2" style={{ color: 'var(--nordic-text-primary)' }}>
                        Stake (BP)
                      </label>
                      <input
                        type="number"
                        value={stake}
                        onChange={(e) => setStake(Number(e.target.value))}
                        min="50"
                        max={user?.max_stake_per_bet || 100}
                        className="nordic-input"
                      />
                      <div className="text-xs mt-1" style={{ color: 'var(--nordic-text-muted)' }}>
                        Minimum: 50 BP • Max: {user?.max_stake_per_bet || 100} BP
                      </div>
                    </div>

                    {/* Potential Reward */}
                    <div className="border-b pb-4" style={{ borderColor: 'var(--nordic-secondary-light)' }}>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--nordic-text-secondary)' }}>Potential Reward:</span>
                        <span className="font-bold" style={{ color: 'var(--nordic-warning)' }}>
                          {calculatePotentialDiamonds()} 💎
                        </span>
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--nordic-text-muted)' }}>
                        Perfect prediction required for full reward
                      </div>
                    </div>

                    {/* Place Bet Button */}
                    <button
                      onClick={placeTableChallengeBet}
                      disabled={!canPlaceBet()}
                      className="w-full nordic-button-primary disabled:opacity-50"
                    >
                      Place Challenge Bet
                    </button>
                    
                    {Object.values(predictions).filter(pos => pos > 0).length < teams.length && (
                      <p className="text-xs text-center" style={{ color: 'var(--nordic-text-muted)' }}>
                        Complete all positions to place bet
                      </p>
                    )}
                  </div>
                )}

                {/* Existing Bets */}
                {existingBets.length > 0 && (
                  <div className="mt-8 border-t pt-4" style={{ borderColor: 'var(--nordic-secondary-light)' }}>
                    <h4 className="font-medium mb-3" style={{ color: 'var(--nordic-text-primary)' }}>
                      Active Challenges
                    </h4>
                    <div className="space-y-2">
                      {existingBets.map(bet => (
                        <div key={bet.id} className="text-sm p-2 rounded"
                             style={{ backgroundColor: 'var(--nordic-bg-secondary)' }}>
                          <div className="font-medium">{bet.league.name}</div>
                          <div style={{ color: 'var(--nordic-text-muted)' }}>
                            {bet.stake} BP → {bet.diamond_reward} 💎
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}