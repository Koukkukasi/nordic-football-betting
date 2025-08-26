# Nordic Football Betting - UI/UX Style Guide

## Design Philosophy

Nordic Football Betting embraces a clean, modern Scandinavian design aesthetic that combines functionality with visual appeal. The interface should feel premium yet accessible, focusing on clarity and ease of use.

## Color Palette

### Primary Colors
- **Nordic Blue**: `#023c8e` - Primary brand color (deep blue)
- **Nordic Blue Dark**: `#022f6f` - Hover states and emphasis
- **Nordic Blue Light**: `#0a64ff` - Interactive elements
- **Nordic Accent**: `#022352` - Headers and important UI elements

### Secondary Colors
- **Success Green**: `#10b981` - Winning bets, positive outcomes
- **Warning Yellow**: `#f59e0b` - Attention, special offers
- **Error Red**: `#ef4444` - Losses, errors
- **Neutral Gray**: `#6b7280` - Secondary text, borders

### Background Colors
- **Primary Background**: `#f9fafb` - Main content areas
- **Secondary Background**: `#ffffff` - Cards and elevated surfaces
- **Dark Background**: `#111827` - Footer, dark sections

## Typography

### Font Family
- **Primary**: Inter, system-ui, -apple-system, sans-serif
- **Monospace**: 'SF Mono', Monaco, monospace (for odds, numbers)

### Font Sizes
- **Heading 1**: 3rem (48px) - Page titles
- **Heading 2**: 2rem (32px) - Section headers
- **Heading 3**: 1.5rem (24px) - Subsections
- **Body**: 1rem (16px) - Regular text
- **Small**: 0.875rem (14px) - Secondary information
- **Tiny**: 0.75rem (12px) - Timestamps, meta data

### Font Weights
- **Regular**: 400 - Body text
- **Medium**: 500 - Emphasis
- **Semibold**: 600 - Buttons, important text
- **Bold**: 700 - Headings

## Spacing System

Using a consistent 8px grid system:
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)

## Components

### Buttons

#### Primary Button
```css
background-color: #023c8e;
color: white;
padding: 0.75rem 1.5rem;
border-radius: 0.5rem;
font-weight: 600;
hover: background-color: #022f6f;
```

#### Secondary Button
```css
background-color: white;
color: #023c8e;
border: 2px solid #023c8e;
padding: 0.75rem 1.5rem;
border-radius: 0.5rem;
hover: background-color: #f0f9ff;
```

### Cards
```css
background-color: white;
border-radius: 0.75rem;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
padding: 1.5rem;
```

### Match Cards
- Clear team separation with vs. indicator
- Prominent odds display with hover effects
- Status badges for live/upcoming/finished
- Quick bet buttons for common stakes

### Betting Slip
- Fixed position on desktop (right sidebar)
- Bottom sheet on mobile
- Clear stake input with preset amounts
- Real-time odds validation
- Prominent "Place Bet" CTA

## Layout Principles

### Desktop (≥1024px)
- Maximum content width: 1280px
- 3-column layout: Navigation (240px) | Content (fluid) | Betting Slip (320px)
- 24px gutters between columns

### Tablet (768px - 1023px)
- 2-column layout with collapsible betting slip
- Touch-optimized tap targets (min 44px)

### Mobile (<768px)
- Single column layout
- Bottom navigation bar
- Betting slip as bottom sheet
- Minimum tap target: 48px

## Interaction States

### Hover
- Buttons: Darken by 10%
- Cards: Subtle shadow elevation
- Links: Underline decoration

### Active/Pressed
- Scale: 0.98
- Opacity: 0.9

### Focus
- Outline: 2px solid #0a64ff
- Outline-offset: 2px

### Disabled
- Opacity: 0.5
- Cursor: not-allowed

## Iconography

Using Lucide React icons:
- **Size**: 20px for inline, 24px for standalone
- **Color**: Inherit from parent text
- **Style**: Outline style for consistency

Common icons:
- Trophy: Leaderboards
- Clock: Live matches
- Calendar: Upcoming matches
- Ticket: Betting slip
- User: Profile
- Home: Dashboard

## Nordic-Specific Elements

### Finnish/Swedish Flags
- Use as small badges (16x12px) next to league names
- SVG format for crisp rendering

### League Badges
- Consistent 32x32px size in lists
- 48x48px for featured matches

### Currency Display
- "BetPoints" abbreviated as "BP"
- Large numbers: Use K/M notation (10K, 1.5M)
- Always show 2 decimal places for odds

## Animation Guidelines

### Transitions
- Duration: 200ms for micro-interactions
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Properties: transform, opacity, background-color

### Loading States
- Skeleton screens for content loading
- Spinner for actions (max 2s before feedback)
- Progress bars for multi-step processes

## Accessibility

### Color Contrast
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

### Keyboard Navigation
- All interactive elements accessible via Tab
- Clear focus indicators
- Skip links for main content

### Screen Readers
- Descriptive labels for all buttons
- ARIA labels for complex interactions
- Live regions for dynamic updates

## Mobile-First Approach

Design for mobile first, then enhance for larger screens:
1. Touch-friendly tap targets
2. Thumb-reachable primary actions
3. Simplified navigation
4. Progressive disclosure of information

## Dark Mode (Future)

Prepare for dark mode support:
- Use CSS variables for colors
- Design with sufficient contrast
- Test both light and dark variants

## Performance Guidelines

- Optimize images: WebP format, lazy loading
- Minimize CSS: Use Tailwind's purge
- Code split: Route-based splitting
- Cache static assets: 1 year for fonts/images

## Brand Voice

- **Friendly**: Welcoming to new users
- **Expert**: Knowledgeable about Nordic football
- **Trustworthy**: Clear about virtual currency
- **Engaging**: Encouraging participation

## Error Messaging

- Be specific about what went wrong
- Provide actionable next steps
- Use friendly, non-technical language
- Include error codes for support

Example:
"Oops! The odds have changed. Please review your bet and try again."

## Empty States

- Helpful illustrations or icons
- Clear explanation of the empty state
- Call-to-action to resolve it

Example:
"No bets yet! Start by browsing today's matches."