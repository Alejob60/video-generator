# Start application and run tests automatically (PowerShell)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  FLUX IMAGE GENERATION - AUTO START & TEST" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if build is complete
Write-Host "🔍 Checking Docker image..." -ForegroundColor Yellow
$images = docker images video-converter:local --format "{{.Repository}}:{{.Tag}}"

if (-not $images -or $images -eq "") {
    Write-Host "❌ Docker image not found! Build may still be running..." -ForegroundColor Red
    Write-Host "   Please wait for build to complete." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker image found: $images" -ForegroundColor Green
Write-Host ""

# Stop existing test container if any
Write-Host "🛑 Stopping existing test container (if any)..." -ForegroundColor Yellow
docker rm -f video-converter-test 2>$null
Write-Host ""

# Start new container
Write-Host "🚀 Starting container..." -ForegroundColor Cyan
docker run -d `
  --name video-converter-test `
  -p 4000:8080 `
  --env-file .env `
  video-converter:local

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start container!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Container started!" -ForegroundColor Green
Write-Host ""

# Wait for service
Write-Host "⏳ Waiting for service to be ready (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check health endpoint
Write-Host "`n🧪 Checking health endpoint..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:4000/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Service is healthy!" -ForegroundColor Green
    Write-Host ($health | ConvertTo-Json -Depth 5) -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Service not responding!" -ForegroundColor Red
    Write-Host "Checking container logs..." -ForegroundColor Yellow
    docker logs video-converter-test --tail 50
    exit 1
}

# Summary
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ✅ READY FOR TESTING" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Container Details:" -ForegroundColor Yellow
Write-Host "  Name: video-converter-test" -ForegroundColor White
Write-Host "  URL: http://localhost:4000" -ForegroundColor White
Write-Host "  Health: http://localhost:4000/health" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Run tests: .\test-local-3-modes.ps1" -ForegroundColor White
Write-Host "  2. View logs: docker logs -f video-converter-test" -ForegroundColor White
Write-Host "  3. Stop container: docker stop video-converter-test" -ForegroundColor White
Write-Host ""
Write-Host "Starting test suite in 5 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Automatically run the test script
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  RUNNING AUTOMATED TESTS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path ".\test-local-3-modes.ps1") {
    & pwsh -File .\test-local-3-modes.ps1
} else {
    Write-Host "❌ Test script not found!" -ForegroundColor Red
    Write-Host "   Expected: .\test-local-3-modes.ps1" -ForegroundColor Yellow
}
