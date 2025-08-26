# Nordic Football Betting - UI/UX Design System

## 🎨 Design Philosophy

### Core Principles
1. **Nordic Minimalism** - Clean, functional, no unnecessary elements
2. **Trust & Transparency** - Clear information, no hidden details
3. **Mobile-First** - Optimized for mobile betting on the go
4. **Accessibility** - WCAG 2.1 AA compliant
5. **Performance** - Fast loading, smooth interactions

## 🎭 Visual Identity

### Brand Colors
```css
/* Primary - Nordic Blue */
--nordic-blue: #003580;        /* Finnish flag blue */
--nordic-blue-light: #0051A5;  /* Hover state */
--nordic-blue-dark: #002451;   /* Active state */

/* Secondary - Swedish Yellow */
--swedish-yellow: #FECC02;     /* Accent color */
--swedish-yellow-light: #FFD633;
--swedish-yellow-dark: #E5B800;

/* Neutral Palette */
--nordic-white: #FFFFFF;       /* Snow white */
--nordic-gray-50: #F9FAFB;     /* Background */
--nordic-gray-100: #F3F4F6;    /* Cards */
--nordic-gray-200: #E5E7EB;    /* Borders */
--nordic-gray-300: #D1D5DB;    /* Disabled */
--nordic-gray-400: #9CA3AF;    /* Placeholder */
--nordic-gray-500: #6B7280;    /* Secondary text */
--nordic-gray-600: #4B5563;    /* Primary text */
--nordic-gray-700: #374151;    /* Headings */
--nordic-gray-800: #1F2937;    /* Dark text */
--nordic-gray-900: #111827;    /* Black */

/* Semantic Colors */
--success-green: #059669;      /* Wins, profits */
--warning-amber: #D97706;      /* Warnings */
--danger-red: #DC2626;         /* Losses, errors */
--info-blue: #0891B2;          /* Information */

/* Live Betting Colors */
--live-pulse: #EF4444;         /* Live indicator */
--live-bg: #FEF2F2;            /* Live card background */
```

### Typography
```css
/* Font Stack */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Courier New', monospace;

/* Font Sizes - Mobile First */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing System
```css
/* 8px Grid System */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## 🏗️ Component Architecture

### 1. Navigation
```
[Player Navigation]
┌─────────────────────────────────────────────────┐
│ 🇫🇮 Nordic Football  | Matches | Live | My Bets │
│                       | BP: 10,000 | 💎 50      │
└─────────────────────────────────────────────────┘

[Mobile Navigation]
┌───┬─────────────────────────────┬──────────┐
│ ☰ │  🇫🇮 Nordic Football        │ BP: 10K  │
└───┴─────────────────────────────┴──────────┘
```

### 2. Match Cards
```
[Standard Match Card]
┌─────────────────────────────────────┐
│ Veikkausliiga • Today 18:00        │
│                                     │
│ HJK Helsinki    [1.85] [3.40] [4.20]│
│ vs                 1    X     2     │
│ FC Inter Turku                      │
│                                     │
│ [→ View More Markets]               │
└─────────────────────────────────────┘

[Live Match Card]
┌─────────────────────────────────────┐
│ 🔴 LIVE • 67'     HJK 2-1 Inter    │
│                                     │
│ Next Goal: [1.65] [2.10]           │
│            HJK    Inter             │
│                                     │
│ [⚡ Quick Bet] [📊 Stats]           │
└─────────────────────────────────────┘
```

### 3. Betting Slip
```
[Betting Slip - Collapsed]
┌──────────────────┐
│ 🎯 Bet Slip (3)  │
│ Total: 2.45x     │
└──────────────────┘

[Betting Slip - Expanded]
┌─────────────────────────────────┐
│ 🎯 Your Bet Slip                │
├─────────────────────────────────┤
│ ✓ HJK Helsinki @ 1.85           │
│   vs FC Inter • Result: 1       │
│                                 │
│ ✓ KuPS vs SJK @ 2.10           │
│   vs SJK • Over 2.5             │
│                                 │
│ Stake: [___500___] BP           │
│ Potential Win: 1,942 BP         │
│                                 │
│ [Place Bet] [Clear All]         │
└─────────────────────────────────┘
```

