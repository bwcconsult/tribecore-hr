#!/bin/bash

# TribeCore Setup Script
# This script automates the installation process

set -e

echo "🚀 TribeCore Setup Starting..."
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version) found${NC}"
echo ""

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version) found${NC}"
echo ""

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd ../frontend
npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Copy environment files
echo -e "${BLUE}📝 Setting up environment files...${NC}"
cd ../backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created backend/.env${NC}"
else
    echo "ℹ️  backend/.env already exists"
fi

cd ../frontend
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created frontend/.env${NC}"
else
    echo "ℹ️  frontend/.env already exists"
fi

cd ..
echo ""

echo "================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure your environment variables:"
echo "   - Edit backend/.env (database credentials, JWT secret)"
echo "   - Edit frontend/.env (API URL)"
echo ""
echo "2. Start the platform:"
echo ""
echo "   Option A - Using Docker (Recommended):"
echo "   $ docker-compose up -d"
echo ""
echo "   Option B - Manual:"
echo "   Terminal 1: cd backend && npm run start:dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "3. Access the platform:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend: http://localhost:3000/api/v1/docs"
echo ""
echo "🎉 Happy coding!"
