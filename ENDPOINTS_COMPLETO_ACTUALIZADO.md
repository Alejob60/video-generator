# 📡 INFORME COMPLETO DE ENDPOINTS DEL MICROSERVICIO

## 📋 RESUMEN GENERAL
**Estado del sistema:** ✅ Operativo y limpio  
**Fecha del informe:** 19/01/2026  
**Total endpoints activos:** 11  
**Eliminados:** FLUX.1-Kontext-pro (por fallas en Foundry)

---

## 🔧 ENDPOINTS FUNCIONALES

### 1. HEALTH CHECKS
```
GET /status
GET /health
```
**Descripción:** Verificación del estado del sistema  
**Respuesta:** `{ status: 'ok', timestamp: '...' }`

---

### 2. GENERACIÓN DE VIDEO
```
POST /videos/generate
```
**Payload:**
```json
{
  "script": "Texto del guión para el video",
  "voice": "es-ES-AlvaroNeural",
  "avatar": "lily",
  "background_music": true,
  "duration": 60,
  "plan": "PRO"
}
```
**Headers:** `Content-Type: application/json`  
**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "✅ Video generation queued successfully",
  "jobId": "video-1768865...",
  "estimatedTime": "5-10 minutes"
}
```

---

### 3. GENERACIÓN DE AUDIO
```
POST /audio/generate
```
**Payload:**
```json
{
  "text": "Texto a convertir en audio",
  "voice": "es-ES-AlvaroNeural",
  "speed": 1.0,
  "plan": "PRO"
}
```
**Headers:** `Content-Type: application/json`  
**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "✅ Audio generation queued successfully",
  "jobId": "audio-1768865...",
  "estimatedTime": "1-2 minutes"
}
```

---

### 4. GENERACIÓN DE IMAGEN CON DALL-E
```
POST /media/image
```
**Payload:**
```json
{
  "prompt": "Descripción detallada de la imagen deseada",
  "size": "1024x1024",
  "quality": "hd",
  "style": "vivid",
  "plan": "PRO"
}
```
**Headers:** `Content-Type: application/json`  
**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "✅ Image generation queued successfully",
  "jobId": "image-1768865...",
  "estimatedTime": "1-3 minutes"
}
```

---

### 5. GENERACIÓN DE IMAGEN CON FLUX
```
POST /media/flux-image
```
**Payload:**
```json
{
  "prompt": "Descripción de la imagen para FLUX",
  "width": 1024,
  "height": 1024,
  "steps": 20,
  "guidance": 3.5,
  "plan": "PRO"
}
```
**Headers:** `Content-Type: application/json`  
**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "✅ FLUX image generation queued successfully",
  "jobId": "flux-1768865...",
  "estimatedTime": "2-4 minutes"
}
```

---

### 6. GENERACIÓN DE IMAGEN DUAL CON FLUX
```
POST /media/flux-image/dual
```
**Payload:**
```json
{
  "prompt_positive": "Lo que quieres en la imagen",
  "prompt_negative": "Lo que NO quieres en la imagen",
  "width": 1024,
  "height": 1024,
  "steps": 25,
  "guidance": 4.0,
  "plan": "PRO"
}
```
**Headers:** `Content-Type: application/json`  
**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "✅ Dual FLUX image generation queued successfully",
  "jobId": "flux-dual-1768865...",
  "estimatedTime": "3-5 minutes"
}
```

---

### 7. GENERACIÓN DE INFLUENCERS (TALKING AVATARS)
```
POST /media/influencer
```
**Payload:**
```json
{
  "script": "Texto para el avatar hablante",
  "avatar": "lily",
  "voice": "es-ES-AlvaroNeural",
  "background": "studio",
  "duration": 30,
  "plan": "PRO"
}
```
**Headers:** `Content-Type: application/json`  
**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "✅ Influencer video generation queued successfully",
  "jobId": "influencer-1768865...",
  "estimatedTime": "4-8 minutes"
}
```

---

