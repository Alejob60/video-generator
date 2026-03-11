# 📚 MASTER - ENDPOINTS DE GENERACIÓN DE IMÁGENES

**Fecha:** 2026-03-09  
**Versión:** 2.0.0  
**Estado:** ✅ PRODUCCIÓN  

---

## 🎯 **RESUMEN GENERAL**

### **Endpoints Disponibles:**

| # | Endpoint | Tipo | Autenticación | SAS Token | Tiempo Promedio |
|---|----------|------|---------------|-----------|-----------------|
| 1 | `/media/image` | DALL-E + FLUX dual | API Key | ✅ | ~15s |
| 2 | `/media/flux-image/simple` | FLUX 2 Pro | API Key | ✅ | ~5-10s* |
| 3 | `/media/flux-kontext/image` | FLUX Kontext (texto) | API Key | ✅ | ~5-10s |
| 4 | `/media/flux-kontext/edit` | FLUX Kontext (edición) | API Key | ✅ | ~5-10s |

*\* FLUX 2 Pro puede tener errores intermitentes 500*

---

## 🔧 **CONFIGURACIÓN GLOBAL**

### **Variables de Entorno Requeridas (.env):**

```env
# === Backend Principal ===
MAIN_BACKEND_URL=http://localhost:3000

# === Azure Blob Storage ===
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=realculturestorage;...
AZURE_STORAGE_CONTAINER_NAME=images
```

---

## **Descripción**

Endpoint inteligente que decide automáticamente si usar DALL-E o FLUX basado en el plan del usuario.

### **Comportamiento:**

```typescript
if (dto.useFlux === true) {
  // Usar FLUX-1.1-pro
  → FLUX endpoint
} else {
  // Usar DALL-E
  → OpenAI endpoint
}
```

### **Reglas por Plan:**

| Plan | useFlux: false (DALL-E) | useFlux: true (FLUX) |
|------|------------------------|---------------------|
| **FREE** | ✅ Permitido | ❌ No disponible |
| **CREATOR** | ✅ Permitido | ✅ Permitido |
| **PRO** | ✅ Permitido | ✅ Permitido |

---

## **IMPLEMENTACIÓN CON CURL**

### **Paso 1: Generar imagen DALL-E**

```bash
curl -X POST "http://localhost:4001/media/image" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user123" \
  -d '{
    "prompt": "A red apple on white background",
    "plan": "FREE",
    "useFlux": false
  }'
```

### **Respuesta Exitosa:**

```json
{
  "success": true,
  "message": "✅ Imagen generada correctamente",
  "result": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/promo_20260308235850319.png?sv=2025-07-05&spr=https&st=2026-03-08T23%3A59%3A06Z&se=2026-03-09T23%3A59%3A06Z&sr=b&sp=r&sig=0bugsCUR3gyJeMgIMNCszphuaZdZQoUCf%2BfWpp10mdo%3D",
    "prompt": "A red apple on white background",
    "imagePath": null,
    "filename": "promo_20260308235850319.png"
  }
}
```

### **Paso 2: Generar imagen FLUX**

```bash
curl -X POST "http://localhost:4001/media/image" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user123" \
  -d '{
    "prompt": "A futuristic robot in cyberpunk city",
    "plan": "CREATOR",
    "useFlux": true
  }'
```

### **Respuesta Exitosa:**

```json
{
  "success": true,
  "message": "✅ Imagen generada correctamente",
  "result": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/images/flux-image-293f908a-9667-44dd-99f5-7dbb13e41c59.png?sv=2025-07-05&spr=https&st=2026-03-09T00%3A00%3A12Z&se=2026-03-10T00%3A00%3A12Z&sr=b&sp=r&sig=MeKyr7kUP89WBkxjPjjMndyqNJnrmPFsaFBiLnNXSXM%3D",
    "prompt": "A futuristic robot in cyberpunk city",
    "imagePath": null,
    "filename": "flux-image-293f908a-9667-44dd-99f5-7dbb13e41c59.png"
  }
}
```

---

## **ESTRUCTURA COMPLETA DEL PAYLOAD**

### **Request:**

