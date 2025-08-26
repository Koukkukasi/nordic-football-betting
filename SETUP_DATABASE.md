# Database Setup Guide for Nordic Football Betting

## Prerequisites
✅ PostgreSQL 17.5 is installed (confirmed)
✅ .env.local file created with configuration template

## Step 1: Create Database

Open PowerShell or Command Prompt as Administrator and run:

```powershell
# Access PostgreSQL prompt
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres

# When prompted for password, enter your PostgreSQL password
# Then run:
CREATE DATABASE nordic_football_betting;
\q
```

Alternative method using pgAdmin:
1. Open pgAdmin 4
2. Connect to your PostgreSQL server
3. Right-click on "Databases"
4. Select "Create" > "Database"
5. Name: `nordic_football_betting`
6. Click "Save"

## Step 2: Update .env.local

Edit the file `Ftp_football_game/nordic-football-betting/.env.local` and update:

```env
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/nordic_football_betting"
```

Replace `YOUR_POSTGRES_PASSWORD` with your actual PostgreSQL password.

## Step 3: Run Migrations

```bash
cd Ftp_football_game/nordic-football-betting
npx prisma generate
npx prisma migrate dev --name init
```

## Step 4: Verify Connection

```bash
npx prisma studio
```

This opens http://localhost:5555 to view your database.

## Troubleshooting

- **Connection refused**: Ensure PostgreSQL service is running
- **Authentication failed**: Verify password in .env.local
- **Database exists**: Drop with `DROP DATABASE nordic_football_betting;`

## Security Notes

⚠️ **Important:**
- Never commit .env.local to Git
- Change NEXTAUTH_SECRET to secure random string
- Update admin password for production
