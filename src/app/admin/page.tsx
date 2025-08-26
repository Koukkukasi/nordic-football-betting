'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 156,
    activeMatches: 8,
    totalBets: 2847,
    systemUptime: '3 days, 14 hours',
    serverHealth: 'Healthy',
    databaseStatus: 'Connected',
    liveEngineStatus: 'Running'
  })
  
  const [recentActivity, setRecentActivity] = useState<string[]>([])
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 23,
    memory: 67,
    disk: 45,
    network: 12
  })

  useEffect(() => {
    // Initialize with sample activity logs
    setRecentActivity([
      `[${new Date().toLocaleTimeString()}] Admin dashboard accessed`,
      `[${new Date(Date.now() - 60000).toLocaleTimeString()}] Live match engine: HJK vs HIFK started`,
      `[${new Date(Date.now() - 120000).toLocaleTimeString()}] New user registered: player_${Math.floor(Math.random() * 1000)}`,
      `[${new Date(Date.now() - 180000).toLocaleTimeString()}] Bet placed: Live bet on Veikkausliiga match`,
      `[${new Date(Date.now() - 240000).toLocaleTimeString()}] System health check completed: All systems operational`,
    ])

    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(95, prev.memory + (Math.random() - 0.5) * 5)),
        disk: prev.disk,
        network: Math.max(0, Math.min(50, prev.network + (Math.random() - 0.5) * 8))
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const quickActions = [
    {
      title: 'Generate Content',
      description: 'Create Nordic teams and matches',
      action: '/admin/generate-content',
      icon: '🎯',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Live Match Control',
      description: 'Start/stop live simulations',
      action: '/admin/live-control',
      icon: '⚡',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'User Management',
      description: 'View and manage users',
      action: '/admin/users',
      icon: '👥',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'System Monitor',
      description: 'Check system health',
      action: '/admin/system',
      icon: '📊',
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-2">System Dashboard</h1>
        <p className="text-gray-400">Nordic Football Betting Platform Administration</p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{systemStats.totalUsers}</p>
            </div>
            <div className="bg-blue-600 rounded-full p-3">
              <span className="text-white text-xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Matches</p>
              <p className="text-2xl font-bold text-white">{systemStats.activeMatches}</p>
            </div>
            <div className="bg-green-600 rounded-full p-3">
              <span className="text-white text-xl">⚽</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Bets</p>
              <p className="text-2xl font-bold text-white">{systemStats.totalBets}</p>
            </div>
            <div className="bg-purple-600 rounded-full p-3">
              <span className="text-white text-xl">🎯</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">System Uptime</p>
              <p className="text-2xl font-bold text-white">{systemStats.systemUptime}</p>
            </div>
            <div className="bg-orange-600 rounded-full p-3">
              <span className="text-white text-xl">⏱️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.action}
              className={`${action.color} rounded-lg p-4 text-white transition-colors block`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{action.icon}</span>
                <div>
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Metrics */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">System Metrics</h2>
          <div className="space-y-4">
            {Object.entries(systemMetrics).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400 capitalize">{key}</span>
                  <span className="text-white">{value}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      value > 80 ? 'bg-red-500' : value > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {recentActivity.map((activity, index) => (
              <div key={index} className="text-sm">
                <span className="text-green-400 font-mono">{activity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-white font-medium">Server Health</p>
              <p className="text-gray-400 text-sm">{systemStats.serverHealth}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-white font-medium">Database</p>
              <p className="text-gray-400 text-sm">{systemStats.databaseStatus}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-white font-medium">Live Engine</p>
              <p className="text-gray-400 text-sm">{systemStats.liveEngineStatus}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}