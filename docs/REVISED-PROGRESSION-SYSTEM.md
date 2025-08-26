# Nordic Football Betting - Revised Progression System
## Game Design Document v2.0

---

## Executive Summary

The Nordic Football Betting platform is a free-to-play sports prediction game where players progress through 10 levels (Rookie to Legend) by making accurate predictions on Nordic football matches. All game modes are available from Level 1, with progression unlocking higher stakes and more simultaneous predictions.

**Core Philosophy**: Predict, Win, Level Up, Unlock More

---

## 1. Core Game Loop

### Primary Cycle (15-20 minutes)
1. **Check Standings** → Browse current league tables and stats
2. **Make Predictions** → Place bets on matches (Tulosveto/Pitkäveto)
3. **Play Mini-Games** → Make quick predictions to earn diamonds
4. **Live Betting** → Use diamonds for real-time match predictions
5. **Earn XP** → Level up to unlock higher limits
6. **Repeat** → More capacity for predictions

### Progression Formula
```
Total XP = Base XP × Accuracy Multiplier × Level Multiplier × Special Bonuses

Where:
- Base XP: 5-500 depending on prediction type
- Accuracy Multiplier: 1.0-3.0 based on odds
- Level Multiplier: 1.0-3.0 based on player level
- Special Bonuses: Derby (2x), Weekend (1.2x), Streak (1.5x)
```

---

## 2. Level Progression System

### Level Requirements and Capabilities

| Level | Title | XP Required | Max Stake | Simultaneous Bets | Pitkäveto Games | Live Bets | Diamond Cost |
|-------|-------|-------------|-----------|-------------------|-----------------|-----------|--------------|
| 1 | Rookie | 0 | 100 BP | 3 | 2-3 | 1 | 3 💎 |
| 2 | Amateur | 100 | 250 BP | 5 | 4 | 2 | 3 💎 |
| 3 | Regular | 300 | 500 BP | 8 | 5 | 3 | 2 💎 |
| 4 | Experienced | 600 | 1,000 BP | 12 | 6 | 4 | 2 💎 |
| 5 | Veteran | 1,000 | 2,000 BP | 15 | 8 | 5 | 1 💎 |
| 6 | Professional | 2,000 | 3,500 BP | 20 | 10 | 7 | 1 💎 |
| 7 | Expert | 3,500 | 5,000 BP | 25 | 12 | 10 | 1 💎 |
| 8 | Master | 5,500 | 7,500 BP | 30 | 15 | 8 | 1 💎 |
| 9 | Champion | 8,500 | 10,000 BP | 40 | 18 | 10 | 1 💎 |
| 10 | Legend | 12,500 | 25,000 BP | 20 | 20 | 12 | 1 💎 |

### Level-Up Rewards
- **BetPoints**: 500-50,000 BP (scaling with level)
- **Diamonds**: 5-500 💎 (scaling with level)
- **Special Badges**: At levels 5, 8, and 10
- **Multipliers**: XP and leaderboard bonuses increase

---

## 3. Three-Tier Betting System

### Tier 1: Tulosveto (Single Match Predictions)
- **Currency**: BetPoints
- **Purpose**: Quick, simple predictions
- **Markets**: 1X2, Over/Under, BTTS
- **XP Rewards**: 
  - Placed: 5 XP
  - Won: 15 XP
  - High odds win (>3.0): 30 XP

### Tier 2: Pitkäveto (Accumulator Predictions)
- **Currency**: BetPoints
- **Purpose**: Higher risk/reward, main XP source
- **Selections**: 2-20 matches (based on level)
- **XP Rewards**:
  - 3 selections won: 40 XP
  - 5 selections won: 75 XP
  - 10 selections won: 150 XP
  - 15 selections won: 300 XP
  - 20 selections won: 500 XP

### Tier 3: Live Betting (Real-Time Predictions)
- **Currency**: Diamonds
- **Purpose**: Premium experience during matches
- **Features**: Dynamic odds, cash out option
- **XP Rewards**:
  - Placed: 7 XP
  - Won: 20 XP
  - Diamond reward chance: 10-75% (based on level)

