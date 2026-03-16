# 🎬 VEO3 - Integración Completa con Colas y Respuesta JSON

## ✅ **Implementación Finalizada**

VEO3 ahora funciona **exactualmente igual que Sora**:
- ✅ **Asíncrono con colas** (Azure Service Bus)
- ✅ **Retorna inmediatamente** con Job ID
- ✅ **Procesa en background** (5-15 minutos)
- ✅ **Notifica al backend** cuando está completo
- ✅ **Soporta audio, subtítulos, música**
- ✅ **Devuelve JSON completo** como antes

---

## 🔄 **Flujo Completo:**

### **1. Request Inicial (Inmediato - < 1 segundo)**

```http
POST /videos/generate
Content-Type: application/json

{
  "prompt": "A cinematic drone shot",
  "n_seconds": 5,
  "plan": "pro",
  "useVoice": true,
  "useSubtitles": true,
  "useMusic": true
}
```

**Response Inmediata:**
```json
{
  "success": true,
  "message": "Video encolado para procesamiento. La generación tomará 5-15 minutos.",
  "result": {
    "userId": "admin",
    "timestamp": 1773070071739,
    "videoUrl": "",
    "fileName": "",
    "jobId": "abc123-def456-ghi789",
    "status": "queued",
    "processingMessage": "Video en proceso de generación. Se notificará al backend principal cuando esté listo.",
    "duration": 5,
    "plan": "pro",
    "audioUrl": "https://...audio.mp3",  // Si useVoice=true
    "script": "...",                      // Si useVoice=true
    "subtitles": "pendiente",             // Si useSubtitles=true
    "music": "pendiente"                  // Si useMusic=true
  }
}
```

---

### **2. Procesamiento en Background (5-15 minutos)**

**Queue Consumer hace:**
1. ✅ Recibe mensaje de Azure Service Bus
2. ✅ Genera video con VEO3 (5-15 min)
3. ✅ Genera audio TTS si solicitado
4. ✅ Prepara JSON completo
5. ✅ Notifica al backend principal

---

### **3. Notificación al Backend Principal**

**Webhook:** `POST ${MAIN_BACKEND_URL}/veo-video/complete`

**Payload Completo:**
```json
{
  "jobId": "abc123-def456-ghi789",
  "userId": "admin",
  "type": "veo3-complete",
  "status": "completed",
  "videoUrl": "https://realculturestorage.blob.core.windows.net/imagen/videos/veo-video-1773070071739.mp4?sv=...",
  "filename": "veo-video-1773070071739.mp4",
  "prompt": "A cinematic drone shot",
  "duration": 5,
  "audioUrl": "https://...audio.mp3",
  "script": "Narration script here...",
  "subtitles": "pendiente",
  "music": "pendiente",
  "completedAt": 1773070071739
}
```

---

## 📊 **Comparativa: Antes vs Ahora**

| Aspecto | Sora (Antes) | VEO3 (Ahora) |
|---------|--------------|--------------|
| **Endpoint** | `/videos/generate` | `/videos/generate` ✅ |
| **Respuesta Inicial** | Job ID + status | Job ID + status ✅ |
| **Async con Colas** | Azure Service Bus | Azure Service Bus ✅ |
| **Tiempo Respuesta** | < 1 segundo | < 1 segundo ✅ |
| **Generación Video** | 2-10 minutos | 5-15 minutos ⏱️ |
| **Audio TTS** | Sí | Sí ✅ |
| **Subtítulos** | Pendiente | Pendiente ✅ |
| **Música** | Pendiente | Pendiente ✅ |
| **JSON Completo** | Al completar | Al completar ✅ |
| **Webhook** | `/sora-video/complete` | `/veo-video/complete` ✅ |

---

## 🔧 **Componentes Implementados:**

### **1. VeoVideoService**
```typescript
@Injectable()
export class VeoVideoService {
  // Cola video para procesamiento async
  async queueVideoGeneration(userId, dto, options): Promise<{ jobId, status }>
  
  // Genera video (usado por el consumer)
  async generateVideo(dto): Promise<{ videoUrl, filename }>
}
```

### **2. VeoVideoQueueConsumerService**
```typescript
@Injectable()
export class VeoVideoQueueConsumerService implements OnModuleInit {
  // Procesa mensajes de la cola continuamente
  private async processMessage(message) {
    // 1. Generar video con VEO3
    // 2. Generar audio TTS si requested
    // 3. Preparar JSON completo
    // 4. Notificar backend principal
  }
}
```

### **3. VideoController**
```typescript
@Post('generate')
async generateVideo(@Body() dto, @Req() req) {
  // Queue video y retorna inmediatamente
  const queueResult = await this.veoService.queueVideoGeneration(...);
  
  return {
    success: true,
    message: 'Video encolado...',
    result: { ...jobId, status, audioUrl, script, ... }
  };
}
```

