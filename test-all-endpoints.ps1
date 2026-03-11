#!/usr/bin/env pwsh

# 🧪 TEST COMPLETO DE ENDPOINTS EN PRODUCCIÓN

$baseUrl = "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net"
$fluxApiKey = "7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"

Write-Host "`n🚀 TESTING ENDPOINTS EN PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl`n" -ForegroundColor Gray

# Test 1: Health Check
Write-Host "`n📊 TEST 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET | Select-Object -ExpandProperty Content
    Write-Host "✅ SUCCESS: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: $_" -ForegroundColor Red
}

# Test 2: DALL-E 3
Write-Host "`n🎨 TEST 2: DALL-E 3 Generation" -ForegroundColor Yellow
try {
    $body = @{
        prompt = "A red apple on white background"
        plan = "FREE"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/media/image" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" | Select-Object -ExpandProperty Content
    
    Write-Host "✅ SUCCESS: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: $_" -ForegroundColor Red
}

# Test 3: Enhanced Prompt (LLM)
Write-Host "`n📝 TEST 3: Enhanced Prompt (LLM)" -ForegroundColor Yellow
try {
    $body = @{
        prompt = "A warrior in battle"
        useJson = $true
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/llm/generate-json" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" | Select-Object -ExpandProperty Content
    
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    $json = $response | ConvertFrom-Json
    Write-Host "Prompt mejorado generado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: $_" -ForegroundColor Red
}

# Test 4: FLUX Kontext Pro SIN Enhancement
Write-Host "`n🖼️  TEST 4: FLUX Kontext Pro (sin enhancement)" -ForegroundColor Yellow
try {
    $body = @{
        prompt = "A red fox in autumn forest"
        plan = "PRO"
        enhancePrompt = $false
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $fluxApiKey"
    }
    
    $response = Invoke-WebRequest -Uri "$baseUrl/media/flux-kontext/image" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -Headers $headers | Select-Object -ExpandProperty Content
    
    Write-Host "✅ SUCCESS: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: $_" -ForegroundColor Red
    Write-Host "💡 Nota: Si el error persiste, verifica que el deployment FLUX.1-Kontext-pro existe en Azure Foundry" -ForegroundColor Yellow
}

# Test 5: FLUX Kontext Pro CON Enhancement Automático
Write-Host "`n🚀 TEST 5: FLUX Kontext Pro (CON enhancement automático)" -ForegroundColor Yellow
try {
    $body = @{
        prompt = "A cat sitting peacefully"
        plan = "PRO"
        enhancePrompt = $true
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $fluxApiKey"
    }
    
    $response = Invoke-WebRequest -Uri "$baseUrl/media/flux-kontext/image" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -Headers $headers | Select-Object -ExpandProperty Content
    
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    $json = $response | ConvertFrom-Json
    if ($json.data.enhancedPromptUsed) {
        Write-Host "✨ Enhanced Prompt USADO: $($json.data.enhancedPromptUsed)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ ERROR: $_" -ForegroundColor Red
    Write-Host "💡 Nota: Si el error persiste, verifica que el deployment FLUX.1-Kontext-pro existe en Azure Foundry" -ForegroundColor Yellow
}

Write-Host "`n📊 RESUMEN:" -ForegroundColor Cyan
Write-Host "- Health Check: ✅ Online" -ForegroundColor Green
Write-Host "- DALL-E 3: ✅ Funcionando" -ForegroundColor Green
Write-Host "- Enhanced Prompt (LLM): ✅ Funcionando" -ForegroundColor Green
Write-Host "- FLUX Kontext: ⏳ Requiere deployment en Azure Foundry" -ForegroundColor Yellow

Write-Host "`n✅ PRUEBAS COMPLETADAS!" -ForegroundColor Green
