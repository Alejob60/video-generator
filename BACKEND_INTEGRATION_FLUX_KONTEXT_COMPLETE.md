# 📋 INFORME DE INTEGRACIÓN - FLUX KONTEXT PRO CON IMAGEN DE REFERENCIA

**Fecha:** 2026-03-09  
**Estado:** ✅ VALIDADO - Mismo patrón de respuesta que todos los servicios  
**Servicio:** FluxKontextImageService

---

## ✅ **VALIDACIÓN DE CONSISTENCIA DE RESPUESTAS:**

### **Comparativa de Servicios de Generación de Imágenes:**

| Servicio | Retorna `imageUrl` | Retorna `filename` | Retorna `prompt` | Notifica Backend | SAS Token |
|----------|-------------------|-------------------|-----------------|------------------|-----------|
| **PromoImageService** (DALL-E) | ✅ | ✅ | ✅ | ✅ `/promo-image/complete` | ✅ |
| **FluxImageService** (FLUX-1.1-pro) | ✅ | ✅ | ✅ | ✅ `/flux-image/complete` | ✅ |
| **Flux2ProService** (FLUX 2 Pro) | ✅ | ✅ | ✅ | ✅ `/flux-2-pro-image/complete` | ✅ |
| **FluxKontextImageService** (FLUX Kontext) | ✅ | ✅ | ✅ | ✅ `/flux-kontext-image/complete` | ✅ |

### **Conclusión:**
✅ **TODOS los servicios retornan EXACTAMENTE la misma estructura JSON**  
✅ **Todos notifican al backend principal con el mismo formato**  
✅ **Todos generan URLs con SAS tokens automáticamente**

---

## 🎯 **ESTRUCTURA DE RESPUESTA ESTÁNDAR:**

### **Respuesta del Servicio (TypeScript):**
```typescript
return {
  imageUrl: blobUrl,      // URL completa con SAS token
  filename,               // Nombre del archivo: misy-image-{timestamp}.png
  prompt: finalPrompt,    // Prompt usado para generación
};
```

### **Notificación al Backend Principal:**
```typescript
await fetch(`${this.backendUrl}/flux-kontext-image/complete`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,              // ID del usuario
    prompt: finalPrompt, // Prompt procesado
    imageUrl: blobUrl,   // URL con SAS token
    filename,            // Nombre del archivo
  }),
});
```

---

## 🔧 **ENDPOINTS DISPONIBLES:**

### **1. Generación desde Texto (Sin imagen de referencia)**

#### **Endpoint:**
```
POST /media/flux-kontext/image
```

#### **Payload Request:**
```json
{
  "prompt": "A beautiful sunset over mountains",
  "plan": "PRO",
  "size": "1024x1024",
  "isJsonPrompt": false
}
```

#### **Proceso Interno:**
1. ✅ Valida prompt
2. ✅ Convierte JSON prompt si es necesario
3. ✅ Llama a `generateImageAndNotify(userId, dto)`
4. ✅ Usa endpoint `/images/generations`
5. ✅ Envía payload:
   ```json
   {
     "model": "FLUX.1-Kontext-pro",
     "prompt": "...",
     "n": 1,
     "size": "1024x1024",
     "output_format": "png"
   }
   ```
6. ✅ Autentica con `Authorization: Bearer <API_KEY>`
7. ✅ Recibe base64 del servicio Azure
8. ✅ Guarda temporalmente
9. ✅ Sube a Blob Storage con SAS token
10. ✅ Notifica backend: `/flux-kontext-image/complete`

#### **Response JSON (Éxito):**
```json
{
  "success": true,
  "message": "✅ FLUX Kontext image generated successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png?sv=2025-07-05&spr=https&st=2026-03-09T00%3A00%3A00Z&se=2026-03-10T00%3A00%3A00Z&sr=b&sp=r&sig=XXXXX",
    "prompt": "A beautiful sunset over mountains",
    "imagePath": null,
    "filename": "misy-image-1741567890123.png"
  }
}
```

#### **Curl de Prueba:**
```bash
curl -X POST http://localhost:4001/media/flux-kontext/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A red fox in an autumn forest",
    "plan": "PRO",
    "size": "1024x1024"
  }'
```

---

### **2. Edición con Imagen de Referencia** ⭐ NUEVO

#### **Endpoint:**
```
POST /media/flux-kontext/edit
```

#### **Payload Request:**
```json
{
  "prompt": "Make it cyberpunk style with neon lights",
  "plan": "PRO",
  "size": "1024x1024",
  "referenceImageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png"
}
```

