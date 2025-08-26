@echo off
echo ========================================
echo Nordic Football Betting - Database Setup
echo ========================================
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL 17.5 from https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo PostgreSQL detected!
echo.

REM Set default password (you should change this)
set DB_PASSWORD=nordic2024

echo Setting up database with password: %DB_PASSWORD%
echo.

REM Create the database
echo Creating database...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE nordic_football_betting;" 2>nul
if %errorlevel% equ 0 (
    echo Database created successfully!
) else (
    echo Database already exists or creation failed.
)

REM Update .env.local with the password
echo.
echo Updating .env.local with database configuration...
powershell -Command "(Get-Content '.env.local') -replace 'postgresql://postgres:your_password_here@', 'postgresql://postgres:%DB_PASSWORD%@' | Set-Content '.env.local'"

echo.
echo Configuration updated!
echo.

REM Generate Prisma client
echo Generating Prisma client...
call npx prisma generate

REM Run migrations
echo.
echo Running database migrations...
call npx prisma db push

echo.
echo ========================================
echo Database setup complete!
echo ========================================
echo.
echo IMPORTANT: The database password has been set to: %DB_PASSWORD%
echo You should change this password in production!
echo.
echo You can now restart the development server.
pause