# TribeCore Enterprise Modules - Deployment Script (PowerShell)
# Run this script to deploy all enterprise modules

Write-Host "================================================" -ForegroundColor Blue
Write-Host "TribeCore Enterprise Modules - Deployment" -ForegroundColor Blue
Write-Host "================================================" -ForegroundColor Blue

# Step 1: Verify PostgreSQL
Write-Host "`nStep 1: Verifying database connection..." -ForegroundColor Cyan
try {
    $result = psql -U postgres -d tribecore_db -c "SELECT version();" 2>&1
    Write-Host "✓ Database connection successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Database connection failed. Please check your PostgreSQL setup." -ForegroundColor Red
    exit 1
}

# Step 2: Run migrations
Write-Host "`nStep 2: Running database migrations..." -ForegroundColor Cyan
psql -U postgres -d tribecore_db -f backend/migrations/create-ai-governance-hrsd-tables.sql
Write-Host "✓ AI Governance & HRSD tables created" -ForegroundColor Green

psql -U postgres -d tribecore_db -f backend/migrations/create-enterprise-modules-tables.sql
Write-Host "✓ Enterprise module tables created" -ForegroundColor Green

# Step 3: Verify tables
Write-Host "`nStep 3: Verifying table creation..." -ForegroundColor Cyan
$query = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name ~ '^(ai_|hr_|hc_|positions|org_scenarios|skills|employee_skills|marketplace|compensation|webhooks|api_connectors)';"
$tableCount = psql -U postgres -d tribecore_db -t -c $query
Write-Host "✓ Created $tableCount enterprise tables" -ForegroundColor Green

# Step 4: Install backend dependencies
Write-Host "`nStep 4: Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green

# Step 5: Build backend
Write-Host "`nStep 5: Building backend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend build successful" -ForegroundColor Green
} else {
    Write-Host "✗ Backend build failed" -ForegroundColor Red
    exit 1
}

# Step 6: Module verification
Write-Host "`nStep 6: Verifying module files..." -ForegroundColor Cyan
$modules = @(
    "ai-governance",
    "hrsd",
    "iso30414",
    "position-management",
    "skills-cloud",
    "compensation",
    "integrations"
)

foreach ($module in $modules) {
    if (Test-Path "src/modules/$module") {
        Write-Host "✓ $module module found" -ForegroundColor Green
    } else {
        Write-Host "✗ $module module missing" -ForegroundColor Red
        exit 1
    }
}

Set-Location ..

# Step 7: Frontend setup
Write-Host "`nStep 7: Setting up frontend..." -ForegroundColor Cyan
Set-Location frontend
npm install
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
Set-Location ..

# Step 8: Success summary
Write-Host "`n================================================" -ForegroundColor Green
Write-Host "✓ Deployment Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Update backend/src/app.module.ts with new module imports"
Write-Host "   (See MODULE_REGISTRATION_GUIDE.md for details)"
Write-Host ""
Write-Host "2. Start the backend:"
Write-Host "   cd backend && npm run start:dev"
Write-Host ""
Write-Host "3. Start the frontend:"
Write-Host "   cd frontend && npm run dev"
Write-Host ""
Write-Host "4. Access the application:"
Write-Host "   http://localhost:5173"
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "- ENTERPRISE_BUILD_FINAL_SUMMARY.md - Complete overview"
Write-Host "- MODULE_REGISTRATION_GUIDE.md - Installation guide"
Write-Host "- ENTERPRISE_HCM_AUDIT.md - Gap analysis"
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
