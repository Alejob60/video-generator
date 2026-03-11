# ⚙️ AZURE ENV VARIABLES CONFIGURATION

**Fecha:** 2026-03-09  
**Propósito:** Configurar variables de entorno requeridas en Azure App Service

---

## 🔑 **VARIABLES REQUERIDAS**

### **1. Azure Blob Storage:**

```bash
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=realculturestorage;AccountKey=<TU_KEY>;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=images
```

**Cómo obtener:**
1. Ir a Azure Portal → Storage Account `realculturestorage`
2. Settings → Access keys
3. Copiar Connection string (key1 o key2)

---

### **2. FLUX Endpoints:**

```bash
# FLUX-1.1-pro (Dual endpoint)
FLUX_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS
FLUX_ENDPOINT=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/flux-1.1-pro/images/generations

# FLUX 2 Pro
ENDPOINT_FLUX_KONTENT_PRO=https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com
ENDPOINT_FLUX_KONTENT_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS

# FLUX.1-Kontext-pro
FLUX_KONTEXT_PRO_BASE_URL=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com
FLUX_KONTEXT_PRO_DEPLOYMENT=FLUX.1-Kontext-pro
FLUX_KONTEXT_PRO_API_VERSION=2025-04-01-preview
FLUX_KONTEXT_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS
```

---

### **3. Backend Principal:**

```bash
MAIN_BACKEND_URL=https://tu-backend-principal.azurewebsites.net
```

**Importante:** Reemplazar con la URL real del backend principal.

---

### **4. Node.js Runtime:**

```bash
NODE_ENV=production
PORT=8080
```

---

## 📝 **SCRIPT PARA VERIFICAR VARIABLES**

### **Ver variables actuales en Azure:**

```bash
az webapp config appsettings list \
  --name video-converter \
  --resource-group realculture-rg \
  --output table
```

---

### **Configurar TODAS las variables de una vez:**

```powershell
# 📁 configure-azure-env-vars.ps1

$resourceGroup = "realculture-rg"
$appName = "video-converter"

Write-Host "⚙️ Configurando variables de entorno en Azure..." -ForegroundColor Cyan

az webapp config appsettings set `
  --resource-group $resourceGroup `
  --name $appName `
  --settings `
    AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=realculturestorage;AccountKey=<TU_KEY>;EndpointSuffix=core.windows.net" `
    AZURE_STORAGE_CONTAINER_NAME="images" `
    `
    FLUX_API_KEY="7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS" `
    FLUX_ENDPOINT="https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/flux-1.1-pro/images/generations" `
    `
    ENDPOINT_FLUX_KONTENT_PRO="https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com" `
    ENDPOINT_FLUX_KONTENT_PRO_API_KEY="7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS" `
    `
    FLUX_KONTEXT_PRO_BASE_URL="https://labsc-m9j5kbl9-eastus2.services.ai.azure.com" `
    FLUX_KONTEXT_PRO_DEPLOYMENT="FLUX.1-Kontext-pro" `
    FLUX_KONTEXT_PRO_API_VERSION="2025-04-01-preview" `
    FLUX_KONTEXT_PRO_API_KEY="7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS" `
    `
    MAIN_BACKEND_URL="https://tu-backend-principal.azurewebsites.net" `
    NODE_ENV="production" `
    PORT="8080"

Write-Host "✅ Variables configuradas" -ForegroundColor Green
Write-Host "`n🔄 Reiniciando App Service..." -ForegroundColor Yellow

az webapp restart `
  --name $appName `
  --resource-group $resourceGroup

Write-Host "✅ App Service reiniciado" -ForegroundColor Green
```

---

## 🔍 **COMO OBTENER CADA VARIABLE**

### **1. Azure Storage Connection String:**

```bash
# Desde Azure CLI
az storage account show-connection-string \
  --name realculturestorage \
  --resource-group realculture-rg \
  --query connectionString \
  --output tsv