```typescript
interface DualImageRequest {
  /**
   * Prompt para generar la imagen
   * Mínimo 1 carácter, máximo 1000
   */
  prompt: string;
  
  /**
   * Plan del usuario
   * Determina características disponibles
   */
  plan: 'FREE' | 'CREATOR' | 'PRO';
  
  /**
   * Usar FLUX en lugar de DALL-E
   * FREE: siempre false
   * CREATOR/PRO: opcional
   */
  useFlux?: boolean;
  
  /**
   * Tamaño de la imagen (solo FLUX)
   * Formato: "ancho x alto"
   */
  size?: string;  // ej: "1024x1024"
}
```

### **Response (Éxito - 201):**

```typescript
interface DualImageResponse {
  success: boolean;
  message: string;
  result: {
    /**
     * URL completa con SAS token
     * Válida por 24 horas
     */
    imageUrl: string;
    
    /**
     * Prompt usado para generación
     */
    prompt: string;
    
    /**
     * Siempre null (no se usa)
     */
    imagePath: null;
    
    /**
     * Nombre del archivo generado
     * DALL-E: promo_{timestamp}.png
     * FLUX: flux-image-{uuid}.png
     */
    filename: string;
  };
}
```

### **Response (Error - 400/500):**

```json
{
  "success": false,
  "error": "Validation failed",
  "message": "El plan FREE no puede usar FLUX",
  "details": ["useFlux debe ser false para plan FREE"]
}
```

---

## **FLUJO INTERNO**

```mermaid
graph TD
    A[Usuario] --> B[POST /media/image]
    B --> C{Validar Plan}
    C -->|FREE| D[useFlux = false]
    C -->|CREATOR/PRO| E{useFlux?}
    E -->|true| F[FLUX-1.1-pro]
    E -->|false| G[DALL-E]
    F --> H[Generar imagen]
    G --> H
    H --> I[Guardar temporal]
    I --> J[Subir a Blob Storage]
    J --> K[Generar SAS token]
    K --> L[Notificar backend]
    L --> M[Retornar JSON]
```

### **Pasos Detallados:**

1. **Recepción del request**
   ```typescript
   @Post('image')
   async generate(@Body() dto: GeneratePromoImageDto, @Headers('x-user-id') userId: string)
   ```

2. **Validación de plan**
   ```typescript
   if (dto.plan === 'FREE' && dto.useFlux === true) {
     throw new BadRequestException('FREE plan cannot use FLUX');
   }
   ```

3. **Decisión de servicio**
   ```typescript
   if (dto.useFlux === true) {
     // Llamar a FluxImageService
     const result = await this.fluxImageService.generateImageAndNotify(userId, dto);
   } else {
     // Llamar a PromoImageService (DALL-E)
     const result = await this.promoImageService.generateAndNotify(userId, dto);
   }
   ```

4. **Generación de imagen**
   - DALL-E: Llama a OpenAI API
   - FLUX: Llama a Azure Foundry

5. **Procesamiento de imagen**
   ```typescript
   // Si viene como base64
   const buffer = Buffer.from(b64_json, 'base64');
   fs.writeFileSync(tempPath, buffer);
   
   // Si viene como URL
   await downloadImage(url, tempPath);
   ```

6. **Subida a Blob Storage**
   ```typescript
   const blobUrl = await azureBlobService.uploadFileToBlobWithSas(
     tempPath,
     'images/' + filename,
     'image/png'
   );
   // → Retorna URL con SAS token automático
   ```

7. **Notificación al backend**
   ```typescript
   await fetch(`${MAIN_BACKEND_URL}/promo-image/complete`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       userId,
       prompt: finalPrompt,
       imageUrl: blobUrl,
       filename,
     }),
   });
   ```

8. **Respuesta al usuario**
   ```typescript
   return {
     success: true,
     message: '✅ Imagen generada correctamente',
     result: {
       imageUrl: blobUrl,
       prompt: finalPrompt,
       imagePath: null,
       filename,
     },
   };
   ```

---

# 🖼️ **ENDPOINT 2: FLUX 2 PRO SIMPLE**

## **Descripción**

Generador de imágenes de alta calidad usando FLUX 2 Pro. Soporta solo generación desde texto (sin imágenes de referencia).

