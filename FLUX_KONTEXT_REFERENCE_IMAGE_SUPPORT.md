# 🎯 FLUX KONTEXT PRO - SOPORTE DE IMAGEN DE REFERENCIA

**Fecha:** 2026-03-09  
**Capacidad:** Edición de imágenes con prompt + imagen de referencia

---

## 🔍 **ANÁLISIS DEL CÓDIGO PROPORCIONADO:**

### **DOS ENDPOINTS PRINCIPALES:**

#### 1. **Generación desde texto** (`/images/generations`)
```javascript
POST /openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview
Content-Type: application/json
Authorization: Bearer <token>

{
  "prompt": "robot futurista en una ciudad cyberpunk",
  "n": 1,
  "size": "1024x1024",
  "output_format": "png"
}
```

#### 2. **Edición con imagen de referencia** (`/images/edits`) ⭐ NUEVO
```javascript
POST /openai/deployments/FLUX.1-Kontext-pro/images/edits?api-version=2025-04-01-preview
Content-Type: multipart/form-data
Authorization: Bearer <token>

FormData:
  - prompt: "robot futurista en una ciudad cyberpunk"
  - image: <archivo PNG>  // ← IMAGEN DE REFERENCIA
  - n: 1
  - size: "1024x1024"
```

---

## ✅ **VARIABLES DE ENTORNO ACTUALIZADAS:**

### **ANTES:**
```env
#----FLUX.1-Kontext-pro
FLUX_KONTEXT_PRO=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview
FLUX_KONTEXT_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS
```

### **AHORA:**
```env
#----FLUX.1-Kontext-pro (Soporta imagen de referencia + prompt)
FLUX_KONTEXT_PRO_BASE_URL=https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com
FLUX_KONTEXT_PRO_DEPLOYMENT=FLUX.1-Kontext-pro
FLUX_KONTEXT_PRO_API_VERSION=2025-04-01-preview
FLUX_KONTEXT_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS
```

---

## 🔧 **IMPLEMENTACIÓN EN EL SERVICIO:**

### [`flux-kontext-image.service.ts`](file:///d:/MisyBot/RealCulture%20AI/video-generator/src/infrastructure/services/flux-kontext-image.service.ts)

```typescript
@Injectable()
export class FluxKontextImageService {
  private readonly baseURL = process.env.FLUX_KONTEXT_PRO_BASE_URL || 
    'https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com';
  private readonly deployment = 'FLUX.1-Kontext-pro';
  private readonly apiVersion = '2025-04-01-preview';
  private readonly apiKey = process.env.FLUX_KONTEXT_PRO_API_KEY || '';

  constructor(
    private readonly azureBlobService: AzureBlobService,
    private readonly llmService: LLMService,
  ) {}

  async generateImageAndNotify(
    userId: string, 
    dto: GenerateFluxImageDto, 
    referenceImagePath?: string  // ← PARÁMETRO OPCIONAL PARA IMAGEN DE REFERENCIA
  ): Promise<{ imageUrl: string; filename: string; prompt: string }> {
    
    // Autenticación con Azure AD
    const credential = new DefaultAzureCredential();
    const tokenResponse = await credential.getToken('https://cognitiveservices.azure.com/.default');
    
    let response: any;

    if (referenceImagePath) {
      // USAR ENDPOINT DE EDICIÓN CON IMAGEN DE REFERENCIA
      const editsPath = `openai/deployments/${this.deployment}/images/edits`;
      const editsUrl = `${this.baseURL}/${editsPath}?api-version=${this.apiVersion}`;
      const formData = new FormData();
      
      formData.append('prompt', finalPrompt);
      formData.append('n', '1');
      formData.append('size', dto.size || '1024x1024');
      formData.append('image', fs.createReadStream(referenceImagePath));

      response = await axios.post(editsUrl, formData, {
        headers: {
          'Authorization': `Bearer ${tokenResponse.token}`,
          ...formData.getHeaders(),
        },
      });
    } else {
      // USAR ENDPOINT DE GENERACIÓN (SÓLO PROMPT)
      const generationsPath = `openai/deployments/${this.deployment}/images/generations`;
      const generationsUrl = `${this.baseURL}/${generationsPath}?api-version=${this.apiVersion}`;
      const payload = {
        prompt: finalPrompt,
        output_format: 'png',
        n: 1,
        size: dto.size || '1024x1024',
      };

      response = await axios.post(generationsUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenResponse.token}`,
        },
      });
    }

    // Procesar respuesta (base64)
    const imageData = response.data.choices[0];
    // ... subir a Blob Storage con SAS token
  }
}
```

---

## 📊 **COMPARATIVA DE ENDPOINTS:**

| Característica | `/images/generations` | `/images/edits` |
|----------------|----------------------|-----------------|
| **Uso** | Generar desde cero | Editar con referencia |
| **Content-Type** | `application/json` | `multipart/form-data` |
| **Imagen** | ❌ No requiere | ✅ Obligatoria |
| **Prompt** | ✅ Requerido | ✅ Requerido |
| **Autenticación** | Azure AD Token | Azure AD Token |
| **Response** | `data[0].b64_json` | `data[0].b64_json` |
| **Tiempo** | ~5-10 segundos | ~5-10 segundos |

---

## 🎯 **CASOS DE USO:**

### **Caso 1: Generación desde Texto**
```typescript
// Endpoint: POST /media/flux-kontext/image
{
  "prompt": "A beautiful sunset over mountains",
  "plan": "PRO",
  "size": "1024x1024"
}

