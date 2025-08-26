@echo off
echo ========================================
echo Nordic Football Betting - Environment Setup
echo ========================================
echo.
echo This script will help you configure your .env.local file
echo.
set /p PGPASSWORD="Enter your PostgreSQL password: "
echo.

REM Generate a random NextAuth secret
set CHARS=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789
set SECRET=
for /L %%i in (1,1,32) do call :AddChar
goto :Continue

:AddChar
set /a x=%random% %% 62
call set SECRET=%SECRET%%%CHARS:~%x%,1%%
exit /b

:Continue
echo Updating .env.local with your configuration...
echo.

(
echo # Database Configuration
echo # PostgreSQL connection string
echo DATABASE_URL="postgresql://postgres:%PGPASSWORD%@localhost:5432/nordic_football_betting"
echo.
echo # NextAuth Configuration
echo NEXTAUTH_URL="http://localhost:3001"
echo NEXTAUTH_SECRET="%SECRET%"
echo.
echo # Admin Panel
echo NEXT_PUBLIC_ADMIN_PASSWORD="nordic_admin_2024!"
echo.
echo # Stripe Configuration ^(Optional - for monetization^)
echo STRIPE_SECRET_KEY=""
echo STRIPE_PUBLISHABLE_KEY=""
echo STRIPE_WEBHOOK_SECRET=""
echo.
echo # Supabase Configuration ^(Optional - for real-time features^)
echo NEXT_PUBLIC_SUPABASE_URL=""
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=""
echo SUPABASE_SERVICE_ROLE_KEY=""
echo.
echo # Environment
echo NODE_ENV="development"
echo.
echo # Application Settings
echo NEXT_PUBLIC_APP_URL="http://localhost:3001"
echo NEXT_PUBLIC_APP_NAME="Nordic Football Betting"
) > .env.local

echo ✅ SUCCESS: .env.local has been updated!
echo.
echo Configuration saved:
echo - PostgreSQL password: [HIDDEN]
echo - NextAuth secret: [GENERATED - 32 chars]
echo - Admin password: nordic_admin_2024!
echo.
echo Next steps:
echo 1. Run: npm run db:setup
echo 2. Restart the dev server
echo.
pause