# XP & Progression System - Implementation Guide

## 🎯 Overview

The XP & Progression system is a comprehensive gamification framework for the Nordic Football Betting platform that includes:

- **10-Level Progression System**: Levels 1-10 with increasing XP requirements and rewards
- **12 Achievements**: Bronze, Silver, and Gold achievements across 5 categories
- **Dynamic Daily Challenges**: AI-generated challenges based on user level and game state
- **Real-time XP Tracking**: XP awarded for all betting activities with multipliers
- **Level-Up Celebrations**: Immersive visual and audio feedback
- **Leaderboards**: Multiple leaderboard types for competitive engagement

## 🏗️ System Architecture

### Core Components

1. **Currency System** (`src/lib/currency-system.ts`)
   - XP calculation engine with multipliers
   - Level progression requirements
   - Level-based rewards and benefit unlocks

2. **Achievement System** (`src/lib/achievement-system.ts`)
   - 12 predefined achievements across 5 categories
   - Progress tracking and completion detection
   - Tiered rewards (Bronze/Silver/Gold)

3. **Challenge System** (`src/lib/challenge-system.ts`)
   - Dynamic daily challenge generation
   - Difficulty-based rewards
   - Time-limited objectives

4. **XP Service** (`src/lib/xp-progression-service.ts`)
   - Main service for awarding XP
   - Level-up processing
   - Achievement unlocking
   - Database integration

### UI Components

1. **Level Progress Bar** (`src/components/progression/LevelProgressBar.tsx`)
   - Animated XP progress visualization
   - Next level requirements display

2. **Level-Up Celebration** (`src/components/progression/LevelUpCelebration.tsx`)
   - Full-screen celebration with confetti
   - Sound effects and reward display
   - Feature unlock announcements

3. **Achievement Notification** (`src/components/notifications/AchievementNotification.tsx`)
   - Modal achievement unlock notification
   - Tier-based styling and animations

4. **Daily Challenges Widget** (`src/components/progression/DailyChallengesWidget.tsx`)
   - Challenge progress tracking
   - Reward claiming interface
   - Countdown timers

5. **Progression Dashboard** (`src/components/progression/ProgressionDashboard.tsx`)
   - Comprehensive overview of user progress
   - Tabbed interface for different aspects
   - Activity feed and statistics

6. **Leaderboard Widget** (`src/components/leaderboard/LeaderboardWidget.tsx`)
   - Multiple leaderboard types
   - User position tracking
   - Competitive rankings

### API Endpoints

1. **XP System** (`src/app/api/progression/xp/route.ts`)
   - Award XP for actions
   - Get user progression data
   - XP leaderboards

2. **Daily Challenges** (`src/app/api/challenges/daily/route.ts`)
   - Generate daily challenges
   - Get active challenges for user

3. **Challenge Claims** (`src/app/api/challenges/claim/route.ts`)
   - Claim challenge rewards
   - Validate completion

4. **Leaderboards** (`src/app/api/leaderboard/route.ts`)
   - Multiple leaderboard types
   - User position calculation

## 🚀 Integration Guide

### 1. Database Setup

First, ensure your Prisma schema includes the progression models. The system uses:

```typescript
// Key models in schema.prisma:
- User (with XP, level, stats fields)
- Achievement & UserAchievement
- Challenge & ChallengeProgress
- Transaction (for reward tracking)
- Notification (for user alerts)
```

### 2. Seed Achievements

Run the achievement seeder to populate the database:

```typescript
import { seedAchievements } from '@/lib/achievements-seeder'

// In your seed script or admin panel
await seedAchievements()
```

### 3. Award XP for Actions

Integrate XP awarding into your betting system:

