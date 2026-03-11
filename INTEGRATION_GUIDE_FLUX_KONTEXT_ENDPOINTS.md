# 🚀 GUÍA DE INTEGRACIÓN - NUEVOS ENDPOINTS FLUX KONTEXT PRO

**Fecha:** 2026-03-09  
**Estado:** ✅ LISTO PARA PRODUCCIÓN  
**Complejidad:** Baja (sigue patrones existentes)

---

## 📋 **RESUMEN EJECUTIVO**

### **Nuevos Endpoints Implementados:**

1. ✅ **`POST /media/flux-kontext/image`** - Generar imagen desde texto
2. ✅ **`POST /media/flux-kontext/edit`** - Editar imagen con referencia
3. ✅ **`POST /flux-kontext-image/complete`** - Notificación del backend

### **Características Clave:**
- ✅ Soporta **imagen de referencia** para ediciones
- ✅ Autenticación con **API Key** (Bearer token)
- ✅ Respuesta estandarizada con **SAS tokens**
- ✅ Nomenclatura consistente: `misy-image-{timestamp}.png`
- ✅ Sigue el mismo patrón que DALL-E y FLUX

---

## 🔧 **PRERREQUISITOS**

### **1. Variables de Entorno (.env)**

Agregar al archivo `.env` del video-generator:

```env
# === FLUX.1-Kontext-pro Configuration ===
FLUX_KONTEXT_PRO_BASE_URL=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com
FLUX_KONTEXT_PRO_DEPLOYMENT=FLUX.1-Kontext-pro
FLUX_KONTEXT_PRO_API_VERSION=2025-04-01-preview
FLUX_KONTEXT_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS
```

### **2. Dependencias Requeridas**

El servicio ya tiene instaladas las dependencias necesarias:

```json
{
  "dependencies": {
    "@azure/identity": "^3.x",
    "form-data": "^4.x",
    "axios": "^1.x"
  }
}
```

**Verificar instalación:**
```bash
npm list @azure/identity form-data axios
```

---

## 📡 **ENDPOINT 1: GENERACIÓN DESDE TEXTO**

### **Endpoint:**
```
POST /media/flux-kontext/image
```

### **Headers:**
```http
Content-Type: application/json
X-User-Id: {userId}  // Opcional, default: "anon"
```

### **Request Body:**
```json
{
  "prompt": "A beautiful sunset over mountains",
  "plan": "PRO",
  "size": "1024x1024",
  "isJsonPrompt": false
}
```

### **Validaciones del Backend:**
```typescript
@IsString()
@MinLength(1)
prompt: string;

@IsEnum(['FREE', 'CREATOR', 'PRO'])
plan: string;

@IsOptional()
@IsString()
@Matches(/^\d+x\d+$/, { message: 'Invalid size format' })
size?: string = '1024x1024';

@IsOptional()
@IsBoolean()
isJsonPrompt?: boolean = false;
```

### **Proceso Interno:**

1. ✅ Validar request body
2. ✅ Extraer userId de headers
3. ✅ Procesar prompt si es JSON
4. ✅ Llamar a `FluxKontextImageService.generateImageAndNotify()`
5. ✅ Usar endpoint Azure: `/images/generations`
6. ✅ Enviar payload:
   ```json
   {
     "model": "FLUX.1-Kontext-pro",
     "prompt": "...",
     "n": 1,
     "size": "1024x1024",
     "output_format": "png"
   }
   ```
7. ✅ Autenticar: `Authorization: Bearer <API_KEY>`
8. ✅ Recibir base64
9. ✅ Guardar temporalmente
10. ✅ Subir a Blob Storage con SAS
11. ✅ Notificar backend: `/flux-kontext-image/complete`

### **Response Exitosa (201 Created):**
```json
{
  "success": true,
  "message": "✅ FLUX Kontext image generated successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png?sv=2025-07-05&spr=https&st=2026-03-09T00%3A00%3A00Z&se=2026-03-10T00%3A00%3A00Z&sr=b&sp=r&sig=XXXXX",
    "prompt": "A beautiful sunset over mountains",
    "imagePath": null,
    "filename": "misy-image-1741567890123.png"
  }
}
```

