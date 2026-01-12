#!/bin/bash

# Script to fix IP address configuration issue
# This removes the hardcoded IP from .env so auto-detection works

echo "🔧 TravelJoy IP Fix Script"
echo "=========================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "✅ No .env file found - auto-detection will work!"
    exit 0
fi

echo "📄 Found .env file. Checking contents..."
echo ""

# Backup original .env
cp .env .env.backup
echo "✅ Backed up .env to .env.backup"

# Check if EXPO_PUBLIC_API_URL exists
if grep -q "EXPO_PUBLIC_API_URL" .env; then
    echo "⚠️  Found EXPO_PUBLIC_API_URL in .env"
    echo ""
    echo "Current value:"
    grep "EXPO_PUBLIC_API_URL" .env
    echo ""
    
    # Comment it out
    sed -i '' 's/^EXPO_PUBLIC_API_URL/#EXPO_PUBLIC_API_URL/g' .env
    
    echo "✅ Commented out EXPO_PUBLIC_API_URL"
    echo ""
    echo "New .env contents:"
    cat .env
else
    echo "✅ EXPO_PUBLIC_API_URL not found - looks good!"
fi

echo ""
echo "=========================="
echo "✅ Done! Now restart Expo:"
echo "   1. Stop Expo (Ctrl+C)"
echo "   2. yarn start"
echo "   3. The app will auto-detect the correct IP"
echo "=========================="
