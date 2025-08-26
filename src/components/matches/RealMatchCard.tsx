'use client';

import { useState } from 'react';
import { cn, formatNordicDateTime, terminology, classifyMatch, getEnhancedOdds } from '@/lib/nordic-utils';
import { Clock, Trophy, TrendingUp, Flame, Zap } from 'lucide-react';

interface RealMatch {
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

interface RealMatchCardProps {
  match: RealMatch;
  onBetSelect: (matchId: string, selection: string, odds: number) => void;
  selectedBets?: Array<{ matchId: string; selection: string }>;
  language?: 'finnish' | 'swedish' | 'english';
  showEnhancedOdds?: boolean;
  className?: string;
}

const RealMatchCard: React.FC<RealMatchCardProps> = ({
  match,
  onBetSelect,
  selectedBets = [],
  language = 'english',
  showEnhancedOdds = true,
  className = ''
}) => {
  const [hoveredOdds, setHoveredOdds] = useState<string | null>(null);
  
  const t = terminology[language];
  const matchClassification = classifyMatch(match.homeTeam, match.awayTeam);
  
  const isSelected = (selection: string) => 
    selectedBets.some(bet => bet.matchId === match.id && bet.selection === selection);

  // Get enhanced odds for entertainment
  const enhancedHomeOdds = showEnhancedOdds ? getEnhancedOdds(match.homeOdds) : match.homeOdds;
  const enhancedDrawOdds = showEnhancedOdds ? getEnhancedOdds(match.drawOdds) : match.drawOdds;
  const enhancedAwayOdds = showEnhancedOdds ? getEnhancedOdds(match.awayOdds) : match.awayOdds;

  const getOddsClassName = (selection: string, odds: number) => {
    const baseClasses = "flex-1 py-3 px-3 rounded-lg font-mono font-semibold text-lg transition-all duration-200 border-2 relative";
    
    if (isSelected(selection)) {
      return `${baseClasses} bg-nordic-blue-500 text-white border-nordic-blue-500 shadow-md`;
    }

    if (hoveredOdds === selection) {
      return `${baseClasses} bg-nordic-blue-light border-nordic-blue-500 text-nordic-blue-600 transform scale-105 shadow-lg`;
    }

    // Enhanced odds styling
    if (showEnhancedOdds) {
      return `${baseClasses} bg-gradient-to-r from-enhanced-odds to-success-600 text-white border-0 shadow-md hover:shadow-lg hover:scale-105 enhanced-glow`;
    }

    // Regular odds
    if (odds < 2.0) {
      return `${baseClasses} bg-white border-enhanced-odds text-enhanced-odds hover:bg-green-50`;
    } else if (odds > 3.0) {
      return `${baseClasses} bg-white border-warning-500 text-warning-600 hover:bg-yellow-50`;
    } else {
      return `${baseClasses} bg-white border-gray-300 text-gray-700 hover:bg-gray-50`;
    }
  };

  const getCountryFlag = () => {
    if (match.country === 'Finland') return '🇫🇮';
    if (match.country === 'Sweden') return '🇸🇪';
    return '🏆';
  };

  const getMatchTypeIcon = () => {
    if (matchClassification.isDerby) return <Flame className="w-4 h-4 text-nordic-gold-500" />;
    if (match.isLive) return <Zap className="w-4 h-4 text-live-500" />;
    return <Trophy className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className={cn(
      "bg-white rounded-xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg",
      matchClassification.country === 'finnish' && "finnish-accent",
      matchClassification.country === 'swedish' && "swedish-accent",
      matchClassification.isDerby && "derby-highlight",
      match.isLive && "live-indicator",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getMatchTypeIcon()}
            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
              {getCountryFlag()} {match.league}
            </span>
          </div>
          
          {match.isLive && (
            <div className="flex items-center gap-1 bg-live-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-live-heartbeat">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              LIVE {match.minute}'
            </div>
          )}
          
          {matchClassification.isDerby && (
            <div className="bg-nordic-gold-500 text-black px-2 py-1 rounded-full text-xs font-bold">
              {matchClassification.derbyType?.toUpperCase()} DERBY
            </div>
          )}

          {showEnhancedOdds && !match.isLive && (
            <div className="bg-enhanced-odds text-white px-2 py-1 rounded-full text-xs font-bold">
              FREE ENHANCED ODDS
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">{match.venue}</div>
      </div>

      {/* Teams */}
      <div className="p-4">
        <div className="space-y-3 mb-4">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                matchClassification.country === 'finnish' ? "bg-finnish-blue" : "bg-swedish-blue"
              )}>
                {match.homeTeam.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{match.homeTeamFull}</div>
                <div className="text-sm text-gray-500">{t.home_win}</div>
              </div>
            </div>
            
            {match.isLive && typeof match.homeScore !== 'undefined' && (
              <div className="text-2xl font-bold text-nordic-blue-600">
                {match.homeScore}
              </div>
            )}
          </div>

          {/* VS */}
          <div className="flex items-center justify-center">
            <span className="text-sm text-gray-500 font-medium">VS</span>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                matchClassification.country === 'finnish' ? "bg-finnish-blue" : "bg-swedish-blue"
              )}>
                {match.awayTeam.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{match.awayTeamFull}</div>
                <div className="text-sm text-gray-500">{t.away_win}</div>
              </div>
            </div>
            
            {match.isLive && typeof match.awayScore !== 'undefined' && (
              <div className="text-2xl font-bold text-nordic-blue-600">
                {match.awayScore}
              </div>
            )}
          </div>
        </div>

        {/* Match Time */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>
            {match.isLive ? 
              `${t.live_match} - ${match.minute}'` : 
              formatNordicDateTime(match.startTime, language)
            }
          </span>
        </div>

        {/* Odds Grid */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 flex items-center justify-between">
            <span>{t.odds}</span>
            {showEnhancedOdds && (
              <span className="text-xs text-enhanced-odds font-bold">
                {t.enhanced_odds}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {/* Home Win */}
            <button
              className={getOddsClassName('home', enhancedHomeOdds)}
              onClick={() => onBetSelect(match.id, 'home', enhancedHomeOdds)}
              onMouseEnter={() => setHoveredOdds('home')}
              onMouseLeave={() => setHoveredOdds(null)}
              aria-label={`${t.home_win}, ${t.odds} ${enhancedHomeOdds.toFixed(2)}`}
            >
              <div className="text-xs mb-1">1</div>
              <div>{enhancedHomeOdds.toFixed(2)}</div>
              {showEnhancedOdds && (
                <div className="absolute -top-1 -right-1 bg-nordic-gold-500 text-black text-xs px-1 rounded-full font-bold">
                  ↗
                </div>
              )}
            </button>

            {/* Draw */}
            <button
              className={getOddsClassName('draw', enhancedDrawOdds)}
              onClick={() => onBetSelect(match.id, 'draw', enhancedDrawOdds)}
              onMouseEnter={() => setHoveredOdds('draw')}
              onMouseLeave={() => setHoveredOdds(null)}
              aria-label={`${t.draw}, ${t.odds} ${enhancedDrawOdds.toFixed(2)}`}
            >
              <div className="text-xs mb-1">X</div>
              <div>{enhancedDrawOdds.toFixed(2)}</div>
              {showEnhancedOdds && (
                <div className="absolute -top-1 -right-1 bg-nordic-gold-500 text-black text-xs px-1 rounded-full font-bold">
                  ↗
                </div>
              )}
            </button>

            {/* Away Win */}
            <button
              className={getOddsClassName('away', enhancedAwayOdds)}
              onClick={() => onBetSelect(match.id, 'away', enhancedAwayOdds)}
              onMouseEnter={() => setHoveredOdds('away')}
              onMouseLeave={() => setHoveredOdds(null)}
              aria-label={`${t.away_win}, ${t.odds} ${enhancedAwayOdds.toFixed(2)}`}
            >
              <div className="text-xs mb-1">2</div>
              <div>{enhancedAwayOdds.toFixed(2)}</div>
              {showEnhancedOdds && (
                <div className="absolute -top-1 -right-1 bg-nordic-gold-500 text-black text-xs px-1 rounded-full font-bold">
                  ↗
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Free Enhanced Odds Comparison */}
        {showEnhancedOdds && !match.isLive && (
          <div className="mt-3 p-3 bg-enhanced-odds/10 rounded-lg border border-enhanced-odds/20">
            <div className="text-xs text-enhanced-odds font-semibold mb-1 flex items-center gap-1">
              🎮 FREE Enhanced vs Real Betting Odds
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="line-through text-gray-500">{match.homeOdds.toFixed(2)}</div>
                <div className="text-enhanced-odds font-bold">{enhancedHomeOdds.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="line-through text-gray-500">{match.drawOdds.toFixed(2)}</div>
                <div className="text-enhanced-odds font-bold">{enhancedDrawOdds.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="line-through text-gray-500">{match.awayOdds.toFixed(2)}</div>
                <div className="text-enhanced-odds font-bold">{enhancedAwayOdds.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Bet Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button 
            className={cn(
              "w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2",
              match.isLive ? 
                "bg-live-500 hover:bg-live-600 text-white shadow-live" :
                "bg-gradient-to-r from-nordic-blue-500 to-nordic-blue-600 hover:from-nordic-blue-600 hover:to-nordic-blue-700 text-white shadow-nordic hover:shadow-xl transform hover:scale-105"
            )}
            onClick={() => {
              // Quick bet on favorite (lowest odds)
              const lowestOdds = Math.min(enhancedHomeOdds, enhancedDrawOdds, enhancedAwayOdds);
              let selection = 'home';
              if (lowestOdds === enhancedDrawOdds) selection = 'draw';
              if (lowestOdds === enhancedAwayOdds) selection = 'away';
              onBetSelect(match.id, selection, lowestOdds);
            }}
          >
            {match.isLive ? <Zap className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            {match.isLive ? `${t.live_betting}` : t.place_bet}
          </button>
        </div>
      </div>
    </div>
  );
};

RealMatchCard.displayName = 'RealMatchCard';

export default RealMatchCard;