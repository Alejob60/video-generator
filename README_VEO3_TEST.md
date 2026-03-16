# 🎬 VEO3 Video Generation - Testing Guide

## ✅ **Modelo Corregido: `veo-001`**

**IMPORTANTE:** El nombre correcto del modelo es `veo-001`, NO `veo-3.1-generate-001`.

---

## 📋 **Flujo de Test en 2 Pasos**

### **Paso 1: Iniciar Generación de Video**

Ejecutar el script de inicialización:

```powershell
.\test-veo-init.ps1
```

**Qué hace:**
1. ✅ Llama al endpoint `:predictLongRunning`
2. ✅ Envía el prompt y parámetros a Google Vertex AI
3. ✅ Recibe un **Operation ID** (ej: `projects/orbital-prime-vision/locations/us-central1/jobs/1234567890`)
4. ✅ Guarda el Operation ID en `veo-operation-name.txt`

**Output Esperado:**
```
🎬 Testing VEO3 Video Generation (veo-001)
============================================================

📡 Step 1: Initiating video generation...
Model: veo-001
Endpoint: predictLongRunning

🔗 Request URL:
https://us-central1-aiplatform.googleapis.com/v1/projects/orbital-prime-vision/locations/us-central1/publishers/google/models/veo-001:predictLongRunning?key=...

📦 Payload:
{
  "instances": [{"prompt": "A cinematic drone shot..."}],
  "parameters": {"aspectRatio": "16:9", "videoLength": 5}
}

✅ Request accepted!
📋 Operation Name: projects/orbital-prime-vision/locations/us-central1/jobs/1234567890
⏳ Status: Processing...

💾 Operation name saved to: veo-operation-name.txt

⏰ Next step: Wait 2-5 minutes, then run .\test-veo-poll.ps1 to check status
```

---

### **Paso 2: Consultar Estado y Obtener Video**

Después de esperar **2-5 minutos**, ejecutar:

```powershell
.\test-veo-poll.ps1
```

**Qué hace:**
1. ✅ Lee el Operation ID desde `veo-operation-name.txt`
2. ✅ Consulta el estado de la operación
3. ✅ Si está listo (`done: true`), descarga el video
4. ✅ Guarda el video como archivo `.mp4`

**Output Esperado (Video Listo):**
```
🎬 Checking VEO3 Video Generation Status
============================================================

📋 Operation: projects/orbital-prime-vision/locations/us-central1/jobs/1234567890

🔗 Status URL:
https://us-central1-aiplatform.googleapis.com/v1/projects/orbital-prime-vision/locations/us-central1/jobs/1234567890?key=...

📊 Operation Status:
✅ DONE - Video generation complete!

📦 Response received:

🎥 SUCCESS: 1 video(s) generated!

   ✅ Video Data Available:
      Size: 15.5 MB
      Format: Base64 encoded MP4
      Saved to: veo-video-20260316-233045.mp4

✨ VEO3 test completed successfully!

📄 Full Response:
{
  "name": "projects/.../jobs/1234567890",
  "done": true,
  "response": {
    "generatedVideos": [{
      "video": {
        "bytes": "base64_encoded_data..."
      }
    }]
  }
}
```

**Output Esperado (Aún Procesando):**
```
🎬 Checking VEO3 Video Generation Status
============================================================

📋 Operation: projects/orbital-prime-vision/locations/us-central1/jobs/1234567890

🔗 Status URL:
https://us-central1-aiplatform.googleapis.com/v1/projects/orbital-prime-vision/locations/us-central1/jobs/1234567890?key=...

📊 Operation Status:
⏳ NOT DONE - Still processing...

📊 Metadata:
{
  "@type": "type.googleapis.com/google.cloud.aiplatform.v1.GenericOperationMetadata",
  "createTime": "2026-03-16T23:30:00Z",
  "updateTime": "2026-03-16T23:31:00Z"
}

💡 Tip: Run this script again in 1-2 minutes to check again.
```

---

## 🔧 **Comandos PowerShell Equivalentes**

### **Test 1: Iniciar Generación (Manual)**

```powershell
$env:VERTEX_API_KEY = "AQ.Ab8RN6LuAtNfSN2NXv8cn0zsclWio1xDmtux_w0Wql3yZzvD3w"
$env:PROJECT_ID = "orbital-prime-vision"
$MODEL = "veo-001"

$body = @'
{
  "instances": [
    {
      "prompt": "A cinematic drone shot of a futuristic city at sunset, flying through skyscrapers with neon lights, photorealistic, 4K quality"
    }
  ],
  "parameters": {
    "aspectRatio": "16:9",
    "videoLength": 5,
    "fps": 24,
    "negativePrompt": "blurry, low quality, distorted"
  }
}
'@

$initUrl = "https://us-central1-aiplatform.googleapis.com/v1/projects/${env:PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL}:predictLongRunning?key=${env:VERTEX_API_KEY}"

$response = Invoke-RestMethod -Uri $initUrl -Method Post -Body $body -ContentType "application/json"

Write-Host "✅ Operation Name: $($response.name)"
$response.name | Out-File -FilePath "veo-operation-name.txt" -Encoding utf8
```