// Resultado: Imagen generada desde cero
```

### **Caso 2: Edición con Imagen de Referencia** ⭐
```typescript
// Endpoint: POST /media/flux-kontext/edit
{
  "prompt": "Make it cyberpunk style with neon lights",
  "plan": "PRO",
  "size": "1024x1024",
  "referenceImageUrl": "https://.../original-image.png"  // ← URL de imagen existente
}

// Resultado: Imagen editada manteniendo composición original
```

---

## 💡 **EJEMPLOS PRÁCTICOS:**

### **Ejemplo 1: Cambiar estilo artístico**
```
Prompt: "Convert this photo to oil painting style"
Imagen: Foto real de paisaje
Resultado: Paisaje en estilo óleo
```

### **Ejemplo 2: Agregar elementos**
```
Prompt: "Add a dragon flying in the sky"
Imagen: Paisaje montañoso
Resultado: Mismo paisaje con dragón
```

### **Ejemplo 3: Cambiar ambiente**
```
Prompt: "Change to winter scene with snow"
Imagen: Bosque en otoño
Resultado: Mismo bosque nevado
```

---

## 🔐 **AUTENTICACIÓN:**

### **Requerimientos:**
1. ✅ Azure AD (Entra ID) configurado
2. ✅ Role: "Cognitive Services User"
3. ✅ Token scope: `https://cognitiveservices.azure.com/.default`

### **Código de autenticación:**
```typescript
const credential = new DefaultAzureCredential();
const tokenResponse = await credential.getToken('https://cognitiveservices.azure.com/.default');

headers: {
  'Authorization': `Bearer ${tokenResponse.token}`,
  // Para FormData: headers automáticos de form-data
}
```

---

## 📝 **FLUJO COMPLETO CON IMAGEN DE REFERENCIA:**

### 1. **Usuario sube imagen**
```
POST /upload
→ Retorna: imageUrl
```

### 2. **Usuario solicita edición**
```
POST /media/flux-kontext/edit
{
  "prompt": "Make it cyberpunk",
  "referenceImageUrl": "https://..."
}
```

### 3. **Servicio descarga imagen de referencia**
```typescript
const tempPath = path.join(__dirname, 'temp', 'ref-image.png');
await downloadImage(referenceImageUrl, tempPath);
```

### 4. **Envía a FLUX Kontext Pro**
```typescript
const formData = new FormData();
formData.append('prompt', prompt);
formData.append('image', fs.createReadStream(tempPath));
// ... más campos
```

### 5. **Recibe base64 y guarda**
```typescript
const b64 = response.data.choices[0].b64_json;
const buffer = Buffer.from(b64, 'base64');
// Guardar y subir a Blob Storage con SAS
```

### 6. **Retorna URL con SAS**
```json
{
  "success": true,
  "imageUrl": "https://realculturestorage.blob.core.windows.net/images/misy-image-1741567890123.png?sv=2025-07-05..."
}
```

---

## 🚀 **ENDPOINTS A IMPLEMENTAR:**

