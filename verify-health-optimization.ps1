# Verify health endpoint optimization
Write-Host "Verifying health endpoint optimization..." -ForegroundColor Green

# Test 1: Basic health check should be fast
Write-Host "`n1. Testing basic health check performance..." -ForegroundColor Yellow
$startTime = Get-Date
try {
    $response = Invoke-RestMethod -Uri "https://realculture-video-generator.azurewebsites.net/health" -Method Get
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalMilliseconds
    Write-Host "✅ Basic health check completed in ${duration}ms" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Cyan
    
    # Verify it's the basic response (not full health check)
    if ($response.note) {
        Write-Host "✅ Correctly returned basic health response" -ForegroundColor Green
    } else {
        Write-Host "❌ Warning: Response looks like full health check" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error in basic health check: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Full health check should work when requested
Write-Host "`n2. Testing full health check (when requested)..." -ForegroundColor Yellow
$startTime = Get-Date
try {
    $response = Invoke-RestMethod -Uri "https://realculture-video-generator.azurewebsites.net/health?check=full" -Method Get
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalMilliseconds
    Write-Host "✅ Full health check completed in ${duration}ms" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Cyan
    
    # Verify it's the full response
    if ($response.services) {
        Write-Host "✅ Correctly returned full health response" -ForegroundColor Green
    } else {
        Write-Host "❌ Warning: Response doesn't look like full health check" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error in full health check: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Status endpoint should still work
Write-Host "`n3. Testing status endpoint..." -ForegroundColor Yellow
$startTime = Get-Date
try {
    $response = Invoke-RestMethod -Uri "https://realculture-video-generator.azurewebsites.net/status" -Method Get
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalMilliseconds
    Write-Host "✅ Status endpoint completed in ${duration}ms" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error in status endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Health endpoint optimization verification completed!" -ForegroundColor Green