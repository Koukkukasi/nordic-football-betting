# Nordic Football Betting - Free to Play

The single free-to-play Nordic football betting platform.

## Quick Start

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Run the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## UI/UX Status

✅ **Working:**
- Landing page with Nordic theme (blue/green gradient)
- Hero section with key features
- League showcase (Finnish & Swedish leagues)
- Responsive design
- Navigation structure

⚠️ **Known Issues:**
- Some TypeScript errors in API routes (non-blocking for UI)
- Missing database configuration (Prisma/Supabase)
- Authentication not configured

## Available Pages

- `/` - Main landing page (working)
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/betting/live` - Live betting interface
- `/betting/pitkaveto` - Traditional betting
- `/leagues` - League overview
- `/dashboard` - User dashboard

## Tech Stack

- Next.js 15
- React 19 (RC)
- TypeScript
- Tailwind CSS
- Prisma (database ORM)
- Supabase (authentication & realtime)

## Development

The UI is now functional and accessible. The main landing page showcases:
- Nordic football betting concept
- Free-to-play model with 10,000 BetPoints
- Diamond economy system
- Finnish and Swedish league coverage
- Enhanced odds features

To continue development, you'll need to:
1. Configure database connection
2. Set up authentication
3. Implement betting logic
4. Connect to real match data