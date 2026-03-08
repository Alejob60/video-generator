# Prompts para Conexión a Endpoints - URLs con SAS Incluidas

## Importante
Todas las URLs devueltas por estos endpoints ya incluyen una firma SAS (Shared Access Signature) para garantizar su acceso inmediato y funcional. No es necesario realizar ningún proceso adicional para validar o generar tokens SAS.

## 1. Audio Controller - `/audio/generate`

### Prompt para generar audio
```bash
curl -X POST "http://localhost:4000/audio/generate" \
  -H "Content-Type: application/json" \
  -d '{
  "prompt": "Texto para convertir en audio"
}'
```

### Ejemplo de uso
```bash
curl -X POST "http://localhost:4000/audio/generate" \
  -H "Content-Type: application/json" \
  -d '{
  "prompt": "Bienvenidos a nuestro canal. Hoy les presentamos una increíble oferta"
}'
```

### Respuesta (con URL SAS ya incluida)
```json
{
  "success": true,
  "message": "🎧 Audio generado con éxito",
  "result": {
    "script": "Bienvenidos a nuestro canal. Hoy les presentamos una increíble oferta",
    "duration": 5.2,
    "filename": "audio-uuid.mp3",
    "blobUrl": "https://storageaccount.blob.core.windows.net/audio/audio-uuid.mp3?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2023-12-31T23:59:59Z&st=2023-01-01T00:00:00Z&spr=https&sig=tokenSAS",
    "generationId": "gen_timestamp_random",
    "userId": "labs",
    "timestamp": 1700000000000
  }
}
```

**Nota**: La URL en `blobUrl` ya contiene el token SAS necesario para acceder al archivo de audio.

## 2. Flux Image Controller - `/media/flux-image`

### Prompt para generar imagen con FLUX
```bash
curl -X POST "http://localhost:4000/media/flux-image" \
  -H "Content-Type: application/json" \
  -d '{
  "prompt": "Descripción de la imagen a generar",
  "size": "1024x1024"
}'
```

### Ejemplo de uso
```bash
curl -X POST "http://localhost:4000/media/flux-image" \
  -H "Content-Type: application/json" \
  -d '{
  "prompt": "Un gato astronauta flotando en el espacio",
  "size": "1024x1024"
}'
```

### Respuesta (con URL SAS ya incluida)
```json
{
  "success": true,
  "message": "✅ FLUX image generated successfully",
  "data": {
    "imageUrl": "https://storageaccount.blob.core.windows.net/images/flux-image-uuid.png?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2023-12-31T23:59:59Z&st=2023-01-01T00:00:00Z&spr=https&sig=tokenSAS",
    "filename": "flux-image-uuid.png",
    "userId": "anon",
    "prompt": "Un gato astronauta flotando en el espacio"
  }
}
```

**Nota**: La URL en `imageUrl` ya contiene el token SAS necesario para acceder a la imagen.

## 3. Promo Image Controller - `/media/image`

### Prompt para generar imagen promocional
```bash
curl -X POST "http://localhost:4000/media/image" \
  -H "Content-Type: application/json" \
  -d '{
  "prompt": "Descripción de la imagen a generar",
  "plan": "FREE"
}'
```

### Ejemplo de uso con DALL·E
```bash
curl -X POST "http://localhost:4000/media/image" \
  -H "Content-Type: application/json" \
  -d '{
  "prompt": "Un producto tecnológico flotando sobre fondo blanco",
  "plan": "FREE"
}'
```

### Ejemplo de uso con FLUX
```bash
curl -X POST "http://localhost:4000/media/image" \
  -H "Content-Type: application/json" \
  -d '{
  "prompt": "Un producto tecnológico flotando sobre fondo blanco",
  "plan": "FREE",
  "useFlux": true
}'
```

