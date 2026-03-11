#!/usr/bin/env pwsh

# 🧪 TEST COMPLETO FLUX KONTEXT - COMPARACIÓN DIRECTA VS SERVICIO

Write-Host "`n🔬 ANÁLISIS COMPLETO DE FLUX KONTEXT PRO" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$apiKey = "7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"
$baseUrl = "https://labsc-m9j5kbl9-eastus2.services.ai.azure.com"
$deployment = "FLUX.1-Kontext-pro"
$apiVersion = "2025-04-01-preview"
$serviceUrl = "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net"

# Test 1: Foundry Directo (TU CURL EXITOSO)
Write-Host "`n📊 TEST 1: FOUNDRY DIRECTO (Tu curl exitoso)" -ForegroundColor Yellow
try {
    $url = "$baseUrl/openai/deployments/$deployment/images/generations?api-version=$apiVersion"
    $body = @"
{
  "prompt": "A red fox in autumn forest",
  "n": 1,
  "model": "$deployment"
}
"@

    $headers = @{
        "Authorization" = "Bearer $apiKey"
        "Content-Type" = "application/json"
    }

    Write-Host "URL: $url" -ForegroundColor Gray
    Write-Host "Prompt: A red fox in autumn forest" -ForegroundColor Gray
    
    $response = Invoke-RestMethod -Uri $url -Method POST -Body $body -Headers $headers
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Created timestamp: $($response.created)" -ForegroundColor Gray
    Write-Host "Has image data: $(if ($response.data[0].b64_json) { 'YES' } else { 'NO' })" -ForegroundColor Gray
    
    if ($response.data[0].b64_json) {
        [System.IO.File]::WriteAllBytes("test_foundry_direct.png", [System.Convert]::FromBase64String($response.data[0].b64_json))
        Write-Host "✅ Imagen guardada: test_foundry_direct.png" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ ERROR: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalle: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 2: Nuestro Servicio (con Authorization header)
Write-Host "`n📊 TEST 2: NUESTRO SERVICIO (Con Authorization header)" -ForegroundColor Yellow
try {
    $url = "$serviceUrl/media/flux-kontext/image"
    $body = @"
{
  "prompt": "A red fox in autumn forest",
  "plan": "PRO",
  "enhancePrompt": false
}
"@

    $headers = @{
        "Authorization" = "Bearer $apiKey"
        "Content-Type" = "application/json"
    }

    Write-Host "URL: $url" -ForegroundColor Gray
    Write-Host "Usando Authorization header: Bearer $apiKey" -ForegroundColor Gray
    
    $response = Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType "application/json" -Headers $headers | Select-Object -ExpandProperty Content
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response: $response" -ForegroundColor Gray
} catch {
    Write-Host "❌ ERROR: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalle:" -ForegroundColor Yellow
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5
    }
}

# Test 3: Nuestro Servicio SIN Authorization header
Write-Host "`n📊 TEST 3: NUESTRO SERVICIO (Sin Authorization header)" -ForegroundColor Yellow
try {
    $url = "$serviceUrl/media/flux-kontext/image"
    $body = @"
{
  "prompt": "A red fox in autumn forest",
  "plan": "PRO",
  "enhancePrompt": false
}
"@

    Write-Host "URL: $url" -ForegroundColor Gray
    Write-Host "SIN Authorization header" -ForegroundColor Gray
    
    $response = Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType "application/json" | Select-Object -ExpandProperty Content
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response: $response" -ForegroundColor Gray
} catch {
    Write-Host "❌ ERROR: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalle:" -ForegroundColor Yellow
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5
    }
}

Write-Host "`n📋 CONCLUSIONES:" -ForegroundColor Cyan
Write-Host "- Si Test 1 funciona pero Test 2 falla: Problema en nuestro servicio o variables de entorno" -ForegroundColor Yellow
Write-Host "- Si ambos tests fallan: Problema con el deployment de FLUX" -ForegroundColor Yellow
Write-Host "- Revisa logs de Azure Application Insights para más detalles" -ForegroundColor Yellow
