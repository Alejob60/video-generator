# Guía de Integración para el Backend Principal

## Propósito del Documento

Este documento proporciona instrucciones claras para que el backend principal se integre correctamente con el microservicio de generación de video. Detalla cómo y cuándo usar cada endpoint, el formato de los datos y las mejores prácticas para manejar solicitudes de manera eficiente.

## Arquitectura de Integración

```
[Frontend] → [Backend Principal] → [Microservicio Video Generator]
              ↑                        ↑
         Encola solicitudes      Procesa solicitudes
         en Service Bus          de forma asíncrona
```

## Endpoints del Microservicio

### 1. Health Check Endpoints

#### GET `/status`
**Propósito**: Verificación rápida del estado del servicio

**Cuándo usar**: 
- Monitoreo de salud del servicio
- Verificaciones periódicas de disponibilidad

**Respuesta esperada**:
```json
{
  "status": "online",
  "timestamp": "2025-10-15T20:30:45.123Z",
  "service": "video-generator",
  "version": "1.0.0"
}
```

#### GET `/health`
**Propósito**: Verificación del estado del servicio (básica por defecto, completa opcional)

**Parámetros**:
- `check` (opcional): 
  - Sin parámetro o cualquier valor excepto "full": Devuelve estado básico (rápido)
  - `check=full`: Realiza verificación completa de todos los servicios dependientes (más lento)

**Cuándo usar**:
- Para verificaciones rápidas: Usar sin parámetros o con `check=basic`
- Para diagnóstico de problemas de conectividad: Usar con `check=full`
- Verificaciones de salud detalladas: Usar con `check=full`

**Respuesta básica esperada**:
```
{
  "status": "online",
  "timestamp": "2025-10-15T20:30:45.123Z",
  "service": "video-generator",
  "version": "1.0.0",
  "note": "For full health check, use ?check=full parameter"
}
```

**Respuesta completa esperada**:
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
**Propósito**: Generar videos de manera síncrona

**Cuándo usar**:
- **NO RECOMENDADO** para solicitudes directas de usuarios
- **RECOMENDADO** solo para pruebas o procesos internos no críticos

**Payload requerido**:
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

**Respuesta**:
```json
{
  "success": true,
  "message": "Medios generados exitosamente",
  "result": {
    "userId": "admin",
    "timestamp": 1702672245123,
    "videoUrl": "https://storage-url/video.mp4?sas-token",
    "duration": 10,
    "plan": "free",
    "fileName": "video.mp4",
    "soraJobId": "job-123",
    "generationId": "gen-456",
    "audioUrl": "https://storage-url/audio.mp3?sas-token",
    "script": "Texto narrado"
  }
}
```

## Integración Recomendada con Colas

### ¿Por qué usar colas?

1. **Escalabilidad**: Maneja picos de tráfico sin sobrecargar el servicio
2. **Tolerancia a fallos**: Reintenta automáticamente mensajes fallidos
3. **Experiencia de usuario**: Respuestas inmediatas al frontend
4. **Procesamiento asíncrono**: Permite operaciones largas sin bloquear

### Proceso de Integración Recomendado

#### Paso 1: Recibir solicitud del frontend
```
// Ejemplo en Express.js
app.post('/api/video/generate', async (req, res) => {
  const { prompt, options } = req.body;
  const userId = req.user.id;
  
  // Validación básica
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt requerido' });
  }
  
  // Continuar con el paso 2...
});
```

#### Paso 2: Encolar en Azure Service Bus
```
// Enviar mensaje a la cola 'video'
const message = {
  userId: userId,
  prompt: prompt,
  options: options,
  timestamp: Date.now(),
  requestId: uuidv4() // Para seguimiento
};

await serviceBusService.sendVideoJobMessage(message);
```

#### Paso 3: Responder inmediatamente al frontend
```
res.status(202).json({
  message: 'Solicitud de video en proceso',
  requestId: message.requestId,
  statusUrl: `/api/video/status/${message.requestId}`
});
```

#### Paso 4: Implementar endpoint de seguimiento (opcional)
```
app.get('/api/video/status/:requestId', async (req, res) => {
  const { requestId } = req.params;
  
  // Consultar estado del proceso (puede ser en base de datos)
  const status = await getVideoRequestStatus(requestId);
  
  res.json(status);
});
```

## Formato de Mensajes en Cola

### Para generación de videos
``json
{
  "userId": "identificador-del-usuario",
  "prompt": "Descripción detallada del video",
  "options": {
    "n_seconds": 10,
    "plan": "free",
    "useVoice": true,
    "useSubtitles": true,
    "useMusic": false
  },
  "timestamp": 1702672245123,
  "requestId": "uuid-único-para-seguimiento"
}
```

### Para generación de imágenes
``json
{
  "userId": "identificador-del-usuario",
  "prompt": "Descripción de la imagen a generar",
  "timestamp": 1702672245123,
  "requestId": "uuid-único-para-seguimiento"
}
```