### 4. User Dashboard
```
[Dashboard Layout]
┌─────────────────────────────────────┐
│ Welcome back, Player!              │
├─────────────────────────────────────┤
│ Balance     │ Today's Stats         │
│ BP: 10,000  │ Bets: 5              │
│ 💎: 50      │ Won: 3                │
├─────────────────────────────────────┤
│ Quick Actions                       │
│ [Daily Bonus] [Live Bets] [Rewards]│
├─────────────────────────────────────┤
│ Recent Bets                         │
│ • HJK vs Inter - Won +850 BP       │
│ • KuPS vs SJK - Lost -200 BP       │
└─────────────────────────────────────┘
```

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
--mobile: 0px;        /* Default */
--tablet: 768px;      /* iPad */
--desktop: 1024px;    /* Desktop */
--wide: 1280px;       /* Wide screens */
```

## 🎯 User Flows

### 1. First-Time User Flow
```
Landing → Start Playing → Browse Matches → Place First Bet → View Results
```

### 2. Returning User Flow
```
Landing → Dashboard → Check Daily Bonus → Live Betting → Cash Out
```

### 3. Betting Flow
```
Select Match → Choose Market → Add to Slip → Set Stake → Confirm → Track
```

## ♿ Accessibility Guidelines

### Focus States
- All interactive elements have visible focus indicators
- Tab order follows logical reading order
- Skip links for keyboard navigation

### Color Contrast
- Text: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Interactive elements: Minimum 3:1 ratio

### Screen Readers
- Semantic HTML structure
- ARIA labels for icons
- Live regions for dynamic content

## 🚀 Performance Targets

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Loading Strategy
1. Critical CSS inline
2. Lazy load images
3. Code splitting by route
4. Prefetch likely next pages

## 🧩 Component Library

### Buttons
```tsx
// Primary Button
<button className="nordic-btn-primary">
  Place Bet
</button>

// Secondary Button
<button className="nordic-btn-secondary">
  View Markets
</button>

// Ghost Button
<button className="nordic-btn-ghost">
  Cancel
</button>
```

### Cards
```tsx
// Standard Card
<div className="nordic-card">
  Content
</div>

// Live Card
<div className="nordic-card-live">
  Live Content
</div>
```

### Forms
```tsx
// Input Field
<input className="nordic-input" />

// Select Dropdown
<select className="nordic-select">
  <option>Option</option>
</select>
```

## 🎮 Micro-interactions

### Hover Effects
- Scale: 1.02 on cards
- Brightness: 110% on buttons
- Underline on links

### Loading States
- Skeleton screens for content
- Spinner for actions
- Progress bars for multi-step

### Feedback
- Toast notifications for success/error
- Haptic feedback on mobile
- Sound effects (optional)

## 📊 Data Visualization

### Odds Display
- Always show decimal format (1.85)
- Highlight value bets (green)
- Show movement arrows (↑↓)

### Statistics
- Use bar charts for comparisons
- Line charts for trends
- Pie charts for distributions

## 🔄 State Management

### Loading States
1. Initial load - Skeleton
2. Refreshing - Subtle spinner
3. Error - Clear message with retry

### Empty States
- Helpful illustrations
- Clear call-to-action
- Suggestions for next steps

## 🌍 Internationalization

### Supported Languages
1. English (default)
2. Finnish (Suomi)
3. Swedish (Svenska)

### Currency Format
- BetPoints: 10,000 BP
- Diamonds: 💎 50
- Odds: 1.85 (decimal)

## 📝 Content Guidelines

### Tone of Voice
- Friendly but professional
- Clear and concise
- Encouraging for wins
- Supportive for losses

### Error Messages
```
❌ Bad: "Error 404"
✅ Good: "Match not found. Try browsing current matches."
```

### Success Messages
```
✅ "Bet placed! Good luck!"
✅ "Congratulations! You won 850 BP!"
```

## 🎯 Implementation Checklist

- [ ] Set up color variables
- [ ] Configure typography
- [ ] Create component library
- [ ] Implement responsive grid
- [ ] Add loading states
- [ ] Set up error handling
- [ ] Configure animations
- [ ] Test accessibility
- [ ] Optimize performance
- [ ] Add analytics tracking

## 🚦 Design Tokens

```json
{
  "colors": {
    "primary": "#003580",
    "secondary": "#FECC02",
    "background": "#F9FAFB",
    "text": "#4B5563"
  },
  "spacing": {
    "unit": 8,
    "scale": [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64]
  },
  "breakpoints": {
    "mobile": 0,
    "tablet": 768,
    "desktop": 1024,
    "wide": 1280
  }
}
```

## 🎨 CSS Architecture

### File Structure
```
styles/
├── base/
│   ├── reset.css
│   ├── typography.css
│   └── variables.css
├── components/
│   ├── buttons.css
│   ├── cards.css
│   └── forms.css
├── layouts/
│   ├── grid.css
│   └── navigation.css
└── utilities/
    ├── spacing.css
    └── responsive.css
```

This design system ensures a consistent, professional, and uniquely Nordic betting experience across all touchpoints of the platform.