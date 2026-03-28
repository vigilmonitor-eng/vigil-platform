#!/bin/bash
# Make this file executable by running: chmod +x START_HERE_MAC.command

# Go to the folder this script is in
cd "$(dirname "$0")"

clear
echo ""
echo "  =========================================="
echo "   VIGIL Platform - Automatic Setup (Mac)"
echo "  =========================================="
echo ""

# ── STEP 1: Check Node.js ──
echo "  [1/4] Checking if Node.js is installed..."

if ! command -v node &> /dev/null; then
    echo ""
    echo "  Node.js is NOT installed."
    echo "  Opening the download page now..."
    echo ""
    echo "  INSTRUCTIONS:"
    echo "  1. The Node.js website will open in Safari/Chrome"
    echo "  2. Click the big green LTS download button"
    echo "  3. Open the downloaded file and install it"
    echo "  4. Come back and double-click this file again"
    echo ""
    open https://nodejs.org/en/download
    read -p "  Press Enter after installing Node.js..."
    exit 1
else
    echo "  Node.js found! Good to go."
fi

echo ""
echo "  [2/4] Installing project files..."
echo "  (This takes about 1-2 minutes, please wait)"
echo ""

npm install
if [ $? -ne 0 ]; then
    echo ""
    echo "  Something went wrong. Please take a screenshot and ask for help."
    read -p "  Press Enter to exit..."
    exit 1
fi

echo ""
echo "  [3/4] Install complete!"
echo ""
echo "  [4/4] Starting VIGIL Platform..."
echo ""
echo "  =========================================="
echo "   Your platform is starting!"
echo "   Opening http://localhost:3000 in browser"
echo ""
echo "   To STOP: press Ctrl + C in this window"
echo "  =========================================="
echo ""

# Open browser after 4 seconds
(sleep 4 && open http://localhost:3000) &

# Start the app
npm run dev