### **Características:**

- ✅ Modelo más reciente: FLUX.2-pro
- ✅ Mayor calidad y detalle
- ✅ Endpoint dedicado y simple
- ⚠️ Puede tener errores intermitentes 500

---

## **IMPLEMENTACIÓN CON CURL**

### **Paso Único: Generar imagen**

```bash
curl -X POST "http://localhost:4001/media/flux-image/simple" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user123" \
  -d '{
    "prompt": "A beautiful mountain landscape at sunset",
    "plan": "PRO",
    "size": "1024x1024"
  }'
```

### **Respuesta Exitosa:**

```json
{
  "success": true,
  "message": "✅ FLUX 2 Pro image generated successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png?sv=2025-07-05&spr=https&st=2026-03-09T00%3A00%3A00Z&se=2026-03-10T00%3A00%3A00Z&sr=b&sp=r&sig=XXXXX",
    "prompt": "A beautiful mountain landscape at sunset",
    "imagePath": null,
    "filename": "misy-image-1741567890123.png"
  }
}
```

### **Respuesta de Error (500):**

```json
{
  "statusCode": 500,
  "message": "Error generating FLUX 2 Pro image: Failed to generate image with FLUX 2 Pro: Request failed with status code 500"
}
```

---

## **ESTRUCTURA COMPLETA DEL PAYLOAD**

### **Request:**

```typescript
interface Flux2ProRequest {
  /**
   * Prompt descriptivo para generar
   * Mínimo 10 caracteres recomendado
   */
  prompt: string;
  
  /**
   * Plan del usuario
   * Se recomienda solo PRO por el costo
   */
  plan: 'FREE' | 'CREATOR' | 'PRO';
  
  /**
   * Tamaño de la imagen
   * Valores válidos: "1024x1024", "1024x1536", etc.
   */
  size?: string;
}
```

### **Response (Éxito - 201):**

```typescript
interface Flux2ProResponse {
  success: boolean;
  message: string;
  data: {
    /**
     * URL con SAS token (24 horas)
     * Prefijo: misy-image-{timestamp}.png
     */
    imageUrl: string;
    
    /**
     * Prompt procesado
     */
    prompt: string;
    
    /**
     * Siempre null
     */
    imagePath: null;
    
    /**
     * Nombre único del archivo
     */
    filename: string;
  };
}
```

---

## **FLUJO INTERNO**

### **Payload enviado a Azure Foundry:**

```json
{
  "model": "FLUX.2-pro",
  "prompt": "A beautiful mountain landscape at sunset",
  "width": 1024,
  "height": 1024,
  "n": 1
}
```

### **Proceso:**

1. **Parsear tamaño**
   ```typescript
   const [width, height] = dto.size.split('x').map(Number);
   // "1024x1024" → width: 1024, height: 1024
   ```

2. **Construir payload**
   ```typescript
   const payload = {
     model: 'FLUX.2-pro',
     prompt: finalPrompt,
     width: width,
     height: height,
     n: 1,
   };
   ```

3. **Enviar a Azure Foundry**
   ```typescript
   const response = await axios.post(endpoint, payload, {
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${apiKey}`,
     },
   });
   ```

4. **Propiar respuesta**
   - Azure retorna: `{ choices: [{ b64_json: "..." }] }`
   - Decodificar base64 → buffer
   - Guardar en temp/
   - Subir a Blob con SAS

5. **Nomenclatura**
   ```typescript
   const uniqueId = Date.now();
   const filename = `misy-image-${uniqueId}.png`;
   // Ej: misy-image-1741567890123.png
   ```

---

# 🎨 **ENDPOINT 3: FLUX KONTEXT PRO (TEXTO)**

## **Descripción**

Generador de imágenes FLUX.1-Kontext-pro especializado en entender prompts complejos y contexto.

### **Características:**

- ✅ Mejor comprensión de contexto
- ✅ Soporta prompts más largos
- ✅ Mayor coherencia semántica
- ✅ Nomenclatura estandarizada: `misy-image-{timestamp}.png`

---

## **IMPLEMENTACIÓN CON CURL**

### **Paso Único: Generar desde texto**

```bash
curl -X POST "http://localhost:4001/media/flux-kontext/image" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user123" \
  -d '{
    "prompt": "A photograph of a red fox in an autumn forest",
    "plan": "PRO",
    "size": "1024x1024",
    "isJsonPrompt": false
  }'
