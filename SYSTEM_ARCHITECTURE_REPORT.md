# 🎬 Sistema Video Generator - Informe Completo de Arquitectura

## 🏗️ Arquitectura General del Sistema

### Tecnología Base
- **Framework**: NestJS (Node.js/TypeScript)
- **Patrón de Arquitectura**: Clean Architecture + DDD (Domain Driven Design)
- **Colas de Mensajes**: Azure Service Bus
- **Almacenamiento**: Azure Blob Storage
- **Modelos de IA**: Azure OpenAI (GPT, TTS, Sora, DALL-E)
- **Deployment**: Azure App Service

### Estructura de Carpetas Principal
```
src/
├── application/          # Casos de uso y lógica de negocio
├── domain/              # Modelos y servicios del dominio
├── infrastructure/      # Implementaciones concretas (APIs, servicios externos)
├── interfaces/          # Controladores HTTP y DTOs
└── types/              # Interfaces y tipos compartidos
```

---

## 🔄 Flujo de Trabajo y Encolamiento

### Sistema de Colas (Azure Service Bus)

#### Colas Configuradas:
1. **`video`** - Procesamiento de videos generados por Sora
2. **`promo-image-queue`** - Generación de imágenes promocionales

#### Mecanismo de Envolvimiento:

**Producer Side (Controllers) → Service Bus → Consumer Services**

```
[HTTP Request] 
    ↓
[Controller] 
    ↓
[Service] → [ServiceBusService.sendVideoJobMessage()]
    ↓
[Azure Service Bus Queue]
    ↓
[Queue Consumer Service] → [Process Message] → [Video/Promo Image Service]
```

### Consumer Services con Retry Logic:

#### VideoQueueConsumerService
- **Cola**: `video`
- **Retry Policy**: 3 intentos con delay de 2 segundos
- **Dead Letter**: Solo en último intento fallido
- **Auto-completado**: Messages completados automáticamente después de procesamiento

#### PromoImageQueueConsumerService
- **Cola**: `promo-image-queue`
- **Retry Policy**: 3 intentos con delay de 2 segundos
- **Dead Letter**: Envío a dead letter queue en fallos persistentes
- **Backend Notification**: Notifica al backend principal tras generación exitosa

---

## 📡 Endpoints HTTP Disponibles

### 1. Health & Status Endpoints

#### GET `/status`
**Descripción**: Estado básico del servicio
```json
{
  "status": "online",
  "timestamp": "2026-01-12T17:30:00.000Z",
  "service": "video-generator",
  "version": "1.0.0"
}
```

#### GET `/health`
**Descripción**: Health check básico
**Parámetros**: `?check=full` para health check completo

#### GET `/health?check=full`
**Descripción**: Verificación completa de todos los servicios
```json
{
  "status": "ok|degraded",
  "services": {
    "llm": "ok|fail",
    "tts": "ok|fail", 
    "sora": "ok|fail",
    "blob": "ok|fail",
    "backend": "ok|fail"
  },
  "timestamp": "2026-01-12T17:30:00.000Z"
}
```

### 2. Video Generation Endpoints

#### POST `/videos/generate`
**Descripción**: Generación de videos con múltiples opciones
**DTO**: `GenerateVideoDto`

**Payload Request**:
```json
{
  "prompt": {
    "subject": "Leon africano",
    "setting": "Sabana al atardecer",
    "action": "Caminando majestuosamente",
    "style": "Cinematográfico",
    "camera": "Wide shot"
  },
  "useVoice": true,
  "useSubtitles": true,
  "useMusic": false,
  "useSora": true,
  "plan": "pro",
  "n_seconds": 15
}
```

**Response Success**:
```json
{
  "success": true,
  "message": "Medios generados exitosamente",
  "result": {
    "userId": "user123",
    "timestamp": 1749740000000,
    "videoUrl": "https://storage/videos/video_123.mp4",
    "fileName": "sora_video_123.mp4",
    "soraJobId": "job_456",
    "generationId": "gen_789",
    "audioUrl": "https://storage/audio/audio_123.mp3",
    "script": "Texto narrativo generado...",
    "duration": 15,
    "plan": "pro"
  }
}
```

#### POST `/videos/generate` (Sora Controller)
**Descripción**: Endpoint específico para generación con Sora
**Requisito**: `useSora: true`

### 3. Audio Generation Endpoints

