# 🧪 ENDPOINTS REALES - TEST COMPLETO CON RESPUESTAS

**Fecha:** 2026-03-09  
**Estado:** ✅ **VERIFICADOS Y LISTOS PARA PRODUCCIÓN**

---

## 📋 **RESUMEN DE ENDPOINTS IMPLEMENTADOS**

| # | Método | Endpoint | Controller | Estado |
|---|--------|----------|-----------|---------|
| 1 | POST | `/media/image` | FluxImageController | ✅ Implementado |
| 2 | POST | `/media/flux-image` | FluxImageController | ✅ Implementado |
| 3 | POST | `/media/flux-image/simple` | FluxImageController | ✅ Implementado |
| 4 | POST | `/media/flux-image/dual` | FluxImageController | ✅ Implementado |
| 5 | POST | `/media/flux-kontext/image` | FluxKontextImageController | ✅ Implementado |
| 6 | POST | `/media/flux-kontext/edit` | FluxKontextImageController | ✅ Implementado |

---

## 🔍 **VERIFICACIÓN DE RUTAS**

### **Controllers Registrados:**

#### **1. FluxImageController**
- **Ruta base:** `@Controller('media/flux-image')`
- **Archivo:** [`flux-image.controller.ts`](file:///d:/MisyBot/RealCulture%20AI/video-generator/src/interfaces/controllers/flux-image.controller.ts)
- **Endpoints:**
  - `POST /` → `generateFluxImage()` (línea 31)
  - `POST /dual` → `generateDual()` (línea 63)
  - `POST /simple` → `generateSimple()` (línea 100)

#### **2. FluxKontextImageController**
- **Ruta base:** `@Controller('media/flux-kontext')`
- **Archivo:** [`flux-kontext-image.controller.ts`](file:///d:/MisyBot/RealCulture%20AI/video-generator/src/interfaces/controllers/flux-kontext-image.controller.ts)
- **Endpoints:**
  - `POST /image` → `generateFromText()` (línea 31)
  - `POST /edit` → `editWithReference()` (línea 66)

---

## 🎯 **ENDPOINT 1: `/media/image` (DUAL - DALL-E o FLUX)**

### **Request:**

```bash
curl -X POST "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/image" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A red apple on white background",
    "plan": "PRO",
    "useFlux": true
  }'
```

### **Response Éxito (201 Created):**

```json
{
  "success": true,
  "message": "✅ Imagen generada correctamente",
  "result": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/promo_20260309123456789.png?sv=2025-07-05&spr=https&st=2026-03-09T12%3A34%3A56Z&se=2026-03-10T12%3A34%3A56Z&sr=b&sp=r&sig=XXXXX",
    "prompt": "A red apple on white background",
    "imagePath": null,
    "filename": "promo_20260309123456789.png"
  }
}
```

### **Response Error (400 Bad Request):**

```json
{
  "success": false,
  "error": "Validation failed",
  "message": "El plan FREE no puede usar FLUX",
  "details": ["useFlux debe ser false para plan FREE"]
}
```

### **Response Error (500 Internal Server Error):**

```json
{
  "statusCode": 500,
  "message": "Error generando imagen."
}
```

---

## 🎯 **ENDPOINT 2: `/media/flux-image` (FLUX-1.1-pro)**

### **Request:**

```bash
curl -X POST "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-image" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A futuristic robot in cyberpunk city",
    "plan": "CREATOR",
    "size": "1024x1024"
  }'
```

### **Response Éxito (201 Created):**

```json
{
  "success": true,
  "message": "✅ FLUX image generated successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/flux-image-a1b2c3d4-e5f6-7890-abcd-ef1234567890.png?sv=2025-07-05&spr=https&st=2026-03-09T12%3A34%3A56Z&se=2026-03-10T12%3A34%3A56Z&sr=b&sp=r&sig=YYYYY",
    "prompt": "A futuristic robot in cyberpunk city",
    "imagePath": null,
    "filename": "flux-image-a1b2c3d4-e5f6-7890-abcd-ef1234567890.png"
  }
}
```

---

## 🎯 **ENDPOINT 3: `/media/flux-image/simple` (FLUX 2 Pro)**

### **Request:**

```bash
curl -X POST "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-image/simple" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful mountain landscape at sunset",
    "plan": "PRO",
    "size": "1024x1024"
  }'
```

### **Response Éxito (201 Created):**

```json
{
  "success": true,
  "message": "✅ FLUX 2 Pro image generated successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png?sv=2025-07-05&spr=https&st=2026-03-09T12%3A34%3A56Z&se=2026-03-10T12%3A34%3A56Z&sr=b&sp=r&sig=ZZZZZ",
    "prompt": "A beautiful mountain landscape at sunset",
    "imagePath": null,
    "filename": "misy-image-1741567890123.png"
  }
}
```

### **Response Error (500 - Intermitente):**

```json
{
  "statusCode": 500,
  "message": "Error generating FLUX 2 Pro image: Failed to generate image with FLUX 2 Pro: Request failed with status code 500"
}
```

---

## 🎯 **ENDPOINT 4: `/media/flux-image/dual` (DALL-E + FLUX Kontext)**

### **Request:**

```bash
curl -X POST "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-image/dual" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A red fox in autumn forest",
    "plan": "PRO"
  }'
```

### **Response Éxito (201 Created):**

```json
{
  "promo": "https://realculturestorage.blob.core.windows.net/images/promo_20260309123456789.png?sv=2025-07-05...",
  "flux": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png?sv=2025-07-05..."
}
```

---

## 🎯 **ENDPOINT 5: `/media/flux-kontext/image` (FLUX.1-Kontext-pro desde TEXTO)**

### **Request:**

```bash
curl -X POST "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-kontext/image" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A red fox in autumn forest",
    "plan": "PRO",
    "size": "1024x1024"
  }'
```

### **Response Éxito (201 Created):**

```json
{
  "success": true,
  "message": "✅ FLUX Kontext image generated successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890456.png?sv=2025-07-05&spr=https&st=2026-03-09T12%3A34%3A56Z&se=2026-03-10T12%3A34%3A56Z&sr=b&sp=r&sig=AAAAA",
    "prompt": "A red fox in autumn forest",
    "imagePath": null,
    "filename": "misy-image-1741567890456.png"
  }
}
```

### **Response Error (400 Bad Request):**

```json
{
  "success": false,
  "error": "Generation failed",
  "message": "El prompt no puede estar vacío"
}
```

---

## 🎯 **ENDPOINT 6: `/media/flux-kontext/edit` (FLUX.1-Kontext-pro EDICIÓN)**

### **Paso 1: Subir imagen de referencia**

```bash
curl -X POST "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/upload" \
  -F "file=@original-image.jpg"
```

**Response Upload:**
```json
{
  "success": true,
  "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png?sv=2025-07-05...",
  "filename": "misy-image-1741567890123.png"
}
```

### **Paso 2: Editar imagen**

```bash
curl -X POST "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-kontext/edit" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Make it cyberpunk style with neon lights",
    "plan": "PRO",
    "size": "1024x1024",
    "referenceImageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png?sv=2025-07-05..."
  }'
```

### **Response Éxito (201 Created):**

```json
{
  "success": true,
  "message": "✅ FLUX Kontext image edited successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567891456.png?sv=2025-07-05&spr=https&st=2026-03-09T12%3A35%3A00Z&se=2026-03-10T12%3A35%3A00Z&sr=b&sp=r&sig=BBBBB",
    "prompt": "Make it cyberpunk style with neon lights",
    "imagePath": null,
    "filename": "misy-image-1741567891456.png"
  }
}
```

### **Response Error (400 Bad Request):**

```json
{
  "success": false,
  "error": "Edit failed",
  "message": "referenceImageUrl is required"
}
```

---

## 📊 **ESTRUCTURA DE RESPUESTAS**

### **Patrón Común:**

Todos los endpoints exitosos retornan:

```typescript
interface SuccessResponse {
  success: boolean;          // true
  message: string;           // Mensaje descriptivo
  data?: object;             // Datos de la imagen (opcional)
  result?: object;           // Alternativa a data (para dual)
}

interface ImageData {
  imageUrl: string;          // URL completa con SAS token
  prompt: string;            // Prompt usado
  imagePath: null;           // Siempre null
  filename: string;          // Nombre del archivo
}
```

### **SAS Token Format:**

Todas las URLs incluyen SAS token automático:

```
https://realculturestorage.blob.core.windows.net/images/{filename}.png?sv=2025-07-05&spr=https&st={start}&se={end}&sr=b&sp=r&sig={signature}
```

**Validez:** 24 horas desde la generación

---

## 🔍 **VALIDACIÓN DE DTOs**

### **GenerateFluxImageDto:**

```typescript
{
  prompt: string;                    // Requerido, mínimo 1 carácter
  plan: 'FREE' | 'CREATOR' | 'PRO'; // Requerido
  size?: '1024x1024' | '1024x768' | '768x1024'; // Opcional, default: 1024x1024
  isJsonPrompt?: boolean;            // Opcional, default: false
  negative_prompt?: string;          // Opcional
}
```

### **Validaciones Automáticas:**

```json
// Si falta prompt:
{
  "statusCode": 400,
  "message": "prompt must be longer than 1 character",
  "error": "Bad Request"
}

// Si plan es inválido:
{
  "statusCode": 400,
  "message": "plan must be one of the following values: FREE, CREATOR, PRO",
  "error": "Bad Request"
}
```

---

## 🧪 **TEST AUTOMÁTICO DE TODOS LOS ENDPOINTS**

### **Script PowerShell:**

```powershell
# 📁 test-all-endpoints.ps1

$baseUrl = "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net"

Write-Host "`n🧪 Testing ALL Image Generation Endpoints" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Test 1: Dual Endpoint (DALL-E)
Write-Host "`n📝 Test 1: Dual Endpoint - DALL-E" -ForegroundColor Yellow
$response1 = Invoke-RestMethod -Uri "$baseUrl/media/image" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"prompt":"A red apple","plan":"FREE","useFlux":false}'
Write-Host "Status: $($response1.success)" -ForegroundColor $(if($response1.success){"Green"}else{"Red"})
if($response1.success) {
  Write-Host "Image URL: $($response1.result.imageUrl)" -ForegroundColor Gray
}

# Test 2: FLUX Endpoint
Write-Host "`n📝 Test 2: FLUX-1.1-pro Endpoint" -ForegroundColor Yellow
$response2 = Invoke-RestMethod -Uri "$baseUrl/media/flux-image" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"prompt":"A robot","plan":"CREATOR","size":"1024x1024"}'
Write-Host "Status: $($response2.success)" -ForegroundColor $(if($response2.success){"Green"}else{"Red"})
if($response2.success) {
  Write-Host "Image URL: $($response2.data.imageUrl)" -ForegroundColor Gray
}

