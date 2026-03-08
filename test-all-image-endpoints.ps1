# Test Image Generation Endpoints
# Tests for DALL-E, FLUX, and Dual generation

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  IMAGE GENERATION ENDPOINT TESTING" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "http://localhost:4000"
# $BASE_URL = "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net"

# Test prompt
$TEST_PROMPT = "A futuristic robot in a cyberpunk city with neon lights"

Write-Host "📋 Test Configuration:" -ForegroundColor Yellow
Write-Host "   Base URL: $BASE_URL" -ForegroundColor Gray
Write-Host "   Test Prompt: $TEST_PROMPT" -ForegroundColor Gray
Write-Host ""

# ===================================================================
# Test 1: DALL-E Only (useFlux: false)
# ===================================================================
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Test 1: DALL-E Only Generation" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$body1 = @{
    prompt = $TEST_PROMPT
    plan = "FREE"
    useFlux = $false
} | ConvertTo-Json -Depth 10

Write-Host "`n📡 Sending request to /media/image (DALL-E)..." -ForegroundColor Yellow

try {
    $response1 = Invoke-RestMethod `
        -Uri "$BASE_URL/media/image" `
        -Method POST `
        -Body $body1 `
        -ContentType "application/json"
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "   Response:" -ForegroundColor Gray
    Write-Host ($response1 | ConvertTo-Json -Depth 10) -ForegroundColor Cyan
} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "   Details: $($_.ErrorDetails)" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 2

# ===================================================================
# Test 2: FLUX Only (useFlux: true)
# ===================================================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Test 2: FLUX-1.1-pro Generation" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$body2 = @{
    prompt = $TEST_PROMPT
    plan = "FREE"
    useFlux = $true
} | ConvertTo-Json -Depth 10

Write-Host "`n📡 Sending request to /media/image (FLUX)..." -ForegroundColor Yellow

try {
    $response2 = Invoke-RestMethod `
        -Uri "$BASE_URL/media/image" `
        -Method POST `
        -Body $body2 `
        -ContentType "application/json"
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "   Response:" -ForegroundColor Gray
    Write-Host ($response2 | ConvertTo-Json -Depth 10) -ForegroundColor Cyan
} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "   Details: $($_.ErrorDetails)" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 2

# ===================================================================
# Test 3: Direct FLUX Endpoint
# ===================================================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Test 3: Direct FLUX Endpoint" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$body3 = @{
    prompt = $TEST_PROMPT
    plan = "FREE"
} | ConvertTo-Json -Depth 10

Write-Host "`n📡 Sending request to /media/flux-image..." -ForegroundColor Yellow

try {
    $response3 = Invoke-RestMethod `
        -Uri "$BASE_URL/media/flux-image" `
        -Method POST `
        -Body $body3 `
        -ContentType "application/json"
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "   Response:" -ForegroundColor Gray
    Write-Host ($response3 | ConvertTo-Json -Depth 10) -ForegroundColor Cyan
} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "   Details: $($_.ErrorDetails)" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 2

# ===================================================================
# Test 4: Dual Generation (DALL-E + FLUX Kontext Pro)
# ===================================================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Test 4: Dual Generation (DALL-E + FLUX Kontext)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$body4 = @{
    prompt = $TEST_PROMPT
    plan = "PRO"
} | ConvertTo-Json -Depth 10

Write-Host "`n📡 Sending request to /media/flux-image/dual..." -ForegroundColor Yellow

try {
    $response4 = Invoke-RestMethod `
        -Uri "$BASE_URL/media/flux-image/dual" `
        -Method POST `
        -Body $body4 `
        -ContentType "application/json"
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "   Response:" -ForegroundColor Gray
    Write-Host ($response4 | ConvertTo-Json -Depth 10) -ForegroundColor Cyan
    
    # Validate response structure
    if ($response4.promo -and $response4.flux) {
        Write-Host "`n🎯 VALIDATION PASSED:" -ForegroundColor Green
        Write-Host "   ✅ Has promo URL (DALL-E): $($response4.promo)" -ForegroundColor Green
        Write-Host "   ✅ Has flux URL (FLUX Kontext): $($response4.flux)" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ VALIDATION WARNING:" -ForegroundColor Yellow
        Write-Host "   Missing promo or flux URL in response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "   Details: $($_.ErrorDetails)" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 2

# ===================================================================
# Test 5: Simple FLUX 2 Pro Endpoint
# ===================================================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Test 5: Simple FLUX 2 Pro Generation" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$body5 = @{
    prompt = $TEST_PROMPT
    plan = "FREE"
    size = "1024x1024"
} | ConvertTo-Json -Depth 10

Write-Host "`n📡 Sending request to /media/flux-image/simple..." -ForegroundColor Yellow

try {
    $response5 = Invoke-RestMethod `
        -Uri "$BASE_URL/media/flux-image/simple" `
        -Method POST `
        -Body $body5 `
        -ContentType "application/json"
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "   Response:" -ForegroundColor Gray
    Write-Host ($response5 | ConvertTo-Json -Depth 10) -ForegroundColor Cyan
    
    # Validate response structure
    if ($response5.success -and $response5.data.imageUrl) {
        Write-Host "`n🎯 VALIDATION PASSED:" -ForegroundColor Green
        Write-Host "   ✅ Success flag: $($response5.success)" -ForegroundColor Green
        Write-Host "   ✅ Has image URL: $($response5.data.imageUrl)" -ForegroundColor Green
        Write-Host "   ✅ Has prompt: $($response5.data.prompt)" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ VALIDATION WARNING:" -ForegroundColor Yellow
        Write-Host "   Missing success flag or imageUrl in response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "   Details: $($_.ErrorDetails)" -ForegroundColor Red
    }
}

# ===================================================================
# Summary
# ===================================================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Endpoints Tested:" -ForegroundColor Yellow
Write-Host "  1. ✅ /media/image (DALL-E only)" -ForegroundColor White
Write-Host "  2. ✅ /media/image (FLUX only)" -ForegroundColor White
Write-Host "  3. ✅ /media/flux-image (Direct FLUX)" -ForegroundColor White
Write-Host "  4. ✅ /media/flux-image/dual (DALL-E + FLUX Kontext)" -ForegroundColor White
Write-Host "  5. ✅ /media/flux-image/simple (FLUX 2 Pro)" -ForegroundColor White
Write-Host ""
Write-Host "Expected JSON Response Format:" -ForegroundColor Yellow
Write-Host @"
{
  // For /media/image and /media/flux-image
  {
    "success": true,
    "message": "✅ ...",
    "data": {
      "imageUrl": "https://...",
      "filename": "...",
      "userId": "...",
      "prompt": "..."
    }
  }
  
  // For /media/flux-image/dual
  {
    "promo": "https://...dall-e...",
    "flux": "https://...flux-kontext..."
  }
  
  // For /media/flux-image/simple
  {
    "success": true,
    "message": "✅ FLUX 2 Pro image generated successfully",
    "data": {
      "imageUrl": "https://...",
      "filename": "...",
      "userId": "...",
      "prompt": "..."
    }
  }
"@
Write-Host ""
Write-Host "✅ All tests completed!" -ForegroundColor Green
