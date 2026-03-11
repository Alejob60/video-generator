# ⚡ QUICK FIX - Configurar Variables Azure

**Ejecutar DESPUÉS de que termine el build:**

---

## 🎯 **PASO 1: Obtener Connection String**

```powershell
# Obtener Azure Storage Connection String
$connectionString = az storage account show-connection-string `
  --name realculturestorage `
  --resource-group realculture-rg `
  --query connectionString `
  --output tsv

Write-Host "✅ Connection String obtenida: $connectionString"
```

---

## 🎯 **PASO 2: Configurar TODAS las Variables**

```powershell
# 📁 configure-all-env-vars.ps1

$resourceGroup = "realculture-rg"
$appName = "video-converter"

Write-Host "⚙️ Configurando variables en Azure App Service..." -ForegroundColor Cyan

# Obtener connection string
$connectionString = az storage account show-connection-string `
  --name realculturestorage `
  --resource-group $resourceGroup `
  --query connectionString `
  --output tsv

# Configurar todas las variables
az webapp config appsettings set `
  --resource-group $resourceGroup `
  --name $appName `
  --settings `
    AZURE_STORAGE_CONNECTION_STRING="$connectionString" `
    AZURE_STORAGE_CONTAINER_NAME="images" `
    `
    FLUX_API_KEY="7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS" `
    `
    ENDPOINT_FLUX_KONTENT_PRO="https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com" `
    ENDPOINT_FLUX_KONTENT_PRO_API_KEY="7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS" `
    `
    FLUX_KONTEXT_PRO_BASE_URL="https://labsc-m9j5kbl9-eastus2.services.ai.azure.com" `
    FLUX_KONTEXT_PRO_DEPLOYMENT="FLUX.1-Kontext-pro" `
    FLUX_KONTEXT_PRO_API_VERSION="2025-04-01-preview" `
    FLUX_KONTEXT_PRO_API_KEY="7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS" `
    `
    MAIN_BACKEND_URL="http://localhost:3000" `
    NODE_ENV="production" `
    PORT="8080"

Write-Host "`n✅ Variables configuradas exitosamente" -ForegroundColor Green

Write-Host "`n🔄 Reiniciando App Service..." -ForegroundColor Yellow

az webapp restart `
  --name $appName `
  --resource-group $resourceGroup

Write-Host "`n✅ App Service reiniciado" -ForegroundColor Green

Write-Host "`n🌐 Esperar 2-3 minutos para que los cambios surtan efecto" -ForegroundColor Yellow
Write-Host "URL: https://$appName.azurewebsites.net" -ForegroundColor Cyan
```

---

## 🧪 **PASO 3: Testear Endpoints (Después de 2-3 min)**

### **Test 1: FLUX Kontext (el que daba 404):**

```bash
curl -X POST "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-kontext/image" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A red fox in autumn forest",
    "plan": "PRO",
    "size": "1024x1024"
  }'
```

**Respuesta esperada (éxito):**
```json
{
  "success": true,
  "message": "✅ FLUX Kontext image generated successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-{timestamp}.png?sv=2025-07-05...",
    "prompt": "A red fox in autumn forest",
    "filename": "misy-image-{timestamp}.png"
  }
}
```

---

### **Test 2: Dual Endpoint (el que daba 500):**

```bash
curl -X POST "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/image" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A red apple on white background",
    "plan": "PRO",
    "useFlux": true
  }'
```

**Respuesta esperada (éxito):**
```json
{
  "success": true,
  "message": "✅ Imagen generada correctamente",
  "result": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/promo_{timestamp}.png?sv=2025-07-05...",
    "prompt": "A red apple on white background",
    "filename": "promo_{timestamp}.png"
  }
}
```

---

## 📊 **Verificar Variables Configuradas:**

```bash
az webapp config appsettings list \
  --name video-converter \
  --resource-group realculture-rg \
  --query "[].{name:name, value:value}" \
  --output table
```

---

## ⚠️ **Si persiste el error 500:**

### **Ver logs en tiempo real:**

```bash
az webapp log tail \
  --name video-converter \
  --resource-group realculture-rg
```

### **Buscar errores específicos:**

```
- "Failed to upload to blob" → Revisar AZURE_STORAGE_CONNECTION_STRING
- "Connection refused" → Revisar MAIN_BACKEND_URL
- "Unauthorized" → Revisar API Keys
- "Resource not found" → Revisar endpoints
```

---

## 🎯 **EJECUCIÓN RÁPIDA:**

### **1. Esperar a que termine el build:**

El script de rebuild está corriendo. Esperar mensaje:
```
✅ REBUILD & REDEPLOY COMPLETADO
```

### **2. Ejecutar configuración:**

```powershell
.\configure-all-env-vars.ps1
```

### **3. Esperar 2-3 minutos**

### **4. Testear:**

```bash
# Copiar y pegar los tests de arriba
```

---

**Timeline estimado:**
- Build actual: ~5-10 min restantes
- Deploy a Azure: ~3-5 min
- Configurar variables: ~1 min
- Propagación: ~2-3 min
- **Total: ~15-20 minutos**
