# PowerShell script to push to GitHub
Write-Host "GitHub Repository Push Script" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""

# Check if repository exists on GitHub
Write-Host "Checking GitHub repository..." -ForegroundColor Yellow

$username = "Koukkukasi"
$repo = "nordic-football-betting"

# Remove existing remote if any
git remote remove origin 2>$null

# Add the remote
Write-Host "Adding GitHub remote..." -ForegroundColor Yellow
git remote add origin "https://github.com/$username/$repo.git"

# Set branch to main
Write-Host "Setting branch to main..." -ForegroundColor Yellow
git branch -M main

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "If this is your first push, you may need to enter your GitHub credentials." -ForegroundColor Cyan
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS! Code pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your repository URL: https://github.com/$username/$repo" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Go to https://dashboard.render.com" -ForegroundColor White
    Write-Host "2. Click 'New +' and select 'Web Service'" -ForegroundColor White
    Write-Host "3. Connect the GitHub repository" -ForegroundColor White
    Write-Host "4. Render will auto-detect the configuration" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "ERROR: Push failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure:" -ForegroundColor Yellow
    Write-Host "1. You've created the repository on GitHub: https://github.com/new" -ForegroundColor White
    Write-Host "2. Repository name is: nordic-football-betting" -ForegroundColor White
    Write-Host "3. Your GitHub username is: Koukkukasi" -ForegroundColor White
    Write-Host ""
    Write-Host "If you need to use a different username, edit this script." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")