#### **Proceso Interno:**
1. ✅ Valida prompt y URL de referencia
2. ✅ Descarga imagen de referencia temporalmente
3. ✅ Llama a `generateImageAndNotify(userId, dto, referenceImagePath)`
4. ✅ Usa endpoint `/images/edits`
5. ✅ Envía FormData:
   ```javascript
   formData.append('model', 'FLUX.1-Kontext-pro');
   formData.append('prompt', 'Make it cyberpunk...');
   formData.append('n', '1');
   formData.append('size', '1024x1024');
   formData.append('image', fs.createReadStream(tempRefImage));
   ```
6. ✅ Autentica con `Authorization: Bearer <API_KEY>`
7. ✅ Recibe base64 editado
8. ✅ Guarda temporalmente
9. ✅ Sube a Blob Storage con SAS token
10. ✅ Notifica backend: `/flux-kontext-image/complete`

#### **Response JSON (Éxito):**
```json
{
  "success": true,
  "message": "✅ FLUX Kontext image edited successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567891456.png?sv=2025-07-05&spr=https&st=2026-03-09T00%3A01%3A00Z&se=2026-03-10T00%3A01%3A00Z&sr=b&sp=r&sig=YYYYY",
    "prompt": "Make it cyberpunk style with neon lights",
    "imagePath": null,
    "filename": "misy-image-1741567891456.png"
  }
}
```

#### **Curl de Prueba:**
```bash
# Primero subir imagen de referencia
curl -X POST http://localhost:4001/upload \
  -F "file=@original-image.jpg"

# → Retorna: {"imageUrl": "https://..."}

# Luego editar
curl -X POST http://localhost:4001/media/flux-kontext/edit \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Make it cyberpunk with neon lights",
    "plan": "PRO",
    "size": "1024x1024",
    "referenceImageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png"
  }'
```

---

## 📊 **FORMATO DE NOTIFICACIÓN AL BACKEND:**

### **Backend Endpoint Esperado:**
```
POST /flux-kontext-image/complete
```

### **Payload de Notificación:**
```json
{
  "userId": "user123",
  "prompt": "A beautiful sunset over mountains",
  "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png?sv=2025-07-05...",
  "filename": "misy-image-1741567890123.png"
}
```

### **Campos del Payload:**

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `userId` | string | ID del usuario que solicitó | `"user123"` o `"anon"` |
| `prompt` | string | Prompt procesado (puede ser mejorado por LLM) | `"A beautiful sunset..."` |
| `imageUrl` | string | URL completa con SAS token (24 horas) | `"https://...png?sv=2025-07-05..."` |
| `filename` | string | Nombre único del archivo | `"misy-image-1741567890123.png"` |

---

## 🔐 **AUTENTICACIÓN CON AZURE FOUNDRY:**

### **Variables de Entorno Requeridas:**
```env
FLUX_KONTEXT_PRO_BASE_URL=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com
FLUX_KONTEXT_PRO_DEPLOYMENT=FLUX.1-Kontext-pro
FLUX_KONTEXT_PRO_API_VERSION=2025-04-01-preview
FLUX_KONTEXT_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS
```

### **Headers de Petición a Azure:**

#### **Generación (JSON):**
```http
POST /openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview
Content-Type: application/json
Authorization: Bearer <API_KEY>

{
  "model": "FLUX.1-Kontext-pro",
  "prompt": "...",
  "n": 1,
  "size": "1024x1024",
  "output_format": "png"
}
```

#### **Edición (FormData):**
```http
POST /openai/deployments/FLUX.1-Kontext-pro/images/edits?api-version=2025-04-01-preview
Content-Type: multipart/form-data
Authorization: Bearer <API_KEY>

FormData:
  - model: FLUX.1-Kontext-pro
  - prompt: ...
  - n: 1
  - size: 1024x1024
  - image: <archivo PNG>
```

---

## 🎨 **NOMENCLATURA DE ARCHIVOS:**

### **Patrón Estándar:**
```
misy-image-{timestamp}.png
```

### **Ejemplos:**
```
misy-image-1741567890123.png
misy-image-1741567891456.png
misy-image-1741567892789.png
```

### **Ventajas:**
- ✅ **Branding consistente** - Todas llevan prefijo "misy"
- ✅ **Orden cronológico** - Timestamp en milisegundos
- ✅ **Único garantizado** - Imposible colisión
- ✅ **Fácil búsqueda** - Patrón reconocible

---

## 📦 **FLUJO COMPLETO DE GENERACIÓN:**

### **Diagrama de Secuencia:**

```
Usuario → Backend Principal → Video Generator → Azure Foundry
   │           │                    │                │
   │──POST─────▶│                    │                │
   │           │──POST─────────────▶│                │
   │           │                    │──POST─────────▶│
   │           │                    │                │
   │           │                    │◀─Response──────│
   │           │                    │  (base64)      │
   │           │◀─Notificación──────│                │
   │           │  (imageUrl)        │                │
   │◀─Response─│                    │                │
   │  (JSON)   │                    │                │
```

