Write-Host ""
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host "   VIGIL Platform - Auto Setup" -ForegroundColor Cyan
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host ""

$locations = @(
    "$env:USERPROFILE\Desktop\vigil-platform",
    "$env:USERPROFILE\Downloads\vigil-platform",
    "$env:USERPROFILE\Documents\vigil-platform",
    (Split-Path -Parent $MyInvocation.MyCommand.Path)
)

$found = $null
foreach ($loc in $locations) {
    Write-Host "  Checking $loc ..." -ForegroundColor Gray
    if (Test-Path "$loc\package.json") {
        $found = $loc
        Write-Host "  FOUND!" -ForegroundColor Green
        break
    }
}

if (-not $found) {
    Write-Host ""
    Write-Host "  FOLDER NOT FOUND" -ForegroundColor Red
    Write-Host "  Move vigil-platform folder to your Desktop and try again." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit
}

Set-Location $found
Write-Host ""
Write-Host "  Project found at: $found" -ForegroundColor Green
Write-Host ""

Write-Host "  Checking Node.js..." -ForegroundColor Cyan
$nodeCheck = node -v 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Node.js not found! Please install from nodejs.org then run again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}
Write-Host "  Node.js OK: $nodeCheck" -ForegroundColor Green
Write-Host ""

Write-Host "  Installing project (1-2 minutes, please wait)..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  Install failed - screenshot this window and ask for help." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "  ==========================================" -ForegroundColor Green
Write-Host "   SUCCESS! Starting VIGIL Platform..." -ForegroundColor Green
Write-Host "   Opening browser at http://localhost:3000" -ForegroundColor Green
Write-Host "   To stop later: press Ctrl + C" -ForegroundColor Green
Write-Host "  ==========================================" -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"
npm run dev
