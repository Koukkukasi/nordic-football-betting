// WebSocket server for real-time updates
// Run this as a separate process alongside Next.js

import { createServer } from 'http'
import { Server } from 'socket.io'
import { matchSimulatorManager, LiveMatchSimulator } from './live-match-simulation'
import { prisma } from './prisma'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

// Store user connections
const userConnections = new Map<string, Set<string>>() // userId -> Set of socketIds
const socketUsers = new Map<string, string>() // socketId -> userId

// Match subscriptions
const matchSubscriptions = new Map<string, Set<string>>() // matchId -> Set of socketIds

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  // Authenticate user
  socket.on('authenticate', async (token: string) => {
    try {
      // Verify JWT token (implement your auth logic)
      const userId = await verifyToken(token)
      
      if (userId) {
        // Store connection
        socketUsers.set(socket.id, userId)
        
        if (!userConnections.has(userId)) {
          userConnections.set(userId, new Set())
        }
        userConnections.get(userId)?.add(socket.id)
        
        socket.emit('authenticated', { userId })
        
        // Send user's active bets
        const activeBets = await prisma.bet.findMany({
          where: {
            userId,
            status: 'PENDING'
          },
          include: {
            selections: {
              include: {
                match: true
              }
            }
          }
        })
        
        socket.emit('activeBets', activeBets)
      }
    } catch (error) {
      socket.emit('authError', 'Invalid token')
    }
  })
  
  // Subscribe to match updates
  socket.on('subscribe:match', async (matchId: string) => {
    if (!matchSubscriptions.has(matchId)) {
      matchSubscriptions.set(matchId, new Set())
    }
    matchSubscriptions.get(matchId)?.add(socket.id)
    
    socket.join(`match:${matchId}`)
    
    // Get current match state
    const simulator = matchSimulatorManager.getSimulator(matchId)
    if (simulator) {
      socket.emit('match:state', simulator.getState())
    } else {
      // Get match from database
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          homeTeam: true,
          awayTeam: true,
          odds: true,
          events: {
            orderBy: { minute: 'desc' },
            take: 10
          }
        }
      })
      
      if (match) {
        socket.emit('match:info', match)
      }
    }
  })
  
  // Unsubscribe from match
  socket.on('unsubscribe:match', (matchId: string) => {
    matchSubscriptions.get(matchId)?.delete(socket.id)
    socket.leave(`match:${matchId}`)
  })
  
  // Place live bet
  socket.on('place:liveBet', async (betData: any) => {
    const userId = socketUsers.get(socket.id)
    if (!userId) {
      socket.emit('error', 'Not authenticated')
      return
    }
    
    try {
      // Validate live bet
      const match = await prisma.match.findUnique({
        where: { id: betData.matchId },
        include: { odds: true }
      })
      
      if (!match || match.status !== 'LIVE') {
        socket.emit('bet:error', 'Match not available for live betting')
        return
      }
      
      // Place bet (implement bet placement logic)
      const bet = await placeLiveBet(userId, betData)
      
      socket.emit('bet:placed', bet)
      
      // Notify user of bet placement
      io.to(`user:${userId}`).emit('notification', {
        type: 'BET_PLACED',
        message: 'Your live bet has been placed',
        bet
      })
    } catch (error: any) {
      socket.emit('bet:error', error.message)
    }
  })
  
  // Request cash out
  socket.on('request:cashOut', async (betId: string) => {
    const userId = socketUsers.get(socket.id)
    if (!userId) {
      socket.emit('error', 'Not authenticated')
      return
    }
    
    try {
      const cashOutResult = await processCashOut(userId, betId)
      
      if (cashOutResult.success) {
        socket.emit('cashOut:success', cashOutResult)
        
        // Update all user connections
        userConnections.get(userId)?.forEach(socketId => {
          io.to(socketId).emit('balance:update', cashOutResult.newBalance)
        })
      } else {
        socket.emit('cashOut:error', cashOutResult.error)
      }
    } catch (error: any) {
      socket.emit('cashOut:error', error.message)
    }
  })
  
  // Get live statistics
  socket.on('get:liveStats', async (matchId: string) => {
    const stats = await getLiveMatchStats(matchId)
    socket.emit('match:liveStats', stats)
  })
  
  // Disconnect
  socket.on('disconnect', () => {
    const userId = socketUsers.get(socket.id)
    
    if (userId) {
      userConnections.get(userId)?.delete(socket.id)
      if (userConnections.get(userId)?.size === 0) {
        userConnections.delete(userId)
      }
    }
    
    socketUsers.delete(socket.id)
    
    // Remove from all match subscriptions
    matchSubscriptions.forEach(sockets => {
      sockets.delete(socket.id)
    })
    
    console.log('Client disconnected:', socket.id)
  })
})