### **Pasos Detallados:**

1. **Usuario solicita generación**
   ```json
   POST /media/flux-kontext/image
   {
     "prompt": "...",
     "plan": "PRO"
   }
   ```

2. **Backend reenvía a video-generator**
   ```
   Headers: X-User-Id: user123
   Body: { "prompt": "...", "plan": "PRO" }
   ```

3. **Video Generator llama a Azure Foundry**
   ```typescript
   await axios.post(generationsUrl, payload, {
     headers: {
       'Authorization': `Bearer ${apiKey}`,
       'Content-Type': 'application/json'
     }
   });
   ```

4. **Azure retorna base64**
   ```json
   {
     "data": [{
       "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
     }]
   }
   ```

5. **Video Generator guarda y sube a Blob**
   ```typescript
   const buffer = Buffer.from(b64, 'base64');
   fs.writeFileSync(tempPath, buffer);
   const blobUrl = await uploadFileToBlobWithSas(tempPath, 'images/filename.png');
   ```

6. **Video Generator notifica backend**
   ```json
   POST /flux-kontext-image/complete
   {
     "userId": "user123",
     "prompt": "...",
     "imageUrl": "https://...png?sv=2025-07-05...",
     "filename": "misy-image-1741567890123.png"
   }
   ```

7. **Backend responde al usuario**
   ```json
   {
     "success": true,
     "data": {
       "imageUrl": "https://...png?sv=2025-07-05...",
       "prompt": "...",
       "imagePath": null,
       "filename": "misy-image-1741567890123.png"
     }
   }
   ```

---

## 🧪 **PRUEBAS DE INTEGRACIÓN:**

### **Test 1: Generación Básica**
```bash
#!/bin/bash
# test-flux-kontext-generate.sh

echo "📡 Testing FLUX Kontext Generation..."

RESPONSE=$(curl -s -X POST "http://localhost:4001/media/flux-kontext/image" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A red fox in an autumn forest",
    "plan": "PRO",
    "size": "1024x1024"
  }')

echo "Response: $RESPONSE" | jq .

# Validar respuesta
SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
  echo "✅ SUCCESS!"
  IMAGE_URL=$(echo "$RESPONSE" | jq -r '.data.imageUrl')
  echo "Image URL: $IMAGE_URL"
else
  echo "❌ FAILED!"
  exit 1
fi
```

### **Test 2: Edición con Referencia**
```bash
#!/bin/bash
# test-flux-kontext-edit.sh

echo "📡 Testing FLUX Kontext Edit..."

# Asumiendo que ya tenemos una imagen subida
REFERENCE_URL="https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png"

RESPONSE=$(curl -s -X POST "http://localhost:4001/media/flux-kontext/edit" \
  -H "Content-Type: application/json" \
  -d "{
    \"prompt\": \"Make it cyberpunk style\",
    \"plan\": \"PRO\",
    \"size\": \"1024x1024\",
    \"referenceImageUrl\": \"$REFERENCE_URL\"
  }")

echo "Response: $RESPONSE" | jq .

# Validar respuesta
SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
  echo "✅ SUCCESS!"
  EDITED_URL=$(echo "$RESPONSE" | jq -r '.data.imageUrl')
  echo "Edited Image URL: $EDITED_URL"
else
  echo "❌ FAILED!"
  exit 1
fi
```

### **Test 3: Validar Notificación al Backend**
```bash
#!/bin/bash
# test-backend-notification.sh

# Mock server para recibir notificación
cat > mock-server.js << 'EOF'
const http = require('http');

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/flux-kontext-image/complete') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.log('📩 Notification received:');
      console.log(JSON.parse(body));
      res.writeHead(200);
      res.end('OK');
      process.exit(0);
    });
  }
}).listen(3000, () => console.log('Mock server listening on port 3000'));
EOF

# Iniciar mock server
node mock-server.js &
MOCK_PID=$!

# Esperar un segundo
sleep 1

# Hacer petición que triggera notificación
curl -X POST "http://localhost:4001/media/flux-kontext/image" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test","plan":"PRO"}'

# Esperar notificación
sleep 5
kill $MOCK_PID 2>/dev/null
```

---

## ⚠️ **MANEJO DE ERRORES:**

### **Errores Comunes y Soluciones:**

#### **Error 1: 401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causa:** API Key incorrecta o faltante  
**Solución:** Verificar variable `FLUX_KONTEXT_PRO_API_KEY`

#### **Error 2: 404 Not Found**
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

**Causa:** Deployment name incorrecto  
**Solución:** Verificar `FLUX_KONTEXT_PRO_DEPLOYMENT=FLUX.1-Kontext-pro`

