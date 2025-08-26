import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        balance: true,
        xp: true,
        level: true,
        achievements: {
          select: {
            id: true,
            achievement: true,
            unlockedAt: true
          }
        },
        bets: {
          select: {
            id: true,
            amount: true,
            potentialWin: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const stats = {
      userId: user.id,
      balance: user.balance,
      xp: user.xp,
      level: user.level,
      totalBets: user.bets.length,
      wonBets: user.bets.filter(b => b.status === 'WON').length,
      lostBets: user.bets.filter(b => b.status === 'LOST').length,
      pendingBets: user.bets.filter(b => b.status === 'PENDING').length,
      totalWagered: user.bets.reduce((sum, bet) => sum + bet.amount, 0),
      totalWinnings: user.bets
        .filter(b => b.status === 'WON')
        .reduce((sum, bet) => sum + bet.potentialWin, 0),
      achievements: user.achievements.length,
      recentBets: user.bets
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}