---

## 4. Prediction Mini-Games (Diamond Economy)

### Core Concept: Real Predictions, Not Quizzes
Players make actual predictions about upcoming matches and player performances to earn diamonds.

### Mini-Game Types

#### 1. **Next Goal Scorer** (1-2 💎)
- Predict who scores next in LIVE matches
- 3 options from top scorers
- Resolution: Within next 15 minutes
- Accuracy rate: 33% baseline

#### 2. **Match Result Predictor** (2-3 💎)
- Predict result of match starting in next hour
- Simple 1X2 prediction
- Resolution: After match ends
- Accuracy rate: 40% expected

#### 3. **Goals Over/Under** (1-2 💎)
- Predict if match will have Over/Under 2.5 goals
- For matches starting soon
- Resolution: After match ends
- Accuracy rate: 50% baseline

#### 4. **First Half Winner** (2-3 💎)
- Predict halftime result
- For matches starting in 30 mins
- Resolution: After first half
- Accuracy rate: 35% expected

#### 5. **Both Teams Score** (1-2 💎)
- Simple Yes/No prediction
- For any upcoming match
- Resolution: After match ends
- Accuracy rate: 45% baseline

#### 6. **Correct Score Challenge** (3-5 💎)
- Predict exact final score
- High difficulty, high reward
- Resolution: After match ends
- Accuracy rate: 10% expected

#### 7. **Multi-Match Predictor** (2-4 💎)
- Predict 3 match results
- All must be correct to win
- Resolution: After all matches end
- Accuracy rate: 15% expected

#### 8. **Top Scorer Today** (3-4 💎)
- Predict which player scores most goals today
- From list of 5 strikers
- Resolution: End of day
- Accuracy rate: 20% expected

### Mini-Game Mechanics
- **Cooldowns**: 15-60 minutes between plays
- **Daily Limits**: 10-20 predictions per day
- **Cost**: Most free, some cost 10-50 BP
- **Resolution Time**: 15 minutes to 24 hours
- **Pending Rewards**: Diamonds awarded when prediction resolves

### Diamond Earning Potential
- **Casual Player**: 5-10 💎 per day
- **Active Player**: 10-20 💎 per day
- **Expert Predictor**: 20-30 💎 per day

---

## 5. XP System Details

### XP Sources and Values

| Action | Base XP | Multipliers |
|--------|---------|-------------|
| Single bet placed | 5 | Odds multiplier |
| Single bet won | 15 | Odds × Level |
| Pitkäveto 3 won | 40 | Level × Streak |
| Pitkäveto 5 won | 75 | Level × Streak |
| Pitkäveto 10 won | 150 | Level × Streak |
| Live bet placed | 7 | None |
| Live bet won | 20 | Level only |
| Mini-game correct | 10-25 | Difficulty |
| Daily login | 10 | Streak bonus |
| First bet of day | 15 | None |
| Derby bet won | 50 | 2x multiplier |
| Perfect day | 100 | All bets won |

### Level Progression Time Estimates
- **Casual Player** (30 min/day): 
  - Level 5: 2-3 months
  - Level 10: 8-12 months
  
- **Regular Player** (1 hour/day):
  - Level 5: 1-2 months
  - Level 10: 4-6 months
  
- **Dedicated Player** (2+ hours/day):
  - Level 5: 3-4 weeks
  - Level 10: 2-3 months

---

## 6. Currency Economy

### BetPoints (BP)
- **Starting Amount**: 10,000 BP
- **Daily Income**: 500-5,000 BP (from wins/bonuses)
- **Primary Sink**: Betting stakes
- **Secondary Sources**: Daily login, challenges, level rewards

### Diamonds (💎)
- **Starting Amount**: 50 💎
- **Daily Income**: 5-20 💎 (from mini-games)
- **Primary Sink**: Live betting
- **Cost Reduction**: 3 → 2 → 1 💎 as you level up

### Economy Balance
```
Expected Value per Bet = Stake × (Win Rate × Odds - 1)

Target EV: -15% to -20% (house edge)
This ensures long-term sustainability while keeping game fun
```

