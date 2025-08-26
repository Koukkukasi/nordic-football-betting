# Deployment Guide for Nordic Football Betting

This guide will help you deploy the Nordic Football Betting platform using Supabase (database & auth) and Render (hosting).

## Prerequisites

1. **Supabase Account** (Already configured)
   - Project: `hzxptkoosdmjrmafwymq`
   - Database is already set up with credentials

2. **Render Account** (Free tier available)
   - Sign up at: https://render.com

3. **GitHub Repository**
   - Push your code to GitHub for Render deployment

## Step 1: Prepare Database (Supabase)

Your Supabase project is already configured. The database schema will be automatically created when you deploy.

### Verify Supabase Setup:
1. Visit: https://supabase.com/dashboard/project/hzxptkoosdmjrmafwymq
2. Check that the database is running
3. Enable Row Level Security (RLS) for all tables (optional but recommended)

## Step 2: Deploy to Render

### Option A: One-Click Deploy (Recommended)

1. Push your code to GitHub
2. Visit https://dashboard.render.com
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Use these settings:
   - **Name**: `nordic-football-betting`
   - **Region**: Frankfurt (EU)
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`

### Option B: Manual Deploy with render.yaml

1. The `render.yaml` file is already configured in your project
2. Push to GitHub
3. In Render dashboard, click "New +" → "Blueprint"
4. Connect your repository
5. Render will automatically detect the `render.yaml` file

## Step 3: Configure Environment Variables in Render

In your Render service settings, add these environment variables:

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres.hzxptkoosdmjrmafwymq:akEMS5KlbxqPtNSP@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.hzxptkoosdmjrmafwymq:akEMS5KlbxqPtNSP@aws-0-eu-north-1.pooler.supabase.com:5432/postgres

# NextAuth (Update URL after deploy)
NEXTAUTH_URL=https://nordic-football-betting.onrender.com
NEXTAUTH_SECRET=9fnNduyj9x58A955iVzzOU9VAzzhnfUULNdeSRdqRYU=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hzxptkoosdmjrmafwymq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6eHB0a29vc2RtanJtYWZ3eW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3ODQwNTksImV4cCI6MjA2ODM2MDA1OX0.4Sdw0FEBuBAimlP7wEkO2rKQ1Cwll5csDv_F9Al2AdI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6eHB0a29vc2RtanJtYWZ3eW1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc4NDA1OSwiZXhwIjoyMDY4MzYwMDU5fQ.T-SKzYMnvk8tJIHMZv6Z-Vy3_AFalJqVDNPTDtffZTE

# API Football
NEXT_PUBLIC_API_FOOTBALL_KEY=3e488875a4005e2d612514ed3598d033

# App Settings
NEXT_PUBLIC_APP_URL=https://nordic-football-betting.onrender.com
NEXT_PUBLIC_APP_NAME=Nordic Football Betting
NEXT_PUBLIC_ADMIN_PASSWORD=nordic_admin_2024!

NODE_ENV=production
```

## Step 4: Initial Database Setup

After your first deployment:

1. Visit your deployed app URL
2. The database schema will be automatically created via Prisma
3. To seed initial data, run in Render Shell:
   ```bash
   npm run db:seed
   ```

## Step 5: Set Up Automatic Deployments

1. In Render dashboard, go to your service
2. Click "Settings" → "Build & Deploy"
3. Enable "Auto-Deploy" for your main branch
4. Every push to GitHub will trigger a new deployment

## Step 6: Monitor Your App

### Render Dashboard
- View logs: Settings → Logs
- Check metrics: Metrics tab
- Set up health checks: Settings → Health & Alerts

### Supabase Dashboard
- Monitor database: https://supabase.com/dashboard/project/hzxptkoosdmjrmafwymq
- View real-time connections
- Check API usage

## Optional: Custom Domain

1. In Render: Settings → Custom Domains
2. Add your domain (e.g., `nordicfootball.com`)
3. Update DNS settings with your domain provider
4. Update environment variables:
   - `NEXTAUTH_URL=https://yourdomain.com`
   - `NEXT_PUBLIC_APP_URL=https://yourdomain.com`

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if Supabase project is active
- Ensure connection pooling is enabled (pgbouncer)

### Build Failures
- Check build logs in Render
- Ensure all dependencies are in package.json
- Verify Node version compatibility

### Auth Issues
- Update NEXTAUTH_URL after deployment
- Verify Supabase auth settings
- Check callback URLs in OAuth providers

### Performance
- Enable caching headers
- Use Render's CDN
- Consider upgrading to paid tier for better performance

## Local Development

To run locally with production database:

```bash
# Copy production env vars
cp .env.production .env.local

# Update URLs for localhost
NEXTAUTH_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Run development server
npm run dev
```

## Support

- Render Docs: https://render.com/docs
- Supabase Docs: https://supabase.com/docs
- Project Issues: Create issue in GitHub repository

## Security Notes

1. Never commit `.env.local` or `.env.production` to Git
2. Rotate NEXTAUTH_SECRET regularly
3. Use Row Level Security in Supabase
4. Enable 2FA on both Render and Supabase accounts
5. Monitor for suspicious activity in logs

## Costs

- **Supabase Free Tier**: 
  - 500MB database
  - 2GB bandwidth
  - 50,000 requests/month

- **Render Free Tier**:
  - 750 hours/month
  - Auto-sleep after 15 min inactivity
  - Custom domains supported

For production use, consider upgrading both services for better performance and reliability.