### Respuesta (con URL SAS ya incluida)
```json
{
  "success": true,
  "message": "✅ Imagen generada correctamente",
  "result": {
    "imageUrl": "https://storageaccount.blob.core.windows.net/images/promo_timestamp.png?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2023-12-31T23:59:59Z&st=2023-01-01T00:00:00Z&spr=https&sig=tokenSAS",
    "prompt": "Un producto tecnológico flotando sobre fondo blanco",
    "imagePath": null,
    "filename": "promo_timestamp.png"
  }
}
```

**Nota**: La URL en `imageUrl` ya contiene el token SAS necesario para acceder a la imagen.

## 4. Sora Controller - `/videos/generate`

### Prompt para generar video con Sora
```bash
curl -X POST "http://localhost:4000/videos/generate" \
  -H "Content-Type: application/json" \
  -d '{
  "prompt": "Descripción del video a generar",
  "n_seconds": 10,
  "useSora": true
}'
```

### Ejemplo de uso
```bash
curl -X POST "http://localhost:4000/videos/generate" \
  -H "Content-Type: application/json" \
  -d '{
  "prompt": "Un paisaje montañoso con ríos y bosques al atardecer",
  "n_seconds": 15,
  "useSora": true
}'
```

### Respuesta (con URL SAS ya incluida)
```json
{
  "success": true,
  "message": "✅ Video generado y subido exitosamente con Sora",
  "jobId": "job-uuid",
  "blobUrl": "https://storageaccount.blob.core.windows.net/video/video-uuid.mp4?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2023-12-31T23:59:59Z&st=2023-01-01T00:00:00Z&spr=https&sig=tokenSAS"
}
```

**Nota**: La URL en `blobUrl` ya contiene el token SAS necesario para acceder al video.

## 5. Video Controller - `/videos/generate` (Generación completa)

### Prompt para generar video completo (con audio, subtítulos, etc.)
```bash
curl -X POST "http://localhost:4000/videos/generate" \
  -H "Content-Type: application/json" \
  -d '{
  "prompt": "Descripción del video a generar",
  "n_seconds": 10,
  "plan": "free",
  "useVoice": true,
  "useSubtitles": true
}'
```

### Ejemplo de uso
```bash
curl -X POST "http://localhost:4000/videos/generate" \
  -H "Content-Type: application/json" \
  -d '{
  "prompt": "Receta de pastel de chocolate fácil y deliciosa",
  "n_seconds": 30,
  "plan": "creator",
  "useVoice": true,
  "useSubtitles": true
}'
```

### Respuesta (con URLs SAS ya incluidas)
```json
{
  "success": true,
  "message": "Medios generados exitosamente",
  "result": {
    "userId": "admin",
    "timestamp": 1700000000000,
    "videoUrl": "https://storageaccount.blob.core.windows.net/video/sora_video_timestamp.mp4?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2023-12-31T23:59:59Z&st=2023-01-01T00:00:00Z&spr=https&sig=tokenSAS",
    "duration": 30,
    "plan": "creator",
    "fileName": "sora_video_timestamp.mp4",
    "soraJobId": "job-uuid",
    "generationId": "gen-uuid",
    "audioUrl": "https://storageaccount.blob.core.windows.net/audio/audio_timestamp.mp3?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2023-12-31T23:59:59Z&st=2023-01-01T00:00:00Z&spr=https&sig=tokenSAS",
    "script": "Receta de pastel de chocolate fácil y deliciosa"
  }
}
```

**Nota**: Todas las URLs (`videoUrl`, `audioUrl`, etc.) ya contienen los tokens SAS necesarios para acceder a los archivos.

## Resumen

- **Todas las URLs devueltas por estos endpoints ya incluyen SAS**: No necesitas realizar ningún proceso adicional para generar o validar tokens SAS.
- **Acceso inmediato**: Las URLs son directamente accesibles mientras estén dentro del período de validez del token SAS.
- **Validación automática**: El sistema ya se encarga de validar que todas las URLs devueltas incluyan SAS correctamente.
- **Corrección implementada**: Se han realizado las modificaciones necesarias en los servicios para garantizar que todas las URLs devueltas incluyan tokens SAS.