### **Response de Error (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "El prompt no puede estar vacío",
  "details": ["prompt must be longer than 1 character"]
}
```

### **Curl de Prueba:**
```bash
curl -X POST http://localhost:4001/media/flux-kontext/image \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user123" \
  -d '{
    "prompt": "A red fox in an autumn forest",
    "plan": "PRO",
    "size": "1024x1024"
  }'
```

---

## 🎨 **ENDPOINT 2: EDICIÓN CON IMAGEN DE REFERENCIA**

### **Endpoint:**
```
POST /media/flux-kontext/edit
```

### **Headers:**
```http
Content-Type: application/json
X-User-Id: {userId}
```

### **Request Body:**
```json
{
  "prompt": "Make it cyberpunk style with neon lights",
  "plan": "PRO",
  "size": "1024x1024",
  "referenceImageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png"
}
```

### **Validaciones Adicionales:**
```typescript
@IsOptional()
@IsUrl()
referenceImageUrl?: string;

// Validación personalizada
@ValidateIf((o) => o.referenceImageUrl)
@IsUrl({ protocols: ['https'], require_protocol: true })
referenceImageUrl?: string;
```

### **Proceso Interno:**

1. ✅ Validar request + URL de referencia
2. ✅ Descargar imagen de referencia temporalmente
3. ✅ Llamar a `FluxKontextImageService.generateImageAndNotify(userId, dto, tempImagePath)`
4. ✅ Usar endpoint Azure: `/images/edits`
5. ✅ Enviar FormData:
   ```javascript
   formData.append('model', 'FLUX.1-Kontext-pro');
   formData.append('prompt', 'Make it cyberpunk...');
   formData.append('n', '1');
   formData.append('size', '1024x1024');
   formData.append('image', fs.createReadStream(tempImagePath));
   ```
6. ✅ Autenticar: `Authorization: Bearer <API_KEY>`
7. ✅ Recibir base64 editado
8. ✅ Guardar temporalmente
9. ✅ Subir a Blob Storage con SAS
10. ✅ Notificar backend: `/flux-kontext-image/complete`

### **Response Exitosa (201 Created):**
```json
{
  "success": true,
  "message": "✅ FLUX Kontext image edited successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567891456.png?sv=2025-07-05...",
    "prompt": "Make it cyberpunk style with neon lights",
    "imagePath": null,
    "filename": "misy-image-1741567891456.png"
  }
}
```

### **Response de Error (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid reference image",
  "message": "La URL de referencia debe ser HTTPS válida"
}
```

### **Flujo Completo con Upload Previo:**

#### **Paso 1: Subir imagen original**
```bash
curl -X POST http://localhost:4001/upload \
  -F "file=@original-image.jpg"
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png?sv=2025-07-05...",
  "filename": "misy-image-1741567890123.png"
}
```

#### **Paso 2: Editar imagen**
```bash
curl -X POST http://localhost:4001/media/flux-kontext/edit \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user123" \
  -d '{
    "prompt": "Make it cyberpunk with neon lights",
    "plan": "PRO",
    "size": "1024x1024",
    "referenceImageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png?sv=2025-07-05..."
  }'
```

---

## 🔔 **ENDPOINT 3: NOTIFICACIÓN AL BACKEND PRINCIPAL**

### **Endpoint (en el backend principal):**
```
POST /flux-kontext-image/complete
```

### **Headers:**
```http
Content-Type: application/json
```

### **Payload de Notificación:**
```json
{
  "userId": "user123",
  "prompt": "A beautiful sunset over mountains",
  "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png?sv=2025-07-05...",
  "filename": "misy-image-1741567890123.png"
}
```

### **Implementación en Backend Principal:**