// Setup match simulator event listeners
export function setupMatchSimulator(simulator: LiveMatchSimulator) {
  const matchId = simulator.getState().matchId
  
  // Match started
  simulator.on('matchStarted', (data) => {
    io.to(`match:${matchId}`).emit('match:started', data)
  })
  
  // Match finished
  simulator.on('matchFinished', (data) => {
    io.to(`match:${matchId}`).emit('match:finished', data)
  })
  
  // Minute update
  simulator.on('minuteUpdate', (data) => {
    io.to(`match:${matchId}`).emit('match:minuteUpdate', data)
    
    // Check for cash out opportunities
    checkCashOutOpportunities(matchId)
  })
  
  // Goal scored
  simulator.on('goal', (data) => {
    io.to(`match:${matchId}`).emit('match:goal', data)
    
    // Send notifications to users with bets
    notifyBettors(matchId, 'GOAL', data)
  })
  
  // Card shown
  simulator.on('card', (data) => {
    io.to(`match:${matchId}`).emit('match:card', data)
  })
  
  // Odds update
  simulator.on('oddsUpdate', (data) => {
    io.to(`match:${matchId}`).emit('match:oddsUpdate', data)
  })
  
  // Shot
  simulator.on('shot', (data) => {
    io.to(`match:${matchId}`).emit('match:shot', data)
  })
  
  // Corner
  simulator.on('corner', (data) => {
    io.to(`match:${matchId}`).emit('match:corner', data)
  })
  
  // Substitution
  simulator.on('substitution', (data) => {
    io.to(`match:${matchId}`).emit('match:substitution', data)
  })
}

// Helper functions

async function verifyToken(token: string): Promise<string | null> {
  // Implement JWT verification
  // Return userId if valid, null otherwise
  try {
    // This is a placeholder - implement actual JWT verification
    const decoded = { userId: 'user-id' } // Decode JWT
    return decoded.userId
  } catch {
    return null
  }
}

async function placeLiveBet(userId: string, betData: any) {
  // Implement live bet placement logic
  // This should call your betting API
  return {
    id: 'bet-id',
    userId,
    ...betData,
    status: 'PENDING'
  }
}

async function processCashOut(userId: string, betId: string) {
  try {
    // Get bet details
    const bet = await prisma.bet.findFirst({
      where: {
        id: betId,
        userId,
        status: 'PENDING'
      },
      include: {
        selections: {
          include: {
            match: true
          }
        }
      }
    })
    
    if (!bet) {
      return { success: false, error: 'Bet not found or already settled' }
    }
    
    // Calculate cash out value
    const cashOutValue = calculateCashOutValue(bet)
    
    if (cashOutValue <= 0) {
      return { success: false, error: 'Cash out not available' }
    }
    
    // Process cash out
    const result = await prisma.$transaction(async (tx) => {
      // Update bet status
      await tx.bet.update({
        where: { id: betId },
        data: {
          status: 'CASHED_OUT',
          winAmount: cashOutValue,
          settledAt: new Date()
        }
      })
      
      // Credit user balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          betPoints: { increment: cashOutValue }
        }
      })
      
      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          type: 'CASH_OUT',
          amount: cashOutValue,
          currency: 'BETPOINTS',
          description: `Cash out for bet ${betId}`,
          reference: betId
        }
      })
      
      return {
        success: true,
        cashOutValue,
        newBalance: updatedUser.betPoints
      }
    })
    
    return result
  } catch (error) {
    console.error('Cash out error:', error)
    return { success: false, error: 'Failed to process cash out' }
  }
}

