'use client'

import { useState } from 'react'

export default function LiveControlPage() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [liveMatches, setLiveMatches] = useState<any[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)])
  }

  const startLiveMatches = async () => {
    setLoading(true)
    addLog('Starting live match simulations...')
    
    try {
      const response = await fetch('/api/admin/live-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_test_matches', password: 'nordic2024!' })
      })
      
      const result = await response.json()
      
      if (result.success) {
        addLog(`✅ Started ${result.startedMatches} live match simulations`)
        addLog('Live betting now available for users!')
        checkStatus() // Refresh status
      } else {
        addLog(`❌ Failed to start live matches: ${result.error}`)
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`)
    }
    
    setLoading(false)
  }

  const stopLiveMatches = async () => {
    setLoading(true)
    addLog('Stopping all live match simulations...')
    
    try {
      const response = await fetch('/api/admin/live-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop_all', password: 'nordic2024!' })
      })
      
      const result = await response.json()
      
      if (result.success) {
        addLog('✅ All live match simulations stopped')
        setLiveMatches([])
      } else {
        addLog(`❌ Failed to stop simulations: ${result.error}`)
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`)
    }
    
    setLoading(false)
  }

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/admin/live-matches')
      const result = await response.json()
      
      addLog(`📊 Status: ${result.activeSimulations} active live matches`)
      if (result.matchIds && result.matchIds.length > 0) {
        addLog(`Active matches: ${result.matchIds.join(', ')}`)
        // Set live matches for display
        setLiveMatches(result.matchIds.map((id: string) => ({ id, status: 'Running' })))
      } else {
        setLiveMatches([])
      }
    } catch (error) {
      addLog(`❌ Status check error: ${error}`)
    }
  }

  const startScraping = async () => {
    setLoading(true)
    addLog('🕷️ Starting real-time data scraping...')
    
    try {
      const response = await fetch('/api/admin/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', password: 'nordic2024!', interval: 2 })
      })
      
      const result = await response.json()
      
      if (result.success) {
        addLog('✅ Data scraping activated - checking Nordic matches every 2 minutes')
        addLog('📡 Sources: Flashscore, Livescore, Soccerway')
      } else {
        addLog(`❌ Failed to start scraping: ${result.error}`)
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`)
    }
    
    setLoading(false)
  }

  const stopScraping = async () => {
    setLoading(true)
    addLog('Stopping data scraping...')
    
    try {
      const response = await fetch('/api/admin/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop', password: 'nordic2024!' })
      })
      
      const result = await response.json()
      
      if (result.success) {
        addLog('✅ Data scraping stopped')
      } else {
        addLog(`❌ Failed to stop scraping: ${result.error}`)
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`)
    }
    
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-2">Live Match Control</h1>
        <p className="text-gray-400">Manage live match simulations and real-time data scraping</p>
      </div>

      {/* Control Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Live Match Control */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">⚽ Match Simulation</h2>
          <div className="space-y-3">
            <button
              onClick={startLiveMatches}
              disabled={loading}
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Start Live Matches
            </button>
            <button
              onClick={stopLiveMatches}
              disabled={loading}
              className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Stop All Matches
            </button>
            <button
              onClick={checkStatus}
              className="w-full bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700"
            >
              Check Status
            </button>
          </div>
        </div>

        {/* Real Data Scraping */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">🕷️ Data Scraping</h2>
          <div className="space-y-3">
            <button
              onClick={startScraping}
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Start Scraping
            </button>
            <button
              onClick={stopScraping}
              disabled={loading}
              className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Stop Scraping
            </button>
          </div>
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded">
            <p className="text-blue-400 text-sm">
              Scrapes real Nordic matches from multiple sources every 2 minutes
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">🚀 Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/betting/live"
              target="_blank"
              className="block w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 text-center"
            >
              Test Live Betting
            </a>
            <a
              href="/dashboard"
              target="_blank"
              className="block w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 text-center"
            >
              View User Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Active Matches */}
      {liveMatches.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">🔴 Active Live Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMatches.map((match, index) => (
              <div key={match.id || index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Match {match.id}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">{match.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Log */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">📝 Control Log</h2>
        <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No activity yet. Use the controls above to manage live matches.
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  <span className="text-green-400">{log}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}