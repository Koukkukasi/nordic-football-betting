# 🚀 Quick Deployment Steps

## Step 1: Create GitHub Repository ✅

1. Go to: https://github.com/new
2. Repository settings:
   - **Name**: `nordic-football-betting`
   - **Visibility**: Public (recommended for Render free tier)
   - **DO NOT** initialize with README, .gitignore, or license
3. Click "Create repository"

## Step 2: Push Code to GitHub

Run the batch file:
```bash
push-to-github.bat
```

Or manually:
```bash
git remote add origin https://github.com/YOUR_USERNAME/nordic-football-betting.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy on Render

1. Go to: https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select the `nordic-football-betting` repository
5. Configure:
   - **Name**: `nordic-football-betting`
   - **Region**: Frankfurt (EU)
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
   - **Plan**: Free

## Step 4: Add Environment Variables in Render

Click "Environment" tab and add these variables:

```env
DATABASE_URL=postgresql://postgres.hzxptkoosdmjrmafwymq:akEMS5KlbxqPtNSP@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.hzxptkoosdmjrmafwymq:akEMS5KlbxqPtNSP@aws-0-eu-north-1.pooler.supabase.com:5432/postgres

NEXTAUTH_URL=https://YOUR-APP-NAME.onrender.com

NEXTAUTH_SECRET=9fnNduyj9x58A955iVzzOU9VAzzhnfUULNdeSRdqRYU=

NEXT_PUBLIC_SUPABASE_URL=https://hzxptkoosdmjrmafwymq.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6eHB0a29vc2RtanJtYWZ3eW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3ODQwNTksImV4cCI6MjA2ODM2MDA1OX0.4Sdw0FEBuBAimlP7wEkO2rKQ1Cwll5csDv_F9Al2AdI

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6eHB0a29vc2RtanJtYWZ3eW1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc4NDA1OSwiZXhwIjoyMDY4MzYwMDU5fQ.T-SKzYMnvk8tJIHMZv6Z-Vy3_AFalJqVDNPTDtffZTE

NEXT_PUBLIC_API_FOOTBALL_KEY=3e488875a4005e2d612514ed3598d033

NEXT_PUBLIC_APP_URL=https://YOUR-APP-NAME.onrender.com

NEXT_PUBLIC_APP_NAME=Nordic Football Betting

NEXT_PUBLIC_ADMIN_PASSWORD=nordic_admin_2024!

NODE_ENV=production
```

**IMPORTANT**: Replace `YOUR-APP-NAME` with your actual Render app name!

## Step 5: Deploy

Click **"Create Web Service"** and wait for deployment (5-10 minutes).

## Step 6: Verify Deployment

1. Visit your app URL: `https://YOUR-APP-NAME.onrender.com`
2. The database schema will auto-create on first run
3. Check logs in Render dashboard if any issues

## 🎉 Success Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] App accessible via URL

## 📝 Notes

- **Free Tier Limits**: Render free tier sleeps after 15 min of inactivity
- **Database**: Using your existing Supabase database (500MB free)
- **API-Football**: 100 requests/day on free tier

## 🆘 Troubleshooting

### Build Fails
- Check Render logs for specific errors
- Ensure all dependencies are in package.json
- Verify Node version compatibility

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Supabase dashboard for database status
- Ensure connection pooling is enabled

### App Not Loading
- Check NEXTAUTH_URL matches your Render URL
- Verify all environment variables are set
- Look at browser console for errors

## 🔗 Important Links

- **Your App**: https://YOUR-APP-NAME.onrender.com
- **Render Dashboard**: https://dashboard.render.com
- **Supabase Dashboard**: https://supabase.com/dashboard/project/hzxptkoosdmjrmafwymq
- **GitHub Repo**: https://github.com/YOUR_USERNAME/nordic-football-betting