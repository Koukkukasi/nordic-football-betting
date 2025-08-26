'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if already authenticated
    const adminAuth = localStorage.getItem('admin_authenticated')
    if (adminAuth === 'true') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const authenticate = () => {
    // Check password against environment variable
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'defaultAdminPass123!'
    if (password === adminPassword) {
      setIsAuthenticated(true)
      localStorage.setItem('admin_authenticated', 'true')
    } else {
      alert('Invalid admin password')
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_authenticated')
    setIsAuthenticated(false)
    router.push('/')
  }

  const adminNavLinks = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/matches', label: 'Matches', icon: '⚽' },
    { href: '/admin/system', label: 'System', icon: '⚙️' },
    { href: '/admin/database', label: 'Database', icon: '🗄️' },
    { href: '/admin/logs', label: 'Logs', icon: '📝' },
    { href: '/admin/api-monitor', label: 'API Monitor', icon: '📡' },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96 border border-gray-700">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-gray-400">Nordic Football Betting Platform</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && authenticate()}
            />
            <button
              onClick={authenticate}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Access Admin Panel
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">
              ← Back to Platform
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Admin Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">ADMIN</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm"
              >
                👁️ View Platform
              </Link>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-gray-800 min-h-screen border-r border-gray-700">
          <nav className="p-4">
            <div className="space-y-2">
              {adminNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    pathname === link.href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Quick Actions
              </div>
              <div className="space-y-1">
                <Link
                  href="/admin/generate-content"
                  className="block text-gray-300 hover:text-white text-sm px-4 py-2 rounded"
                >
                  🎯 Generate Content
                </Link>
                <Link
                  href="/admin/live-control"
                  className="block text-gray-300 hover:text-white text-sm px-4 py-2 rounded"
                >
                  ⚡ Live Control
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Admin Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}