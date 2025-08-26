@echo off
echo Adding GitHub remote and pushing to repository...
echo.
echo Make sure you've created a repository on GitHub first!
echo Repository name should be: nordic-football-betting
echo.
pause

REM Replace YOUR_GITHUB_USERNAME with your actual GitHub username
set /p username="Enter your GitHub username: "

cd C:\Users\ilmiv\Ftp_football_game\nordic-football-betting

REM Add remote origin
git remote add origin https://github.com/%username%/nordic-football-betting.git

REM Push to main branch
git branch -M main
git push -u origin main

echo.
echo Done! Your code is now on GitHub.
echo.
echo Next steps:
echo 1. Go to https://dashboard.render.com
echo 2. Click "New +" and select "Web Service"
echo 3. Connect your GitHub repository
echo 4. Render will auto-detect the configuration
echo.
pause