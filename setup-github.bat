@echo off
cls
echo ============================================
echo        GitHub Repository Setup Helper
echo ============================================
echo.
echo This script will help you push your code to GitHub.
echo.
echo IMPORTANT: You must create the repository on GitHub first!
echo.
echo Step 1: Create Repository on GitHub
echo ------------------------------------
echo 1. Open your browser
echo 2. Go to: https://github.com/new
echo 3. Sign in with your GitHub account
echo 4. Create a new repository with these settings:
echo    - Repository name: nordic-football-betting
echo    - Description: Nordic Football Betting Platform
echo    - Visibility: Public (recommended)
echo    - DO NOT check any initialization options
echo 5. Click "Create repository"
echo.
echo Press any key AFTER you've created the repository on GitHub...
pause > nul

cls
echo ============================================
echo        Pushing Code to GitHub
echo ============================================
echo.

set /p username="Enter your GitHub username (or press Enter for 'Koukkukasi'): "
if "%username%"=="" set username=Koukkukasi

echo.
echo Using GitHub username: %username%
echo.

cd C:\Users\ilmiv\Ftp_football_game\nordic-football-betting

echo Removing any existing remote...
git remote remove origin 2>nul

echo Adding GitHub remote...
git remote add origin https://github.com/%username%/nordic-football-betting.git

echo Setting branch to main...
git branch -M main

echo.
echo Pushing to GitHub (you may need to enter your GitHub credentials)...
echo.
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo         SUCCESS! Code pushed to GitHub!
    echo ============================================
    echo.
    echo Your repository is now available at:
    echo https://github.com/%username%/nordic-football-betting
    echo.
    echo Next steps for Render deployment:
    echo 1. Go to https://dashboard.render.com
    echo 2. Click "New +" then "Web Service"
    echo 3. Connect your GitHub account if needed
    echo 4. Select the nordic-football-betting repository
    echo 5. Render will auto-detect the configuration
    echo.
) else (
    echo.
    echo ============================================
    echo              ERROR: Push failed!
    echo ============================================
    echo.
    echo Common issues:
    echo 1. Repository not created on GitHub yet
    echo 2. Wrong username (you entered: %username%^)
    echo 3. Authentication required
    echo.
    echo To authenticate with GitHub:
    echo - You may need to create a Personal Access Token
    echo - Go to: https://github.com/settings/tokens
    echo - Create a new token with 'repo' scope
    echo - Use the token as your password when prompted
    echo.
)

echo Press any key to exit...
pause > nul