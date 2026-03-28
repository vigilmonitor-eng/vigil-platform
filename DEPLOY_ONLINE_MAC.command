#!/bin/bash
cd "$(dirname "$0")"
clear

echo ""
echo "  =========================================="
echo "   VIGIL Platform - Deploy Online (Free)"
echo "  =========================================="
echo ""
echo "  This puts your platform online FREE at"
echo "  a URL like: vigil-platform.vercel.app"
echo ""

# Check vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "  [1/3] Installing Vercel deploy tool..."
    npm install -g vercel
fi

echo ""
echo "  [2/3] Logging into Vercel..."
echo "  A browser window will open — sign up free"
echo "  with Google or GitHub, then come back here."
echo ""
read -p "  Press Enter to open the login page..."
vercel login

echo ""
echo "  [3/3] Deploying your platform..."
vercel --prod

echo ""
echo "  =========================================="
echo "   DONE! Your platform is LIVE online."
echo "   Copy the URL shown above and share it!"
echo "  =========================================="
read -p "  Press Enter to exit..."
