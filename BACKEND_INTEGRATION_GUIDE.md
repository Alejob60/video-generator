# 🎬 Guía de Integración para el Backend Principal: Módulo de Influencers

## 📋 Descripción General

Se ha implementado un nuevo módulo de "Talking Avatars" (influencers) en el microservicio `video-generator`. Este módulo permite generar videos donde un avatar habla siguiendo un script proporcionado.

## 🚀 Nuevo Endpoint Disponible

### Endpoint
```
POST http://[video-generator-url]/media/influencer
```

### Headers Requeridos
```json
{
  "Content-Type": "application/json"
}
```

### Payload de Solicitud
```json
{
  "imageUrl": "https://storage.example.com/avatars/influencer1.jpg",
  "script": "Hola, soy tu asistente virtual y hoy te hablaré sobre inteligencia artificial...",
  "voiceId": "nova",
  "plan": "pro"
}
```

### Descripción de Campos
- `imageUrl` (string, requerido): URL pública de la imagen del rostro del influencer
- `script` (string, requerido, min 10 caracteres): Texto que el influencer debe decir
- `voiceId` (string, requerido): ID de la voz a utilizar (ej: "nova", "jenny", "david")
- `plan` (string, requerido): Plan del usuario ("free" o "pro")

## 📨 Respuesta Exitosa
```json
{
  "success": true,
  "message": "Influencer video generation initiated successfully",
  "statusCode": 201,
  "result": {
    "jobId": "job_inf_123456789",
    "userId": "user123",
    "timestamp": 1749740000000
  }
}
```

## 🔔 Notificación al Backend Principal

Una vez que el video de influencer se ha generado completamente (después del procesamiento en cola), el microservicio enviará una notificación POST al backend principal:

### Endpoint de Notificación
```
POST http://[main-backend-url]/media/register-influencer-video
```

### Payload de Notificación
```json
{
  "videoUrl": "https://fake-azure-storage/influencer_result_job_inf_123456789.mp4",
  "jobId": "job_inf_123456789",
  "userId": "user123",
  "imageUrl": "https://storage.example.com/avatars/influencer1.jpg",
  "script": "Hola, soy tu asistente virtual...",
  "voiceId": "nova",
  "plan": "pro",
  "timestamp": 1749740000000,
  "status": "completed",
  "duration": 30,
  "resolution": "1080p"
}
```

## 🔧 Pasos para Integración en el Backend Principal

### 1. Crear el Endpoint de Recepción
Implementar el endpoint `POST /media/register-influencer-video` en el backend principal para recibir las notificaciones.

### 2. Validar el Payload
Verificar que los campos requeridos estén presentes en la notificación:
- `videoUrl`
- `jobId`
- `userId`
- `status`

### 3. Registrar en la Base de Datos
Guardar la información del video generado en la tabla correspondiente de videos de influencers.

### 4. Actualizar Galería del Usuario
Agregar el video generado a la galería del usuario (`userId`) para que sea accesible desde la interfaz.

### 5. Control de Créditos
Dependiendo del `plan` del usuario, aplicar la deducción correspondiente de créditos si aplica.

## 🛡️ Manejo de Errores

### Posibles Errores de Solicitud
- `400 Bad Request`: Campos faltantes o inválidos
- `401 Unauthorized`: Autenticación fallida
- `500 Internal Server Error`: Error interno en el microservicio

### Manejo de Colas
- El endpoint responde rápidamente (201 Created)
- El procesamiento pesado ocurre en segundo plano
- Tiempo estimado de procesamiento: 5-10 segundos

## ⚙️ Variables de Configuración

Las siguientes variables de entorno se han agregado al microservicio:
- `AZURE_SERVICE_BUS_QUEUE_INFLUENCER`: Nombre de la cola de influencers
- `MOCK_INFLUENCER_API_URL`: URL de la API simulada de influencers
- `MOCK_INFLUENCER_API_KEY`: Clave de la API simulada

## 🔁 Proceso Completo

1. El frontend/envío externo llama a `POST /media/influencer`
2. El microservicio responde inmediatamente con el `jobId`
3. El trabajo se encola en Azure Service Bus
4. Un worker procesa el video (simulando 5 segundos de renderizado)
5. El microservicio notifica al backend principal en `POST /media/register-influencer-video`
6. El backend principal registra el video y actualiza la galería del usuario

## 🧪 Prueba de Integración

Para probar la integración, puedes hacer una solicitud de ejemplo:

```bash
curl -X POST "http://[video-generator-url]/media/influencer" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/avatar.jpg",
    "script": "Este es un mensaje de prueba para el video de influencer.",
    "voiceId": "nova",
    "plan": "free"
  }'
```

## 📞 Soporte

Para cualquier problema con la integración, revisar los logs del microservicio en Azure App Service y confirmar que el endpoint de notificación en el backend principal esté disponible y devuelva un código 200 OK.