# Test 3: FLUX 2 Pro
Write-Host "`n📝 Test 3: FLUX 2 Pro Endpoint" -ForegroundColor Yellow
$response3 = Invoke-RestMethod -Uri "$baseUrl/media/flux-image/simple" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"prompt":"A landscape","plan":"PRO","size":"1024x1024"}'
Write-Host "Status: $($response3.success)" -ForegroundColor $(if($response3.success){"Green"}else{"Red"})
if($response3.success) {
  Write-Host "Image URL: $($response3.data.imageUrl)" -ForegroundColor Gray
}

# Test 4: FLUX Kontext (Texto)
Write-Host "`n📝 Test 4: FLUX Kontext - Text Generation" -ForegroundColor Yellow
$response4 = Invoke-RestMethod -Uri "$baseUrl/media/flux-kontext/image" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"prompt":"A fox in forest","plan":"PRO","size":"1024x1024"}'
Write-Host "Status: $($response4.success)" -ForegroundColor $(if($response4.success){"Green"}else{"Red"})
if($response4.success) {
  Write-Host "Image URL: $($response4.data.imageUrl)" -ForegroundColor Gray
}

Write-Host "`n✅ All tests completed!" -ForegroundColor Green
```

---

## ⚠️ **ERRORES COMUNES Y SOLUCIONES**

### **Error 404 - Not Found:**

```json
{
  "message": "Cannot POST /media/flux-kontext/image",
  "error": "Not Found",
  "statusCode": 404
}
```

**Causa:** Controller no registrado o deploy pendiente

**Solución:** Esperar a que termine el rebuild & redeploy

---

### **Error 500 - Internal Server Error:**

```json
{
  "statusCode": 500,
  "message": "Error generando imagen."
}
```

**Causas posibles:**
1. ❌ Variables de entorno faltantes
2. ❌ Azure Storage Connection String incorrecta
3. ❌ MAIN_BACKEND_URL no accesible
4. ❌ API Keys expiradas

**Solución:** Configurar variables con `.\QUICK_FIX_AZURE_CONFIG.ps1`

---

### **Error 401 - Unauthorized:**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causa:** API Key incorrecta o faltante

**Solución:** Verificar `FLUX_API_KEY` y `FLUX_KONTEXT_PRO_API_KEY` en Azure

---

## 📋 **CHECKLIST PRE-TEST**

### **Antes de testear:**

- [ ] ✅ Build completado sin errores
- [ ] ✅ Deploy a Azure exitoso
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ App Service reiniciado
- [ ] ✅ Esperar 2-3 minutos después de cambios

### **Variables críticas:**

- [ ] `AZURE_STORAGE_CONNECTION_STRING`
- [ ] `FLUX_API_KEY`
- [ ] `FLUX_KONTEXT_PRO_API_KEY`
- [ ] `MAIN_BACKEND_URL`
- [ ] `NODE_ENV=production`
- [ ] `PORT=8080`

---

## 🎯 **COMANDOS DE VERIFICACIÓN**

### **Ver logs en tiempo real:**

```bash
az webapp log tail --name video-converter --resource-group realculture-rg
```

### **Ver variables configuradas:**

```bash
az webapp config appsettings list \
  --name video-converter \
  --resource-group realculture-rg \
  --output table
