# Simple Planr Application Starter Script
Write-Host "Starting Planr Application..." -ForegroundColor Cyan
Write-Host "The application will be available at http://localhost:5000" -ForegroundColor Cyan

# Start the server
Set-Location -Path ".\backend"
node server.js
Set-Location -Path ".."

Write-Host "Server has stopped. Press Enter to exit..." -ForegroundColor Yellow
Read-Host
