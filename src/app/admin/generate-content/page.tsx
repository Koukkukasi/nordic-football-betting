'use client'

import { useState } from 'react'

export default function GenerateContentPage() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)])
  }

  const generateContent = async () => {
    setLoading(true)
    addLog('Starting Nordic content generation...')
    
    try {
      const response = await fetch('/api/admin/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'nordic2024!' })
      })
      
      const result = await response.json()
      
      if (result.success) {
        addLog('✅ Nordic content generated successfully!')
        addLog(`Generated fixtures for all Nordic leagues`)
        addLog(`Generated realistic odds for all matches`)
        addLog(`Derby detection system activated`)
      } else {
        addLog(`❌ Content generation failed: ${result.error}`)
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`)
    }
    
    setLoading(false)
  }

  const checkEnvironment = async () => {
    try {
      addLog('Checking environment configuration...')
      const response = await fetch('/api/admin/environment-check')
      const result = await response.json()
      
      if (result.success) {
        addLog('✅ Environment check passed')
        addLog(`Database: ${result.database}`)
        addLog(`Auth: ${result.auth}`)
        addLog(`Stripe: ${result.stripe}`)
      } else {
        addLog(`⚠️ Environment issues detected: ${result.error}`)
      }
    } catch (error) {
      addLog(`❌ Environment check failed: ${error}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-2">Content Generation</h1>
        <p className="text-gray-400">Generate Nordic teams, leagues, and match data</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">🎯 Initial Setup</h2>
          <div className="space-y-4">
            <button
              onClick={generateContent}
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Teams & Leagues'}
            </button>
            <p className="text-sm text-gray-400">
              One-time setup: Creates authentic Nordic teams and league structure for all tiers
            </p>
            <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">What this creates:</h4>
              <ul className="text-sm text-blue-300 space-y-1">
                <li>• Finnish Veikkausliiga (12 teams)</li>
                <li>• Finnish Ykkösliiga (10 teams)</li>
                <li>• Finnish Ykkönen (10 teams)</li>
                <li>• Swedish Allsvenskan (16 teams)</li>
                <li>• Swedish Superettan (16 teams)</li>
                <li>• Realistic match schedules</li>
                <li>• Derby detection system</li>
                <li>• Authentic player names</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">⚙️ System Check</h2>
          <div className="space-y-4">
            <button
              onClick={checkEnvironment}
              className="w-full bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700"
            >
              Check Environment
            </button>
            <p className="text-sm text-gray-400">
              Verify that all environment variables and connections are properly configured
            </p>
            <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
              <h4 className="text-gray-300 font-semibold mb-2">Validates:</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Database connection</li>
                <li>• NextAuth configuration</li>
                <li>• Stripe integration</li>
                <li>• API endpoints</li>
                <li>• Environment variables</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">📝 Generation Log</h2>
        <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No activity yet. Click a button above to start.
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

      {/* Phase Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">🎯 Platform Features Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-900/20 border border-green-600 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">✅</div>
            <div className="text-sm text-green-400">Match Generator</div>
          </div>
          <div className="bg-green-900/20 border border-green-600 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">✅</div>
            <div className="text-sm text-green-400">Odds Engine</div>
          </div>
          <div className="bg-green-900/20 border border-green-600 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">✅</div>
            <div className="text-sm text-green-400">Live Simulation</div>
          </div>
          <div className="bg-green-900/20 border border-green-600 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">✅</div>
            <div className="text-sm text-green-400">Derby Detection</div>
          </div>
        </div>
      </div>
    </div>
  )
}