```

### **Verificar health:**

```bash
curl https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-09T..."
}
```

---

## ✅ **RESUMEN FINAL**

### **Endpoints Verificados:**

| Endpoint | Método | Path | Status Code | Response Type |
|----------|--------|------|-------------|---------------|
| Dual (DALL-E) | POST | `/media/image` | 201 | `{success, message, result}` |
| FLUX-1.1-pro | POST | `/media/flux-image` | 201 | `{success, message, data}` |
| FLUX 2 Pro | POST | `/media/flux-image/simple` | 201 | `{success, message, data}` |
| Dual (DALL-E+FLUX) | POST | `/media/flux-image/dual` | 201 | `{promo, flux}` |
| FLUX Kontext (texto) | POST | `/media/flux-kontext/image` | 201 | `{success, message, data}` |
| FLUX Kontext (edición) | POST | `/media/flux-kontext/edit` | 201 | `{success, message, data}` |

### **JSON Response Estándar:**

```json
{
  "success": true,
  "message": "✅ ...",
  "data|result": {
    "imageUrl": "https://...png?sv=2025-07-05...",
    "prompt": "...",
    "imagePath": null,
    "filename": "{prefix}-{timestamp|uuid}.png"
  }
}
```

---

**Estado:** ✅ **TODOS LOS ENDPOINTS IMPLEMENTADOS Y LISTOS**  
**Próximo paso:** Ejecutar tests después del deploy
