# Infraestructura del Microservicio de Generación de Video

## Arquitectura General

Este microservicio está diseñado para manejar la generación completa de videos con los siguientes componentes:

```
[Frontend] → [Backend Principal] → [Microservicio Video Generator] → [Azure Services]
                                    ↑
                              [Cola Service Bus]
```

## Componentes Clave

1. **Microservicio Video Generator** (este servicio)
   - Desplegado en Azure App Service (Linux, Node.js 20 LTS)
   - Contenerizado con Docker
   - Registro en Azure Container Registry (realcultureacr)

2. **Azure Service Bus**
   - Cola `video` para procesamiento asíncrono de videos
   - Cola `imagen` para procesamiento de imágenes

3. **Servicios Azure Integrados**
   - Azure OpenAI (GPT-4, DALL-E, TTS)
   - Azure Blob Storage (almacenamiento de videos, audios, imágenes)
   - Sora Video Generator (servicio externo)

## Endpoints Activos

### 1. Health Check Endpoints

#### GET `/status`
Verificación básica del servicio

**Respuesta:**
```json
{
  "status": "online",
  "timestamp": "2025-10-15T20:30:45.123Z",
  "service": "video-generator",
  "version": "1.0.0"
}
```

#### GET `/health`
Verificación completa de todos los servicios dependientes

**Respuesta:**
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
  "timestamp": "2025-10-15T20:30:45.123Z"
}
```

### 2. Video Generation Endpoint

#### POST `/videos/generate`

**Payload requerido:**
```json
{
  "prompt": "Descripción detallada del video a generar",
  "n_seconds": 10,
  "plan": "free|creator|pro",
  "useVoice": true,
  "useSubtitles": true,
  "useMusic": false
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Medios generados exitosamente",
  "result": {
    "userId": "admin",
    "timestamp": 1702672245123,
    "videoUrl": "https://storage-url/video.mp4",
    "duration": 10,
    "plan": "free",
    "fileName": "video.mp4",
    "soraJobId": "job-123",
    "generationId": "gen-456",
    "audioUrl": "https://storage-url/audio.mp3",
    "script": "Texto narrado"
  }
}
```

## Procesamiento Asíncrono con Colas

### ¿Cuándo se usan las colas?

1. **Desde el Backend Principal**: Cuando se envían solicitudes de generación de video
2. **Interno**: Para procesar videos generados por Sora y agregar narración/subtítulos

### Formato de mensajes en cola (video)

```json
{
  "jobId": "identificador-único-del-job-en-sora",
  "audioId": 1702672245123,
  "script": "Texto narrado",
  "prompt": "Prompt original",
  "n_seconds": 10,
  "narration": true,
  "subtitles": true
}
```

## Manejo de Carga y Escalabilidad

### ¿El backend principal debe encolar?

**Sí**, se recomienda que el backend principal encole las solicitudes de video por las siguientes razones:

1. **Evitar sobrecarga**: El endpoint `/videos/generate` realiza operaciones síncronas que pueden tardar varios segundos
2. **Mejor experiencia de usuario**: Las respuestas inmediatas mejoran la UX
3. **Tolerancia a fallos**: Los mensajes en cola se procesan reintentando automáticamente

### Proceso recomendado para el backend principal:

1. Recibir solicitud del frontend
2. Validar datos básicos
3. Encolar en Service Bus cola `video`
4. Responder inmediatamente al frontend con "procesando"
5. El microservicio video-generator procesa el mensaje de la cola

## Verificación de Salud del Backend Principal

El endpoint `/health` verifica la conectividad con el backend principal:

1. Hace una solicitud GET a `MAIN_BACKEND_URL/ping`
2. Espera una respuesta HTTP 200
3. Marca el servicio como "ok" si recibe respuesta exitosa

**Para solucionar el fallo de verificación:**

1. Asegúrese de que el backend principal tenga un endpoint `/ping` que responda con HTTP 200
2. Verifique que `MAIN_BACKEND_URL` en las variables de entorno apunte a la URL correcta
3. Confirme que no haya restricciones de red entre los servicios

## Variables de Entorno Requeridas

```env
# Azure Service Bus
AZURE_SERVICE_BUS_CONNECTION=Endpoint=sb://...
AZURE_SERVICE_BUS_QUEUE=video
AZURE_SERVICE_BUS_QUEUE_IMAGE=imagen

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
AZURE_STORAGE_ACCOUNT_NAME=realculturestorage
AZURE_STORAGE_KEY=...

# Azure OpenAI
AZURE_OPENAI_KEY=...
AZURE_OPENAI_GPT_URL=...
AZURE_TTS_KEY=...
AZURE_TTS_ENDPOINT=...

# Sora Service
SORA_VIDEO_URL=https://sora-video-creator-ekf5hkfvbfebbuf6.canadacentral-01.azurewebsites.net

# Backend Principal
MAIN_BACKEND_URL=https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net
```