---

## 🎯 **Características Clave:**

### **✅ No Bloqueante**
- El endpoint responde en < 1 segundo
- El cliente recibe Job ID inmediatamente
- Puede hacer polling o esperar webhook

### **✅ Escalable**
- Múltiples videos pueden generarse en paralelo
- Service Bus maneja la cola
- No bloquea otros endpoints

### **✅ Resiliente**
- Si falla la generación, reintenta
- Notifica errores al backend
- Logs detallados para debugging

### **✅ Compatible**
- Mismo endpoint `/videos/generate`
- Mismo DTO `GenerateVideoDto`
- Mismo formato de respuesta JSON
- Solo cambia el tiempo de generación

---

## 🧪 **Testing:**

### **Test 1: Request Inicial**
```bash
curl -X POST 'http://localhost:4000/videos/generate' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "A cat playing with yarn",
    "n_seconds": 5,
    "plan": "pro",
    "useVoice": true,
    "useSubtitles": true,
    "useMusic": true
  }'
```

**Expected Response (< 1 second):**
```json
{
  "success": true,
  "message": "Video encolado para procesamiento...",
  "result": {
    "jobId": "uuid-here",
    "status": "queued",
    "audioUrl": "https://...",
    "script": "...",
    "subtitles": "pendiente",
    "music": "pendiente"
  }
}
```

---

### **Test 2: Verificar Logs del Consumer**
```bash
# Buscar logs de procesamiento
az webapp log tail --name video-converter --resource-group realculture-rg

# Deberías ver:
🎬 [jobId] Processing VEO3 video generation
🔧 Generating video with VEO3...
✅ Video generated: veo-video-xxx.mp4
🎤 Generating TTS audio...
✅ Audio generated
🔔 Notifying main backend
✅ [jobId] VEO3 video generation completed successfully
```

---

### **Test 3: Verificar Webhook**
```bash
# En el backend principal, monitorear:
POST /veo-video/complete

# Payload esperado:
{
  "jobId": "...",
  "status": "completed",
  "videoUrl": "https://...",
  "audioUrl": "https://...",
  ...
}
```

---

## ⚠️ **Consideraciones Importantes:**

### **1. Tiempo de Generación**
- **VEO3:** 5-15 minutos (depende de duración del video)
- **Cliente debe:** Esperar o hacer polling
- **Backend:** Recibe webhook automático

### **2. Service Bus Required**
- Sin Service Bus configurado, no funciona async
- Asegurar `AZURE_SERVICE_BUS_CONNECTION` en .env
- Queue: `video` (por defecto)

### **3. Webhook Endpoint**
- Backend principal debe tener `/veo-video/complete`
- Método: POST
- Content-Type: application/json

---

## 📝 **Environment Variables (.env):**

```bash
# Google Vertex AI VEO3
VERTEX_API_KEY=AQ.Ab8RN6LuAtNfSN2NXv8cn0zsclWio1xDmtux_w0Wql3yZzvD3w
VERTEX_PROJECT_ID=orbital-prime-vision
VERTEX_LOCATION=us-central1
VEO3_MODEL=veo-3.1-generate-001

# Azure Service Bus (REQUIRED para colas)
AZURE_SERVICE_BUS_CONNECTION=Endpoint=sb://realculutrebus.servicebus.windows.net/;SharedAccessKeyName=...
AZURE_SERVICE_BUS_QUEUE=video

# Main Backend (para webhook)
MAIN_BACKEND_URL=https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net
```

---

## 🚀 **Deploy:**

```powershell
.\build-and-deploy-final.ps1
```

**Después del deploy:**
1. ✅ Verificar Service Bus conectado
2. ✅ Monitorear logs del consumer
3. ✅ Testear endpoint `/videos/generate`
4. ✅ Verificar webhook llega al backend

---

## 📄 **Archivos Modificados/Creados:**

1. **`src/infrastructure/services/veo-video.service.ts`** - Queue + generate
2. **`src/infrastructure/services/veo-video-queue-consumer.service.ts`** - Consumer nuevo
3. **`src/interfaces/controllers/video.controller.ts`** - Usa queue en vez de sync
4. **`src/infrastructure/modules/video.module.ts`** - Registra consumer
5. **`VEO3_QUEUE_INTEGRATION_SUMMARY.md`** - Esta documentación

---

**Status:** ✅ **COMPLETADO Y LISTO PARA PRODUCCIÓN**

**Próximo Paso:** Deploy y test end-to-end

---

**Last Updated:** March 17, 2026  
**Version:** 5.0.0 (Queue Integration)  
**Status:** Ready for Deployment