```typescript
import { XPService, XPActionType } from '@/lib/xp-progression-service'

// When a bet is placed
await XPService.awardXP(userId, XPActionType.BET_PLACED, {
  stake: betAmount,
  odds: betOdds,
  isDerby: match.isDerby,
  isLive: betType === 'LIVE'
})

// When a bet wins
await XPService.awardXP(userId, XPActionType.BET_WON, {
  winAmount: winnings,
  odds: betOdds,
  streak: userWinStreak
})

// For daily login
await XPService.awardXP(userId, XPActionType.DAILY_LOGIN, {
  streak: loginStreak
})
```

### 4. Add UI Components

Add progression components to your pages:

```typescript
// In your dashboard or profile page
import ProgressionDashboard from '@/components/progression/ProgressionDashboard'
import XPProgressBar from '@/components/progression/XPProgressBar'
import LeaderboardWidget from '@/components/leaderboard/LeaderboardWidget'

// Usage examples:
<XPProgressBar 
  currentLevel={user.level}
  currentXP={user.xp}
  animated={true}
  showRewards={true}
/>

<LeaderboardWidget 
  userId={user.id}
  defaultType="level"
  showUserPosition={true}
/>
```

### 5. Handle Level-Up Events

Listen for level-up events and show celebrations:

```typescript
import { useState } from 'react'
import LevelUpCelebration from '@/components/progression/LevelUpCelebration'

const [showLevelUp, setShowLevelUp] = useState(false)
const [levelUpData, setLevelUpData] = useState(null)

// After XP award, check for level-up
const result = await XPService.awardXP(userId, action, context)
if (result.levelUp) {
  setLevelUpData(result.levelUp)
  setShowLevelUp(true)
}

// In your JSX
<LevelUpCelebration
  isVisible={showLevelUp}
  levelUpData={levelUpData}
  onClose={() => setShowLevelUp(false)}
  onClaimRewards={() => {
    // Handle reward claiming
    setShowLevelUp(false)
  }}
/>
```

### 6. Set Up Daily Challenges

Create a daily cron job to generate challenges:

```typescript
// In your cron job or scheduled function
import { generateTodaysChallenges } from '@/app/api/challenges/daily/route'

// Run daily at midnight
await generateTodaysChallenges()
```

## 📊 XP Earning Activities

### Base XP Awards

| Action | Base XP | Conditions |
|--------|---------|------------|
| Bet Placed | 5-50 | Based on stake amount |
| Bet Won | 15-100 | Based on winnings + odds |
| Live Bet Placed | 10-65 | Higher than regular bets |
| Live Bet Won | 25-150 | Premium for live betting |
| Derby Bet | +50% | Extra for derby matches |
| Daily Login | 10-50 | Streak bonuses |
| First Bet of Day | +25 | Daily engagement bonus |
| Challenge Completed | 25-400 | Based on difficulty |
| Achievement Unlocked | 50-500 | Tier-based rewards |

### XP Multipliers

- **Weekend Boost**: 1.5x XP on weekends
- **Login Streak**: Up to 1.5x for 15+ day streaks
- **Level Veteran**: 1.1x - 1.7x based on user level
- **Derby Matches**: 2.0x XP multiplier
- **High Odds**: 1.5x for bets with 5.0+ odds

## 🏆 Achievement Categories

### 1. Betting (3 achievements)
- **First Bet** (Bronze): Place your first bet
- **Combo Master** (Silver): Win a 5+ selection combo
- **High Roller** (Gold): 50 bets over 1000 BP

### 2. Winning (3 achievements)
- **First Win** (Bronze): Win your first bet
- **Win Streak** (Silver): 5 consecutive wins
- **Big Winner** (Gold): Single win of 10,000+ BP

### 3. Loyalty (2 achievements)
- **Daily Visitor** (Silver): 7-day login streak
- **Veteran Player** (Gold): Reach level 10

### 4. Special (2 achievements)
- **Derby Specialist** (Silver): Win 10 derby matches
- **Live Legend** (Gold): Win 25 live bets

### 5. Social (2 achievements)
- **Team Supporter** (Bronze): Bet on favorite team 10 times
- **Challenge Champion** (Silver): Complete 20 daily challenges

