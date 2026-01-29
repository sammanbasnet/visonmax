# Run from project root - installs deps and starts app
$ErrorActionPreference = "Stop"
$root = "C:\Users\samma\Downloads\security-main"

Set-Location $root
Write-Host "Installing root deps..." -ForegroundColor Cyan
npm install

Set-Location "$root\server"
Write-Host "Installing server deps (axios, express, etc.)..." -ForegroundColor Cyan
npm install

Set-Location "$root\client"
Write-Host "Installing client deps (react, vite, etc.)..." -ForegroundColor Cyan
npm install

Set-Location $root
Write-Host "Starting app..." -ForegroundColor Green
npm start