---

### **Test 2: Consultar Estado (Manual)**

```powershell
$env:VERTEX_API_KEY = "AQ.Ab8RN6LuAtNfSN2NXv8cn0zsclWio1xDmtux_w0Wql3yZzvD3w"
$operationName = Get-Content "veo-operation-name.txt" -Raw

$statusUrl = "https://us-central1-aiplatform.googleapis.com/v1/${operationName}?key=${env:VERTEX_API_KEY}"

$status = Invoke-RestMethod -Uri $statusUrl -Method Get

if ($status.done) {
    Write-Host "✅ Video generation complete!"
    
    if ($status.response.generatedVideos[0].video.bytes) {
        $videoBytes = [Convert]::FromBase64String($status.response.generatedVideos[0].video.bytes)
        [System.IO.File]::WriteAllBytes("output-video.mp4", $videoBytes)
        Write-Host "💾 Video saved to: output-video.mp4"
    }
} else {
    Write-Host "⏳ Still processing..."
}
```

---

## ⏱️ **Tiempos Estimados**

| Duración Video | Tiempo Promedio | Máximo Recomendado |
|----------------|-----------------|-------------------|
| 5 segundos | 3-8 minutos | 15 minutos |
| 10 segundos | 5-12 minutos | 20 minutos |
| 15+ segundos | 8-15 minutos | 30 minutos |

**Recomendación:** Consultar cada 2-3 minutos hasta que esté listo.

---

## 📁 **Archivos Generados**

| Archivo | Descripción |
|---------|-------------|
| `veo-operation-name.txt` | Operation ID para polling |
| `veo-video-YYYYMMDD-HHMMSS.mp4` | Video generado (15-25 MB) |

---

## ❌ **Errores Comunes y Soluciones**

### **Error 1: "Model not found"**

**Causa:** Usaste `veo-3.1-generate-001` en lugar de `veo-001`

**Solución:**
```powershell
# ❌ INCORRECTO
$MODEL = "veo-3.1-generate-001"

# ✅ CORRECTO
$MODEL = "veo-001"
```

---

### **Error 2: "RESOURCE_EXHAUSTED"**

**Causa:** Usaste el endpoint `:predict` en lugar de `:predictLongRunning`

**Solución:**
```powershell
# ❌ INCORRECTO
POST .../models/veo-001:predict

# ✅ CORRECTO
POST .../models/veo-001:predictLongRunning
```

---

### **Error 3: "veo-operation-name.txt not found"**

**Causa:** No ejecutaste `test-veo-init.ps1` primero

**Solución:**
```powershell
# Ejecutar en orden:
.\test-veo-init.ps1      # Paso 1: Iniciar generación
Wait 2-5 minutes         # Esperar procesamiento
.\test-veo-poll.ps1      # Paso 2: Consultar estado
```

---

### **Error 4: "Invalid API key"**

**Causa:** La API key expiró o es incorrecta

**Solución:**
1. Verificar la key en `.env`
2. Regenerar key en Google Cloud Console
3. Actualizar variable de entorno

---

## 🧪 **Testing Checklist**

- ✅ Modelo correcto: `veo-001`
- ✅ Endpoint correcto: `:predictLongRunning`
- ✅ URL correcta: `https://us-central1-aiplatform.googleapis.com/v1/...`
- ✅ Project ID: `orbital-prime-vision`
- ✅ Location: `us-central1`
- ✅ API key válida en .env
- ✅ Payload JSON bien formado
- ✅ Esperar 2-5 minutos entre init y poll
- ✅ Guardar operation name en archivo
- ✅ Verificar response tiene `generatedVideos`

---

## 🚀 **Flujo Completo Automatizado**

Si quieres un solo script que haga todo (init + poll automático):

```powershell
# Crear test-veo-full.ps1
.\test-veo-init.ps1
Write-Host "`n⏳ Waiting 3 minutes for video generation..."
Start-Sleep -Seconds 180
.\test-veo-poll.ps1
```

---

## 📞 **Soporte**

### **Logs Detallados:**
Ambos scripts muestran logs paso a paso con:
- 🔗 URLs de request
- 📦 Payloads enviados
- 📊 Respuestas recibidas
- ✅ Estados de operación

### **Debugging:**
Si algo falla, revisar:
1. Output completo del error
2. Variables de entorno (`$env:VERTEX_API_KEY`, etc.)
3. Conectividad a Google Cloud
4. Quotas y billing habilitados

---

## 📄 **Referencias**

- [Vertex AI Video Generation](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/overview)
- [LongRunning Operations API](https://cloud.google.com/vertex-ai/docs/reference/rest/v1/projects.locations.operations/get)
- [VEO Model Documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/video/video-models)

---

**Last Updated:** March 16, 2026  
**Model:** veo-001 (stable)  
**Status:** ✅ Ready for Testing
