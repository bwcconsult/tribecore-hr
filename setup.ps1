# TribeCore Setup Script for Windows PowerShell
# This script automates the installation process

Write-Host "🚀 TribeCore Setup Starting..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Blue
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
Set-Location backend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
Set-Location ../frontend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Copy environment files
Write-Host "📝 Setting up environment files..." -ForegroundColor Blue
Set-Location ../backend
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
} else {
    Write-Host "ℹ️  backend/.env already exists" -ForegroundColor Yellow
}

Set-Location ../frontend
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created frontend/.env" -ForegroundColor Green
} else {
    Write-Host "ℹ️  frontend/.env already exists" -ForegroundColor Yellow
}

Set-Location ..
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configure your environment variables:"
Write-Host "   - Edit backend/.env (database credentials, JWT secret)"
Write-Host "   - Edit frontend/.env (API URL)"
Write-Host ""
Write-Host "2. Start the platform:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Option A - Using Docker (Recommended):"
Write-Host "   PS> docker-compose up -d"
Write-Host ""
Write-Host "   Option B - Manual:"
Write-Host "   Terminal 1: cd backend; npm run start:dev"
Write-Host "   Terminal 2: cd frontend; npm run dev"
Write-Host ""
Write-Host "3. Access the platform:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:5173"
Write-Host "   - Backend: http://localhost:3000/api/v1/docs"
Write-Host ""
Write-Host "🎉 Happy coding!" -ForegroundColor Green