```

### **Respuesta Exitosa:**

```json
{
  "success": true,
  "message": "✅ FLUX Kontext image generated successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png?sv=2025-07-05...",
    "prompt": "A photograph of a red fox in an autumn forest",
    "imagePath": null,
    "filename": "misy-image-1741567890123.png"
  }
}
```

---

## **ESTRUCTURA COMPLETA DEL PAYLOAD**

### **Request:**

```typescript
interface FluxKontextRequest {
  /**
   * Prompt para la generación
   * Puede ser JSON estructurado si isJsonPrompt=true
   */
  prompt: string;
  
  /**
   * Plan del usuario
   */
  plan: 'FREE' | 'CREATOR' | 'PRO';
  
  /**
   * Tamaño de la imagen
   */
  size?: string;
  
  /**
   * Indica si el prompt viene en formato JSON
   * Si es true, se convierte a lenguaje natural con LLM
   */
  isJsonPrompt?: boolean;
}
```

### **Ejemplo con isJsonPrompt: true:**

```json
{
  "prompt": "{\"subject\":\"red fox\",\"setting\":\"autumn forest\",\"style\":\"photograph\"}",
  "plan": "PRO",
  "size": "1024x1024",
  "isJsonPrompt": true
}
```

**Proceso interno:**
```typescript
if (dto.isJsonPrompt) {
  // Convertir JSON a lenguaje natural
  const naturalPrompt = await llmService.improveImagePrompt(dto.prompt);
  // → "A photograph of a red fox in an autumn forest"
}
```

---

## **FLUJO INTERNO**

### **Payload a Azure:**

```json
{
  "model": "FLUX.1-Kontext-pro",
  "prompt": "A photograph of a red fox in an autumn forest",
  "n": 1,
  "size": "1024x1024",
  "output_format": "png"
}
```

### **Autenticación:**

```http
Authorization: Bearer <API_KEY>
```

**Importante:** Usa API Key directa, NO Azure AD token.

---

# ✏️ **ENDPOINT 4: FLUX KONTEXT PRO (EDICIÓN)**

## **Descripción**

Editor de imágenes que permite modificar una imagen existente usando un prompt y manteniendo la composición original.

### **Casos de Uso:**

- ✅ Cambiar estilo artístico
- ✅ Agregar/quitar elementos
- ✅ Modificar ambiente
- ✅ Variaciones sobre misma imagen

---

## **IMPLEMENTACIÓN CON CURL**

### **Paso 1: Subir imagen de referencia**

```bash
curl -X POST "http://localhost:4001/upload" \
  -F "file=@original-image.jpg"
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png?sv=2025-07-05...",
  "filename": "misy-image-1741567890123.png"
}
```

### **Paso 2: Editar imagen**

```bash
curl -X POST "http://localhost:4001/media/flux-kontext/edit" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user123" \
  -d '{
    "prompt": "Make it cyberpunk style with neon lights",
    "plan": "PRO",
    "size": "1024x1024",
    "referenceImageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png?sv=2025-07-05..."
  }'
```

### **Respuesta Exitosa:**

```json
{
  "success": true,
  "message": "✅ FLUX Kontext image edited successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567891456.png?sv=2025-07-05...",
    "prompt": "Make it cyberpunk style with neon lights",
    "imagePath": null,
    "filename": "misy-image-1741567891456.png"
  }
}
```

---

## **ESTRUCTURA COMPLETA DEL PAYLOAD**

### **Request:**

```typescript
interface FluxKontextEditRequest {
  /**
   * Prompt describiendo los cambios
   */
  prompt: string;
  
  /**
   * Plan del usuario
   */
  plan: 'FREE' | 'CREATOR' | 'PRO';
  
  /**
   * Tamaño de salida
   */
  size?: string;
  
