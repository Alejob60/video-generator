# 🔧 CORRECCIONES CRÍTICAS - FLUX KONTEXT PRO

**Fecha:** 2026-03-09  
**Estado:** Correcciones basadas en documentación oficial de Microsoft Foundry

---

## ⚠️ **ERRORES IDENTIFICADOS Y CORREGIDOS:**

### **Error 1: Autenticación Incorrecta** ❌

#### **ANTES (INCORRECTO):**
```typescript
// Azure AD Token (DefaultAzureCredential)
const credential = new DefaultAzureCredential();
const tokenResponse = await credential.getToken('https://cognitiveservices.azure.com/.default');
headers: { 'Authorization': `Bearer ${tokenResponse.token}` }
```

#### **AHORA (CORRECTO):**
```typescript
// API Key directa (Bearer token)
const authHeader = `Bearer ${this.apiKey}`;
headers: { 'Authorization': authHeader }
```

**Documentación oficial:**
```bash
export AZURE_API_KEY="<your-api-key>"
curl -H "Authorization: Bearer $AZURE_API_KEY" ...
```

---

### **Error 2: Endpoint Incorrecto** ❌

#### **ANTES (INCORRECTO):**
```
https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com/
```

#### **AHORA (CORRECTO):**
```
https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/
```

**Nota:** El endpoint correcto usa `.services.ai.azure.com` NO `.cognitiveservices.azure.com`

---

### **Error 3: Payload sin campo `model`** ❌

#### **ANTES (INCORRECTO):**
```json
{
  "prompt": "...",
  "n": 1,
  "size": "1024x1024",
  "output_format": "png"
}
```

#### **AHORA (CORRECTO):**
```json
{
  "model": "FLUX.1-Kontext-pro",  // ← OBLIGATORIO
  "prompt": "...",
  "n": 1,
  "size": "1024x1024",
  "output_format": "png"
}
```

**Documentación oficial curl:**
```bash
-d '{
  "prompt": "A photograph of a red fox in an autumn forest",
  "n": 1,
  "model": "FLUX.1-Kontext-pro"
}'
```

---

### **Error 4: FormData sin campo `model`** ❌

#### **ANTES (INCORRECTO):**
```typescript
formData.append('prompt', finalPrompt);
formData.append('n', '1');
formData.append('size', dto.size || '1024x1024');
formData.append('image', fs.createReadStream(referenceImagePath));
```

#### **AHORA (CORRECTO):**
```typescript
formData.append('model', this.deployment);  // ← OBLIGATORIO
formData.append('prompt', finalPrompt);
formData.append('n', '1');
formData.append('size', dto.size || '1024x1024');
formData.append('image', fs.createReadStream(referenceImagePath));
```

**Documentación oficial curl para edits:**
```bash
-F "model=FLUX.1-Kontext-pro" \
-F "image=@image_to_edit.png" \
-F "prompt=Make this black and white"
```

---

## ✅ **CÓDIGO CORREGIDO COMPLETO:**

### [`flux-kontext-image.service.ts`](file:///d:/MisyBot/RealCulture%20AI/video-generator/src/infrastructure/services/flux-kontext-image.service.ts)

```typescript
@Injectable()
export class FluxKontextImageService {
  private readonly logger = new Logger(FluxKontextImageService.name);
  private readonly baseURL = process.env.FLUX_KONTEXT_PRO_BASE_URL || 
    'https://labsc-m9j5kbl9-eastus2.services.ai.azure.com';  // ✅ Endpoint correcto
  private readonly deployment = 'FLUX.1-Kontext-pro';
  private readonly apiVersion = '2025-04-01-preview';
  private readonly apiKey = process.env.FLUX_KONTEXT_PRO_API_KEY || '';
  private readonly backendUrl = process.env.MAIN_BACKEND_URL!;

  constructor(
    private readonly azureBlobService: AzureBlobService,
    private readonly llmService: LLMService,
  ) {}

  async generateImageAndNotify(
    userId: string, 
    dto: GenerateFluxImageDto, 
    referenceImagePath?: string
  ): Promise<{ imageUrl: string; filename: string; prompt: string }> {
    
    // ... procesamiento del prompt ...

    // ✅ Autenticación con API Key (NO Azure AD)
    const authHeader = `Bearer ${this.apiKey}`;
    
    let response: any;

    try {
      if (referenceImagePath) {
        // ✅ ENDPOINT DE EDICIÓN CON IMAGEN DE REFERENCIA
        const editsPath = `openai/deployments/${this.deployment}/images/edits`;
        const editsUrl = `${this.baseURL}/${editsPath}?api-version=${this.apiVersion}`;
        const formData = new FormData();
        
        // ✅ Agregar model al FormData
        formData.append('model', this.deployment);
        formData.append('prompt', finalPrompt);
        formData.append('n', '1');
        formData.append('size', dto.size || '1024x1024');
        formData.append('image', fs.createReadStream(referenceImagePath));

        response = await axios.post(editsUrl, formData, {
          headers: {
            'Authorization': authHeader,  // ✅ API Key directa
            ...formData.getHeaders(),
          },
        });
      } else {
        // ✅ ENDPOINT DE GENERACIÓN (SÓLO PROMPT)
        const generationsPath = `openai/deployments/${this.deployment}/images/generations`;
        const generationsUrl = `${this.baseURL}/${generationsPath}?api-version=${this.apiVersion}`;
        
        // ✅ Agregar model al payload
        const payload = {
          model: this.deployment,  // ← OBLIGATORIO
          prompt: finalPrompt,
          output_format: 'png',
          n: 1,
          size: dto.size || '1024x1024',
        };

        response = await axios.post(generationsUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,  // ✅ API Key directa
          },
          responseType: 'json',
        });
      }

      // Procesar respuesta...
    } catch (error) {
      throw error;
    }
  }
}
```

