# Force rebuild EdgeSoul Desktop App
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Force Rebuilding EdgeSoul Desktop App" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Kill all related processes
Write-Host "Step 1: Killing all processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -match "EdgeSoul|edgesoul|electron"} | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process | Where-Object {$_.ProcessName -eq "Code"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "  Processes killed`n" -ForegroundColor Green

# Step 2: Force delete dist folder
Write-Host "Step 2: Force deleting dist folder..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\desktop"
if (Test-Path "dist") {
    cmd /c "rmdir /s /q dist" 2>$null
}
Start-Sleep -Seconds 1
Write-Host "  Cleaned`n" -ForegroundColor Green

# Step 3: Build
Write-Host "Step 3: Building desktop app..." -ForegroundColor Yellow
npm run build:win
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n  Build failed!" -ForegroundColor Red
    pause
    exit 1
}

# Step 4: Copy backend
Write-Host "`nStep 4: Copying backend..." -ForegroundColor Yellow
Copy-Item -Path "..\backend\dist\*" -Destination "dist\win-unpacked\resources\backend\" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "  Backend copied`n" -ForegroundColor Green

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Desktop app rebuilt successfully!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Location: $PSScriptRoot\desktop\dist\" -ForegroundColor White
Write-Host "  - Installer: EdgeSoul-3.0.0-x64.exe" -ForegroundColor White
Write-Host "  - Portable: win-unpacked\EdgeSoul.exe`n" -ForegroundColor White

pause
