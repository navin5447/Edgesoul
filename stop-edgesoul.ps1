Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stopping EdgeSoul - All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Stopping Ollama..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*ollama*"} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Stopping Backend (Port 8000)..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | 
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Write-Host "Stopping Frontend (Port 3000)..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Write-Host "Stopping Desktop App..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*EdgeSoul*" -or $_.ProcessName -eq "electron"} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "All EdgeSoul services stopped" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to close"
