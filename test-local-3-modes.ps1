# Test all 3 image generation modes locally
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  LOCAL TESTING - 3 IMAGE GENERATION MODES" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "http://localhost:4000"
$TEST_PROMPT = "A beautiful sunset over mountains"

Write-Host "🎯 Testing Configuration:" -ForegroundColor Yellow
Write-Host "   Base URL: $BASE_URL" -ForegroundColor Gray
Write-Host "   Test Prompt: $TEST_PROMPT" -ForegroundColor Gray
Write-Host ""

# Wait for service to be ready
Write-Host "⏳ Waiting for service to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts -and -not $ready) {
    $attempt++
    try {
        $health = Invoke-RestMethod -Uri "$BASE_URL/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
        $ready = $true
        Write-Host "✅ Service is ready after $attempt attempts!" -ForegroundColor Green
    } catch {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
}

if (-not $ready) {
    Write-Host "`n❌ Service did not start in time!" -ForegroundColor Red
    exit 1
}

Write-Host ($health | ConvertTo-Json -Depth 5) -ForegroundColor Gray
Start-Sleep -Seconds 2

# ===================================================================
# TEST 1: DALL-E Only
# ===================================================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  TEST 1: DALL-E ONLY (useFlux: false)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$body1 = @{
    prompt = $TEST_PROMPT
    plan = "FREE"
    useFlux = $false
} | ConvertTo-Json

Write-Host "`n📡 Request: DALL-E generation..." -ForegroundColor Yellow
Write-Host "Body: $body1" -ForegroundColor Gray

try {
    $response1 = Invoke-RestMethod `
        -Uri "$BASE_URL/media/image" `
        -Method POST `
        -Body $body1 `
        -ContentType "application/json" `
        -TimeoutSec 60
    
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "   Image URL: $($response1.data.imageUrl)" -ForegroundColor Green
    Write-Host "   Filename: $($response1.data.filename)" -ForegroundColor Gray
    Write-Host "   Prompt: $($response1.data.prompt)" -ForegroundColor Gray
} catch {
    Write-Host "`n❌ FAILED!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# ===================================================================
# TEST 2: FLUX Only
# ===================================================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  TEST 2: FLUX ONLY (useFlux: true)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$body2 = @{
    prompt = $TEST_PROMPT
    plan = "FREE"
    useFlux = $true
} | ConvertTo-Json

Write-Host "`n📡 Request: FLUX generation..." -ForegroundColor Yellow
Write-Host "Body: $body2" -ForegroundColor Gray

try {
    $response2 = Invoke-RestMethod `
        -Uri "$BASE_URL/media/image" `
        -Method POST `
        -Body $body2 `
        -ContentType "application/json" `
        -TimeoutSec 60
    
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "   Image URL: $($response2.data.imageUrl)" -ForegroundColor Green
    Write-Host "   Filename: $($response2.data.filename)" -ForegroundColor Gray
    Write-Host "   Prompt: $($response2.data.prompt)" -ForegroundColor Gray
} catch {
    Write-Host "`n❌ FAILED!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# ===================================================================
# TEST 3: Dual (DALL-E + FLUX Kontext Pro)
# ===================================================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  TEST 3: DUAL (DALL-E + FLUX Kontext Pro)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$body3 = @{
    prompt = $TEST_PROMPT
    plan = "PRO"
} | ConvertTo-Json

Write-Host "`n📡 Request: Dual generation..." -ForegroundColor Yellow
Write-Host "Body: $body3" -ForegroundColor Gray

try {
    $response3 = Invoke-RestMethod `
        -Uri "$BASE_URL/media/flux-image/dual" `
        -Method POST `
        -Body $body3 `
        -ContentType "application/json" `
        -TimeoutSec 90
    
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "   DALL-E URL (promo): $($response3.promo)" -ForegroundColor Green
    Write-Host "   FLUX URL (flux): $($response3.flux)" -ForegroundColor Green
    
    # Validate both URLs exist
    if ($response3.promo -and $response3.flux) {
        Write-Host "`n🎯 VALIDATION: ✅ Both URLs present!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ VALIDATION: ❌ Missing URLs!" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ FAILED!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# ===================================================================
# TEST 4: Simple FLUX 2 Pro
# ===================================================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  TEST 4: SIMPLE FLUX 2 PRO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$body4 = @{
    prompt = $TEST_PROMPT
    plan = "FREE"
    size = "1024x1024"
} | ConvertTo-Json

Write-Host "`n📡 Request: FLUX 2 Pro generation..." -ForegroundColor Yellow
Write-Host "Body: $body4" -ForegroundColor Gray

try {
    $response4 = Invoke-RestMethod `
        -Uri "$BASE_URL/media/flux-image/simple" `
        -Method POST `
        -Body $body4 `
        -ContentType "application/json" `
        -TimeoutSec 60
    
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "   Image URL: $($response4.data.imageUrl)" -ForegroundColor Green
    Write-Host "   Success: $($response4.success)" -ForegroundColor Gray
    Write-Host "   Message: $($response4.message)" -ForegroundColor Gray
} catch {
    Write-Host "`n❌ FAILED!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# ===================================================================
# SUMMARY
# ===================================================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Modes Tested:" -ForegroundColor Yellow
Write-Host "  1. ✅ DALL-E Only (useFlux: false)" -ForegroundColor White
Write-Host "  2. ✅ FLUX Only (useFlux: true)" -ForegroundColor White
Write-Host "  3. ✅ Dual (DALL-E + FLUX Kontext Pro)" -ForegroundColor White
Write-Host "  4. ✅ FLUX 2 Pro" -ForegroundColor White
Write-Host ""
Write-Host "Expected JSON Format:" -ForegroundColor Yellow
Write-Host @"
{
  // Standard endpoints
  {
    "success": true,
    "message": "...",
    "data": {
      "imageUrl": "https://...",
      "filename": "...",
      "userId": "...",
      "prompt": "..."
    }
  }
  
  // Dual endpoint
  {
    "promo": "https://...dall-e...",
    "flux": "https://...flux-kontext..."
  }
"@
Write-Host ""
Write-Host "✅ All local tests completed!" -ForegroundColor Green