  /**
   * URL de la imagen original
   * Debe ser HTTPS y accesible
   */
  referenceImageUrl: string;
}
```

### **Validaciones:**

```typescript
@IsUrl({ 
  protocols: ['https'], 
  require_protocol: true 
})
referenceImageUrl: string;
```

---

## **FLUJO INTERNO**

### **FormData enviado a Azure:**

```javascript
formData.append('model', 'FLUX.1-Kontext-pro');
formData.append('prompt', 'Make it cyberpunk...');
formData.append('n', '1');
formData.append('size', '1024x1024');
formData.append('image', fs.createReadStream(tempImagePath));
```

### **Proceso:**

1. **Descargar imagen de referencia**
   ```typescript
   const response = await axios.get(referenceImageUrl, {
     responseType: 'arraybuffer'
   });
   fs.writeFileSync(tempPath, response.data);
   ```

2. **Construir FormData**
   ```typescript
   const formData = new FormData();
   formData.append('model', deployment);
   formData.append('prompt', finalPrompt);
   formData.append('n', '1');
   formData.append('size', dto.size);
   formData.append('image', fs.createReadStream(tempPath));
   ```

3. **Enviar a Azure**
   ```typescript
   const editsUrl = `${baseURL}/openai/deployments/${deployment}/images/edits?api-version=${apiVersion}`;
   
   const response = await axios.post(editsUrl, formData, {
     headers: {
       'Authorization': `Bearer ${apiKey}`,
       ...formData.getHeaders(),  // Content-Type multipart/form-data
     },
   });
   ```

4. **Procesar resultado**
   - Recibir base64
   - Guardar
   - Subir a Blob
   - Retornar URL

---

# 📊 **COMPARATIVA DE RESPUESTAS**

## **Estructura Común**

Todos los endpoints retornan EL MISMO formato:

```json
{
  "success": true|false,
  "message": "string",
  "data|result": {
    "imageUrl": "https://...png?sv=2025-07-05...",
    "prompt": "string",
    "imagePath": null,
    "filename": "string"
  }
}
```

## **Diferencias**

| Endpoint | Campo Raíz | Prefijo Filename | SAS Token | Notificación Backend |
|----------|-----------|------------------|-----------|---------------------|
| **Dual (DALL-E)** | `result` | `promo_{ts}.png` | ✅ | `/promo-image/complete` |
| **Dual (FLUX)** | `result` | `flux-image-{uuid}.png` | ✅ | `/promo-image/complete` |
| **FLUX 2 Pro** | `data` | `misy-image-{ts}.png` | ✅ | `/flux-2-pro-image/complete` |
| **FLUX Kontext** | `data` | `misy-image-{ts}.png` | ✅ | `/flux-kontext-image/complete` |

---

# 🔔 **NOTIFICACIONES AL BACKEND PRINCIPAL**

## **Endpoints de Notificación**

Cada servicio notifica a un endpoint diferente:

### **1. Dual (DALL-E/FLUX)**
```
POST /promo-image/complete
```

**Payload:**
```json
{
  "userId": "user123",
  "prompt": "A red apple...",
  "imageUrl": "https://...png",
  "filename": "promo_....png"
}
```

### **2. FLUX 2 Pro**
```
POST /flux-2-pro-image/complete
```

**Payload:**
```json
{
  "userId": "user123",
  "prompt": "A beautiful mountain...",
  "imageUrl": "https://...png",
  "filename": "misy-image-....png"
}
```

### **3. FLUX Kontext**
```
POST /flux-kontext-image/complete
```

**Payload:**
```json
{
  "userId": "user123",
  "prompt": "A photograph of...",
  "imageUrl": "https://...png",
  "filename": "misy-image-....png"
}
```

## **Implementación en Backend Principal**

```typescript
@Post('promo-image/complete')
async completePromo(@Body() notification: ImageNotification) {
  await this.prisma.generatedImage.create({
    data: {
      userId: notification.userId,
      imageUrl: notification.imageUrl,
      filename: notification.filename,
      prompt: notification.prompt,
      service: 'DALL-E_OR_FLUX',
    },
  });
  
  return { success: true };
}

