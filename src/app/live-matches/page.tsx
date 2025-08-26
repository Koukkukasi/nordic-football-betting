'use client';

import { useState, useEffect } from 'react';
import { RealMatchCard } from '@/components/matches/RealMatchCard';
import { realSportsAPI } from '@/lib/real-sports-api';
import { formatNordicCurrency, terminology } from '@/lib/nordic-utils';
import { Trophy, Zap, Coins, Gem, RefreshCw, Info, Star, GamepadIcon, Clock } from 'lucide-react';

interface TransformedMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamFull: string;
  awayTeamFull: string;
  league: string;
  country: string;
  startTime: Date;
  homeScore?: number | null;
  awayScore?: number | null;
  status: string;
  minute?: number | null;
  isLive: boolean;
  venue: string;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
}

export default function LiveMatchesPage() {
  const [matches, setMatches] = useState<TransformedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBets, setSelectedBets] = useState<Array<{ matchId: string; selection: string }>>([]);
  const [language] = useState<'finnish' | 'swedish' | 'english'>('english');
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'finnish' | 'swedish'>('all');
  
  // Free-to-play virtual currency
  const [betPoints, setBetPoints] = useState(10000);
  const [diamonds, setDiamonds] = useState(50);
  const [level, setLevel] = useState(1);
  
  const t = terminology[language];

  useEffect(() => {
    loadMatches();
    
    // Refresh every 30 seconds for live updates
    const interval = setInterval(loadMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      
      // Get today's matches and live matches
      const [todaysMatches, liveMatches, upcomingMatches] = await Promise.all([
        realSportsAPI.getTodaysMatches(),
        realSportsAPI.getLiveMatches(),
        realSportsAPI.getUpcomingMatches(3)
      ]);
      
      // Combine and transform matches
      const allMatches = [...todaysMatches, ...liveMatches, ...upcomingMatches];
      const uniqueMatches = allMatches.filter((match, index, self) => 
        index === self.findIndex(m => m.fixture.id === match.fixture.id)
      );
      
      const transformed = uniqueMatches.map(match => realSportsAPI.transformToOurFormat(match));
      
      setMatches(transformed);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBetSelect = (matchId: string, selection: string, odds: number) => {
    setSelectedBets(prev => {
      const existing = prev.find(bet => bet.matchId === matchId);
      if (existing) {
        return prev.map(bet => 
          bet.matchId === matchId ? { matchId, selection } : bet
        );
      } else {
        return [...prev, { matchId, selection }];
      }
    });
    
    // Simulate earning diamonds for engagement (free-to-play feature)
    if (Math.random() > 0.7) {
      setDiamonds(prev => prev + 1);
    }
  };

  const filteredMatches = matches.filter(match => {
    switch (filter) {
      case 'live':
        return match.isLive;
      case 'upcoming':
        return !match.isLive && new Date(match.startTime) > new Date();
      case 'finnish':
        return match.country === 'Finland';
      case 'swedish':
        return match.country === 'Sweden';
      default:
        return true;
    }
  });

  const liveMatchesCount = matches.filter(m => m.isLive).length;
  const totalMatchesToday = matches.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-nordic-blue-900 via-nordic-blue-800 to-swedish-blue">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <GamepadIcon className="w-8 h-8 text-nordic-gold-500" />
                Nordic Football FREE Betting
              </h1>
              <p className="text-nordic-blue-200 flex items-center gap-2 mt-1">
                <Star className="w-4 h-4" />
                Free-to-play entertainment • Enhanced odds • No real money
              </p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                  <Coins className="w-5 h-5 text-nordic-gold-500" />
                  <span className="font-bold">{formatNordicCurrency(betPoints, 'BetPoints', language)}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                  <Gem className="w-5 h-5 text-diamond-500" />
                  <span className="font-bold">{diamonds}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                  <Trophy className="w-5 h-5 text-nordic-gold-500" />
                  <span className="font-bold">Level {level}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Free-to-Play Information Banner */}
        <div className="bg-nordic-gold-500 text-black rounded-xl p-6 mb-8 shadow-xl">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold mb-2">🎮 100% FREE Entertainment Platform</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>• No Real Money:</strong> Pure entertainment with virtual BetPoints
                </div>
                <div>
                  <strong>• Enhanced Odds:</strong> Better than real betting sites for more fun
                </div>
                <div>
                  <strong>• Diamond Rewards:</strong> Earn diamonds, boost your virtual winnings
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Filters */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{totalMatchesToday}</div>
                <div className="text-nordic-blue-200 text-sm">Total Matches</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-live-500 flex items-center gap-1">
                  <Zap className="w-6 h-6" />
                  {liveMatchesCount}
                </div>
                <div className="text-nordic-blue-200 text-sm">Live Now</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-nordic-gold-500">{selectedBets.length}</div>
                <div className="text-nordic-blue-200 text-sm">Your Picks</div>
              </div>
            </div>
            
            <button
              onClick={loadMatches}
              disabled={loading}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All Matches', icon: Trophy },
              { key: 'live', label: 'Live', icon: Zap },
              { key: 'upcoming', label: 'Upcoming', icon: Clock },
              { key: 'finnish', label: '🇫🇮 Finnish', icon: null },
              { key: 'swedish', label: '🇸🇪 Swedish', icon: null }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === key
                    ? 'bg-white text-nordic-blue-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-white">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="text-lg">Loading real Nordic football matches...</span>
            </div>
          </div>
        )}

        {/* Matches Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map(match => (
              <RealMatchCard
                key={match.id}
                match={match}
                onBetSelect={handleBetSelect}
                selectedBets={selectedBets}
                language={language}
                showEnhancedOdds={true}
              />
            ))}
          </div>
        )}

        {/* No Matches State */}
        {!loading && filteredMatches.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No matches found</h3>
            <p className="text-nordic-blue-200">
              Try adjusting your filters or check back later for more Nordic football action!
            </p>
          </div>
        )}

        {/* Selected Bets Summary */}
        {selectedBets.length > 0 && (
          <div className="fixed bottom-6 left-6 right-6 bg-white rounded-xl shadow-2xl border-2 border-nordic-blue-500 p-6 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-nordic-blue-600 mb-3 flex items-center gap-2">
              <GamepadIcon className="w-5 h-5" />
              Your Free Bet Slip ({selectedBets.length})
            </h3>
            
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {selectedBets.map((bet, index) => {
                const match = matches.find(m => m.id === bet.matchId);
                if (!match) return null;
                
                return (
                  <div key={index} className="text-sm bg-gray-50 rounded-lg p-2">
                    <div className="font-medium">
                      {match.homeTeam} vs {match.awayTeam}
                    </div>
                    <div className="text-gray-600 capitalize">{bet.selection} win</div>
                  </div>
                );
              })}
            </div>
            
            <button className="w-full bg-gradient-to-r from-nordic-blue-500 to-nordic-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-nordic-blue-600 hover:to-nordic-blue-700 transition-all duration-200 flex items-center justify-center gap-2">
              <Star className="w-4 h-4" />
              Place FREE Bet • Virtual Currency Only
            </button>
            
            <div className="text-xs text-gray-500 text-center mt-2">
              🎮 Entertainment only • No real money involved
            </div>
          </div>
        )}
      </div>
    </div>
  );
}