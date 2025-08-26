'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LeaguesPage() {
  const [selectedCountry, setSelectedCountry] = useState('Finland')

  const finnishLeagues = [
    {
      name: 'Veikkausliiga',
      level: 1,
      teams: 12,
      description: 'Top tier of Finnish football',
      teams_list: ['HJK Helsinki', 'KuPS Kuopio', 'FC Inter Turku', 'IFK Mariehamn', 'HIFK Helsinki', 'SJK Seinäjoki', 'FC Haka', 'FC Honka', 'Ilves Tampere', 'VPS Vaasa', 'AC Oulu', 'FC Lahti']
    },
    {
      name: 'Ykkösliiga',
      level: 2,
      teams: 10,
      description: 'Second tier of Finnish football',
      teams_list: ['FC Jazz', 'FF Jaro', 'KTP Kotka', 'MP Mikkeli', 'PK-35 Vantaa', 'RoPS Rovaniemi', 'TPS Turku', 'TPV Tampere', 'KuFu-98', 'GrIFK Gransholmen']
    },
    {
      name: 'Ykkönen',
      level: 3,
      teams: 10,
      description: 'Third tier of Finnish football',
      teams_list: ['AC Kajaani', 'EPS Espoo', 'FC Viikingit', 'Gnistan Helsinki', 'IF Gnistan', 'JJK Jyväskylä', 'KuPS Akatemia', 'NuPS Nummela', 'OLS Oulu', 'PK Keski-Uusimaa']
    }
  ]

  const swedishLeagues = [
    {
      name: 'Allsvenskan',
      level: 1,
      teams: 16,
      description: 'Top tier of Swedish football',
      teams_list: ['Malmö FF', 'AIK Stockholm', 'Djurgården Stockholm', 'Hammarby Stockholm', 'IFK Göteborg', 'BK Häcken', 'IF Elfsborg', 'IFK Norrköping', 'Kalmar FF', 'Mjällby AIF', 'Sirius IK', 'Västerås SK', 'GAIS Göteborg', 'IFK Värnamo', 'Brommapojkarna', 'Halmstads BK']
    },
    {
      name: 'Superettan',
      level: 2,
      teams: 16,
      description: 'Second tier of Swedish football',
      teams_list: ['Örebro SK', 'Gefle IF', 'Helsingborgs IF', 'Landskrona BoIS', 'Östers IF', 'Sandvikens IF', 'Trelleborgs FF', 'Utsiktens BK', 'Varbergs BoIS', 'Åtvidabergs FF', 'Degerfors IF', 'Falkenbergs FF', 'IK Brage', 'Skövde AIK', 'Örgryte IS', 'GIF Sundsvall']
    }
  ]

  const currentLeagues = selectedCountry === 'Finland' ? finnishLeagues : swedishLeagues

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">Nordic Football</h1>
                <span className="ml-2 px-2 py-1 text-xs bg-yellow-400 text-black rounded-full font-semibold">
                  FREE
                </span>
              </Link>
            </div>
            <nav className="flex space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
              <Link href="/betting/live" className="text-gray-600 hover:text-blue-600">Live Betting</Link>
              <Link href="/leagues" className="text-blue-600 font-medium">Leagues</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nordic Football Leagues</h1>
          <p className="text-gray-600">Complete overview of Finnish and Swedish football league systems</p>
        </div>

        {/* Country Selector */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedCountry('Finland')}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedCountry === 'Finland'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl mr-2">🇫🇮</span>
              Finland ({finnishLeagues.length} leagues)
            </button>
            <button
              onClick={() => setSelectedCountry('Sweden')}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedCountry === 'Sweden'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl mr-2">🇸🇪</span>
              Sweden ({swedishLeagues.length} leagues)
            </button>
          </div>
        </div>

        {/* Leagues Display */}
        <div className="space-y-6">
          {currentLeagues.map((league, index) => (
            <div key={league.name} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{league.name}</h2>
                  <p className="text-gray-600">{league.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Level {league.level}</div>
                  <div className="text-lg font-semibold text-blue-600">{league.teams} teams</div>
                </div>
              </div>

              {/* Teams Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {league.teams_list.map((team, teamIndex) => (
                  <div 
                    key={team} 
                    className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900">{team}</div>
                  </div>
                ))}
              </div>

              {/* League Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Season: {league.teams * (league.teams - 1)} matches</span>
                  <span>Available for betting</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Nordic Football Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {finnishLeagues.reduce((sum, league) => sum + league.teams, 0)}
              </div>
              <div className="text-sm text-blue-800">Finnish Teams</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {swedishLeagues.reduce((sum, league) => sum + league.teams, 0)}
              </div>
              <div className="text-sm text-blue-800">Swedish Teams</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">831</div>
              <div className="text-sm text-blue-800">Total Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-blue-800">Betting Markets</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/betting/live"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Live Betting
          </Link>
          <Link
            href="/betting/pitkaveto"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Build Pitkäveto
          </Link>
          <Link
            href="/challenges"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Table Challenges
          </Link>
        </div>
      </main>
    </div>
  )
}