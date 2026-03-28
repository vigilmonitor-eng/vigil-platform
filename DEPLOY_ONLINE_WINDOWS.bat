@echo off
title VIGIL - Deploy to Internet (Free)
color 0B
cls

echo.
echo  ==========================================
echo   VIGIL Platform - Deploy Online (Free)
echo  ==========================================
echo.
echo  This will put your VIGIL platform online
echo  at a free URL like: vigil-platform.vercel.app
echo.
echo  ==========================================
echo.

REM Check Node
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo  Please run START_HERE_WINDOWS.bat first!
    pause
    exit
)

REM Check if vercel CLI is installed
vercel -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo  [1/3] Installing Vercel deploy tool...
    call npm install -g vercel
)

echo.
echo  [2/3] Logging into Vercel...
echo.
echo  A browser window will open asking you to log in.
echo  You can sign up free with your Google or GitHub account.
echo  Come back to this window after logging in.
echo.
pause
call vercel login

echo.
echo  [3/3] Deploying your platform...
echo  (This takes about 2 minutes)
echo.
call vercel --prod

echo.
echo  ==========================================
echo   DONE! Your platform is now LIVE online.
echo   The URL is shown above (ends in .vercel.app)
echo   Copy that URL and share it with anyone!
echo  ==========================================
echo.
pause