---

## 7. Player Retention Mechanics

### Daily Engagement (20-30 minutes)
1. **Login Bonus**: 100-3,000 BP (streak-based)
2. **Daily Challenges**: 3 tasks for XP/BP
3. **Mini-Game Predictions**: 5-10 quick predictions
4. **Main Betting**: 2-3 Pitkäveto selections

### Weekly Goals
- Win 10 bets: 500 BP bonus
- Make 20 predictions: 10 💎 bonus
- Reach new level: 2x XP weekend

### Monthly Competitions
- Leaderboard rankings
- Prediction accuracy contests
- Special derby months
- Seasonal championships

### Social Features
- Friend challenges
- Prediction sharing
- Team supporters clubs
- Weekly prediction leagues

---

## 8. Game Balance Analysis

### XP Curve Balance
- **Early Levels (1-3)**: Quick progression, 1-2 days each
- **Mid Levels (4-6)**: Moderate pace, 1-2 weeks each
- **High Levels (7-9)**: Slow progression, 3-4 weeks each
- **Max Level (10)**: Prestige goal, 1-2 months

### Risk/Reward Ratios
- **Tulosveto**: Low risk (100 BP), Low reward (1.5-3x)
- **Pitkäveto**: Medium risk (200 BP), High reward (5-100x)
- **Live Betting**: High risk (diamonds), Variable reward (1.2-5x)

### Win Rate Targets
- **Single Bets**: 40-45% win rate
- **Pitkäveto 3**: 20-25% win rate
- **Pitkäveto 5+**: 5-10% win rate
- **Live Betting**: 35-40% win rate
- **Mini-Games**: 30-40% accuracy

---

## 9. Monetization Strategy (F2P Sustainable)

### Core Principle
100% free-to-play with no pay-to-win elements. Optional cosmetic purchases only.

### Optional Purchases (Future)
- **Avatar Customization**: Team jerseys, badges
- **Prediction Themes**: Custom bet slip designs
- **Statistics Pro**: Advanced analytics dashboard
- **Ad Removal**: One-time purchase
- **Season Pass**: Cosmetic rewards track

### Sustainability Model
- Low server costs (turn-based predictions)
- Community-driven content
- Optional ads between matches
- Sponsorship opportunities
- No real-money gambling = lower regulatory costs

---

## 10. Success Metrics

### Key Performance Indicators
- **Day 1 Retention**: Target 40%
- **Day 7 Retention**: Target 20%
- **Day 30 Retention**: Target 10%
- **Daily Active Users**: 25% of monthly
- **Average Session**: 20-30 minutes
- **Level 5 Achievement**: 30% of players
- **Level 10 Achievement**: 5% of players

### Engagement Metrics
- **Predictions per Session**: 5-10
- **Mini-Games per Day**: 3-5
- **Diamond Spending Rate**: 70% of earned
- **Social Features Usage**: 40% of players

---

## 11. Implementation Priorities

### Phase 1: Core Systems
1. Level progression with betting limits
2. Three-tier betting system
3. Basic XP rewards
4. Simple mini-game predictions

### Phase 2: Engagement
1. Full mini-game suite
2. Daily challenges
3. Leaderboards
4. Achievement system

### Phase 3: Social
1. Friend system
2. Prediction sharing
3. Team leagues
4. Tournaments

### Phase 4: Polish
1. Advanced statistics
2. Cosmetic customization
3. Season pass
4. Special events

---

## Conclusion

This progression system creates a compelling free-to-play experience where:
- **All content is accessible** from day one
- **Progression provides meaningful benefits** without gating content
- **Predictions drive engagement**, not random chance
- **Mini-games complement main gameplay** with diamond rewards
- **Social features enhance** long-term retention

The system balances immediate gratification with long-term goals, creating a sustainable and engaging football prediction platform that celebrates Nordic football culture while providing entertainment value without financial risk.

---

*Document Version: 2.0*
*Last Updated: Current Date*
*Game Design Lead: Nordic Football Betting Team*