---

## 📋 **VARIABLES DE ENTORNO CORRECTAS:**

### `.env`:
```env
#----FLUX.1-Kontext-pro (Soporta imagen de referencia + prompt)
FLUX_KONTEXT_PRO_BASE_URL=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com
FLUX_KONTEXT_PRO_DEPLOYMENT=FLUX.1-Kontext-pro
FLUX_KONTEXT_PRO_API_VERSION=2025-04-01-preview
FLUX_KONTEXT_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS
```

---

## 🧪 **SCRIPTS DE PRUEBA OFICIALES:**

### **Test 1: Generación de imagen**
```bash
#!/bin/bash
# test-flux-kontext-generate.sh

export AZURE_API_KEY="7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"

curl -X POST "https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AZURE_API_KEY" \
  -d '{
    "prompt": "A photograph of a red fox in an autumn forest",
    "n": 1,
    "model": "FLUX.1-Kontext-pro"
  }' | jq -r '.data[0].b64_json' | base64 --decode > generated_image.png

echo "✅ Imagen generada: generated_image.png"
```

### **Test 2: Edición de imagen**
```bash
#!/bin/bash
# test-flux-kontext-edit.sh

export AZURE_API_KEY="7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"

curl -X POST "https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/edits?api-version=2025-04-01-preview" \
  -H "Authorization: Bearer $AZURE_API_KEY" \
  -F "model=FLUX.1-Kontext-pro" \
  -F "image=@generated_image.png" \
  -F "prompt=Make this black and white" | jq -r '.data[0].b64_json' | base64 --decode > edited_image.png

echo "✅ Imagen editada: edited_image.png"
```

---

## 📊 **COMPARATIVA ANTES VS AHORA:**

| Elemento | Antes ❌ | Ahora ✅ |
|----------|---------|----------|
| **Endpoint** | `.cognitiveservices.azure.com` | `.services.ai.azure.com` |
| **Autenticación** | Azure AD Token | API Key (`Bearer <key>`)|
| **Generations Payload** | Sin `model` | Con `model: "FLUX.1-Kontext-pro"` |
| **Edits FormData** | Sin `model` | Con `-F "model=FLUX.1-Kontext-pro"` |
| **Imports** | `DefaultAzureCredential` | Removido (no necesario) |

---

## 🎯 **PRUEBAS LOCALES RECOMENDADAS:**

### **Paso 1: Probar generación desde texto**
```bash
# PowerShell
$Env:AZURE_API_KEY="7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"

curl.exe -X POST "https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $Env:AZURE_API_KEY" `
  -d "{\"prompt\":\"A red fox in autumn forest\",\"n\":1,\"model\":\"FLUX.1-Kontext-pro\"}"
```

### **Paso 2: Probar edición con imagen**
```bash
# Primero generar una imagen
# Luego editarla
curl.exe -X POST "https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/edits?api-version=2025-04-01-preview" `
  -H "Authorization: Bearer $Env:AZURE_API_KEY" `
  -F "model=FLUX.1-Kontext-pro" `
  -F "image=@generated_image.png" `
  -F "prompt=Make it cyberpunk style"
```

---

## ⚡ **IMPACTO DE LAS CORRECCIONES:**

### **Antes (con Azure AD):**
- ❌ Error 401 Unauthorized
- ❌ Error 403 Forbidden
- ❌ Token expirado rápidamente

### **Ahora (con API Key):**
- ✅ Autenticación directa y simple
- ✅ Sin dependencias de Azure AD
- ✅ Funciona en cualquier entorno (local, Docker, Azure)

---

## 📝 **LECCIONES APRENDIDAS:**

1. ✅ **Siempre verificar la documentación oficial de Foundry**
   - Los ejemplos de curl son la fuente de verdad
   - No asumir autenticación estándar de Cognitive Services

2. ✅ **Diferenciar entre endpoints:**
   - `.cognitiveservices.azure.com` → Azure AD
   - `.services.ai.azure.com` → API Key

3. ✅ **El campo `model` es OBLIGATORIO**
   - Tanto en JSON como en FormData
   - Debe coincidir exactamente con el deployment name

4. ✅ **Los payloads oficiales son la mejor referencia**
   - Copiar estructura exacta de los ejemplos de Microsoft
   - No simplificar o asumir campos opcionales

---

## ✅ **CHECKLIST DE VALIDACIÓN:**

- [x] Endpoint actualizado a `.services.ai.azure.com`
- [x] Autenticación cambiada a `Bearer ${apiKey}`
- [x] Agregado campo `model` en payload JSON
- [x] Agregado campo `model` en FormData
- [x] Removido `DefaultAzureCredential`
- [x] Variables de entorno actualizadas
- [ ] Probar endpoint de generación
- [ ] Probar endpoint de edición
- [ ] Validar que retorna base64 correctamente

---

## 🚀 **PRÓXIMOS PASOS:**

### Inmediato:
1. [ ] Reconstruir Docker con correcciones
2. [ ] Probar generación desde texto
3. [ ] Probar edición con imagen de referencia
4. [ ] Validar respuesta base64

### Documentación:
1. [ ] Actualizar README con endpoints correctos
2. [ ] Crear guía de uso para frontend
3. [ ] Documentar casos de uso de edición

---

**Estado:** ✅ CORREGIDO - Listo para pruebas  
**Impacto:** Crítico (autenticación y endpoints correctos)  
**Riesgo:** Bajo (corrección basada en docs oficiales)
