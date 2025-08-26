# Database Setup Guide

## Option 1: Supabase (Recommended)

### Step 1: Create Account
1. Go to https://supabase.com/
2. Click "Start your project"
3. Sign up with GitHub (easier)

### Step 2: Create Project
```
Project Name: nordic-football-betting
Database Password: [Choose strong password - SAVE THIS!]
Region: Europe West (eu-west-1) or closest to you
Plan: Free (perfect for development)
```

### Step 3: Get Your Keys
Once project is created:
1. Go to Settings → API
2. Copy these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Update Environment
Replace values in `.env.local`:
```env
# Replace these lines with your actual values
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

## Option 2: Local Database (If Supabase fails)

### PostgreSQL Local Setup
1. Download PostgreSQL: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember your password!

### Environment for Local
```env
# For local PostgreSQL
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/nordic_football
```

## Option 3: Railway (Alternative Cloud)

### Railway Setup
1. Go to https://railway.app/
2. Sign up with GitHub
3. Create new PostgreSQL database
4. Get connection URL

### Environment for Railway
```env
DATABASE_URL=postgresql://postgres:password@host:port/database
```

## Next Steps

Once you have database connection:
1. Tell me which option worked
2. I'll create the database schema
3. We'll seed with Nordic teams
4. Enable real user accounts
5. Set up live data scraping

## Troubleshooting

**If Supabase won't load:**
- Try different browser
- Clear browser cache
- Use mobile hotspot
- Try incognito mode
- Check if company/school firewall is blocking

**Connection Issues:**
- Restart your internet
- Try different DNS (8.8.8.8)
- Use VPN if available
- Try Railway or local PostgreSQL instead