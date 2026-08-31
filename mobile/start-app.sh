#!/bin/bash

# TravelJoy Mobile App - Quick Start Script
# This script helps you set up and run the TravelJoy mobile app

set -e

echo "🌍 TravelJoy Mobile App Setup"
echo "================================"
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the mobile directory."
    exit 1
fi

echo "📦 Installing dependencies..."
yarn install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Choose how to run the app:"
echo ""
echo "1. iOS Simulator (macOS only)"
echo "2. Android Emulator"
echo "3. Start Expo Dev Server (scan QR code with phone)"
echo "4. Web Browser (for quick testing)"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🍎 Starting iOS Simulator..."
        yarn ios
        ;;
    2)
        echo ""
        echo "🤖 Starting Android Emulator..."
        yarn android
        ;;
    3)
        echo ""
        echo "📱 Starting Expo Dev Server..."
        echo "Scan the QR code with Expo Go app on your phone"
        yarn start
        ;;
    4)
        echo ""
        echo "🌐 Starting Web Browser..."
        yarn web
        ;;
    *)
        echo ""
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac



