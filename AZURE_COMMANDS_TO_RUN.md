# 🚀 COMANDOS AZ PARA ACTUALIZAR VARIABLES DE ENTORNO

## 📋 **EJECUTAR EN ORDEN**

### **Paso 1: Login en Azure**

```powershell
az login
```

---

### **Paso 2: Obtener Azure Storage Connection String**

```powershell
$connectionString = az storage account show-connection-string `
  --name realculturestorage `
  --resource-group realculture-rg `
  --query connectionString `
  --output tsv

Write-Host "Connection String obtenido: $connectionString"
```

---

### **Paso 3: Actualizar TODAS las Variables de Entorno**

```powershell
# Copiar y pegar TODO el bloque siguiente:

$resourceGroup = "realculture-rg"
$appName = "video-converter"

az webapp config appsettings set `
  --resource-group $resourceGroup `
  --name $appName `
  --settings `
    AZURE_STORAGE_CONNECTION_STRING="$connectionString" `
    AZURE_STORAGE_CONTAINER_NAME="images" `
    AZURE_STORAGE_ACCOUNT_NAME="realculturestorage" `
    `
    FLUX_KONTEXT_PRO_BASE_URL="https://labsc-m9j5kbl9-eastus2.services.ai.azure.com" `
    FLUX_KONTEXT_PRO_DEPLOYMENT="FLUX.1-Kontext-pro" `
    FLUX_KONTEXT_PRO_API_VERSION="2025-04-01-preview" `
    FLUX_KONTEXT_PRO_API_KEY="7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS" `
    `
    AZURE_OPENAI_IMAGE_ENDPOINT="https://api.openai.com/v1" `
    AZURE_OPENAI_IMAGE_API_KEY="sk-YOUR-OPENAI-API-KEY-HERE" `
    `
    MAIN_BACKEND_URL="http://localhost:3000" `
    NODE_ENV="production" `
    PORT="8080"
```

**⚠️ IMPORTANTE:** Reemplazar `sk-YOUR-OPENAI-API-KEY-HERE` con tu API key real de OpenAI para que el fallback funcione.

---

### **Paso 4: Reiniciar App Service**

```powershell
az webapp restart `
  --name video-converter `
  --resource-group realculture-rg
```

---

### **Paso 5: Verificar Variables Configuradas**

```powershell
az webapp config appsettings list `
  --name video-converter `
  --resource-group realculture-rg `
  --query "[].{name:name, value:value}" `
  --output table
```

---

### **Paso 6: Testear Endpoints**

```bash
# Health check
curl https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/health

# Test DALL-E
curl -X POST "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/image" `
  -H "Content-Type: application/json" `
  -d '{"prompt":"A red apple on white background","plan":"FREE"}'

# Test FLUX Kontext (con fallback automático a DALL-E si falla)
curl -X POST "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-kontext/image" `
  -H "Content-Type: application/json" `
  -d '{"prompt":"A photograph of a red fox in autumn forest","plan":"PRO","size":"1024x1024"}'
```

---

## 🎯 **SCRIPT AUTOMÁTICO (RECOMENDADO)**

Si tienes Azure CLI instalado, ejecuta:

```powershell
.\get-storage-and-update-vars.ps1
```

Este script automáticamente:
1. ✅ Obtiene el connection string de Azure Storage
2. ✅ Configura TODAS las variables de entorno
3. ✅ Reinicia el App Service
4. ✅ Muestra resumen de la configuración

---

## ⚠️ **VARIABLES CRÍTICAS PARA EL FALLBACK**

Para que el fallback de FLUX → DALL-E funcione correctamente, es **OBLIGATORIO** configurar:

```env
AZURE_OPENAI_IMAGE_API_KEY=sk-...  # Tu API key de OpenAI
AZURE_OPENAI_IMAGE_ENDPOINT=https://api.openai.com/v1
```

**Sin estas variables**, cuando FLUX falle (404), el sistema lanzará error:
```
Error: DALL-E API key not configured for fallback
```

---

## 📊 **RESUMEN DE VARIABLES**

| Variable | Valor | Estado |
|----------|-------|--------|
| AZURE_STORAGE_CONNECTION_STRING | [Auto-obtenido] | ✅ Requerido |
| AZURE_STORAGE_CONTAINER_NAME | images | ✅ Configurado |
| FLUX_KONTEXT_PRO_BASE_URL | https://labsc-m9j5kbl9-eastus2.services.ai.azure.com | ✅ Configurado |
| FLUX_KONTEXT_PRO_DEPLOYMENT | FLUX.1-Kontext-pro | ✅ Configurado |
| FLUX_KONTEXT_PRO_API_VERSION | 2025-04-01-preview | ✅ Configurado |
| FLUX_KONTEXT_PRO_API_KEY | 7PAsgxvIw4v494OveKjy... | ✅ Configurado |
| AZURE_OPENAI_IMAGE_API_KEY | **[COMPLETAR]** | ⚠️ Requiere acción |
| AZURE_OPENAI_IMAGE_ENDPOINT | https://api.openai.com/v1 | ✅ Configurado |
| MAIN_BACKEND_URL | http://localhost:3000 | ✅ Configurado |
| NODE_ENV | production | ✅ Configurado |
| PORT | 8080 | ✅ Configurado |

---

**Próximo paso:** Ejecutar los comandos en orden o usar el script automático `.get-storage-and-update-vars.ps1`