function calculateCashOutValue(bet: any): number {
  // Calculate current probability of bet winning
  let probability = 1
  
  for (const selection of bet.selections) {
    const match = selection.match
    
    if (match.status === 'FINISHED') {
      // Check if selection won
      if (selection.result === 'WON') {
        continue
      } else if (selection.result === 'LOST') {
        return 0 // Bet already lost
      }
    } else if (match.status === 'LIVE') {
      // Calculate probability based on current score and time
      const minutesRemaining = 90 - (match.minute || 0)
      const scoreDiff = (match.homeScore || 0) - (match.awayScore || 0)
      
      // Simple probability calculation (can be improved)
      if (selection.selection === 'HOME') {
        probability *= scoreDiff > 0 ? 0.8 : scoreDiff === 0 ? 0.4 : 0.2
      } else if (selection.selection === 'AWAY') {
        probability *= scoreDiff < 0 ? 0.8 : scoreDiff === 0 ? 0.4 : 0.2
      } else if (selection.selection === 'DRAW') {
        probability *= scoreDiff === 0 ? 0.6 : 0.2
      }
      
      // Adjust for time remaining
      probability *= (1 - minutesRemaining / 90 * 0.3)
    }
  }
  
  // Calculate cash out value
  const potentialWin = bet.stake * bet.totalOdds
  const cashOutValue = Math.round(bet.stake + (potentialWin - bet.stake) * probability * 0.9) // 90% of fair value
  
  return Math.max(0, Math.min(cashOutValue, potentialWin))
}

async function checkCashOutOpportunities(matchId: string) {
  // Find all pending bets with this match
  const bets = await prisma.bet.findMany({
    where: {
      status: 'PENDING',
      selections: {
        some: {
          matchId
        }
      }
    },
    include: {
      selections: {
        include: {
          match: true
        }
      }
    }
  })
  
  for (const bet of bets) {
    const cashOutValue = calculateCashOutValue(bet)
    
    if (cashOutValue > bet.stake * 0.5) { // Only offer if > 50% of stake
      // Notify user of cash out opportunity
      const userId = bet.userId
      userConnections.get(userId)?.forEach(socketId => {
        io.to(socketId).emit('cashOut:available', {
          betId: bet.id,
          cashOutValue,
          stake: bet.stake,
          potentialWin: bet.potentialWin
        })
      })
    }
  }
}

async function notifyBettors(matchId: string, eventType: string, eventData: any) {
  // Find users with bets on this match
  const bets = await prisma.bet.findMany({
    where: {
      status: 'PENDING',
      selections: {
        some: {
          matchId
        }
      }
    },
    select: {
      userId: true,
      id: true
    }
  })
  
  const userIds = [...new Set(bets.map(b => b.userId))]
  
  for (const userId of userIds) {
    userConnections.get(userId)?.forEach(socketId => {
      io.to(socketId).emit('match:event', {
        matchId,
        eventType,
        ...eventData
      })
    })
  }
}

async function getLiveMatchStats(matchId: string) {
  // Get live betting statistics
  const stats = await prisma.bet.aggregate({
    where: {
      selections: {
        some: {
          matchId
        }
      }
    },
    _count: true,
    _sum: {
      stake: true
    }
  })
  
  const distribution = await prisma.betSelection.groupBy({
    by: ['selection'],
    where: {
      matchId,
      market: 'MATCH_RESULT'
    },
    _count: true,
    _sum: {
      bet: {
        stake: true
      }
    }
  })
  
  return {
    totalBets: stats._count,
    totalStake: stats._sum.stake || 0,
    distribution
  }
}

// Start server
const PORT = process.env.WEBSOCKET_PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`)
})

export { io, setupMatchSimulator }