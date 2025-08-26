import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Clear localStorage data for demo mode
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    })
    
    // Clear any cookies if needed
    response.cookies.delete('next-auth.session-token')
    response.cookies.delete('next-auth.callback-url')
    response.cookies.delete('next-auth.csrf-token')
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}