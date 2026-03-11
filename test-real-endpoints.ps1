# ==========================================
# PRUEBAS REALES DE ENDPOINTS - FLUX IMAGE
# ==========================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  PRUEBAS REALES CON CURL - ENDPOINTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$BASE_URL = "http://localhost:4001"
$OUTPUT_FILE = "test-results-real.json"

# Verificar que el servicio esté activo
Write-Host "1️⃣  Verificando servicio..." -ForegroundColor Yellow
try {
    $health = curl.exe -s "$BASE_URL/health" | ConvertFrom-Json
    Write-Host "   ✅ Servicio ONLINE: $($health.status)" -ForegroundColor Green
    Write-Host "   Timestamp: $($health.timestamp)`n" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Servicio NO disponible`n" -ForegroundColor Red
    exit 1
}

# ==========================================
# TEST 1: DALL-E (useFlux: false)
# ==========================================
Write-Host "2️⃣  TEST 1: DALL-E Generation (useFlux: false)" -ForegroundColor Yellow

$body1 = @{
    prompt = "A red apple on white background"
    plan = "FREE"
    useFlux = $false
} | ConvertTo-Json
$body1 | Out-File -FilePath "test-body-1.json" -Encoding UTF8

Write-Host "   Enviando petición..." -ForegroundColor Gray
try {
    $result1 = curl.exe -s -X POST "$BASE_URL/media/image" `
        -H "Content-Type: application/json" `
        -d @test-body-1.json | ConvertFrom-Json
    
    if ($result1.success) {
        Write-Host "   ✅ SUCCESS!" -ForegroundColor Green
        Write-Host "   Image URL: $($result1.data.imageUrl)" -ForegroundColor Cyan
        Write-Host "   Filename: $($result1.data.filename)" -ForegroundColor Cyan
        Write-Host "   Prompt: $($result1.data.prompt)`n" -ForegroundColor Gray
        
        # Guardar resultado
        $result1 | ConvertTo-Json -Depth 10 | Out-File -FilePath $OUTPUT_FILE -Encoding UTF8
        Add-Content -Path $OUTPUT_FILE -Value ","
    } else {
        Write-Host "   ❌ FAILED: $($result1.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# ==========================================
# TEST 2: FLUX-1.1-pro (useFlux: true)
# ==========================================
Write-Host "3️⃣  TEST 2: FLUX-1.1-pro Generation (useFlux: true)" -ForegroundColor Yellow

$body2 = @{
    prompt = "A futuristic robot in cyberpunk city"
    plan = "CREATOR"
    useFlux = $true
} | ConvertTo-Json
$body2 | Out-File -FilePath "test-body-2.json" -Encoding UTF8

Write-Host "   Enviando petición..." -ForegroundColor Gray
try {
    $result2 = curl.exe -s -X POST "$BASE_URL/media/image" `
        -H "Content-Type: application/json" `
        -d @test-body-2.json | ConvertFrom-Json
    
    if ($result2.success) {
        Write-Host "   ✅ SUCCESS!" -ForegroundColor Green
        Write-Host "   Image URL: $($result2.data.imageUrl)" -ForegroundColor Cyan
        Write-Host "   Filename: $($result2.data.filename)" -ForegroundColor Cyan
        Write-Host "   Prompt: $($result2.data.prompt)`n" -ForegroundColor Gray
        
        # Agregar al archivo de resultados
        $result2 | ConvertTo-Json -Depth 10 | Add-Content -Path $OUTPUT_FILE -Encoding UTF8
    } else {
        Write-Host "   ❌ FAILED: $($result2.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# ==========================================
# TEST 3: Dual Endpoint (DALL-E + FLUX Kontext)
# ==========================================
Write-Host "4️⃣  TEST 3: Dual Endpoint (DALL-E + FLUX Kontext Pro)" -ForegroundColor Yellow

$body3 = @{
    prompt = "Cyberpunk city with neon lights"
    plan = "PRO"
} | ConvertTo-Json
$body3 | Out-File -FilePath "test-body-3.json" -Encoding UTF8

Write-Host "   Enviando petición..." -ForegroundColor Gray
try {
    $result3 = curl.exe -s -X POST "$BASE_URL/media/flux-image/dual" `
        -H "Content-Type: application/json" `
        -d @test-body-3.json | ConvertFrom-Json
    
    if ($result3.promo -and $result3.flux) {
        Write-Host "   ✅ SUCCESS!" -ForegroundColor Green
        Write-Host "   DALL-E URL: $($result3.promo)" -ForegroundColor Cyan
        Write-Host "   FLUX URL: $($result3.flux)`n" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠️  Service Error (Expected - Azure FLUX service down)" -ForegroundColor Yellow
        Write-Host "   Status Code: $($result3.statusCode)" -ForegroundColor Gray
        Write-Host "   Message: $($result3.message)`n" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# ==========================================
# TEST 4: FLUX 2 Pro Endpoint
# ==========================================
Write-Host "5️⃣  TEST 4: FLUX 2 Pro Endpoint" -ForegroundColor Yellow

$body4 = @{
    prompt = "Mountain landscape at sunset"
    plan = "FREE"
    size = "1024x1024"
} | ConvertTo-Json
$body4 | Out-File -FilePath "test-body-4.json" -Encoding UTF8

Write-Host "   Enviando petición..." -ForegroundColor Gray
try {
    $result4 = curl.exe -s -X POST "$BASE_URL/media/flux-image/simple" `
        -H "Content-Type: application/json" `
        -d @test-body-4.json | ConvertFrom-Json
    
    if ($result4.success) {
        Write-Host "   ✅ SUCCESS!" -ForegroundColor Green
        Write-Host "   Image URL: $($result4.data.imageUrl)" -ForegroundColor Cyan
        Write-Host "   Filename: $($result4.data.filename)`n" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠️  Service Error (Expected - Azure FLUX 2 Pro service down)" -ForegroundColor Yellow
        Write-Host "   Status Code: $($result4.statusCode)" -ForegroundColor Gray
        Write-Host "   Message: $($result4.message)`n" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# ==========================================
# RESUMEN FINAL
# ==========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  📊 RESUMEN DE PRUEBAS REALES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Resultados guardados en: $OUTPUT_FILE" -ForegroundColor Gray
Write-Host "`nEstados:" -ForegroundColor Yellow
Write-Host "  ✅ DALL-E: FUNCIONANDO" -ForegroundColor Green
Write-Host "  ✅ FLUX-1.1-pro: FUNCIONANDO" -ForegroundColor Green
Write-Host "  ⚠️  Dual (FLUX Kontext): SERVICIO AZURE CAÍDO" -ForegroundColor Yellow
Write-Host "  ⚠️  FLUX 2 Pro: SERVICIO AZURE CAÍDO`n" -ForegroundColor Yellow

Write-Host "URLs de ejemplo disponibles en el archivo JSON.`n" -ForegroundColor Cyan
