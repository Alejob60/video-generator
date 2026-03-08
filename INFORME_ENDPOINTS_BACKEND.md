# 📋 INFORME COMPLETO DE ENDPOINTS - VIDEO GENERATOR API

> **Aplicación desplegada en:** `https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net`  
> **Versión:** 1.0.0  
> **Fecha del informe:** 21 de enero de 2026

---

## 📑 TABLA DE CONTENIDOS

1. [Health Check y Status](#1-health-check-y-status)
2. [Generación de Video](#2-generación-de-video)
3. [Generación de Audio](#3-generación-de-audio)
4. [Generación de Imágenes DALL-E](#4-generación-de-imágenes-dall-e)
5. [Generación de Imágenes FLUX](#5-generación-de-imágenes-flux)
6. [Generación de Prompts JSON con LLM](#6-generación-de-prompts-json-con-llm)
7. [Notas de Integración](#7-notas-de-integración)

---

## 1. HEALTH CHECK Y STATUS

### 1.1 Status Básico del Servicio

**Ruta:** `GET /status`  
**Descripción:** Verifica el estado básico del servicio (siempre responde si la aplicación está corriendo).

#### Request:
```http
GET https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/status
```

#### Response (200 OK):
```json
{
  "status": "online",
  "timestamp": "2026-01-21T19:03:03.727Z",
  "service": "video-generator",
  "version": "1.0.0"
}
```

---

### 1.2 Health Check Básico

**Ruta:** `GET /health`  
**Descripción:** Verifica el estado básico del servicio sin hacer llamadas externas (respuesta rápida).

#### Request:
```http
GET https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/health
```

#### Response (200 OK):
```json
{
  "status": "online",
  "timestamp": "2026-01-21T19:03:47.023Z",
  "service": "video-generator",
  "version": "1.0.0",
  "note": "For full health check, use ?check=full parameter"
}
```

---

### 1.3 Health Check Completo

**Ruta:** `GET /health?check=full`  
**Descripción:** Verifica el estado de todos los servicios externos (LLM, TTS, Sora, Blob Storage, Backend).

#### Request:
```http
GET https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/health?check=full
```

#### Response (200 OK):
```json
{
  "status": "ok",
  "services": {
    "llm": "ok",
    "tts": "ok",
    "sora": "ok",
    "blob": "ok",
    "backend": "ok"
  },
  "timestamp": "2026-01-21T19:05:00.000Z"
}
```

**Nota:** Si algún servicio falla, el `status` será `"degraded"` en lugar de `"ok"`.

---

### 1.4 Health Check de Cola de Videos

**Ruta:** `GET /videos/health`  
**Descripción:** Verifica el estado del cliente Sora para generación de videos.

#### Request:
```http
GET https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/videos/health
```

#### Response (200 OK):
```json
{
  "status": "ok",
  "sora": true,
  "timestamp": "2026-01-21T19:06:00.000Z"
}
```

---

## 2. GENERACIÓN DE VIDEO

**Ruta:** `POST /videos/generate`  
**Descripción:** Genera un video usando el modelo Sora de Azure OpenAI. Opcionalmente incluye narración TTS, subtítulos y música.

### 2.1 Payload (JSON)

```json
{
  "prompt": "A golden retriever playing in the park during sunset",
  "useVoice": true,
  "useSubtitles": false,
  "useMusic": false,
  "useSora": true,
  "plan": "pro",
  "n_seconds": 10
}
```

### 2.2 Descripción de Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `prompt` | `string` o `object` | ✅ Sí | Descripción del video a generar. Puede ser un string simple o un objeto JSON con estructura detallada. |
| `useVoice` | `boolean` | ✅ Sí | Si es `true`, genera narración de audio con Azure TTS. |
| `useSubtitles` | `boolean` | ✅ Sí | Si es `true`, genera subtítulos sincronizados (actualmente en desarrollo). |
| `useMusic` | `boolean` | ✅ Sí | Si es `true`, añade música de fondo (actualmente en desarrollo). |
| `useSora` | `boolean` | ✅ Sí | Si es `true`, usa el modelo Sora de Azure OpenAI. |
| `plan` | `string` | ✅ Sí | Plan del usuario: `"free"`, `"creator"` o `"pro"`. |
| `n_seconds` | `number` | ❌ No (default: 10) | Duración del video en segundos (rango: 5-20 segundos). |

### 2.3 Ejemplo de Request con Prompt JSON

```json
{
  "prompt": {
    "title": "Perro Jugando en el Parque",
    "description": "Un golden retriever jugando con una pelota durante la puesta de sol",
    "style": "cinematic",
    "camera_movement": "slow pan",
    "duration": 10
  },
  "useVoice": true,
  "useSubtitles": false,
  "useMusic": false,
  "useSora": true,
  "plan": "pro",
  "n_seconds": 10
}
```

### 2.4 Response Exitoso (200 OK)

```json
{
  "success": true,
  "message": "Medios generados exitosamente",
  "result": {
    "userId": "admin",
    "timestamp": 1737488520000,
    "videoUrl": "https://realcultureblob.blob.core.windows.net/videos/video_123456.mp4",
    "duration": 10,
    "plan": "pro",
    "fileName": "video_123456.mp4",
    "soraJobId": "job_abc123",
    "generationId": "gen_xyz789",
    "audioUrl": "https://realcultureblob.blob.core.windows.net/audios/audio_123456.mp3",
    "script": "Un hermoso golden retriever juega con una pelota en el parque mientras el sol se pone en el horizonte."
  }
}
```

### 2.5 Response de Error (500)

```json
{
  "success": false,
  "message": "Fallo interno en la generación del video",
  "result": {
    "userId": "admin",
    "timestamp": 1737488520000,
    "duration": 10,
    "plan": "pro",
    "error": "Fallo inesperado al generar video"
  }
}
```

### 2.6 Ejemplo cURL

```bash
curl -X POST https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/videos/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A golden retriever playing in the park during sunset",
    "useVoice": true,
    "useSubtitles": false,
    "useMusic": false,
    "useSora": true,
    "plan": "pro",
    "n_seconds": 10
  }'
```

### 2.7 Ejemplo JavaScript/TypeScript

```typescript
const response = await fetch('https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/videos/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: "A golden retriever playing in the park during sunset",
    useVoice: true,
    useSubtitles: false,
    useMusic: false,
    useSora: true,
    plan: "pro",
    n_seconds: 10
  })
});

const data = await response.json();
console.log('Video URL:', data.result.videoUrl);
console.log('Audio URL:', data.result.audioUrl);
```

---

## 3. GENERACIÓN DE AUDIO

**Ruta:** `POST /audio/generate`  
**Descripción:** Genera un audio narrativo usando Azure Text-to-Speech (TTS) basado en un prompt. El servicio convierte el prompt en un script mejorado y luego lo sintetiza en audio.

### 3.1 Payload (JSON)

```json
{
  "prompt": "Explica en 30 segundos cómo funciona la energía solar",
  "duration": 30
}
```

### 3.2 Descripción de Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `prompt` | `string` | ✅ Sí | Prompt descriptivo para generar el script del audio (mínimo 3 caracteres). |
| `duration` | `number` | ❌ No | Duración deseada en segundos. Valores permitidos: `20`, `30`, o `60`. |

### 3.3 Response Exitoso (200 OK)

```json
{
  "success": true,
  "message": "🎧 Audio generado con éxito",
  "result": {
    "script": "La energía solar aprovecha la luz del sol mediante paneles fotovoltaicos que convierten los rayos solares en electricidad...",
    "duration": 30,
    "filename": "audio_abc123.mp3",
    "blobUrl": "https://realcultureblob.blob.core.windows.net/audios/audio_abc123.mp3",
    "generationId": "gen_lm8nop9q",
    "userId": "labs",
    "timestamp": 1737488600000
  }
}
```

### 3.4 Response de Error (400)

```json
{
  "statusCode": 400,
  "message": "Prompt requerido",
  "error": "Bad Request"
}
```

### 3.5 Ejemplo cURL

```bash
curl -X POST https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/audio/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explica en 30 segundos cómo funciona la energía solar",
    "duration": 30
  }'
```

### 3.6 Ejemplo JavaScript/TypeScript

```typescript
const response = await fetch('https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/audio/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: "Explica en 30 segundos cómo funciona la energía solar",
    duration: 30
  })
});

const data = await response.json();
console.log('Audio URL:', data.result.blobUrl);
console.log('Script:', data.result.script);
```

---

## 4. GENERACIÓN DE IMÁGENES DALL-E

**Ruta:** `POST /media/image`  
**Descripción:** Genera una imagen promocional usando DALL-E 3 o FLUX (dependiendo del parámetro `useFlux`). Soporta upload de imagen de referencia o generación desde prompt.

### 4.1 Payload (JSON)

```json
{
  "prompt": "Un zapato deportivo flotando sobre un fondo futurista azul",
  "plan": "PRO",
  "useFlux": false,
  "isJsonPrompt": false,
  "textOverlay": "¡Solo por hoy! 20% OFF"
}
```

### 4.2 Descripción de Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `prompt` | `string` | ❌ No (si se envía imagen) | Descripción de la imagen a generar. |
| `plan` | `string` | ✅ Sí | Plan del usuario: `"FREE"`, `"CREATOR"` o `"PRO"`. |
| `useFlux` | `boolean` | ❌ No (default: false) | Si es `true`, usa FLUX-1.1-pro en lugar de DALL-E. |
| `isJsonPrompt` | `boolean` | ❌ No (default: false) | Si es `true`, el prompt ya está en formato JSON y no necesita mejora. |
| `textOverlay` | `string` | ❌ No | Texto para superponer sobre la imagen generada (actualmente en desarrollo). |

**Nota:** También soporta `multipart/form-data` para subir una imagen de referencia con campo `image`.

### 4.3 Response Exitoso (200 OK)

```json
{
  "success": true,
  "message": "✅ Imagen generada correctamente",
  "result": {
    "imageUrl": "https://realcultureblob.blob.core.windows.net/images/promo_123456.png",
    "filename": "promo_123456.png",
    "prompt": "Un zapato deportivo flotando sobre un fondo futurista azul",
    "userId": "anon",
    "timestamp": 1737488700000
  }
}
```

### 4.4 Response de Error (400)

```json
{
  "statusCode": 400,
  "message": "❌ Debes enviar un prompt o una imagen.",
  "error": "Bad Request"
}
```

### 4.5 Ejemplo cURL (con JSON)

```bash
curl -X POST https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Un zapato deportivo flotando sobre un fondo futurista azul",
    "plan": "PRO",
    "useFlux": false
  }'
```

### 4.6 Ejemplo cURL (con imagen de referencia)

```bash
curl -X POST https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/image \
  -F "image=@/path/to/reference-image.png" \
  -F "prompt=Modify this image with futuristic style" \
  -F "plan=PRO"
```

### 4.7 Ejemplo JavaScript/TypeScript (con JSON)

```typescript
const response = await fetch('https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: "Un zapato deportivo flotando sobre un fondo futurista azul",
    plan: "PRO",
    useFlux: false
  })
});

const data = await response.json();
console.log('Image URL:', data.result.imageUrl);
```

### 4.8 Ejemplo JavaScript/TypeScript (con imagen)

```typescript
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('prompt', 'Modify this image with futuristic style');
formData.append('plan', 'PRO');

const response = await fetch('https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/image', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log('Image URL:', data.result.imageUrl);
```

---

## 5. GENERACIÓN DE IMÁGENES FLUX

**Ruta:** `POST /media/flux-image`  
**Descripción:** Genera imágenes de alta calidad usando el modelo FLUX-1.1-pro.

### 5.1 Payload (JSON)

```json
{
  "prompt": "A majestic lion in the savannah at sunset, cinematic lighting, 8k quality",
  "plan": "PRO",
  "size": "1024x1024",
  "isJsonPrompt": false,
  "negative_prompt": "blurry, low quality, text, watermark"
}
```

### 5.2 Descripción de Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `prompt` | `string` | ✅ Sí | Prompt descriptivo para generar la imagen. |
| `plan` | `string` | ✅ Sí | Plan del usuario: `"FREE"`, `"CREATOR"` o `"PRO"`. |
| `size` | `string` | ❌ No (default: "1024x1024") | Tamaño de la imagen. Opciones: `"1024x1024"`, `"1024x768"`, `"768x1024"`. |
| `isJsonPrompt` | `boolean` | ❌ No (default: false) | Si es `true`, el prompt ya está en formato JSON optimizado. |
| `negative_prompt` | `string` | ❌ No | Elementos a excluir de la imagen (ej: "blurry, low quality"). |

### 5.3 Response Exitoso (200 OK)

```json
{
  "success": true,
  "message": "✅ FLUX image generated successfully",
  "data": {
    "imageUrl": "https://realcultureblob.blob.core.windows.net/images/flux_123456.png",
    "filename": "flux_123456.png",
    "userId": "anon",
    "prompt": "A majestic lion in the savannah at sunset, cinematic lighting, 8k quality"
  }
}
```

### 5.4 Response de Error (500)

```json
{
  "statusCode": 500,
  "message": "Error generating FLUX image: Connection timeout",
  "error": "Internal Server Error"
}
```

### 5.5 Ejemplo cURL

```bash
curl -X POST https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A majestic lion in the savannah at sunset, cinematic lighting, 8k quality",
    "plan": "PRO",
    "size": "1024x1024",
    "negative_prompt": "blurry, low quality, text, watermark"
  }'
```

### 5.6 Ejemplo JavaScript/TypeScript

```typescript
const response = await fetch('https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: "A majestic lion in the savannah at sunset, cinematic lighting, 8k quality",
    plan: "PRO",
    size: "1024x1024",
    negative_prompt: "blurry, low quality, text, watermark"
  })
});

const data = await response.json();
console.log('FLUX Image URL:', data.data.imageUrl);
```

---

### 5.7 Endpoint Adicional: Generación Dual

**Ruta:** `POST /media/flux-image/dual`  
**Descripción:** Genera dos imágenes simultáneamente: una con DALL-E (promo) y otra con FLUX.

#### Payload (JSON)

```json
{
  "prompt": "A futuristic cityscape at night",
  "plan": "PRO"
}
```

#### Response Exitoso (200 OK)

```json
{
  "promo": "https://realcultureblob.blob.core.windows.net/images/promo_123456.png",
  "flux": "https://realcultureblob.blob.core.windows.net/images/flux_123456.png"
}
```

---

## 6. GENERACIÓN DE PROMPTS JSON CON LLM

**Ruta:** `POST /llm/generate-json`  
**Descripción:** Mejora un prompt simple convirtiéndolo en un objeto JSON estructurado optimizado para generación de contenido.

### 6.1 Payload (JSON)

```json
{
  "prompt": "Un perro jugando en el parque",
  "duration": 10,
  "useJson": true
}
```

### 6.2 Descripción de Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `prompt` | `string` | ✅ Sí | Prompt simple a mejorar (mínimo 5 caracteres). |
| `duration` | `number` | ❌ No | Duración del contenido para ajustar el prompt. |
| `useJson` | `boolean` | ❌ No | Indica si se desea formato JSON en la respuesta. |

### 6.3 Response Exitoso (200 OK)

```json
{
  "success": true,
  "message": "Prompt JSON generado",
  "result": {
    "promptJson": "{\n  \"title\": \"Perro Jugando en el Parque\",\n  \"description\": \"Un golden retriever corriendo y jugando con una pelota en un parque verde durante el atardecer. La escena es alegre y vibrante.\",\n  \"style\": \"cinematic\",\n  \"camera_movement\": \"slow pan following the dog\",\n  \"lighting\": \"golden hour sunset lighting\",\n  \"mood\": \"happy and playful\",\n  \"duration\": 10\n}"
  }
}
```

### 6.4 Response de Error (400)

```json
{
  "statusCode": 400,
  "message": "El prompt debe tener al menos 5 caracteres.",
  "error": "Bad Request"
}
```

### 6.5 Ejemplo cURL

```bash
curl -X POST https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/llm/generate-json \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Un perro jugando en el parque",
    "duration": 10
  }'
```

### 6.6 Ejemplo JavaScript/TypeScript

```typescript
const response = await fetch('https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/llm/generate-json', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: "Un perro jugando en el parque",
    duration: 10
  })
});

const data = await response.json();
const improvedPrompt = JSON.parse(data.result.promptJson);
console.log('Improved Prompt:', improvedPrompt);
```

---

## 7. NOTAS DE INTEGRACIÓN

### 7.1 Autenticación

**Actualmente NO se requiere autenticación** para usar los endpoints. El sistema asigna un `userId` predeterminado (`"admin"`, `"labs"`, `"anon"`) si no se detecta un usuario autenticado.

**Para futuras integraciones con backend:**
- Los endpoints esperan recibir información de usuario en `req.user.id` si se implementa middleware de autenticación.
- Recomendación: Implementar JWT o Bearer token en el header `Authorization`.

### 7.2 CORS y Headers

La API acepta peticiones cross-origin. Asegúrate de incluir los siguientes headers en tus requests:

```http
Content-Type: application/json
```

Para requests con archivos (multipart/form-data):
```http
Content-Type: multipart/form-data
```

### 7.3 Timeouts y Límites

- **Timeout recomendado:** 120 segundos (generación de video puede tardar)
- **Tamaño máximo de payload:** 50 MB (para imágenes)
- **Rate limiting:** No implementado actualmente

### 7.4 Manejo de Errores

Todos los endpoints devuelven respuestas estructuradas:

**Éxito:**
```json
{
  "success": true,
  "message": "...",
  "result": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "...",
  "result": { "error": "..." }
}
```

O formato estándar de NestJS:
```json
{
  "statusCode": 400,
  "message": "...",
  "error": "Bad Request"
}
```

### 7.5 URLs de Recursos Generados

Todos los recursos generados (videos, audios, imágenes) se almacenan en Azure Blob Storage y se devuelven como URLs públicas:

```
https://realcultureblob.blob.core.windows.net/videos/video_xxxxx.mp4
https://realcultureblob.blob.core.windows.net/audios/audio_xxxxx.mp3
https://realcultureblob.blob.core.windows.net/images/image_xxxxx.png
```

**Duración de las URLs:** Las URLs son permanentes (sin expiración) mientras el recurso exista en el blob storage.

### 7.6 Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 400 | Bad Request - Parámetros inválidos o faltantes |
| 500 | Internal Server Error - Error en el servidor o servicios externos |

### 7.7 Flujo de Integración Recomendado

1. **Verificar conectividad:** `GET /status`
2. **Mejorar prompt (opcional):** `POST /llm/generate-json` con prompt simple
3. **Generar contenido:** Usar el prompt mejorado en `/videos/generate`, `/audio/generate`, o `/media/image`
4. **Obtener URLs:** Extraer las URLs de los recursos generados del response
5. **Almacenar en tu backend:** Guardar las URLs y metadata en tu base de datos

### 7.8 Ejemplo de Flujo Completo

```typescript
// Paso 1: Mejorar el prompt
const improvedPromptResponse = await fetch('https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/llm/generate-json', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: "Un perro jugando", duration: 10 })
});

const { result } = await improvedPromptResponse.json();
const improvedPrompt = JSON.parse(result.promptJson);

// Paso 2: Generar el video
const videoResponse = await fetch('https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/videos/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: improvedPrompt,
    useVoice: true,
    useSubtitles: false,
    useMusic: false,
    useSora: true,
    plan: "pro",
    n_seconds: 10
  })
});

const videoData = await videoResponse.json();

// Paso 3: Guardar en tu base de datos
const savedVideo = await saveToDatabase({
  videoUrl: videoData.result.videoUrl,
  audioUrl: videoData.result.audioUrl,
  script: videoData.result.script,
  userId: videoData.result.userId,
  timestamp: videoData.result.timestamp
});

console.log('Video generado y guardado:', savedVideo);
```

---

## 📊 RESUMEN DE ENDPOINTS

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/status` | Status básico del servicio |
| GET | `/health` | Health check básico |
| GET | `/health?check=full` | Health check completo |
| GET | `/videos/health` | Health check de Sora |
| POST | `/videos/generate` | Generar video con Sora |
| POST | `/audio/generate` | Generar audio con TTS |
| POST | `/media/image` | Generar imagen DALL-E/FLUX |
| POST | `/media/flux-image` | Generar imagen FLUX |
| POST | `/media/flux-image/dual` | Generar dos imágenes simultáneas |
| POST | `/llm/generate-json` | Mejorar prompt con LLM |

---

## ✅ CHECKLIST DE INTEGRACIÓN

- [ ] Verificar conectividad con `GET /status`
- [ ] Probar generación de prompt JSON con `POST /llm/generate-json`
- [ ] Probar generación de video con `POST /videos/generate`
- [ ] Probar generación de audio con `POST /audio/generate`
- [ ] Probar generación de imagen con `POST /media/image`
- [ ] Probar generación FLUX con `POST /media/flux-image`
- [ ] Implementar manejo de errores en el backend
- [ ] Configurar timeouts adecuados (120s recomendado)
- [ ] Implementar almacenamiento de URLs en base de datos
- [ ] (Opcional) Implementar autenticación JWT
- [ ] (Opcional) Implementar rate limiting en tu backend

---

## 📞 SOPORTE TÉCNICO

**Base URL:** `https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net`  
**Región:** Canada Central  
**Estado del servicio:** ✅ Online y funcional

**Recursos Azure:**
- **Resource Group:** `realculture-rg`
- **App Service:** `video-converter`
- **Container Registry:** `realcultureacr.azurecr.io`
- **Storage Account:** `realcultureblob`

---

**Fecha del informe:** 21 de enero de 2026  
**Versión del documento:** 1.0.0
