#!/bin/bash

# MoneyFlow Mobile Setup Script
echo "🚀 Setting up MoneyFlow Mobile App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Install iOS pods (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Installing iOS pods..."
    cd ios
    if command -v pod &> /dev/null; then
        pod install
        cd ..
        echo "✅ iOS pods installed successfully"
    else
        echo "⚠️  CocoaPods not found. Please install CocoaPods for iOS development."
        cd ..
    fi
fi

echo ""
echo "🎉 MoneyFlow Mobile setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the API endpoint in src/services/api.ts"
echo "2. Run 'npm run android' for Android development"
echo "3. Run 'npm run ios' for iOS development (macOS only)"
echo ""
echo "For more information, check the README.md file"