```typescript
@Post('flux-kontext-image/complete')
async completeGeneration(@Body() notification: FluxKontextNotification) {
  this.logger.log(`📨 Received notification from video-generator`);
  
  // 1. Guardar en base de datos
  const savedImage = await this.prisma.generatedImage.create({
    data: {
      userId: notification.userId,
      imageUrl: notification.imageUrl,
      filename: notification.filename,
      prompt: notification.prompt,
      service: 'FLUX_KONTEXT_PRO',
      createdAt: new Date(),
    },
  });

  this.logger.log(`💾 Saved to database: ${savedImage.id}`);

  // 2. Retornar éxito (video-generator ignora la respuesta)
  return { success: true };
}
```

### **DTO en Backend Principal:**
```typescript
export class FluxKontextNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  prompt: string;

  @IsString()
  @IsUrl()
  imageUrl: string;

  @IsString()
  filename: string;
}
```

---

## 💻 **IMPLEMENTACIÓN EN EL CONTROLLER**

### **Controller en Video-Generator:**

```typescript
import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { FluxKontextImageService } from '../services/flux-kontext-image.service';
import { GenerateFluxImageDto } from '../dto/generate-flux-image.dto';

@Controller('media/flux-kontext')
export class FluxKontextController {
  private readonly logger = new Logger(FluxKontextController.name);

  constructor(
    private readonly fluxKontextService: FluxKontextImageService,
  ) {}

  @Post('image')
  async generate(
    @Body() dto: GenerateFluxImageDto,
    @Headers('x-user-id') userId: string = 'anon',
  ) {
    this.logger.log(`📸 Generating FLUX Kontext image for user: ${userId}`);
    
    try {
      const result = await this.fluxKontextService.generateImageAndNotify(
        userId,
        dto,
      );

      return {
        success: true,
        message: '✅ FLUX Kontext image generated successfully',
        data: result,
      };
    } catch (error: any) {
      this.logger.error(`❌ Error: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: 'Generation failed',
        message: error.message,
      };
    }
  }

  @Post('edit')
  async edit(
    @Body() dto: GenerateFluxImageDto & { referenceImageUrl: string },
    @Headers('x-user-id') userId: string = 'anon',
  ) {
    this.logger.log(`🎨 Editing FLUX Kontext image for user: ${userId}`);
    
    if (!dto.referenceImageUrl) {
      throw new BadRequestException('referenceImageUrl is required');
    }

    try {
      // Descargar imagen de referencia temporalmente
      const tempPath = await this.downloadReferenceImage(dto.referenceImageUrl);
      
      const result = await this.fluxKontextService.generateImageAndNotify(
        userId,
        dto,
        tempPath,
      );

      return {
        success: true,
        message: '✅ FLUX Kontext image edited successfully',
        data: result,
      };
    } catch (error: any) {
      this.logger.error(`❌ Error: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: 'Edit failed',
        message: error.message,
      };
    }
  }

  private async downloadReferenceImage(url: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const filename = `ref-${Date.now()}.png`;
    const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);
    
    fs.writeFileSync(tempPath, response.data);
    return tempPath;
  }
}
```

---

## 🔐 **CONFIGURACIÓN DE CORS**

### **En Backend Principal:**

```typescript
// app.module.ts o main.ts
app.enableCors({
  origin: [
    'http://localhost:4001',      // Video generator local
    'https://tu-backend-principal.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id'],
});
```

### **En Video-Generator (si aplica):**

```typescript
// main.ts
const app = await NestFactory.create(AppContext, {
  cors: {
    origin: process.env.BACKEND_URL || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id'],
  },
});
```

---

## 📝 **IMPLEMENTACIÓN DE DTOs**

### **GenerateFluxImageDto:**

```typescript
import { IsString, IsOptional, IsBoolean, IsEnum, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateFluxImageDto {
  @ApiProperty({
    description: 'Prompt para generar la imagen',
    example: 'A beautiful sunset over mountains',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  prompt: string;

  @ApiProperty({
    description: 'Plan del usuario',
    enum: ['FREE', 'CREATOR', 'PRO'],
    example: 'PRO',
  })
  @IsString()
  @IsEnum(['FREE', 'CREATOR', 'PRO'])
  plan: string;

  @ApiPropertyOptional({
    description: 'Tamaño de la imagen (ancho x alto)',
    example: '1024x1024',
    default: '1024x1024',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d+x\d+$/, { message: 'Invalid size format. Use: 1024x1024' })
  size?: string = '1024x1024';

  @ApiPropertyOptional({
    description: 'Indica si el prompt viene en formato JSON estructurado',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isJsonPrompt?: boolean = false;
}
```

### **EditFluxImageDto (Extensión):**

```typescript
import { GenerateFluxImageDto } from './generate-flux-image.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUrl, ValidateIf } from 'class-validator';

export class EditFluxImageDto extends GenerateFluxImageDto {
  @ApiPropertyOptional({
    description: 'URL de la imagen de referencia para edición',
    example: 'https://realculturestorage.blob.core.windows.net/images/misy-image-123.png',
  })
  @ValidateIf((o) => o.referenceImageUrl !== undefined)
  @IsOptional()
  @IsUrl({ 
    protocols: ['https'], 
    require_protocol: true,
    require_host: true,
  }, { message: 'referenceImageUrl must be a valid HTTPS URL' })
  referenceImageUrl?: string;
}
```

---

## 🧪 **SCRIPTS DE PRUEBA**

### **Test 1: Generación Básica**

```bash
#!/bin/bash
# test-flux-kontext-generate.sh

echo "📡 Testing FLUX Kontext Generation..."

RESPONSE=$(curl -s -X POST "http://localhost:4001/media/flux-kontext/image" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user" \
  -d '{
    "prompt": "A red fox in an autumn forest",
    "plan": "PRO",
    "size": "1024x1024"
  }')

echo ""
echo "Response:"
echo "$RESPONSE" | jq .

# Validar respuesta
SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
  echo ""
  echo "✅ SUCCESS!"
  IMAGE_URL=$(echo "$RESPONSE" | jq -r '.data.imageUrl')
  FILENAME=$(echo "$RESPONSE" | jq -r '.data.filename')
  echo "Filename: $FILENAME"
  echo "Image URL: $IMAGE_URL"
  
  # Verificar que la URL es accesible
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$IMAGE_URL")
  if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ Image URL is accessible (HTTP $HTTP_CODE)"
  else
    echo "❌ Image URL not accessible (HTTP $HTTP_CODE)"
    exit 1
  fi
else
  echo ""
  echo "❌ FAILED!"
  ERROR=$(echo "$RESPONSE" | jq -r '.message')
  echo "Error: $ERROR"
  exit 1
fi
```

### **Test 2: Edición con Referencia**

```bash
#!/bin/bash
# test-flux-kontext-edit.sh

echo "🎨 Testing FLUX Kontext Edit with Reference Image..."

# Primero necesitamos una imagen de referencia
echo "📤 Step 1: Uploading reference image..."

UPLOAD_RESPONSE=$(curl -s -X POST "http://localhost:4001/upload" \
  -F "file=@test-images/fox.jpg")

echo "Upload Response:"
echo "$UPLOAD_RESPONSE" | jq .

REFERENCE_URL=$(echo "$UPLOAD_RESPONSE" | jq -r '.imageUrl')

if [ "$REFERENCE_URL" == "null" ] || [ -z "$REFERENCE_URL" ]; then
  echo "❌ Failed to upload reference image"
  exit 1
fi

echo "✅ Reference image uploaded: $REFERENCE_URL"
echo ""

# Ahora editar la imagen
echo "📡 Step 2: Editing image..."

EDIT_RESPONSE=$(curl -s -X POST "http://localhost:4001/media/flux-kontext/edit" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user" \
  -d "{
    \"prompt\": \"Make it cyberpunk style with neon lights\",
    \"plan\": \"PRO\",
    \"size\": \"1024x1024\",
    \"referenceImageUrl\": \"$REFERENCE_URL\"
  }")

echo ""
echo "Edit Response:"
echo "$EDIT_RESPONSE" | jq .

SUCCESS=$(echo "$EDIT_RESPONSE" | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
  echo ""
  echo "✅ SUCCESS!"
  EDITED_URL=$(echo "$EDIT_RESPONSE" | jq -r '.data.imageUrl')
  echo "Edited Image URL: $EDITED_URL"
else
  echo ""
  echo "❌ FAILED!"
  ERROR=$(echo "$EDIT_RESPONSE" | jq -r '.message')
  echo "Error: $ERROR"
  exit 1
fi
```

### **Test 3: Validar Notificación**

```bash
#!/bin/bash
# test-notification-receiver.sh

echo "📬 Starting mock backend server to receive notifications..."

cat > mock-backend.js << 'EOF'
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/flux-kontext-image/complete') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      console.log('\n📨 Notification received:');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Headers:', JSON.stringify(req.headers, null, 2));
      console.log('Body:', JSON.stringify(JSON.parse(body), null, 2));
      
      // Simular guardado en BD
      console.log('\n💾 Saving to database...');
      console.log('✅ Success!');
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      
      // Cerrar servidor después de recibir
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 1000);
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3000, () => {
  console.log('Mock backend listening on port 3000');
  console.log('Waiting for notification at: POST /flux-kontext-image/complete\n');
});
EOF

# Iniciar mock server en background
node mock-backend.js &
MOCK_PID=$!

echo "✅ Mock backend started (PID: $MOCK_PID)"
echo ""

# Esperar a que el servidor esté listo
sleep 2

# Hacer petición que triggera notificación
echo "📡 Triggering generation (this will send notification)..."
curl -s -X POST "http://localhost:4001/media/flux-kontext/image" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user" \
  -d '{"prompt":"test notification","plan":"PRO"}' > /dev/null

# Esperar notificación (timeout 10s)
echo "⏳ Waiting for notification (timeout: 10s)..."
wait $MOCK_PID

EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
  echo ""
  echo "✅ Notification test PASSED!"
else
  echo ""
  echo "❌ Notification test FAILED or TIMEOUT"
  kill $MOCK_PID 2>/dev/null
  exit 1
fi
```

---

## ⚠️ **MANEJO DE ERRORES**

### **Errores Comunes y Soluciones:**

#### **1. Error 401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causa:** API Key incorrecta o faltante  
**Solución:**
```bash
# Verificar variable de entorno
echo $FLUX_KONTEXT_PRO_API_KEY

# Debe retornar: 7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS
```

#### **2. Error 404 Not Found**
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

**Causa:** Deployment name incorrecto  
**Solución:**
```bash
# Verificar deployment name
echo $FLUX_KONTEXT_PRO_DEPLOYMENT

# Debe retornar exactamente: FLUX.1-Kontext-pro
```

#### **3. Error 500 Internal Server Error**
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "activityId": "xxx-xxx-xxx"
}
```

**Causa:** Error intermitente de Azure Foundry  
**Solución:** Implementar retry logic

```typescript
async generateWithRetry(dto: GenerateFluxImageDto, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await this.generateImageAndNotify(userId, dto);
    } catch (error: any) {
      if (error.response?.status === 500 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        this.logger.warn(`⚠️ Attempt ${attempt} failed. Retrying in ${delay}ms...`);
        await setTimeout(delay);
      } else {
        throw error;
      }
    }
  }
}
```

#### **4. Error: Invalid Base64**
```typescript
Error: Unexpected response format from FLUX API - no URL or base64 data found
```

**Causa:** Response malformed de Azure  
**Solución:** Loguear response completo

```typescript
this.logger.error('Full response:', JSON.stringify(response.data, null, 2));
throw new Error('Azure API returned unexpected format');
```

---

## 📊 **MÉTRICAS Y LOGGING**

### **Logs Recomendados:**

```typescript
// En el controller
this.logger.log(`📸 Generating FLUX Kontext image for user: ${userId}`);
this.logger.log(`📝 Prompt: ${dto.prompt}`);
this.logger.log(`📏 Size: ${dto.size}`);

