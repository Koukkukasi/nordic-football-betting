# 🚀 Quick Database Setup Guide

## Step 1: Update Password (Required!)

### Option A: Automatic Setup (Recommended)
Run `setup-env.bat` - it will:
- Ask for your PostgreSQL password
- Generate a secure NextAuth secret
- Update .env.local automatically

### Option B: Manual Edit
Edit `.env.local` and replace `your_password_here`:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/nordic_football_betting"
```

## Step 2: Create Database

Run `create-database.bat` or use this command:
```bash
"C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres nordic_football_betting
```

## Step 3: Test Connection

```bash
node test-database.js
```

This will verify:
- ✅ PostgreSQL is running
- ✅ Password is correct
- ✅ Database exists

## Step 4: Run Migrations

```bash
npm run db:setup
```

This creates all tables and relationships.

## Step 5: Verify Installation

```bash
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555

## Troubleshooting

### "Authentication failed"
- Wrong password in .env.local
- Run `setup-env.bat` to fix

### "Cannot reach database"
- PostgreSQL service not running
- Start it in Windows Services

### "Database does not exist"
- Run `create-database.bat`
- Or create in pgAdmin

## Files Helper Scripts

| Script | Purpose |
|--------|---------|
| `setup-env.bat` | Configure .env.local with password |
| `create-database.bat` | Create PostgreSQL database |
| `test-database.js` | Test connection |
| `create-database.sql` | SQL script for pgAdmin |

## Ready to Go! 🎉

After setup, restart your dev server:
```bash
npm run dev
```

Your app will now use PostgreSQL for persistent data storage!