## Manejo de Respuestas del Microservicio

### URLs con SAS
Todas las URLs devueltas por el microservicio incluyen tokens SAS para acceso directo:
``json
{
  "videoUrl": "https://storageaccount.blob.core.windows.net/videos/video.mp4?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2025-10-16T00:00:00Z&st=2025-10-15T00:00:00Z&spr=https&sig=token",
  "audioUrl": "https://storageaccount.blob.core.windows.net/audio/audio.mp3?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2025-10-16T00:00:00Z&st=2025-10-15T00:00:00Z&spr=https&sig=token"
}
```

### Procesamiento de resultados
Cuando el microservicio completa una tarea, puede:
1. Enviar una notificación webhook al backend principal
2. Guardar el resultado en base de datos
3. Enviar mensaje a otra cola para procesamiento posterior

## Variables de Entorno Requeridas

```env
# Azure Service Bus para encolar solicitudes
AZURE_SERVICE_BUS_CONNECTION=Endpoint=sb://realculutrebus.servicebus.windows.net/;...
AZURE_SERVICE_BUS_QUEUE=video
AZURE_SERVICE_BUS_QUEUE_IMAGE=imagen

# URL del microservicio de video
VIDEO_GENERATOR_URL=https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net

# URL del backend principal (para verificación de salud)
MAIN_BACKEND_URL=https://tu-backend-principal.azurewebsites.net
```

## Mejores Prácticas

### 1. Manejo de Errores
```javascript
try {
  await serviceBusService.sendVideoJobMessage(message);
  // Registrar éxito
} catch (error) {
  // Registrar error y posiblemente reintentar
  logger.error('Error al encolar solicitud de video:', error);
  
  // Opcional: Notificar al usuario si el error es crítico
  res.status(500).json({ error: 'Error al procesar la solicitud' });
}
```

### 2. Validación de Datos
```javascript
const validateVideoRequest = (data) => {
  if (!data.prompt || typeof data.prompt !== 'string') {
    throw new Error('Prompt inválido');
  }
  
  if (data.options && data.options.n_seconds) {
    if (typeof data.options.n_seconds !== 'number' || data.options.n_seconds < 1 || data.options.n_seconds > 60) {
      throw new Error('Duración inválida (1-60 segundos)');
    }
  }
  
  // Otras validaciones...
};
```

### 3. Seguimiento y Logging
```javascript
// Registrar cada paso del proceso
logger.info(`Solicitud de video recibida: ${requestId}`);
logger.info(`Video encolado: ${requestId}`);
logger.info(`Video procesado exitosamente: ${requestId}`);
```

## Ejemplo Completo de Integración

```
// Ruta principal para generar videos
app.post('/api/video/generate', async (req, res) => {
  try {
    const { prompt, options } = req.body;
    const userId = req.user?.id || 'anonymous';
    const requestId = uuidv4();
    
    // Validación
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt requerido' });
    }
    
    // Crear mensaje para la cola
    const message = {
      userId,
      prompt,
      options: {
        n_seconds: options?.n_seconds || 10,
        plan: options?.plan || 'free',
        useVoice: options?.useVoice || false,
        useSubtitles: options?.useSubtitles || false,
        useMusic: options?.useMusic || false
      },
      timestamp: Date.now(),
      requestId
    };
    
    // Encolar solicitud
    await serviceBusService.sendVideoJobMessage(message);
    
    // Registrar en base de datos para seguimiento
    await saveVideoRequest(message);
    
    // Responder inmediatamente
    res.status(202).json({
      message: 'Video en proceso de generación',
      requestId,
      statusUrl: `/api/video/status/${requestId}`,
      estimatedTime: '2-5 minutos'
    });
    
  } catch (error) {
    logger.error('Error al procesar solicitud de video:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
```

## Troubleshooting

### Problemas Comunes

1. **Health check fallando**: 
   - Verificar que el backend principal tenga endpoint `/ping`
   - Confirmar conectividad de red entre servicios

2. **Mensajes en cola no procesados**:
   - Revisar logs del microservicio
   - Verificar formato de mensajes
   - Confirmar conectividad con Service Bus

3. **URLs sin acceso**:
   - Asegurar que todas las URLs incluyan tokens SAS
   - Verificar permisos en Azure Storage

## Contacto y Soporte

Para problemas de integración, contactar al equipo de desarrollo del microservicio de video.