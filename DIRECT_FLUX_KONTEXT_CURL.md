# 🧪 CURL DIRECTO - FLUX KONTEXT TEST

## 🔍 **PROBLEMA DETECTADO:**

Error 404 del Foundry indica que el **deployment no existe** o la URL está incorrecta.

---

## 🎯 **CURL ALTERNATIVO 1: Azure Cognitive Services**

```bash
curl -X POST "https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview" \
  -H "Content-Type: application/json" \
  -H "Api-Key: 7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS" \
  -d '{
    "model": "FLUX.1-Kontext-pro",
    "prompt": "A photograph of a red fox in autumn forest, photorealistic style",
    "n": 1,
    "size": "1024x1024",
    "response_format": "b64_json"
  }'
```

---

## 🎯 **CURL ALTERNATIVO 2: Services.ai (Corregido)**

```bash
curl -X POST "https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/models/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview" \
  -H "Content-Type: application/json" \
  -H "Api-Key: 7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS" \
  -d '{
    "prompt": "A photograph of a red fox in autumn forest, photorealistic style",
    "n": 1,
    "size": "1024x1024",
    "response_format": "b64_json"
  }'
```

**NOTA:** Sin `/deployments/{deployment}` en el path

---

## 🎯 **CURL ALTERNATIVO 3: Simplificado**

```bash
curl -X POST "https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openshift/images/generations?api-version=2025-04-01-preview" \
  -H "Content-Type: application/json" \
  -H "Api-Key: 7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS" \
  -d '{
    "prompt": "A red fox in autumn forest",
    "size": "1024x1024"
  }'
```

---

## 🛠️ **ENDPOINT DE UPLOAD DE IMAGEN**

Crear endpoint para subir imagen de referencia:

### **POST /upload**

```bash
curl -X POST "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/upload" \
  -F "file=@C:\path\to\image.png"
```

**Response Esperada:**
```json
{
  "success": true,
  "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-{timestamp}.png?sv=2025-07-05...",
  "filename": "misy-image-{timestamp}.png"
}
```

---

## ⚠️ **DIAGNÓSTICO DEL PROBLEMA**

### **Posibles Causas del 404:**

1. ❌ **Deployment no existe** en Azure Foundry
2. ❌ **URL incorrecta** del servicio
3. ❌ **API Key expirada** o inválida
4. ❌ **Resource no encontrado** en esa región

### **Verificar en Azure Portal:**

1. Ir a [Azure AI Foundry](https://ai.azure.com/)
2. Buscar el proyecto: `labsc`
3. Verificar deployments activos
4. Confirmar nombre exacto: `FLUX.1-Kontext-pro`

---

## 🔧 **SOLUCIÓN RÁPIDA**

Si el deployment no existe, usar **DALL-E 3** como fallback:

```bash
# DALL-E 3 (YA FUNCIONANDO)
curl -X POST "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/image" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A red fox in autumn forest","plan":"PRO"}'
```

---

## 📋 **COMANDOS PARA VERIFICAR**

### **1. Test directo con PowerShell:**

```powershell
$headers = @{
  "Content-Type" = "application/json"
  "Api-Key" = "7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"
}

$body = @{
  "prompt" = "A red fox in autumn forest"
  "n" = 1
  "size" = "1024x1024"
  "response_format" = "b64_json"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/models/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview" -Method Post -Headers $headers -Body $body
```

### **2. Ver logs de error:**

```bash
az webapp log tail --name video-converter --resource-group realculture-rg
```

---

## ✅ **ESTADO ACTUAL**

| Endpoint | Estado | Notas |
|----------|--------|-------|
| `/media/image` (DALL-E) | ✅ Funcional | Respondiendo correctamente |
| `/media/flux-kontext/image` | ❌ Error 404 | Deployment no encontrado en Azure |
| `/upload` | ⚠️ Pendiente | Por implementar |

---

## 🎯 **PRÓXIMOS PASOS**

1. ✅ DALL-E 3 funcionando correctamente
2. ❌ FLUX Kontext requiere verificar deployment en Azure
3. ⚠️ Upload endpoint pendiente de implementación

**Recomendación:** Usar DALL-E 3 mientras se verifica el deployment de FLUX en Azure Portal
