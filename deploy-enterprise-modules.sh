#!/bin/bash
# TribeCore Enterprise Modules - Deployment Script
# Run this script to deploy all enterprise modules

set -e

echo "================================================"
echo "TribeCore Enterprise Modules - Deployment"
echo "================================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Verify database connection
echo -e "\n${BLUE}Step 1: Verifying database connection...${NC}"
psql -U postgres -d tribecore_db -c "SELECT version();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Database connection failed. Please check your PostgreSQL setup.${NC}"
    exit 1
fi

# Step 2: Run migrations
echo -e "\n${BLUE}Step 2: Running database migrations...${NC}"
psql -U postgres -d tribecore_db -f backend/migrations/create-ai-governance-hrsd-tables.sql
echo -e "${GREEN}✓ AI Governance & HRSD tables created${NC}"

psql -U postgres -d tribecore_db -f backend/migrations/create-enterprise-modules-tables.sql
echo -e "${GREEN}✓ Enterprise module tables created${NC}"

# Step 3: Verify tables
echo -e "\n${BLUE}Step 3: Verifying table creation...${NC}"
TABLES=$(psql -U postgres -d tribecore_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name ~ '^(ai_|hr_|hc_|positions|org_scenarios|skills|employee_skills|marketplace|compensation|webhooks|api_connectors)';")
echo -e "${GREEN}✓ Created $TABLES enterprise tables${NC}"

# Step 4: Install backend dependencies
echo -e "\n${BLUE}Step 4: Installing backend dependencies...${NC}"
cd backend
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Step 5: Build backend
echo -e "\n${BLUE}Step 5: Building backend...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend build successful${NC}"
else
    echo -e "${RED}✗ Backend build failed${NC}"
    exit 1
fi

# Step 6: Module verification
echo -e "\n${BLUE}Step 6: Verifying module files...${NC}"
MODULES=(
    "ai-governance"
    "hrsd"
    "iso30414"
    "position-management"
    "skills-cloud"
    "compensation"
    "integrations"
)

for module in "${MODULES[@]}"; do
    if [ -d "src/modules/$module" ]; then
        echo -e "${GREEN}✓ $module module found${NC}"
    else
        echo -e "${RED}✗ $module module missing${NC}"
        exit 1
    fi
done

cd ..

# Step 7: Frontend setup
echo -e "\n${BLUE}Step 7: Setting up frontend...${NC}"
cd frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
cd ..

# Step 8: Success summary
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${GREEN}================================================${NC}"

echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Update backend/src/app.module.ts with new module imports"
echo "   (See MODULE_REGISTRATION_GUIDE.md for details)"
echo ""
echo "2. Start the backend:"
echo "   cd backend && npm run start:dev"
echo ""
echo "3. Start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Access the application:"
echo "   http://localhost:5173"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "- ENTERPRISE_BUILD_FINAL_SUMMARY.md - Complete overview"
echo "- MODULE_REGISTRATION_GUIDE.md - Installation guide"
echo "- ENTERPRISE_HCM_AUDIT.md - Gap analysis"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
