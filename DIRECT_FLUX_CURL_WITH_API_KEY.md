# 🧪 CURL DIRECTO AL FOUNDRY CON API KEY

## 🔑 API Key
```powershell
$Env:AZURE_API_KEY = "7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"
```

---

## 📸 TEST 1: GENERAR IMAGEN DIRECTO AL FOUNDRY

### **PowerShell:**
```powershell
$body = @"
{
  "prompt": "A photograph of a red fox in an autumn forest",
  "n": 1,
  "model": "FLUX.1-Kontext-pro"
}
"@

$headers = @{
    "Authorization" = "Bearer $Env:AZURE_API_KEY"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview" `
    -Method POST `
    -Body $body `
    -Headers $headers | ConvertTo-Json -Depth 10
```

### **Curl (Bash/Linux/Mac):**
```bash
export AZURE_API_KEY="7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"

curl -X POST "https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AZURE_API_KEY" \
  -d '{
    "prompt": "A photograph of a red fox in an autumn forest",
    "n": 1,
    "model": "FLUX.1-Kontext-pro"
  }' | jq -r '.data[0].b64_json' | base64 --decode > generated_image.png
```

---

## ✏️ TEST 2: EDITAR IMAGEN DIRECTO AL FOUNDRY

### **PowerShell:**
```powershell
# Primero necesitas subir una imagen
$imagePath = "C:\ruta\a\tu\imagen.png"

# Crear formulario multipart
$formBoundary = [System.Guid]::NewGuid().ToString()

$bodyLines = @(
    "--$formBoundary",
    'Content-Disposition: form-data; name="model"',
    "",
    "FLUX.1-Kontext-pro",
    "--$formBoundary",
    "Content-Disposition: form-data; name=`"image`"; filename=`"$([System.IO.Path]::GetFileName($imagePath))`"",
    "Content-Type: image/png",
    "",
    [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($imagePath)),
    "--$formBoundary",
    'Content-Disposition: form-data; name="prompt"',
    "",
    "Apply cyberpunk neon style with purple and blue lighting",
    "--$formBoundary--"
)

$body = ($bodyLines -join "`r`n")

$headers = @{
    "Authorization" = "Bearer $Env:AZURE_API_KEY"
    "Content-Type" = "multipart/form-data; boundary=$formBoundary"
}

Invoke-RestMethod -Uri "https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/edits?api-version=2025-04-01-preview" `
    -Method POST `
    -Body $body `
    -Headers $headers | ConvertTo-Json -Depth 10
```

### **Curl (Bash/Linux/Mac):**
```bash
export AZURE_API_KEY="7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"

curl -X POST "https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/edits?api-version=2025-04-01-preview" \
  -H "Authorization: Bearer $AZURE_API_KEY" \
  -F "model=FLUX.1-Kontext-pro" \
  -F "image=@image_to_edit.png" \
  -F "prompt=Apply cyberpunk neon style with purple and blue lighting" | jq -r '.data[0].b64_json' | base64 --decode > edited_image.png
```

---

## 🚀 TEST 3: NUESTRO ENDPOINT EN PRODUCCIÓN (CON API KEY DIRECTA)

### **PowerShell Script Completo:**

```powershell
# URL y API Key
$baseUrl = "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net"
$fluxApiKey = "7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"

# Test FLUX SIN Enhancement
Write-Host "`n🖼️  Testing FLUX Kontext Pro (sin enhancement)" -ForegroundColor Yellow

$body = @{
    prompt = "A red fox in autumn forest"
    plan = "PRO"
    enhancePrompt = $false
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $fluxApiKey"
}

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/media/flux-kontext/image" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -Headers $headers | Select-Object -ExpandProperty Content
    
    Write-Host "✅ SUCCESS: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: $_" -ForegroundColor Red
}

# Test FLUX CON Enhancement Automático
Write-Host "`n🚀 Testing FLUX Kontext Pro (CON enhancement automático)" -ForegroundColor Yellow

$body = @{
    prompt = "A majestic cat with blue eyes"
    plan = "PRO"
    enhancePrompt = $true
} | ConvertTo-Json

try {
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
}
```

---

## 📊 RESULTADOS ESPERADOS

### **Si el deployment existe:**
```json
{
  "success": true,
  "message": "✅ FLUX Kontext image generated successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-{timestamp}.png?sv=2025-07-05...",
    "prompt": "A majestic red fox with vibrant orange fur...",
    "filename": "misy-image-{timestamp}.png",
    "enhancedPromptUsed": true
  }
}
```

### **Si el deployment NO existe (Error 500):**
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

**Solución:** Crear deployment en Azure Foundry: https://labsc-m9j5kbl9-eastus2.services.ai.azure.com

---

## 🎯 RESUMEN RÁPIDO

| Endpoint | API Key | Estado |
|----------|---------|--------|
| Foundry Directo | `7PAsgxvIw4v494O...` | Requiere deployment |
| Nuestro FLUX | Misma key arriba | Requiere deployment |
| DALL-E 3 | Configurada en backend | ✅ Funcionando |
| LLM Enhancement | Configurada en backend | ✅ Funcionando |

---

**Ejecuta:** `.\test-all-endpoints.ps1` para test automatizado completo! 🚀
