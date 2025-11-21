Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting EdgeSoul - Complete Stack" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if port is in use
function Test-Port {
    param($Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        return $connection.TcpTestSucceeded
    } catch {
        return $false
    }
}

# 1. Check and start Ollama
Write-Host "[1/4] Checking Ollama..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  OK: Ollama is running" -ForegroundColor Green
} catch {
    Write-Host "  Warning: Starting Ollama..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "ollama serve" -WindowStyle Normal
    Start-Sleep -Seconds 3
}
Write-Host ""

# 2. Start Backend
Write-Host "[2/4] Starting Backend (FastAPI)..." -ForegroundColor Yellow
if (Test-Port 8000) {
    Write-Host "  Warning: Port 8000 in use. Killing process..." -ForegroundColor Yellow
    Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | 
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 1
}
Set-Location "$PSScriptRoot\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload" -WindowStyle Normal
Set-Location $PSScriptRoot
Start-Sleep -Seconds 3
Write-Host "  OK: Backend started on http://localhost:8000" -ForegroundColor Green
Write-Host ""

# 3. Start Frontend
Write-Host "[3/4] Starting Frontend (Next.js)..." -ForegroundColor Yellow
if (Test-Port 3000) {
    Write-Host "  Warning: Port 3000 in use. Killing process..." -ForegroundColor Yellow
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 1
}
Set-Location "$PSScriptRoot\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
Set-Location $PSScriptRoot
Start-Sleep -Seconds 5
Write-Host "  OK: Frontend started on http://localhost:3000" -ForegroundColor Green
Write-Host ""

# 4. Start Desktop App
Write-Host "[4/4] Starting Desktop App..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\desktop"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:NODE_ENV='development'; npm start" -WindowStyle Normal
Set-Location $PSScriptRoot
Start-Sleep -Seconds 2
Write-Host "  OK: Desktop app launching..." -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EdgeSoul Stack Started Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor White
Write-Host "  - Ollama:   http://localhost:11434" -ForegroundColor Gray
Write-Host "  - Backend:  http://localhost:8000" -ForegroundColor Gray
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "  - Desktop:  Electron App" -ForegroundColor Gray
Write-Host ""
Write-Host "All services are running in separate windows." -ForegroundColor Yellow
Write-Host "Close this window to keep services running." -ForegroundColor Yellow
Write-Host "To stop all services, run: .\stop-edgesoul.ps1" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to close this window"
