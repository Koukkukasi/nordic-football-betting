@echo off
REM ===============================================
REM Nordic Football Betting - Secret Generation Script (Windows)
REM ===============================================
REM
REM This batch file generates secure secrets for production deployment
REM Requires PowerShell (available on Windows 7+ by default)
REM
REM Usage: Double-click this file or run: scripts\generate-secrets.bat

echo 🔐 Nordic Football Betting - Secret Generation
echo ==============================================
echo.

echo Generating secure secrets for production deployment...
echo.

REM Generate NEXTAUTH_SECRET (64 characters base64)
echo 🔑 NEXTAUTH_SECRET (64 characters, base64):
powershell -Command "[System.Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 })) -replace '=', ''"
echo.

REM Generate ENCRYPTION_KEY (32 bytes = 64 hex characters)
echo 🔒 ENCRYPTION_KEY (32 bytes, hex encoded):
powershell -Command "-join ((1..32 | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) }))"
echo.

REM Generate ADMIN_SECRET_KEY
echo 🔐 ADMIN_SECRET_KEY (API access):
powershell -Command "[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 })) -replace '=', ''"
echo.

REM Generate a secure admin password suggestion
echo 🛡️  ADMIN_PASSWORD (suggestion):
powershell -Command "(-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 16 | ForEach-Object { [char]$_ })) + '@2024!'"
echo.

echo ==============================================
echo ✅ Secret generation complete!
echo.
echo 📝 Next steps:
echo 1. Copy the secrets above to your .env.production file
echo 2. Set up your database connection string
echo 3. Configure Supabase URL and keys
echo 4. Set up Stripe keys and webhook secret
echo 5. Run environment validation: npm run validate-env
echo.
echo ⚠️  Security reminders:
echo - Never commit these secrets to version control
echo - Store them securely in your deployment platform
echo - Rotate secrets regularly (quarterly recommended)
echo - Use different secrets for staging and production
echo.

pause