## 🎯 Daily Challenges

### Challenge Types

1. **Easy Challenges** (70% probability)
   - Place 3 bets today
   - Win 2 bets today
   - Place bets under 2.0 odds
   - Bet on 3 different leagues

2. **Medium Challenges** (25% probability)
   - Place a 4+ selection combo
   - Win a bet with 3.0+ odds
   - Place 3 live bets
   - Win 3 bets in a row

3. **Hard Challenges** (5% probability)
   - Win a bet worth 2000+ BP
   - Win a 6+ selection combo
   - Place 5 high-stake bets (500+ BP)

### Special Challenges
- **Weekend Warrior**: Place 10 bets over weekend
- **Derby Day**: Win 2 derby matches (when available)

## 💎 Level Benefits

| Level | BetPoints | Diamonds | Max Stake | Max Active Bets | Features Unlocked |
|-------|-----------|----------|-----------|-----------------|-------------------|
| 1 | 0 | 0 | 50 BP | 3 | Basic betting |
| 2 | 500 | 10 | 100 BP | 4 | Diamond Boosts |
| 3 | 1,000 | 20 | 200 BP | 5 | Live Betting |
| 4 | 1,500 | 30 | 300 BP | 6 | Cash Out Feature |
| 5 | 2,000 | 50 | 500 BP | 7 | VIP Tournaments |
| 6 | 3,000 | 75 | 750 BP | 8 | Advanced Statistics |
| 7 | 4,000 | 100 | 1,000 BP | 9 | Custom Bet Builder |
| 8 | 5,000 | 150 | 1,500 BP | 10 | Premium Insights |
| 9 | 7,500 | 200 | 2,000 BP | 12 | Elite Challenges |
| 10 | 10,000 | 300 | 5,000 BP | 15 | Legend Status |

## 🔧 Configuration

### Environment Variables

```env
# Admin key for challenge generation
ADMIN_SECRET_KEY=your_secret_key_here

# Database connection
DATABASE_URL=your_database_url_here
```

### Customization Options

1. **XP Multipliers**: Modify in `currency-system.ts`
2. **Level Requirements**: Adjust `XP_REQUIREMENTS` constant
3. **Achievement Criteria**: Edit `ACHIEVEMENTS` array
4. **Challenge Templates**: Modify `CHALLENGE_TEMPLATES`

## 📱 Mobile Considerations

All components are responsive and include:
- Touch-friendly interfaces
- Optimized animations for mobile
- Condensed layouts for small screens
- Progressive loading for better performance

## 🚨 Performance Notes

- XP calculations are optimized for speed
- Achievement checks use efficient database queries
- Leaderboards are cached and paginated
- Heavy animations can be disabled via props

## 🐛 Troubleshooting

### Common Issues

1. **XP not awarded**: Check if XPService.awardXP is called correctly
2. **Achievements not unlocking**: Verify achievement criteria and database seeding
3. **Challenges not generating**: Ensure daily cron job is running
4. **Level-up not showing**: Check for proper event handling

### Debug Tools

- Use `verifyAchievements()` to check achievement integrity
- Monitor XP transactions in the database
- Check API responses for error messages
- Use browser console for frontend debugging

## 🔄 Maintenance

### Regular Tasks

1. **Daily**: Generate new challenges
2. **Weekly**: Clean up old notifications
3. **Monthly**: Analyze progression metrics
4. **Quarterly**: Review and adjust XP rewards

### Monitoring

- Track average user level progression
- Monitor achievement completion rates
- Analyze challenge engagement
- Watch for XP inflation or deflation

## 🎊 Conclusion

The XP & Progression system provides a comprehensive gamification framework that encourages user engagement through:

- Immediate feedback via XP rewards
- Long-term progression through levels
- Achievement hunting for completionists
- Daily challenges for regular engagement
- Social competition via leaderboards

The system is designed to be flexible, performant, and engaging while maintaining the integrity of the betting experience.