@Post('flux-2-pro-image/complete')
async completeFlux2Pro(@Body() notification: ImageNotification) {
  await this.prisma.generatedImage.create({
    data: {
      userId: notification.userId,
      imageUrl: notification.imageUrl,
      filename: notification.filename,
      prompt: notification.prompt,
      service: 'FLUX_2_PRO',
    },
  });
  
  return { success: true };
}

@Post('flux-kontext-image/complete')
async completeFluxKontext(@Body() notification: ImageNotification) {
  await this.prisma.generatedImage.create({
    data: {
      userId: notification.userId,
      imageUrl: notification.imageUrl,
      filename: notification.filename,
      prompt: notification.prompt,
      service: 'FLUX_KONTEXT_PRO',
    },
  });
  
  return { success: true };
}
```

---

# 🧪 **TESTS COMPLETOS**

## **Test 1: Dual Endpoint (DALL-E)**

```bash
#!/bin/bash
echo "🖼️ Testing Dual Endpoint - DALL-E..."

RESPONSE=$(curl -s -X POST http://localhost:4001/media/image \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user" \
  -d '{
    "prompt": "A red apple on white background",
    "plan": "FREE",
    "useFlux": false
  }')

echo "$RESPONSE" | jq .

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
  echo "✅ DALL-E SUCCESS!"
  IMAGE_URL=$(echo "$RESPONSE" | jq -r '.result.imageUrl')
  echo "Image: $IMAGE_URL"
else
  echo "❌ FAILED!"
  exit 1
fi
```

## **Test 2: Dual Endpoint (FLUX)**

```bash
#!/bin/bash
echo "🖼️ Testing Dual Endpoint - FLUX..."

RESPONSE=$(curl -s -X POST http://localhost:4001/media/image \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user" \
  -d '{
    "prompt": "A futuristic robot",
    "plan": "CREATOR",
    "useFlux": true
  }')

echo "$RESPONSE" | jq .

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
  echo "✅ FLUX SUCCESS!"
  IMAGE_URL=$(echo "$RESPONSE" | jq -r '.result.imageUrl')
  echo "Image: $IMAGE_URL"
else
  echo "❌ FAILED!"
  exit 1
fi
```

## **Test 3: FLUX 2 Pro**

```bash
#!/bin/bash
echo "🚀 Testing FLUX 2 Pro..."

RESPONSE=$(curl -s -X POST http://localhost:4001/media/flux-image/simple \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user" \
  -d '{
    "prompt": "A beautiful landscape",
    "plan": "PRO",
    "size": "1024x1024"
  }')

echo "$RESPONSE" | jq .

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
  echo "✅ FLUX 2 PRO SUCCESS!"
  IMAGE_URL=$(echo "$RESPONSE" | jq -r '.data.imageUrl')
  echo "Image: $IMAGE_URL"
else
  echo "❌ FAILED (may be intermittent 500 error)"
  exit 1
fi
```

## **Test 4: FLUX Kontext (Texto)**

```bash
#!/bin/bash
echo "🎨 Testing FLUX Kontext - Text Generation..."

RESPONSE=$(curl -s -X POST http://localhost:4001/media/flux-kontext/image \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user" \
  -d '{
    "prompt": "A red fox in autumn forest",
    "plan": "PRO",
    "size": "1024x1024"
  }')

echo "$RESPONSE" | jq .

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
  echo "✅ FLUX KONTEXT SUCCESS!"
  IMAGE_URL=$(echo "$RESPONSE" | jq -r '.data.imageUrl')
  echo "Image: $IMAGE_URL"
else
  echo "❌ FAILED!"
  exit 1
fi
```

## **Test 5: FLUX Kontext (Edición)**

```bash
#!/bin/bash
echo "✏️ Testing FLUX Kontext - Edit with Reference..."

# Primero subir imagen
echo "📤 Step 1: Upload reference image..."
UPLOAD=$(curl -s -X POST http://localhost:4001/upload \
  -F "file=@test-image.jpg")

REF_URL=$(echo "$UPLOAD" | jq -r '.imageUrl')
echo "Reference URL: $REF_URL"

if [ "$REF_URL" == "null" ]; then
  echo "❌ Upload failed"
  exit 1
fi

