#!/bin/bash

echo "🔍 Verifying TravelJoy Setup..."
echo ""

# Check Docker services
echo "📦 Checking Docker services..."
if docker-compose ps | grep -q "healthy"; then
    echo "✅ Docker services are running and healthy"
else
    echo "❌ Docker services are not running. Run: docker-compose up -d"
    exit 1
fi

# Check backend
echo ""
echo "🔧 Checking backend..."
cd backend
if [ -d "node_modules" ] && [ -d "dist" ]; then
    echo "✅ Backend dependencies installed and compiled"
else
    echo "❌ Backend not properly set up. Run: cd backend && npm install && npm run build"
    exit 1
fi
cd ..

# Check mobile
echo ""
echo "📱 Checking mobile app..."
cd mobile
if [ -d "node_modules" ]; then
    echo "✅ Mobile app dependencies installed"
else
    echo "❌ Mobile app not properly set up. Run: cd mobile && npm install"
    exit 1
fi
cd ..

echo ""
echo "✅ All checks passed! Your development environment is ready."
echo ""
echo "To start developing:"
echo "  1. Backend: cd backend && npm run dev"
echo "  2. Mobile: cd mobile && npm start"