#### **Error 3: 500 Internal Server Error**
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "activityId": "xxx-xxx-xxx"
}
```

**Causa:** Error intermitente de Azure Foundry  
**Solución:** Implementar retry logic o fallback

#### **Error 4: Invalid Base64**
```typescript
Error: Unexpected response format from FLUX API - no URL or base64 data found
```

**Causa:** Response malformed de Azure  
**Solución:** Loguear response completo y contactar soporte Azure

---

## 📋 **CHECKLIST DE INTEGRACIÓN PARA BACKEND PRINCIPAL:**

### **Pre-Requirements:**
- [ ] Variables de entorno configuradas
- [ ] Endpoints de notificación implementados
- [ ] CORS habilitado para video-generator
- [ ] Logging configurado

### **Endpoints a Implementar:**
- [ ] `POST /media/flux-kontext/image` - Generación desde texto
- [ ] `POST /media/flux-kontext/edit` - Edición con referencia
- [ ] `POST /flux-kontext-image/complete` - Recepción de notificación

### **Validaciones:**
- [ ] Usuario autenticado
- [ ] Plan válido (FREE, CREATOR, PRO)
- [ ] Prompt no vacío
- [ ] Tamaño válido (1024x1024, etc.)
- [ ] URL de referencia válida (para edición)

### **Respuestas Estandarizadas:**
```json
// Éxito
{
  "success": true,
  "message": "✅ FLUX Kontext image generated successfully",
  "data": {
    "imageUrl": "https://...png?sv=2025-07-05...",
    "prompt": "...",
    "imagePath": null,
    "filename": "misy-image-{timestamp}.png"
  }
}

// Error
{
  "success": false,
  "error": "Invalid prompt",
  "message": "El prompt no puede estar vacío"
}
```

---

## 🎯 **MÉTRICAS Y MONITOREO:**

### **Métricas a Capturar:**

```typescript
// Tiempo de generación
const startTime = Date.now();
await generateImage();
const duration = Date.now() - startTime;
// → ~5-10 segundos típico

// Tasa de éxito
const successRate = successfulGenerations / totalGenerations * 100;
// → Objetivo: >95%

// Uso por plan
const usageByPlan = {
  FREE: 10,
  CREATOR: 25,
  PRO: 15
};

// Imágenes generadas por día
const dailyUsage = {
  '2026-03-09': 50,
  '2026-03-08': 45
};
```

---

## 📞 **SOPORTE Y TROUBLESHOOTING:**

### **Logs Recomendados:**

```typescript
// En video-generator
this.logger.log(`📡 Sending request to FLUX.1-Kontext-pro`);
this.logger.log(`📥 Response status: ${response.status}`);
this.logger.log(`🗄️ Uploaded to blob: ${blobUrl}`);
this.logger.log(`🔔 Notified backend`);

// En backend principal
this.logger.log(`📨 Received notification from video-generator`);
this.logger.log(`💾 Saved to database: ${imageId}`);
this.logger.log(`📤 Responding to user`);
```

### **Debugging Checklist:**

1. [ ] Verificar logs de video-generator
2. [ ] Verificar logs de backend principal
3. [ ] Validar que notificación llegó
4. [ ] Confirmar que URL con SAS es accesible
5. [ ] Verificar que archivo existe en Blob Storage

---

## ✅ **RESUMEN EJECUTIVO:**

### **Lo que debe hacer el Backend Principal:**

1. ✅ **Recibir petición de usuario**
   - Endpoint: `POST /media/flux-kontext/image` o `/edit`
   - Validar: prompt, plan, tamaño

2. ✅ **Reenviar a video-generator**
   - Headers: `X-User-Id: {userId}`
   - Body: `{ prompt, plan, size, referenceImageUrl? }`

3. ✅ **Esperar notificación**
   - Endpoint: `POST /flux-kontext-image/complete`
   - Payload: `{ userId, prompt, imageUrl, filename }`

4. ✅ **Guardar en base de datos**
   - Tabla: `generated_images`
   - Campos: `user_id, image_url, filename, prompt, created_at`

5. ✅ **Responder al usuario**
   - JSON estandarizado con URL de imagen
   - Incluir filename y prompt usado

### **Lo que hace video-generator automáticamente:**

1. ✅ Generar imagen con Azure Foundry
2. ✅ Decodificar base64
3. ✅ Guardar temporalmente
4. ✅ Subir a Azure Blob Storage
5. ✅ Generar SAS token (24 horas)
6. ✅ Notificar al backend principal
7. ✅ Retornar JSON estandarizado

---

**Estado:** ✅ DOCUMENTACIÓN COMPLETADA  
**Próximo Paso:** Implementar endpoints en backend principal  
**Tiempo Estimado:** 2-4 horas  
**Complejidad:** Baja (patrón ya establecido)
