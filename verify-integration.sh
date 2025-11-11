#!/bin/bash

# TravelJoy Integration Verification Script
# This script verifies that all components are properly integrated

echo "======================================"
echo "TravelJoy Integration Verification"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend dependencies are installed
echo "1. Checking backend dependencies..."
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${RED}✗${NC} Backend dependencies not installed"
    echo "   Run: cd backend && npm install"
fi

# Check if mobile dependencies are installed
echo "2. Checking mobile dependencies..."
if [ -d "mobile/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Mobile dependencies installed"
else
    echo -e "${RED}✗${NC} Mobile dependencies not installed"
    echo "   Run: cd mobile && npm install"
fi

# Check if backend .env exists
echo "3. Checking backend environment configuration..."
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Backend .env file exists"
    
    # Check for required variables
    if grep -q "DATABASE_URL" backend/.env && \
       grep -q "JWT_SECRET" backend/.env && \
       grep -q "STRIPE_SECRET_KEY" backend/.env; then
        echo -e "${GREEN}✓${NC} Required environment variables present"
    else
        echo -e "${YELLOW}⚠${NC} Some required environment variables may be missing"
        echo "   Check: DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY"
    fi
else
    echo -e "${RED}✗${NC} Backend .env file not found"
    echo "   Copy backend/.env.example to backend/.env and configure"
fi

# Check if mobile .env exists
echo "4. Checking mobile environment configuration..."
if [ -f "mobile/.env" ]; then
    echo -e "${GREEN}✓${NC} Mobile .env file exists"
    
    if grep -q "EXPO_PUBLIC_API_URL" mobile/.env; then
        API_URL=$(grep "EXPO_PUBLIC_API_URL" mobile/.env | cut -d '=' -f2)
        echo -e "${GREEN}✓${NC} API URL configured: $API_URL"
    else
        echo -e "${YELLOW}⚠${NC} EXPO_PUBLIC_API_URL not set"
    fi
else
    echo -e "${RED}✗${NC} Mobile .env file not found"
    echo "   Copy mobile/.env.example to mobile/.env and configure"
fi

# Check if Docker is running (for PostgreSQL and Redis)
echo "5. Checking Docker services..."
if command -v docker &> /dev/null; then
    if docker ps | grep -q "postgres"; then
        echo -e "${GREEN}✓${NC} PostgreSQL container running"
    else
        echo -e "${YELLOW}⚠${NC} PostgreSQL container not running"
        echo "   Run: docker-compose up -d"
    fi
    
    if docker ps | grep -q "redis"; then
        echo -e "${GREEN}✓${NC} Redis container running"
    else
        echo -e "${YELLOW}⚠${NC} Redis container not running"
        echo "   Run: docker-compose up -d"
    fi
else
    echo -e "${YELLOW}⚠${NC} Docker not found or not running"
    echo "   Install Docker or configure services manually"
fi

# Check if Prisma is set up
echo "6. Checking database setup..."
if [ -d "backend/node_modules/@prisma/client" ]; then
    echo -e "${GREEN}✓${NC} Prisma client generated"
else
    echo -e "${YELLOW}⚠${NC} Prisma client not generated"
    echo "   Run: cd backend && npm run prisma:generate"
fi

if [ -d "backend/prisma/migrations" ] && [ "$(ls -A backend/prisma/migrations)" ]; then
    echo -e "${GREEN}✓${NC} Database migrations exist"
else
    echo -e "${YELLOW}⚠${NC} No database migrations found"
    echo "   Run: cd backend && npm run prisma:migrate"
fi

# Check if backend can be built
echo "7. Checking backend build..."
if [ -d "backend/dist" ]; then
    echo -e "${GREEN}✓${NC} Backend build directory exists"
else
    echo -e "${YELLOW}⚠${NC} Backend not built yet"
    echo "   Run: cd backend && npm run build"
fi

# Check API connectivity (if backend is running)
echo "8. Checking API connectivity..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend API is responding"
    
    # Run integration tests
    echo ""
    echo "Running integration tests..."
    cd backend && npm run test:integration
else
    echo -e "${YELLOW}⚠${NC} Backend API not responding"
    echo "   Start backend: cd backend && npm run dev"
    echo "   Then run integration tests: cd backend && npm run test:integration"
fi

echo ""
echo "======================================"
echo "Integration Verification Complete"
echo "======================================"
echo ""
echo "Next Steps:"
echo "1. Ensure all services are running (PostgreSQL, Redis, Backend)"
echo "2. Run integration tests: cd backend && npm run test:integration"
echo "3. Start mobile app: cd mobile && npm start"
echo "4. Test complete user journey manually"
echo ""
echo "For detailed integration guide, see: INTEGRATION_GUIDE.md"

