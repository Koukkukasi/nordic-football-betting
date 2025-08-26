import { NextRequest, NextResponse } from 'next/server'
import { dataScraper } from '@/lib/data-scraper'

export async function POST(request: NextRequest) {
  try {
    const { action, password, interval } = await request.json()
    
    // Simple admin protection
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let result
    switch (action) {
      case 'start':
        await dataScraper.startScraping(interval || 2)
        result = {
          success: true,
          message: `Started scraping Nordic matches every ${interval || 2} minutes`,
          status: 'active'
        }
        break

      case 'stop':
        await dataScraper.stopScraping()
        result = {
          success: true,
          message: 'Stopped data scraping',
          status: 'stopped'
        }
        break

      case 'scrape_once':
        await dataScraper.scrapeAllSources()
        result = {
          success: true,
          message: 'One-time scrape completed',
          status: 'completed'
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Scraper control error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Nordic Data Scraper Ready',
    sources: ['Flashscore', 'Livescore', 'Soccerway'],
    updateInterval: '2 minutes',
    timestamp: new Date().toISOString()
  })
}