```

**O desde Azure Portal:**
1. Ir a: https://portal.azure.com/#@/resource/subscriptions/a466ea69-1312-4361-95e1-f1c8524bea91/resourceGroups/realculture-rg/providers/Microsoft.Storage/storageAccounts/realculturestorage
2. Settings → Access keys
3. Copiar "Connection string"

---

### **2. FLUX API Keys:**

Todas las keys apuntan al mismo recurso Azure AI Services.

**Verificar endpoint:**
```bash
curl -X GET "https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/" \
  -H "Authorization: Bearer 7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"
```

---

### **3. Main Backend URL:**

**Si el backend está en local (desarrollo):**
```bash
MAIN_BACKEND_URL=http://localhost:3000
```

**Si el backend está en Azure:**
```bash
MAIN_BACKEND_URL=https://<tu-backend-app-name>.azurewebsites.net
```

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

### **Variables Críticas:**

- [ ] `AZURE_STORAGE_CONNECTION_STRING` - Sin esto no puede subir imágenes
- [ ] `AZURE_STORAGE_CONTAINER_NAME` - Debe ser "images"
- [ ] `FLUX_API_KEY` - Para FLUX-1.1-pro
- [ ] `FLUX_KONTEXT_PRO_API_KEY` - Para FLUX Kontext
- [ ] `MAIN_BACKEND_URL` - Para notificaciones
- [ ] `NODE_ENV` - Debe ser "production"
- [ ] `PORT` - Debe ser "8080"

---

## 🧪 **TEST POST-CONFIGURACIÓN**

### **1. Testear generación FLUX:**

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
  "message": "✅ FLUX image generated successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/flux-image-{uuid}.png?sv=2025-07-05...",
    "filename": "flux-image-{uuid}.png"
  }
}
```

---

### **2. Testear FLUX Kontext:**

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
    "filename": "misy-image-{timestamp}.png"
  }
}
```

---

## ⚠️ **ERRORES COMUNES Y SOLUCIONES**

### **Error 500 - Internal Server Error:**

**Causas posibles:**
1. ❌ `AZURE_STORAGE_CONNECTION_STRING` incorrecta
2. ❌ `MAIN_BACKEND_URL` no accesible
3. ❌ API Keys expiradas o incorrectas

**Solución:**
```bash
# Ver logs
az webapp log tail --name video-converter --resource-group realculture-rg

# Buscar errores específicos
# Ej: "Failed to upload to blob", "Connection refused", etc.
```

---

### **Error 401 - Unauthorized:**

**Causa:** API Key incorrecta

**Solución:**
```bash
# Verificar variable
az webapp config appsettings show \
  --name video-converter \
  --resource-group realculture-rg \
  --query "[?name=='FLUX_API_KEY'].value" \
  --output tsv
```

---

### **Error 404 - Resource Not Found:**

**Causas:**
1. ❌ Endpoint incorrecto
2. ❌ Deployment name errónea

**Solución:**
```bash
# Verificar endpoints en .env
# FLUX: https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/flux-1.1-pro/images/generations
# FLUX Kontext: https://labsc-m9j5kbl9-eastus2.services.ai.azure.com
```

---

## 📊 **COMANDO ÚTIL**

### **Ver todas las variables de entorno:**

```bash
az webapp config appsettings list \
  --name video-converter \
  --resource-group realculture-rg \
  --query "[].{name:name, value:value}" \
  --output table
```

---

### **Eliminar variable específica:**

```bash
az webapp config appsettings delete \
  --name video-converter \
  --resource-group realculture-rg \
  --setting-names VARIABLE_NAME
```

---

### **Reiniciar App Service después de cambios:**

```bash
az webapp restart \
  --name video-converter \
  --resource-group realculture-rg
```

---

## 🎯 **PRÓXIMOS PASOS**

1. ✅ Obtener `AZURE_STORAGE_CONNECTION_STRING` correcta
2. ✅ Ejecutar script de configuración
3. ✅ Reiniciar App Service
4. ✅ Testear endpoints
5. ✅ Verificar logs

---

**Documentación oficial:**
- [Azure App Service Configuration](https://docs.microsoft.com/azure/app-service/configure-common)
- [Azure Storage Connection Strings](https://docs.microsoft.com/azure/storage/common/storage-account-keys-manage)
