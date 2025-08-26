@echo off
echo ========================================
echo Nordic Football Betting Database Setup
echo ========================================
echo.
echo This script will create the PostgreSQL database
echo.
echo Please enter your PostgreSQL password when prompted.
echo.
echo Creating database: nordic_football_betting
echo ========================================
echo.

"C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres -h localhost nordic_football_betting

if %ERRORLEVEL% == 0 (
    echo.
    echo ✅ SUCCESS: Database 'nordic_football_betting' created successfully!
    echo.
    echo Next steps:
    echo 1. Update the password in .env.local file
    echo 2. Run: npm run prisma:migrate
    echo.
) else (
    echo.
    echo ⚠️  Database creation failed or already exists.
    echo.
    echo If the database already exists, that's OK!
    echo Otherwise, check your PostgreSQL password and try again.
    echo.
)

pause