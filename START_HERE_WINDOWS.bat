@echo off
title VIGIL Platform - Auto Setup
color 0A
cls

echo.
echo  ==========================================
echo   VIGIL Platform - Automatic Setup
echo  ==========================================
echo.

REM ── STEP 1: Check if Node.js is installed ──
echo  [1/4] Checking if Node.js is installed...
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo  Node.js is NOT installed.
    echo  Opening the download page now...
    echo.
    echo  INSTRUCTIONS:
    echo  1. The Node.js website will open in your browser
    echo  2. Click the big green "LTS" download button
    echo  3. Install it (just keep clicking Next)
    echo  4. Come back here and double-click this file again
    echo.
    pause
    start https://nodejs.org/en/download
    exit
) ELSE (
    echo  Node.js found! Good to go.
)

echo.
echo  [2/4] Installing project files...
echo  (This takes about 1-2 minutes, please wait)
echo.
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo  Something went wrong during install.
    echo  Please send a screenshot of this screen for help.
    pause
    exit
)

echo.
echo  [3/4] Install complete!
echo.
echo  [4/4] Starting VIGIL Platform...
echo.
echo  ==========================================
echo   Your platform is starting up!
echo   It will open in your browser shortly.
echo.
echo   To STOP the platform later:
echo   Press Ctrl + C in this window
echo  ==========================================
echo.

REM Open browser after 4 seconds
timeout /t 4 /nobreak >nul
start http://localhost:3000

REM Start the app
call npm run dev
pause
