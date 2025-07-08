#!/bin/bash

# Android Development Setup Script for Ubuntu
echo "🚀 Setting up Android Development Environment..."

# Install Java Development Kit
echo "📦 Installing Java..."
sudo apt update
sudo apt install -y openjdk-11-jdk

# Download Android SDK Command Line Tools
echo "📱 Setting up Android SDK..."
mkdir -p ~/Android/Sdk
cd ~/Android/Sdk

# Download command line tools
wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip -q commandlinetools-linux-11076708_latest.zip
rm commandlinetools-linux-11076708_latest.zip

# Setup environment variables
echo "🔧 Setting up environment variables..."
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.bashrc
echo 'export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64' >> ~/.bashrc

# Apply environment variables
source ~/.bashrc

# Create directory structure
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true

# Accept licenses and install SDK components
echo "📥 Installing Android SDK components..."
./cmdline-tools/latest/bin/sdkmanager --licenses --sdk_root=$ANDROID_HOME
./cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0" "system-images;android-33;google_apis;x86_64" --sdk_root=$ANDROID_HOME

# Create AVD (Android Virtual Device)
echo "📱 Creating Android Virtual Device..."
./cmdline-tools/latest/bin/avdmanager create avd -n "MoneyFlow_AVD" -k "system-images;android-33;google_apis;x86_64" --device "pixel_3a" --sdk_root=$ANDROID_HOME

echo "✅ Android setup complete!"
echo "🎯 You can now run: npm run android"
echo "📱 Or start the emulator: ~/Android/Sdk/emulator/emulator -avd MoneyFlow_AVD"