### 8. EXTRACCIÓN DE ADN VISUAL DE SITIOS WEB
```
POST /media/website-dna
```
**Payload:**
```json
{
  "url": "https://sitio-web.com",
  "extraction_mode": "full",
  "plan": "PRO"
}
```
**Alternativa con HTML directo:**
```json
{
  "html_structure": "<html>...</html>",
  "extraction_mode": "visual",
  "plan": "PRO"
}
```
**Headers:** `Content-Type: application/json`  
**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "✅ Website DNA extracted successfully",
  "requestId": 1768865100536,
  "result": {
    "url": "https://sitio-web.com",
    "brand_dna": {
      "colors": {
        "primary": "#007bff",
        "secondary": "#6c757d"
      },
      "typography": {
        "primary_font": "Inter, sans-serif"
      },
      "styling": {
        "border_radius": "0.375rem"
      }
    },
    "logical_orders": ["1. Extraer paleta de colores...", "..."],
    "css_tokens": "/* Variables CSS extraídas */\n:root {...}",
    "content_strategy": {
      "tone_of_voice": "Profesional y amigable"
    },
    "ui_patterns": {
      "hero_section": "Hero con imagen de fondo..."
    }
  }
}
```

---

### 9. GENERACIÓN DE JSON CON LLM
```
POST /llm/generate-json
```
**Payload:**
```json
{
  "prompt": "Genera un objeto JSON con información de producto",
  "schema": {
    "type": "object",
    "properties": {
      "nombre": { "type": "string" },
      "precio": { "type": "number" }
    }
  },
  "temperature": 0.7,
  "plan": "PRO"
}
```
**Headers:** `Content-Type: application/json`  
**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "✅ JSON generated successfully",
  "result": {
    "nombre": "Producto de ejemplo",
    "precio": 29.99
  }
}
```

---

## 🔄 COLAS DE PROCESAMIENTO

### Endpoints de salud de colas:
```
GET /videos/health
```

### Colas activas monitoreadas:
- **video**: Procesamiento de videos completos
- **imagen**: Generación de imágenes con DALL-E
- **influencer-video-queue**: Videos de avatares hablantes

---

## ⚙️ CONFIGURACIÓN DEL SISTEMA

### Variables de entorno requeridas:
```bash
# Azure OpenAI
AZURE_OPENAI_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS
AZURE_OPENAI_GPT_URL=https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview
AZURE_OPENAI_GPT_DEPLOYMENT=gpt-4.1
AZURE_OPENAI_API_VERSION=2025-01-01-preview

# FLUX 2 Pro (Endpoint activo)
FLUX_ENDPOINT=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/providers/blackforestlabs/v1/flux-2-pro
FLUX_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS

# Azure Service Bus
SERVICE_BUS_CONNECTION_STRING=Endpoint=sb://...

# Azure Blob Storage
AZURE_STORAGE_ACCOUNT_NAME=labscode2026
AZURE_STORAGE_ACCOUNT_KEY=...
AZURE_STORAGE_SAS_TOKEN=...

# URLs
MAIN_BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
```

---

## 📈 PLANES SOPORTADOS

Todos los endpoints aceptan estos planes:
- `"FREE"` - Funcionalidades básicas limitadas
- `"CREATOR"` - Funcionalidades intermedias  
- `"PRO"` - Todas las funcionalidades sin límites

---

## 🛠️ EJEMPLOS DE USO

### Ejemplo completo de flujo de video:
```bash
# 1. Generar guión con LLM
curl -X POST "http://localhost:8080/llm/generate-json" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Crea un guión para video de 30 segundos sobre tecnología", "plan": "PRO"}'

# 2. Generar imagen para el video
curl -X POST "http://localhost:8080/media/flux-image" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Fondo tecnológico moderno con circuitos", "plan": "PRO"}'

# 3. Generar audio del guión
curl -X POST "http://localhost:8080/audio/generate" \
  -H "Content-Type: application/json" \
  -d '{"text": "Texto del guión generado", "voice": "es-ES-AlvaroNeural", "plan": "PRO"}'

# 4. Generar video final
curl -X POST "http://localhost:8080/videos/generate" \
  -H "Content-Type: application/json" \
  -d '{"script": "Guion completo", "voice": "es-ES-AlvaroNeural", "avatar": "lily", "plan": "PRO"}'
```

---

## 📞 SOPORTE Y MONITOREO

### Health checks:
- `GET /status` - Estado general del sistema
- `GET /health` - Salud del servicio
- `GET /videos/health` - Estado de las colas

### Logging:
Todos los endpoints registran eventos con timestamps y detalles de procesamiento para seguimiento y debugging.

---
*Informe generado automáticamente - Sistema de Video Generator v1.0*