#### POST `/audio/generate`
**Descripción**: Generación de audio narrativo con TTS
**DTO**: `GenerateAudioDto`

**Payload Request**:
```json
{
  "prompt": "Explica en 30 segundos cómo funciona la energía solar",
  "duration": 30
}
```

**Response**:
```json
{
  "success": true,
  "message": "🎧 Audio generado con éxito",
  "result": {
    "script": "Texto narrativo generado por IA...",
    "duration": 30,
    "filename": "audio_1234567890.mp3",
    "blobUrl": "https://storage/audio/audio_1234567890.mp3",
    "generationId": "gen_xyz123",
    "userId": "user123",
    "timestamp": 1749740000000
  }
}
```

### 4. Image Generation Endpoints

#### POST `/media/image`
**Descripción**: Generación de imágenes promocionales (DALL-E o FLUX)
**DTO**: `GeneratePromoImageDto`
**Features**: Upload de imagen de referencia + overlay de texto

**Payload Request**:
```json
{
  "prompt": "Zapato deportivo flotando sobre fondo futurista",
  "textOverlay": "¡Oferta Especial!",
  "plan": "PRO",
  "useFlux": true,
  "isJsonPrompt": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "✅ Imagen generada correctamente",
  "result": {
    "imageUrl": "https://storage/images/image_123.png",
    "filename": "generated_image_123.png",
    "prompt": "Prompt usado para generación"
  }
}
```

#### POST `/media/flux-image`
**Descripción**: Generación específica con modelo FLUX-1.1-pro
**DTO**: `GenerateFluxImageDto`

**Payload Request**:
```json
{
  "prompt": "A majestic lion in the savannah at sunset",
  "plan": "PRO",
  "size": "1024x1024",
  "isJsonPrompt": false,
  "negative_prompt": "blurry, low quality"
}
```

#### POST `/media/flux-kontext-image`
**Descripción**: Generación con FLUX.1-Kontext-pro (con imagen de referencia)
**DTO**: `GenerateFluxKontextImageDto`
**Features**: Upload de imagen de referencia + contexto

**Payload Request**:
```json
{
  "prompt": "Transform this landscape into a cyberpunk city",
  "plan": "PRO",
  "size": "1024x1024",
  "isJsonPrompt": false,
  "negative_prompt": "blurry, low quality"
}
```
*Multipart form-data con campo `referenceImage`*

### 5. LLM Endpoints

#### POST `/llm/generate-json`
**Descripción**: Mejora de prompts convirtiéndolos a JSON editable
**DTO**: `{ prompt: string, duration?: number, useJson?: boolean }`

**Request**:
```json
{
  "prompt": "Un león en la sabana",
  "duration": 15,
  "useJson": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Prompt JSON generado",
  "result": {
    "promptJson": "{\n  \"subject\": \"León africano\",\n  \"setting\": \"Sabana al atardecer\",\n  \"action\": \"Caminando majestuosamente\"\n}"
  }
}
```

---

## 📦 Estructuras de Datos (DTOs)

### GenerateVideoDto
```typescript
{
  prompt: Record<string, any> | string;  // Prompt JSON o string
  useVoice: boolean;                     // Incluir narración TTS
  useSubtitles: boolean;                 // Generar subtítulos
  useMusic: boolean;                     // Incluir música de fondo
  useSora: boolean;                      // Usar modelo Sora
  plan: 'free' | 'creator' | 'pro';     // Plan del usuario
  n_seconds?: number;                    // Duración en segundos (5-20)
}
```

### GenerateAudioDto
```typescript
{
  prompt: string;                        // Prompt base para audio
  duration?: 20 | 30 | 60;              // Duración en segundos
}
```

### GeneratePromoImageDto
```typescript
{
  prompt?: string;                       // Prompt para generación
  textOverlay?: string;                  // Texto a superponer
  plan: 'FREE' | 'CREATOR' | 'PRO';     // Plan del usuario
  useFlux?: boolean;                     // Usar FLUX en lugar de DALL-E
  isJsonPrompt?: boolean;                // Prompt ya en formato JSON
}
```

### GenerateFluxImageDto
```typescript
{
  prompt: string;                        // Prompt descriptivo
  plan: 'FREE' | 'CREATOR' | 'PRO';     // Plan del usuario
  size?: '1024x1024' | '1024x768' | '768x1024';
  isJsonPrompt?: boolean;                // Prompt en formato JSON
  negative_prompt?: string;              // Elementos a excluir
}
```

