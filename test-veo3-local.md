# 🧪 Test del Endpoint VEO3 - Local

## ✅ **Aplicación Iniciada Correctamente**

```
[Nest] 13576  - 16/03/2026, 6:37:12 p. m.     LOG [AppModule] ✅ Módulo principal inicializado correctamente.
🎬 Microservicio de video escuchando en http://localhost:8080
```

### **Rutas Mapeadas:**
- ✅ `POST /videos/generate` - Video generation endpoint
- ✅ `GET /videos/health` - Health check
- ✅ Todos los demás endpoints intactos

---

## 📋 **Test 1: Verificar que el endpoint no se dañó**

### **Request:**
```bash
curl -X POST 'http://localhost:8080/videos/generate' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "A cat playing with yarn",
    "n_seconds": 5,
    "plan": "pro",
    "useVoice": false,
    "useSubtitles": false,
    "useMusic": false
  }'
```

### **Expected Response (Inmediata - < 1 segundo):**
```json
{
  "success": true,
  "message": "Video encolado para procesamiento. La generación tomará 5-15 minutos.",
  "result": {
    "userId": "admin",
    "timestamp": 1773070071739,
    "videoUrl": "",
    "fileName": "",
    "jobId": "uuid-here",
    "status": "queued",
    "processingMessage": "Video en proceso de generación. Se notificará al backend principal cuando esté listo.",
    "duration": 5,
    "plan": "pro"
  }
}
```

---

## 🔍 **Verificaciones:**

### **✅ Endpoints No Afectados:**

1. **FLUX Kontext Image:**
   ```bash
   curl -X POST 'http://localhost:8080/media/flux-kontext/image' \
     -H 'Content-Type: application/json' \
     -d '{"prompt": "A sunset"}'
   ```

2. **FLUX Kontext Image with Reference:**
   ```bash
   curl -X POST 'http://localhost:8080/media/flux-kontext/image-with-reference' \
     -F 'prompt=A red fox' \
     -F 'referenceImage=@image.png'
   ```

3. **DALL-E Image:**
   ```bash
   curl -X POST 'http://localhost:8080/media/image' \
     -H 'Content-Type: application/json' \
     -d '{"prompt": "A sunset"}'
   ```

4. **Audio Generation:**
   ```bash
   curl -X POST 'http://localhost:8080/audio/generate' \
     -H 'Content-Type: application/json' \
     -d '{"script": "Hello world"}'
   ```

5. **Health Check:**
   ```bash
   curl 'http://localhost:8080/status'
   # Expected: {"status": "ok", "timestamp": ...}
   ```

---

## 📊 **Logs Esperados:**

### **Cuando se llama al endpoint:**
```
🎬 [admin] Iniciando generación con duración=5s y plan=pro
📤 Enviando solicitud a VEO3 con payload: {...}
🎬 [admin] Queueing VEO3 video generation
✅ Video generation queued - Job ID: abc123-def456
✅ Video queued correctly - Job ID: abc123-def456
```

### **Consumer procesando (5-15 min después):**
```
🎬 [abc123] Processing VEO3 video generation for user: admin
🔧 Generating video with VEO3...
✅ Video generated: veo-video-xxx.mp4
🔔 Notifying main backend
✅ [abc123] VEO3 video generation completed successfully
```

---

## ⚠️ **Notas Importantes:**

1. **Service Bus Required**: Sin Azure Service Bus configurado, el endpoint fallará
2. **VERTEX_API_KEY**: Necesaria para VEO3
3. **MAIN_BACKEND_URL**: Necesaria para webhook de completado

---

**Status:** ✅ Application running on http://localhost:8080  
**Ready for Testing:** Yes  
**Endpoints Affected:** None (all preserved)  
**VEO3 Integration:** Async with queues