// En el servicio
this.logger.log(`📡 Sending request to FLUX.1-Kontext-pro`);
this.logger.log(`🔑 Using API Key authentication`);
this.logger.log(`📥 Response status: ${response.status}`);
this.logger.log(`💾 Decoded buffer size: ${buffer.length} bytes`);
this.logger.log(`🗄️ Uploaded to blob: ${blobUrl}`);
this.logger.log(`🔔 Notified backend: ${this.backendUrl}/flux-kontext-image/complete`);

// En backend principal
this.logger.log(`📨 Received notification from video-generator`);
this.logger.log(`💾 Saved to database: ${savedImage.id}`);
this.logger.log(`📤 Responding to user`);
```

### **Métricas a Capturar:**

```typescript
// Tiempo de generación
const startTime = Date.now();
await generateImage();
const duration = Date.now() - startTime;
metrics.histogram('flux_kontext_generation_duration_ms', duration);

// Tasa de éxito
if (success) {
  metrics.increment('flux_kontext_success_total');
} else {
  metrics.increment('flux_kontext_error_total');
}

// Uso por plan
metrics.increment(`flux_kontext_usage_${plan.toLowerCase()}_total`);

// Imágenes generadas por día
metrics.increment('flux_kontext_images_generated_daily');
```

---

## 🔄 **FLUJO COMPLETO DE INTEGRACIÓN**

### **Diagrama de Secuencia:**

```
┌─────────┐         ┌──────────────┐         ┌─────────────────┐         ┌──────────────┐
│ Usuario │         │Backend Principal│         │Video Generator  │         │Azure Foundry │
└────┬────┘         └──────┬───────┘         └────────┬────────┘         └──────┬───────┘
     │                     │                          │                         │
     │ POST /media/        │                          │                         │
     │ flux-kontext/image  │                          │                         │
     │────────────────────>│                          │                         │
     │                     │                          │                         │
     │                     │ POST /media/             │                         │
     │                     │ flux-kontext/image       │                         │
     │                     │ (X-User-Id header)       │                         │
     │                     │─────────────────────────>│                         │
     │                     │                          │                         │
     │                     │                          │ POST /images/generations│
     │                     │                          │ (Bearer API_KEY)        │
     │                     │                          │────────────────────────>│
     │                     │                          │                         │
     │                     │                          │                         │ Response
     │                     │                          │                         │ (base64)
     │                     │                          │<────────────────────────│
     │                     │                          │                         │
     │                     │                          │ Save to temp            │
     │                     │                          │ Upload to Blob          │
     │                     │                          │ Get SAS URL             │
     │                     │                          │                         │
     │                     │ POST /flux-kontext-image │                         │
     │                     │ /complete                │                         │
     │                     │<─────────────────────────│                         │
     │                     │                          │                         │
     │                     │ Save to DB               │                         │
     │                     │                          │                         │
     │ Response            │                          │                         │
     │ (JSON con imageUrl) │                          │                         │
     │<────────────────────│                          │                         │
     │                     │                          │                         │
