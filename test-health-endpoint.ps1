# Test health endpoint changes
Write-Host "Testing health endpoint changes..." -ForegroundColor Green

# Test 1: Basic health check (should be fast and not perform external service checks)
Write-Host "`n1. Testing basic health check (default)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://realculture-video-generator.azurewebsites.net/health" -Method Get
    Write-Host "✅ Basic health check response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error in basic health check: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Full health check (should perform all external service checks)
Write-Host "`n2. Testing full health check (with ?check=full)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://realculture-video-generator.azurewebsites.net/health?check=full" -Method Get
    Write-Host "✅ Full health check response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error in full health check: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Status endpoint (should always be fast)
Write-Host "`n3. Testing status endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://realculture-video-generator.azurewebsites.net/status" -Method Get
    Write-Host "✅ Status endpoint response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error in status endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green