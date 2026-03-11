# ==========================================
# TEST FLUX 2 PRO - ESTRUCTURA OFICIAL FOUNDRY
# ==========================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST FLUX 2 PRO - FOUNDRY STRUCTURE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$BASE_URL = "http://localhost:4001"

# Verificar servicio
Write-Host "1️⃣  Verificando servicio..." -ForegroundColor Yellow
try {
    $health = curl.exe -s "$BASE_URL/health" | ConvertFrom-Json
    Write-Host "   ✅ Servicio ONLINE: $($health.status)`n" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Servicio NO disponible`n" -ForegroundColor Red
    exit 1
}

# ==========================================
# TEST: FLUX 2 Pro con nueva estructura
# ==========================================
Write-Host "2️⃣  TEST: FLUX 2 Pro (Official Foundry Structure)" -ForegroundColor Yellow

$body = @{
    prompt = "A photograph of a red fox in an autumn forest"
    plan = "FREE"
    size = "1024x1024"
} | ConvertTo-Json

$body | Out-File -FilePath "test-flux2pro-body.json" -Encoding UTF8

Write-Host "   Payload structure:" -ForegroundColor Gray
Write-Host "   - model: FLUX.2-pro (official name)" -ForegroundColor Gray
Write-Host "   - width: 1024, height: 1024" -ForegroundColor Gray
Write-Host "   - n: 1" -ForegroundColor Gray
Write-Host "   - prompt: A photograph of a red fox in an autumn forest`n" -ForegroundColor Gray

Write-Host "   Enviando petición a FLUX 2 Pro endpoint..." -ForegroundColor Gray

try {
    $result = curl.exe -s -X POST "$BASE_URL/media/flux-image/simple" `
        -H "Content-Type: application/json" `
        -d @test-flux2pro-body.json
    
    Write-Host "`n   Response:`n" -ForegroundColor Gray
    $result | Write-Host
    
    $jsonResult = $result | ConvertFrom-Json
    
    if ($jsonResult.success) {
        Write-Host "`n   ✅ SUCCESS! FLUX 2 Pro is working!" -ForegroundColor Green
        Write-Host "   Image URL: $($jsonResult.data.imageUrl)" -ForegroundColor Cyan
        Write-Host "   Filename: $($jsonResult.data.filename)" -ForegroundColor Cyan
        Write-Host "   Prompt: $($jsonResult.data.prompt)`n" -ForegroundColor Cyan
        
        # Guardar resultado
        $result | Out-File -FilePath "flux2pro-result.json" -Encoding UTF8
        Write-Host "   Result saved to: flux2pro-result.json`n" -ForegroundColor Gray
    } else {
        Write-Host "`n   ❌ FAILED!" -ForegroundColor Red
        Write-Host "   Error: $($jsonResult.message)" -ForegroundColor Red
        Write-Host "   Status Code: $($jsonResult.statusCode)`n" -ForegroundColor Red
    }
} catch {
    Write-Host "`n   ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Test completed!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