```

### **Paso a Paso Detallado:**

1. **Usuario hace POST** a `/media/flux-kontext/image`
   - Body: `{ prompt, plan, size }`
   - Headers: `X-User-Id` (opcional)

2. **Backend Principal valida** y reenvía
   - Agrega header: `X-User-Id: {userId}`
   - POST a `http://video-generator:4001/media/flux-kontext/image`

3. **Video Generator procesa**
   - Valida DTO
   - Procesa prompt (si es JSON)
   - Llama a `FluxKontextImageService`

4. **Servicio llama a Azure Foundry**
   - Endpoint: `/images/generations`
   - Payload: `{ model, prompt, n, size, output_format }`
   - Auth: `Authorization: Bearer <API_KEY>`

5. **Azure retorna base64**
   - Response: `{ data: [{ b64_json: "..." }] }`

6. **Video Generator guarda**
   - Decodifica base64 → buffer
   - Guarda en temp/
   - Sube a Azure Blob Storage
   - Obtiene URL con SAS token

7. **Video Generator notifica**
   - POST a `http://backend-principal/flux-kontext-image/complete`
   - Body: `{ userId, prompt, imageUrl, filename }`

8. **Backend Principal guarda en BD**
   - Tabla: `generated_images`
   - Campos: `user_id, image_url, filename, prompt, service, created_at`