### Queue Message Structures

#### QueueVideoMessage
```typescript
{
  jobId: string;           // ID del job en Sora
  audioId: number;         // ID del audio generado
  script: string;          // Libreto generado
  prompt?: string;         // Prompt original
  n_seconds?: number;      // Duración del video
  narration?: boolean;     // Incluir narración
  subtitles?: boolean;     // Incluir subtítulos
}
```

---

## ⚙️ Flujo de Procesamiento Detallado

### 1. Generación de Video (Con Cola)
```
1. Cliente → POST /videos/generate
2. Controller valida DTO y envía a Sora
3. Sora devuelve jobId
4. ServiceBusService envía mensaje a cola 'video'
5. VideoQueueConsumerService recibe mensaje
6. Procesa assets (descarga video, genera audio/subtítulos)
7. Sube a Azure Blob Storage
8. Retorna URLs finales
```

### 2. Generación de Imagen (Con Cola)
```
1. Cliente → POST /media/image
2. Controller procesa upload + DTO
3. ServiceBusService envía mensaje a cola 'promo-image-queue'
4. PromoImageQueueConsumerService recibe mensaje
5. Genera imagen con servicio correspondiente
6. Notifica backend principal para registro en galería
```

### 3. Generación de Audio Directa
```
1. Cliente → POST /audio/generate
2. Controller llama directamente a AzureTTSService
3. Genera audio y sube a Blob Storage
4. Retorna URL inmediatamente
```

---

## 🔧 Configuración de Variables de Entorno

### Azure Service Bus
```
AZURE_SERVICE_BUS_CONNECTION=Endpoint=sb://...
AZURE_SERVICE_BUS_QUEUE=video
AZURE_SERVICE_BUS_QUEUE_IMAGE=promo-image-queue
```

### Azure OpenAI Services
```
AZURE_OPENAI_GPT_URL=https://...
AZURE_OPENAI_KEY=******
AZURE_TTS_ENDPOINT=https://...
AZURE_TTS_KEY=******
AZURE_SORA_URL=https://...
AZURE_SORA_API_KEY=******
```

### Azure Storage
```
AZURE_STORAGE_ACCOUNT_NAME=mystorageaccount
AZURE_STORAGE_KEY=******
AZURE_STORAGE_CONTAINER=media-files
```

### Backend Integration
```
MAIN_BACKEND_URL=http://localhost:3001
PORT=4000
NODE_ENV=production
```

---

## 📊 Monitoreo y Logging

### Niveles de Log
- **Logger NestJS** para todos los servicios
- **Log detallado** de procesos de generación
- **Error tracking** con mensajes específicos
- **Performance metrics** implícitos en logs

### Health Checks
- **Basic**: `/health` - Verificación rápida
- **Full**: `/health?check=full` - Verificación completa de servicios:
  - LLM (GPT)
  - TTS (Text-to-Speech)
  - Sora (Video generation)
  - Blob Storage
  - Backend connectivity

---

## 🛡️ Seguridad y Validación

### Validación de DTOs
- **class-validator** para todas las entradas
- **Transformación automática** de tipos
- **Whitelist validation** (solo campos permitidos)
- **Validación de planes** (FREE/CREATOR/PRO)

### Manejo de Errores
- **HttpExceptions** estandarizadas
- **Safe error messages** en logs
- **Retry mechanisms** en consumidores de cola
- **Dead letter queues** para mensajes fallidos persistentes

---

## 🚀 Deployment y Escalabilidad

### Azure Infrastructure
- **App Service** para hosting
- **Service Bus** para mensajería
- **Blob Storage** para almacenamiento de medios
- **Auto-scaling** basado en carga

### Consideraciones de Performance
- **Procesamiento asíncrono** mediante colas
- **Retry logic** para tolerancia a fallos
- **Connection pooling** para servicios externos
- **Caching implícito** en Blob Storage

---

## 📈 Métricas y Observabilidad

### Métricas Disponibles
- Tiempo de procesamiento por tipo de contenido
- Tasa de éxito/fallo en generaciones
- Latencia de colas de mensajes
- Uso de recursos por plan de usuario

### Logging Estratégico
- Identificadores únicos por request
- Timestamps precisos
- Contexto de usuario y operación
- Resultados de health checks

---

*Informe generado automáticamente - Sistema Video Generator v1.0*