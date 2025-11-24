#!/bin/bash

# TravelJoy - Complete Test Runner
# Tests the mobile app with the backend

echo "🌍 TravelJoy - Complete Testing Suite"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo "${BLUE}Step 1: Checking Backend...${NC}"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "${GREEN}✅ Backend is running!${NC}"
else
    echo "${YELLOW}⚠️  Backend not detected. Starting backend...${NC}"
    cd ../backend
    npm run dev &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"
    sleep 5
    cd ../mobile
fi

echo ""
echo "${BLUE}Step 2: Installing Mobile Dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "${GREEN}✅ Dependencies already installed${NC}"
fi

echo ""
echo "${BLUE}Step 3: Choose Testing Method${NC}"
echo ""
echo "1. 🍎 iOS Simulator (macOS only)"
echo "2. 🤖 Android Emulator"  
echo "3. 📱 Physical Device (Expo Go)"
echo "4. 🌐 Web Browser"
echo "5. 📋 Run All Tests"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "${GREEN}🍎 Starting iOS Simulator...${NC}"
        npm run ios
        ;;
    2)
        echo ""
        echo "${GREEN}🤖 Starting Android Emulator...${NC}"
        npm run android
        ;;
    3)
        echo ""
        echo "${GREEN}📱 Starting Expo Dev Server...${NC}"
        echo "Scan QR code with Expo Go app"
        npm start
        ;;
    4)
        echo ""
        echo "${GREEN}🌐 Starting Web Browser...${NC}"
        npm run web
        ;;
    5)
        echo ""
        echo "${GREEN}📋 Running Tests...${NC}"
        npm test
        ;;
    *)
        echo "${YELLOW}Invalid choice${NC}"
        exit 1
        ;;
esac

# Cleanup function
cleanup() {
    if [ ! -z "$BACKEND_PID" ]; then
        echo ""
        echo "${YELLOW}Stopping backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID
    fi
}

trap cleanup EXIT

