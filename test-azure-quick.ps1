# Quick test for Azure deployment
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  AZURE DEPLOYMENT QUICK TEST" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net"
$TEST_PROMPT = "A beautiful sunset over mountains"

Write-Host "🌐 Testing Azure Deployment:" -ForegroundColor Yellow
Write-Host "   URL: $BASE_URL" -ForegroundColor Gray
Write-Host ""

# Test 1: Health Check
Write-Host "1️⃣ Health Check..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$BASE_URL/health" -Method GET
    Write-Host "✅ Health OK" -ForegroundColor Green
    Write-Host ($health | ConvertTo-Json -Depth 5) -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Test 2: DALL-E Only
Write-Host "`n2️⃣ DALL-E Generation (useFlux: false)..." -ForegroundColor Cyan
$body1 = @{
    prompt = $TEST_PROMPT
    plan = "FREE"
    useFlux = $false
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "$BASE_URL/media/image" -Method POST -Body $body1 -ContentType "application/json"
    Write-Host "✅ DALL-E Success" -ForegroundColor Green
    Write-Host "   Image URL: $($response1.data.imageUrl)" -ForegroundColor Gray
} catch {
    Write-Host "❌ DALL-E Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Test 3: FLUX Only
Write-Host "`n3️⃣ FLUX Generation (useFlux: true)..." -ForegroundColor Cyan
$body2 = @{
    prompt = $TEST_PROMPT
    plan = "FREE"
    useFlux = $true
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "$BASE_URL/media/image" -Method POST -Body $body2 -ContentType "application/json"
    Write-Host "✅ FLUX Success" -ForegroundColor Green
    Write-Host "   Image URL: $($response2.data.imageUrl)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FLUX Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Test 4: Dual (DALL-E + FLUX Kontext)
Write-Host "`n4️⃣ Dual Generation (DALL-E + FLUX Kontext)..." -ForegroundColor Cyan
$body3 = @{
    prompt = $TEST_PROMPT
    plan = "PRO"
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri "$BASE_URL/media/flux-image/dual" -Method POST -Body $body3 -ContentType "application/json"
    Write-Host "✅ Dual Success" -ForegroundColor Green
    Write-Host "   DALL-E URL: $($response3.promo)" -ForegroundColor Gray
    Write-Host "   FLUX URL: $($response3.flux)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Dual Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Test 5: Simple FLUX 2 Pro
Write-Host "`n5️⃣ Simple FLUX 2 Pro..." -ForegroundColor Cyan
$body4 = @{
    prompt = $TEST_PROMPT
    plan = "FREE"
    size = "1024x1024"
} | ConvertTo-Json

try {
    $response4 = Invoke-RestMethod -Uri "$BASE_URL/media/flux-image/simple" -Method POST -Body $body4 -ContentType "application/json"
    Write-Host "✅ FLUX 2 Pro Success" -ForegroundColor Green
    Write-Host "   Image URL: $($response4.data.imageUrl)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FLUX 2 Pro Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  TEST COMPLETE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