### **1. Generación básica (YA EXISTE)**
```typescript
@Post('flux-kontext/image')
async generate(@Body() dto: GenerateFluxImageDto) {
  return this.fluxKontextService.generateImageAndNotify('user', dto);
}
```

### **2. Edición con referencia (NUEVO)**
```typescript
@Post('flux-kontext/edit')
@UseInterceptors(FileInterceptor('image'))
async edit(
  @Body() body: EditFluxImageDto,
  @UploadedFile() image: Express.Multer.File
) {
  // Guardar imagen temporalmente
  const tempPath = path.join(__dirname, 'temp', image.originalname);
  fs.writeFileSync(tempPath, image.buffer);
  
  // Llamar al servicio con imagen de referencia
  return this.fluxKontextService.generateImageAndNotify('user', body, tempPath);
}
```

---

## 📋 **DTO SUGERIDO:**

### **GenerateFluxImageDto (Existente)**
```typescript
export class GenerateFluxImageDto {
  @IsString()
  prompt: string;
  
  @IsOptional()
  @IsString()
  size?: string = '1024x1024';
  
  @IsOptional()
  @IsBoolean()
  isJsonPrompt?: boolean = false;
}
```

### **EditFluxImageDto (NUEVO)**
```typescript
export class EditFluxImageDto extends GenerateFluxImageDto {
  @IsOptional()
  @IsString()
  referenceImageUrl?: string;  // URL de imagen existente
  
  @IsOptional()
  @IsString()
  maskImageUrl?: string;  // Máscara opcional para edición selectiva
}
```

---

## ⚠️ **CONSIDERACIONES IMPORTANTES:**

### **Tamaño de imagen de referencia:**
- ✅ Recomendado: < 4MB
- ✅ Formatos: PNG, JPEG
- ✅ Resolución: 1024x1024 ó similar

### **Temp files cleanup:**
```typescript
// Limpieza después de procesar
try {
  fs.unlinkSync(tempPath);
  this.logger.log(`🧹 Cleaned up temp file: ${tempPath}`);
} catch (error) {
  this.logger.warn(`⚠️ Failed to cleanup: ${error.message}`);
}
```

### **Manejo de errores:**
```typescript
if (!fs.existsSync(referenceImagePath)) {
  throw new BadRequestException('Reference image not found');
}

try {
  const stats = fs.statSync(referenceImagePath);
  if (stats.size > 4 * 1024 * 1024) {
    throw new BadRequestException('Image too large (max 4MB)');
  }
} catch (error) {
  // Manejar error
}
```

---

## 🧪 **PRUEBAS:**

### **Test 1: Generación sin referencia**
```bash
curl -X POST http://localhost:4001/media/flux-kontext/image \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A cat","size":"1024x1024"}'
```

### **Test 2: Edición con referencia**
```bash
# Primero subir imagen
curl -X POST http://localhost:4001/upload -F "file=@cat.jpg"
# → Retorna: {"imageUrl": "https://..."}

# Luego editar
curl -X POST http://localhost:4001/media/flux-kontext/edit \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Make it a tiger",
    "referenceImageUrl": "https://.../cat.jpg"
  }'
```

---

## ✅ **BENEFICIOS:**

1. ✅ **Mayor control creativo** - Mantener composición de imagen original
2. ✅ **Iteraciones rápidas** - Variaciones sobre mismo tema
3. ✅ **Consistencia de marca** - Mantener elementos visuales clave
4. ✅ **Ediciones precisas** - Cambios específicos sin alterar todo
5. ✅ **Ahorro de tiempo** - No regenerar desde cero

---

## 🎯 **PRÓXIMOS PASOS:**

### Inmediato:
1. [x] Actualizar variables de entorno
2. [x] Actualizar servicio FluxKontextImageService
3. [ ] Crear DTO para edición con referencia
4. [ ] Implementar endpoint `/edit`
5. [ ] Agregar validación de imágenes

### Corto plazo:
1. [ ] Soporte para máscaras de edición
2. [ ] Multiple image references
3. [ ] Control de fuerza de edición
4. [ ] Documentación de API completa

---

**Estado:** ✅ Servicio actualizado, listo para implementar endpoint de edición  
**Impacto:** Alto (nuevas capacidades de edición de imágenes)  
**Complejidad:** Media (requiere manejo de FormData y archivos temporales)