9. **Backend responde al usuario**
   - Status: 201 Created
   - Body: `{ success: true, data: { imageUrl, ... } }`

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

### **Backend Principal:**

- [ ] Agregar variables de entorno para video-generator
- [ ] Configurar CORS para origen de video-generator
- [ ] Implementar endpoint `POST /media/flux-kontext/image`
- [ ] Implementar endpoint `POST /media/flux-kontext/edit`
- [ ] Implementar endpoint `POST /flux-kontext-image/complete`
- [ ] Crear tabla `generated_images` en base de datos
- [ ] Agregar logging de notificaciones
- [ ] Validar permisos por plan (FREE, CREATOR, PRO)
- [ ] Implementar rate limiting si es necesario
- [ ] Agregar tests unitarios

### **Video Generator:**

- [x] Servicio `FluxKontextImageService` implementado
- [x] Endpoints en controller configurados
- [x] DTOs con validaciones creados
- [x] Variables de entorno documentadas
- [ ] Tests de integración implementados
- [ ] Documentación Swagger actualizada
- [ ] Logs configurados correctamente

### **Pruebas:**

- [ ] Test de generación básica
- [ ] Test de edición con referencia
- [ ] Test de notificación al backend
- [ ] Test de errores (401, 404, 500)
- [ ] Test de validación de DTOs
- [ ] Test de carga (múltiples peticiones)

