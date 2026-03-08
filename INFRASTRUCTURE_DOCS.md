# Documentación de Infraestructura

## Módulos del Sistema

### 1. AudioModule
**Responsabilidad**: Gestiona la generación de audio mediante Text-to-Speech (TTS) usando servicios de Azure.
**Componentes principales**:
- AudioController: Expone endpoints REST para la generación de audio
- AudioGeneratorService: Implementa la lógica de negocio para la generación de audio
- AzureTTSService: Interactúa con la API de Azure Text-to-Speech

### 2. VideoModule
**Responsabilidad**: Coordina la generación de videos completos combinando múltiples elementos (video, audio, subtítulos).
**Componentes principales**:
- VideoController: Expone endpoints REST para la generación de videos
- VideoService: Implementa la lógica de negocio para la coordinación de videos
- VideoQueueConsumerService: Consume mensajes de la cola de Service Bus para procesamiento asíncrono

### 3. PromoImageModule
**Responsabilidad**: Genera imágenes promocionales usando servicios de IA como DALL·E o FLUX.
**Componentes principales**:
- PromoImageController: Expone endpoints REST para la generación de imágenes promocionales
- PromoImageService: Implementa la lógica de negocio para la generación de imágenes
- PromoImageQueueConsumerService: Consume mensajes de la cola de Service Bus para procesamiento asíncrono

### 4. SoraModule
**Responsabilidad**: Interactúa con el servicio Sora para la generación de videos de IA.
**Componentes principales**:
- SoraController: Expone endpoints REST para la generación de videos con Sora
- SoraService: Implementa la lógica de negocio para la interacción con Sora
- SoraVideoClientService: Cliente para comunicarse con el microservicio de Sora

### 5. FluxImageModule
**Responsabilidad**: Genera imágenes usando el modelo FLUX-1.1-pro.
**Componentes principales**:
- FluxImageController: Expone endpoints REST para la generación de imágenes con FLUX
- FluxImageService: Implementa la lógica de negocio para la generación de imágenes con FLUX

### 6. FluxKontextImageModule
**Responsabilidad**: Genera imágenes usando el modelo FLUX.1-Kontext-pro, con capacidad de edición usando imágenes de referencia.
**Componentes principales**:
- FluxKontextImageController: Expone endpoints REST para la generación de imágenes con FLUX.1-Kontext-pro
- FluxKontextImageService: Implementa la lógica de negocio para la generación de imágenes con FLUX.1-Kontext-pro

### 7. LLMModule
**Responsabilidad**: Proporciona servicios de procesamiento de lenguaje natural usando modelos de IA.
**Componentes principales**:
- LLMController: Expone endpoints REST para la generación de prompts mejorados
- LLMService: Implementa la lógica de negocio para el procesamiento de lenguaje natural

### 8. ServiceBusModule
**Responsabilidad**: Gestiona la comunicación asíncrona mediante colas de mensajes de Azure Service Bus.
**Componentes principales**:
- ServiceBusService: Implementa la lógica para enviar y recibir mensajes de Service Bus

## Servicios Compartidos

### AzureBlobService
**Responsabilidad**: Gestiona el almacenamiento y recuperación de archivos en Azure Blob Storage.
**Funcionalidades**:
- Subida de archivos con generación de URLs SAS
- Descarga de archivos
- Gestión de contenedores

### HealthController
**Responsabilidad**: Proporciona endpoints para monitorear la salud del servicio.
**Endpoints**:
- `/status`: Verificación básica del estado del servicio
- `/health`: Verificación completa de la salud de todos los servicios dependientes

## Arquitectura de Colas

El sistema utiliza Azure Service Bus para procesamiento asíncrono:
- `video`: Cola para solicitudes de generación de videos
- `imagen`: Cola para solicitudes de generación de imágenes

## Variables de Entorno

### Azure OpenAI
- `AZURE_OPENAI_GPT_URL`: URL del endpoint de GPT
- `AZURE_OPENAI_KEY`: Clave de API para Azure OpenAI
- `AZURE_OPENAI_GPT_DEPLOYMENT`: Nombre del deployment de GPT
- `AZURE_OPENAI_API_VERSION`: Versión de la API de Azure OpenAI

### Azure TTS
- `AZURE_TTS_ENDPOINT`: URL del endpoint de Text-to-Speech
- `AZURE_TTS_KEY`: Clave de API para Azure TTS
- `AZURE_TTS_DEPLOYMENT`: Nombre del deployment de TTS
- `AZURE_TTS_API_VERSION`: Versión de la API de Azure TTS
- `AZURE_TTS_VOICE`: Voz predeterminada para la generación de audio

### Azure Storage
- `AZURE_STORAGE_CONNECTION_STRING`: Cadena de conexión para Azure Storage
- `AZURE_STORAGE_KEY`: Clave de cuenta para Azure Storage
- `AZURE_STORAGE_CONTAINER_NAME`: Nombre del contenedor para archivos de audio
- `AZURE_STORAGE_CONTAINER_VIDEO`: Nombre del contenedor para archivos de video
- `AZURE_STORAGE_CONTAINER_IMAGES`: Nombre del contenedor para archivos de imagen

### Sora
- `SORA_VIDEO_URL`: URL del microservicio de Sora

### FLUX
- `FLUX_API_KEY`: Clave de API para el servicio FLUX

### Backend Principal
- `MAIN_BACKEND_URL`: URL del backend principal para notificaciones

### Database
- `DATABASE_URL`: URL de conexión a la base de datos PostgreSQL
- `DB_HOST`: Host de la base de datos
- `DB_PORT`: Puerto de la base de datos
- `DB_USERNAME`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `DB_NAME`: Nombre de la base de datos
- `DB_SSL`: Indica si se usa SSL para la conexión

## Docker

### Imagen Base
- `node:20-alpine`: Imagen ligera de Node.js 20

### Dependencias del Sistema
- `ffmpeg`: Requerido para procesamiento de video

### Puertos
- `8080`: Puerto expuesto por la aplicación

### Volúmenes
- `/app/public/videos`: Archivos de video generados
- `/app/public/audio`: Archivos de audio generados
- `/app/public/subtitles`: Archivos de subtítulos generados
- `/app/public/uploads`: Archivos subidos por los usuarios
- `/app/public/avatars`: Avatares de usuarios
- `/app/public/campaigns`: Archivos de campañas
- `/app/public/image`: Imágenes generadas

## Despliegue

### Azure App Service
- **Runtime**: Node.js 20
- **SKU**: B1 (Básico) o superior
- **Sistema Operativo**: Linux

### Variables de Configuración en Azure
- `WEBSITES_PORT`: 8080
- `NODE_ENV`: production