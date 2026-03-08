# Checklist de Endpoints y Servicios

## Controladores y Endpoints

### 1. Audio Controller (`/audio`)
- [x] **POST** `/audio/generate`
  - **Descripción**: Genera audio a partir de un prompt usando Azure TTS
  - **DTO**: GenerateAudioDto
  - **Servicio**: AzureTTSService
  - **Respuesta**: URL del audio generado con SAS

### 2. Flux Image Controller (`/media/flux-image`)
- [x] **POST** `/media/flux-image`
  - **Descripción**: Genera imágenes usando FLUX-1.1-pro
  - **DTO**: GenerateFluxImageDto
  - **Servicio**: FluxImageService
  - **Respuesta**: URL de la imagen generada con SAS

### 3. Flux Kontext Image Controller (`/media/flux-kontext-image`)
- [x] **POST** `/media/flux-kontext-image`
  - **Descripción**: Genera imágenes usando FLUX.1-Kontext-pro con opción de carga de imagen de referencia
  - **DTO**: GenerateFluxKontextImageDto
  - **Servicio**: FluxKontextImageService
  - **Respuesta**: URL de la imagen generada con SAS

### 4. Health Controller (`/`)
- [x] **GET** `/status`
  - **Descripción**: Verifica el estado básico del servicio
  - **Servicio**: Ninguno (información estática)
  - **Respuesta**: Estado del servicio y versión

- [x] **GET** `/health`
  - **Descripción**: Verifica la salud del servicio (básica por defecto, completa opcional)
  - **Parámetros**: `check=full` para verificación completa
  - **Servicios**: LLM, TTS, Sora, Blob Storage, Backend (solo con `check=full`)
  - **Respuesta**: Estado de cada servicio (solo con `check=full`)

### 5. LLM Controller (`/llm`)
- [x] **POST** `/llm/generate-json`
  - **Descripción**: Genera un prompt JSON editable para video
  - **DTO**: GeneratePromptDto
  - **Servicio**: LLMService
  - **Respuesta**: Prompt en formato JSON

### 6. Promo Image Controller (`/media/image`)
- [x] **POST** `/media/image`
  - **Descripción**: Genera imágenes promocionales (puede usar DALL·E o FLUX)
  - **DTO**: GeneratePromoImageDto
  - **Servicio**: PromoImageService
  - **Respuesta**: URL de la imagen generada con SAS

### 7. Sora Controller (`/videos`)
- [x] **POST** `/videos/generate`
  - **Descripción**: Genera videos usando Sora (solo si useSora=true)
  - **DTO**: GenerateVideoDto
  - **Servicio**: SoraService
  - **Respuesta**: URL del video generado con SAS

### 8. Video Controller (`/videos`)
- [x] **GET** `/videos/health`
  - **Descripción**: Verifica la salud del servicio de video
  - **Servicio**: SoraVideoClientService
  - **Respuesta**: Estado del servicio Sora

- [x] **POST** `/videos/generate`
  - **Descripción**: Genera videos completos con múltiples elementos (video, audio, subtítulos)
  - **DTO**: GenerateVideoDto
  - **Servicios**: SoraVideoClientService, AzureTTSService, AzureBlobService
  - **Respuesta**: URLs de todos los elementos generados con SAS

## Servicios

### 1. AudioGeneratorService
- [x] Genera audio usando Azure TTS
- [x] Sube audio a Azure Blob Storage
- [x] Genera URLs SAS
- [x] Notifica al backend principal

### 2. AzureBlobService
- [x] Sube archivos a Azure Blob Storage
- [x] Genera URLs SAS
- [x] Maneja diferentes tipos de contenido (audio, video, imágenes)

### 3. AzureTTSService
- [x] Genera audio a partir de texto usando Azure TTS
- [x] Sube audio a Azure Blob Storage
- [x] Genera URLs SAS

### 4. FluxImageService
- [x] Genera imágenes usando FLUX-1.1-pro
- [x] Maneja respuestas con URL o base64
- [x] Sube imágenes a Azure Blob Storage
- [x] Genera URLs SAS
- [x] Notifica al backend principal

### 5. FluxKontextImageService
- [x] Genera imágenes usando FLUX.1-Kontext-pro
- [x] Maneja edición de imágenes con imagen de referencia
- [x] Maneja respuestas con URL o base64
- [x] Sube imágenes a Azure Blob Storage
- [x] Genera URLs SAS
- [x] Notifica al backend principal

### 6. LLMService
- [x] Genera prompts mejorados para diferentes tipos de contenido
- [x] Mejora prompts JSON a lenguaje natural
- [x] Genera scripts narrativos

### 7. PromoImageService
- [x] Genera imágenes promocionales usando DALL·E o FLUX
- [x] Sube imágenes a Azure Blob Storage
- [x] Genera URLs SAS
- [x] Notifica al backend principal

### 8. SoraService
- [x] Genera videos usando Sora
- [x] Sube videos a Azure Blob Storage
- [x] Genera URLs SAS
- [x] Notifica al backend principal

### 9. VideoService
- [x] Coordina la generación de videos completos
- [x] Combina múltiples elementos (video, audio, subtítulos)
- [x] Sube videos a Azure Blob Storage
- [x] Genera URLs SAS
- [x] Notifica al backend principal