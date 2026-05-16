# PR Buddy Setup Script for Windows
Write-Host "🤖 PR Buddy Setup Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ../frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# Create .env file if it doesn't exist
Set-Location ../backend
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ Created backend/.env - Please edit it with your credentials" -ForegroundColor Green
} else {
    Write-Host "ℹ️  backend/.env already exists" -ForegroundColor Blue
}
Write-Host ""

Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend/.env with your credentials:"
Write-Host "   - GITHUB_TOKEN"
Write-Host "   - GITHUB_WEBHOOK_SECRET"
Write-Host "   - BOB_API_KEY"
Write-Host "   - BOB_API_URL"
Write-Host ""
Write-Host "2. Set up GitHub webhook:"
Write-Host "   - Use ngrok for local dev: ngrok http 3000"
Write-Host "   - Add webhook in GitHub repo settings"
Write-Host "   - Webhook URL: https://your-domain/api/webhooks/github"
Write-Host ""
Write-Host "3. Start the application:"
Write-Host "   Terminal 1: cd backend; npm run dev"
Write-Host "   Terminal 2: cd frontend; npm run dev"
Write-Host ""
Write-Host "4. Open dashboard: http://localhost:5173"
Write-Host ""

Set-Location ..

# Made with Bob