# Ahora editar
echo "📡 Step 2: Edit image..."
EDIT_RESPONSE=$(curl -s -X POST http://localhost:4001/media/flux-kontext/edit \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user" \
  -d "{
    \"prompt\": \"Make it cyberpunk style\",
    \"plan\": \"PRO\",
    \"size\": \"1024x1024\",
    \"referenceImageUrl\": \"$REF_URL\"
  }")

echo "$EDIT_RESPONSE" | jq .

SUCCESS=$(echo "$EDIT_RESPONSE" | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
  echo "✅ EDIT SUCCESS!"
  EDITED_URL=$(echo "$EDIT_RESPONSE" | jq -r '.data.imageUrl')
  echo "Edited Image: $EDITED_URL"
else
  echo "❌ EDIT FAILED!"
  exit 1
fi
```

---

# ⚠️ **MANEJO DE ERRORES**

## **Errores Comunes**

### **1. Validación (400)**

```json
{
  "success": false,
  "error": "Validation failed",
  "message": "El prompt no puede estar vacío",
  "details": ["prompt must be longer than 1 character"]
}
```

**Causa:** Payload inválido  
**Solución:** Revisar campos requeridos

### **2. Unauthorized (401)**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causa:** API Key incorrecta  
**Solución:** Verificar variables de entorno

### **3. Not Found (404)**

```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

**Causa:** Deployment name incorrecto  
**Solución:** Verificar endpoint en .env

### **4. Internal Error (500)**

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "activityId": "xxx-xxx-xxx"
}
```

**Causa:** Error de Azure Foundry (intermitente)  
**Solución:** Implementar retry logic

```typescript
async generateWithRetry(dto, maxRetries = 3) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      return await this.generate(dto);
    } catch (error) {
      if (error.status === 500 && i < maxRetries) {
        await sleep(Math.pow(2, i) * 1000);
        continue;
      }
      throw error;
    }
  }
}
```

---

# 📋 **CHECKLIST DE INTEGRACIÓN**

## **Backend Principal:**

- [ ] Configurar CORS para video-generator
- [ ] Implementar endpoint `POST /media/image` (dual)
- [ ] Implementar endpoint `POST /media/flux-image/simple`
- [ ] Implementar endpoint `POST /media/flux-kontext/image`
- [ ] Implementar endpoint `POST /media/flux-kontext/edit`
- [ ] Implementar notificaciones:
  - [ ] `POST /promo-image/complete`
  - [ ] `POST /flux-2-pro-image/complete`
  - [ ] `POST /flux-kontext-image/complete`
- [ ] Crear tabla `generated_images`
- [ ] Agregar validación por plan
- [ ] Implementar rate limiting
- [ ] Tests unitarios

## **Video Generator:**

- [x] Servicios implementados
- [x] Controllers configurados
- [x] DTOs creados
- [x] Variables documentadas
- [ ] Tests integración
- [ ] Swagger actualizado

## **Pruebas:**

- [ ] Test dual DALL-E
- [ ] Test dual FLUX
- [ ] Test FLUX 2 Pro
- [ ] Test FLUX Kontext texto
- [ ] Test FLUX Kontext edición
- [ ] Test de notificaciones
- [ ] Test de errores

---

# 🚀 **DEPLOYMENT**

## **Construir y Ejecutar Local**

```bash
# Build
docker build -t video-converter:latest .

# Run
docker run -d --name video-generator-test \
  -p 4001:8080 \
  --env-file .env \
  video-converter:latest

# Logs
docker logs -f video-generator-test
```

## **Deploy a Azure**

```bash
# Login
az login

# Set subscription
az account set --subscription "<sub-id>"

# Deploy
az webapp deployment source config-zip \
  --resource-group realculture-rg \
  --name video-converter \
  --src deployment.zip

# Configure env vars
az webapp config appsettings set \
  --resource-group realculture-rg \
  --name video-converter \
  --settings \
    MAIN_BACKEND_URL="https://tu-backend.com" \
    FLUX_KONTEXT_PRO_API_KEY="..." \
    # ... más variables
```

---

**Estado:** ✅ DOCUMENTACIÓN COMPLETADA  
**Última Actualización:** 2026-03-09  
**Versión:** 2.0.0
