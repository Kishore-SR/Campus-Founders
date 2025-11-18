# PowerShell script to push code to GitHub (replacing everything)
# Run this from the project root directory

Write-Host "🚀 Starting GitHub Push Process..." -ForegroundColor Green
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Yellow
    git init
}

# Check current status
Write-Host "📊 Checking git status..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "⚠️  WARNING: This will REPLACE all code on GitHub!" -ForegroundColor Red
Write-Host "Press Ctrl+C to cancel, or any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Add all files
Write-Host ""
Write-Host "➕ Adding all files..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "Complete project restructure: Separate frontend and backend with full features"

# Check if remote exists
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "🔗 Adding remote origin..." -ForegroundColor Yellow
    git remote add origin https://github.com/Kishore-SR/Campus-Founders.git
} else {
    Write-Host "🔗 Remote already exists: $remoteExists" -ForegroundColor Cyan
    Write-Host "Updating remote URL..." -ForegroundColor Yellow
    git remote set-url origin https://github.com/Kishore-SR/Campus-Founders.git
}

# Force push
Write-Host ""
Write-Host "🚀 Force pushing to GitHub (this replaces everything)..." -ForegroundColor Yellow
Write-Host "⚠️  This is your last chance to cancel (Ctrl+C)!" -ForegroundColor Red
Start-Sleep -Seconds 3

git push -f origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "🌐 Visit: https://github.com/Kishore-SR/Campus-Founders" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Check the error above." -ForegroundColor Red
}