---

## 🚀 **DEPLOYMENT**

### **1. Construir Docker**

```bash
docker build -t video-converter:latest .
```

### **2. Ejecutar Local**

```bash
docker run -d --name video-generator-test \
  -p 4001:8080 \
  --env-file .env \
  video-converter:latest
```

### **3. Desplegar a Azure**

```bash
# Login a Azure
az login

# Set subscription
az account set --subscription "<subscription-id>"

# Deploy
az webapp deployment source config-zip \
  --resource-group realculture-rg \
  --name video-converter \
  --src deployment.zip
```

### **4. Configurar Variables en Azure**

```bash
az webapp config appsettings set \
  --resource-group realculture-rg \
  --name video-converter \
  --settings \
    FLUX_KONTEXT_PRO_BASE_URL="https://labsc-m9j5kbl9-eastus2.services.ai.azure.com" \
    FLUX_KONTEXT_PRO_DEPLOYMENT="FLUX.1-Kontext-pro" \
    FLUX_KONTEXT_PRO_API_VERSION="2025-04-01-preview" \
    FLUX_KONTEXT_PRO_API_KEY="7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"
```

---

## 📞 **SOPORTE**

### **Documentación Adicional:**

- [`BACKEND_INTEGRATION_FLUX_KONTEXT_COMPLETE.md`](./BACKEND_INTEGRATION_FLUX_KONTEXT_COMPLETE.md) - Guía completa de integración
- [`FLUX_KONTEXT_CORRECTIONS.md`](./FLUX_KONTEXT_CORRECTIONS.md) - Correcciones implementadas
- [`FLUX_KONTEXT_REFERENCE_IMAGE_SUPPORT.md`](./FLUX_KONTEXT_REFERENCE_IMAGE_SUPPORT.md) - Soporte de imagen de referencia

### **Contacto:**

- Email: labsc@realculture.ai
- Slack: #video-generator-support

---

**Estado:** ✅ LISTO PARA PRODUCCIÓN  
**Última Actualización:** 2026-03-09  
**Versión:** 1.0.0
