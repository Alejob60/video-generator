# 🎬 VEO3 - Cómo Obtener el URL del Video

## ⏱️ **Timeline de Generación:**

```
┌─────────────────┬──────────────┬──────────────────┬─────────────────┐
│  T = 0 segundos │ T = 2-10 min │ T = 10-15 min    │ T = 15+ min     │
├─────────────────┼──────────────┼──────────────────┼─────────────────┤
│ POST /videos/  │ VEO3         │ Video generado   │ Backend recibe  │
│ generate        │ procesando   │ y subido a Blob │ webhook         │
└─────────────────┴──────────────┴──────────────────┴─────────────────┘
      ↓                    ↓                ↓                ↓
 Response: jobId      Logs:           Logs:          Backend:
 queued             "Generating..."  "Complete!"    /veo-video/complete
```

---

## 📋 **Paso 1: Llamar al Endpoint**

```bash
curl -X POST 'http://localhost:8080/videos/generate' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "A cat playing with yarn",
    "n_seconds": 5,
    "plan": "pro",
    "useVoice": false,
    "useSubtitles": false,
    "useMusic": false,
    "useSora": false
  }'
```

**Response Inmediata:**
```json
{
  "jobId": "2bdbb4e2-ff26-4d79-987e-df9c3f8e7af8",
  "status": "queued",
  "videoUrl": "",  // ⏳ Aún no está listo
  "processingMessage": "Video en proceso de generación..."
}
```

---

## ⏳ **Paso 2: Esperar 5-15 Minutos**

Mientras tanto, el consumer está procesando:

```bash
# Ver logs en tiempo real
tail -f logs/app.log

# O ver terminal donde corre NestJS
[Nest] LOG [VeoVideoQueueConsumerService] 🎬 [2bdbb4e2] Processing VEO3 video generation
[Nest] LOG [VeoVideoQueueConsumerService] 🔧 Generating video with VEO3...
# ⏱️ Esperando 5-15 minutos...
[Nest] LOG [VeoVideoQueueConsumerService] ✅ Video generated: veo-video-xxx.mp4
[Nest] LOG [VeoVideoQueueConsumerService] 🔔 Notifying main backend
```

---

## ✅ **Paso 3: Video Completado**

### **Cuando el video está listo, el consumer hace:**

1. ✅ Genera video con VEO3 (5-15 min)
2. ✅ Guarda video temporalmente
3. ✅ Sube a Azure Blob Storage
4. ✅ Envía webhook al backend principal

### **Webhook al Backend:**

```http
POST ${MAIN_BACKEND_URL}/veo-video/complete
Content-Type: application/json

{
  "jobId": "2bdbb4e2-ff26-4d79-987e-df9c3f8e7af8",
  "userId": "admin",
  "type": "veo3-complete",
  "status": "completed",
  
  "videoUrl": "https://realculturestorage.blob.core.windows.net/videos/veo-video-1773704385327.mp4?sv=2021-06-08&st=2026-03-17T00%3A00%3A00Z&se=2026-03-17T01%3A00%3A00Z&sr=b&sp=r&sig=ABC123",
  "filename": "veo-video-1773704385327.mp4",
  "prompt": "A cat playing with yarn",
  "duration": 5,
  
  "completedAt": 1773704385327
}
```

---

## 🔍 **¿Dónde Está el URL del Video?**

### **En el Backend Principal:**

El backend principal recibe el webhook en:
```
POST /veo-video/complete
```

**Payload completo:**
```json
{
  "jobId": "2bdbb4e2-ff26-4d79-987e-df9c3f8e7af8",
  "status": "completed",
  "videoUrl": "https://realculturestorage.blob.core.windows.net/videos/veo-video-xxx.mp4?sv=...",
  "filename": "veo-video-xxx.mp4",
  "prompt": "A cat playing with yarn",
  "duration": 5,
  "audioUrl": "...",  // Si se solicitó audio
  "script": "...",    // Si se solicitó audio
  "subtitles": "pendiente",
  "music": "pendiente",
  "completedAt": 1773704385327
}
```

---

## 🧪 **Test End-to-End Completo:**

### **Script de PowerShell:**

```powershell
# Paso 1: Iniciar generación
$payload = @{
    prompt = "A cat playing with yarn"
    n_seconds = 5
    plan = "pro"
    useVoice = $false
    useSubtitles = $false
    useMusic = $false
    useSora = $false
} | ConvertTo-Json

Write-Host "🎬 Iniciando generación de video..."
$response = Invoke-WebRequest -Uri 'http://localhost:8080/videos/generate' `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body $payload `
    | ConvertFrom-Json

$jobId = $response.result.jobId
Write-Host "✅ Job ID: $jobId"
Write-Host "⏳ Estado: $($response.result.status)"
Write-Host "⏱️ Tiempo estimado: 5-15 minutos"

# Paso 2: Esperar (puedes hacer polling o esperar webhook)
Write-Host "`n📡 Esperando a que el video se genere..."
Write-Host "💡 El backend principal recibirá el webhook en:"
Write-Host "   POST ${env:MAIN_BACKEND_URL}/veo-video/complete"
Write-Host "`n📹 El URL del video estará en el campo 'videoUrl' del webhook"
```

---

## 📊 **Respuesta Completa del Backend:**

Cuando el backend principal recibe el webhook, tendrá:

```json
{
  "jobId": "2bdbb4e2-ff26-4d79-987e-df9c3f8e7af8",
  "videoUrl": "https://realculturestorage.blob.core.windows.net/videos/veo-video-1773704385327.mp4?sv=2021-06-08&st=2026-03-17T00%3A00%3A00Z&se=2026-03-17T01%3A00%3A00Z&sr=b&sp=r&sig=ABC123",
  "filename": "veo-video-1773704385327.mp4",
  "prompt": "A cat playing with yarn",
  "duration": 5,
  "audioUrl": "https://realculturestorage.blob.core.windows.net/audio/audio-xxx.mp3",
  "script": "Narration script here...",
  "subtitles": "pendiente",
  "music": "pendiente",
  "status": "completed",
  "completedAt": 1773704385327
}
```

---

## ⚠️ **Notas Importantes:**

1. **No hay polling en el endpoint** - El endpoint `/videos/generate` NO espera a que el video esté listo
2. **Webhook automático** - El backend principal es notificado automáticamente
3. **Tiempo real** - VEO3 toma 5-15 minutos dependiendo de la duración del video
4. **Azure Blob SAS** - El videoUrl incluye token SAS temporal

---

## 🎯 **Resumen:**

| Momento | Dónde Está el VideoUrl |
|---------|------------------------|
| **T = 0-2 seg** | ❌ No disponible (response vacía) |
| **T = 2-10 min** | ⏳ Generándose |
| **T = 10-15 min** | ✅ Disponible en webhook del backend |
| **Backend** | ✅ `POST /veo-video/complete` → `videoUrl` field |

---

**Status:** ✅ Sistema funcionando correctamente como colas asíncronas  
**VideoURL:** Estará disponible en el webhook del backend principal después de 5-15 minutos  
**JobId Actual:** `2bdbb4e2-ff26-4d79-987e-df9c3f8e7af8`
