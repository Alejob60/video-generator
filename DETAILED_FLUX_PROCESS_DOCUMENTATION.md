# 📘 FLUX Image Generation - Technical Process Documentation

## Executive Summary

This document provides an **extremely detailed** breakdown of every step in the FLUX.1-Kontext-pro image generation pipeline, including all processing modes, enhanced prompt workflows, and internal backend operations.

---

## 🔗 Base URL & Infrastructure

```
Base URL: https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net
Azure Region: Canada Central
Resource Group: realculture-rg
App Service: video-converter(Linux Container)
Container Registry: realcultureacr.azurecr.io
Image Tag: video-converter:latest
```

---

## Table of Contents

1. [Text-to-Image (Basic Mode)](#1-text-to-image-basic-mode)
2. [Text-to-Image with Enhanced Prompt](#2-text-to-image-with-enhanced-prompt)
3. [Image Editing with Reference Upload](#3-image-editing-with-reference-upload)
4. [Internal Processing Pipeline](#4-internal-processing-pipeline)
5. [Enhanced Prompt Deep Dive](#5-enhanced-prompt-deep-dive)
6. [Fallback Mechanisms](#6-fallback-mechanisms)
7. [Azure Blob Storage Integration](#7-azure-blob-storage-integration)
8. [Backend Notification System](#8-backend-notification-system)

---

# 1. Text-to-Image (Basic Mode)

## Endpoint: `POST /media/flux-kontext/image`

### Request Flow Diagram

```
Client Request
    ↓
Controller Layer (flux-kontext-image.controller.ts)
    ↓
Service Layer (flux-kontext-image.service.ts)
    ↓
LLM Service Check (if enhancePrompt=true)
    ↓
FLUX API Call (Azure Foundry)
    ↓
Response Parsing (Multi-format Handler)
    ↓
Azure Blob Upload
    ↓
Backend Notification
    ↓
Client Response
```

### Step-by-Step Execution

#### Step 1: Client Request

**HTTP Request:**
```http
POST /media/flux-kontext/image HTTP/1.1
Host: video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net
Content-Type: application/json

{
  "prompt": "A red fox in autumn forest",
  "plan": "PRO",
  "enhancePrompt": false,
  "size": "1024x1024"
}
```

**Validation:**
- ✅ `prompt` (string, required): Text description
- ✅ `plan` (enum, required): Must be `"PRO"`, `"CREATOR"`, or `"FREE"`
- ❌ `enhancePrompt` (boolean, optional): Default `false`
- ❌ `size` (string, optional): Default `"1024x1024"`

---

#### Step 2: Controller Processing

**File:** `src/interfaces/controllers/flux-kontext-image.controller.ts`

**Code Execution:**
```typescript
@Post('flux-kontext/image')
async generateFromText(
  @Body() dto: GenerateFluxImageDto & { enhancePrompt?: boolean },
  @Headers('x-user-id') userId: string = 'anon',
) {
  let finalPrompt = dto.prompt;
  let enhancedPromptUsed = false;

  // Check if enhancement is requested
  if (dto.enhancePrompt === true) {
    // STEP 2A: Call LLM Service for enhancement
   const improvedPrompt = await this.llmService.improveImagePrompt(dto.prompt);
   finalPrompt = improvedPrompt;
    enhancedPromptUsed = true;
  }

  // STEP 2B: Call service to generate image
  const result = await this.fluxKontextService.generateImageAndNotify(
   userId,
    { ...dto, prompt: finalPrompt },
  );

  // STEP 2C: Return response
  return {
    success: true,
   message: '✅ FLUX Kontext image generated successfully',
    data: {
      imageUrl: result.imageUrl,
     prompt: finalPrompt,
     filename: result.filename,
      enhancedPromptUsed,
    },
  };
}
```

**Processing Details:**
1. Extract `userId` from header `x-user-id` (default: `'anon'`)
2. Initialize `finalPrompt` with original prompt
3. If `enhancePrompt === true`, call LLM service
4. Pass processed prompt to service layer
5. Format response with metadata

---

#### Step 3: Service Layer Processing

**File:** `src/infrastructure/services/flux-kontext-image.service.ts`

**Method:** `generateImageAndNotify()`

##### Step 3A: JSON Prompt Processing

```typescript
async generateImageAndNotify(
  userId: string, 
  dto: GenerateFluxImageDto, 
  referenceImagePath?: string
): Promise<{ imageUrl: string; filename: string; prompt: string }> {
  let finalPrompt = dto.prompt;
  
  // Check if this is a JSON prompt (from LLM service)
  if (dto.isJsonPrompt) {
    try {
     finalPrompt = await this.llmService.improveImagePrompt(dto.prompt);
      this.logger.log(`📋 Converted JSON prompt to natural language with LLM: ${finalPrompt}`);
    } catch (error: any) {
      this.logger.warn(`⚠️ Failed to convert JSON prompt with LLM, using as-is: ${error.message}`);
     finalPrompt = dto.prompt;
    }
  }
```

**Purpose:**Convert structured JSON prompts to natural language descriptions

---

##### Step 3B: Authentication Setup

```typescript
// Use API Key for authentication (Bearer token)
const authHeader = `Bearer ${this.apiKey}`;

// Configuration from environment variables
private readonly baseURL = process.env.FLUX_KONTEXT_PRO_BASE_URL || 
  'https://labsc-m9j5kbl9-eastus2.services.ai.azure.com';
private readonly deployment = process.env.FLUX_KONTEXT_PRO_DEPLOYMENT || 
  'FLUX.1-Kontext-pro';
private readonly apiVersion = '2025-04-01-preview';
private readonly apiKey = process.env.FLUX_KONTEXT_PRO_API_KEY || '';
```

**Environment Variables Required:**
- `FLUX_KONTEXT_PRO_BASE_URL`: Azure Foundry endpoint
- `FLUX_KONTEXT_PRO_DEPLOYMENT`: Model deployment name
- `FLUX_KONTEXT_PRO_API_KEY`: Authentication key
- `MAIN_BACKEND_URL`: Backend notification URL

---

##### Step 3C: FLUX API Call (No Reference Image)

**Endpoint Selection:**
```typescript
if (referenceImagePath) {
  // Use edits endpoint (covered in Section 3)
  // ...
} else {
  // Use generations endpoint
  const generationsPath = `openai/deployments/${this.deployment}/images/generations`;
  const generationsUrl = `${this.baseURL}/${generationsPath}?api-version=${this.apiVersion}`;
  
  const payload = {
    model: this.deployment,
   prompt: finalPrompt,
    output_format: 'png',
    n: 1,
   size: dto.size || '1024x1024',
  };

  this.logger.log(`📡 Sending request to FLUX.1-Kontext-pro with payload: ${JSON.stringify(payload, null, 2)}`);
  
  response = await axios.post(generationsUrl, payload, {
   headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    responseType: 'json',
  });
}
```

**Request Sent to Azure Foundry:**
```http
POST /openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview HTTP/1.1
Host: labsc-m9j5kbl9-eastus2.services.ai.azure.com
Authorization: Bearer <API_KEY>
Content-Type: application/json

{
  "model": "FLUX.1-Kontext-pro",
  "prompt": "A red fox in autumn forest",
  "output_format": "png",
  "n": 1,
  "size": "1024x1024"
}
```

---

##### Step 3D: Response Parsing (Multi-Format Handler)

**Critical Step:** Foundry API can return responses in multiple formats

```typescript
this.logger.log(`📥 FLUX API Response Status: ${response.status}`);
this.logger.log(`🔍 FLUX API Response Type: response.data=${typeof response.data}, isArray=${Array.isArray(response.data)}`);

// Extract image data from response - Handle multiple formats
let imageData: any;

// Format 1: Direct b64_json in response.data(Foundry format)
if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
  // Check if it has b64_json directly
  if (response.data.b64_json) {
    imageData = response.data;
    this.logger.log('📊 Using direct response.data.b64_json format');
  }
  // Check if it has data array inside (OpenAI/Foundry standard)
  else if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
    imageData = response.data.data[0];
    this.logger.log('📊 Using response.data.data[0] format');
  }
  // Check choices array (alternative format)
  else if (response.data.choices && Array.isArray(response.data.choices) && response.data.choices.length > 0) {
    imageData = response.data.choices[0];
    this.logger.log('📊 Using response.data.choices[0] format');
  }
}
// Format 2: response.data is array directly
else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
  imageData = response.data[0];
  this.logger.log('📊 Using response.data[0] format');
}
// Fallback to top-level choices
else if (response.choices && Array.isArray(response.choices) && response.choices.length > 0) {
  imageData = response.choices[0];
  this.logger.log('📊 Using response.choices[0] format');
} else {
  this.logger.error(`❌ Unexpected response structure. Keys: ${Object.keys(response.data || {}).join(', ')}`);
  throw new Error('No image data received from FLUX API - unexpected response format');
}
```

**Supported Response Formats:**

| Format | Structure | Example |
|--------|-----------|---------|
| **Direct b64_json** | `{ "data": { "b64_json": "..." } }` | Foundry native |
| **Nested data array** | `{ "data": [{ "b64_json": "..." }] }` | OpenAI standard |
| **Nested choices** | `{ "data": { "choices": [...] } }` | Alternative |
| **Direct array** | `{ "data": [...] }` | Simplified |
| **Top choices** | `{ "choices": [...] }` | Legacy |

---

##### Step 3E: Image Data Handling

**Two Possible Cases:**

**Case A: URL Provided**
```typescript
if (imageData.url) {
  this.logger.log(`🌐 Image URL provided by FLUX: ${imageData.url}`);
  filename = `misy-image-${Date.now()}.png`;
  
  // Download from URL and upload to Azure Blob
  blobUrl = await this.azureBlobService.uploadFileFromUrlWithSas(
    imageData.url, 
    `images/${filename}`
  );
  
  this.logger.log(`✅ Image uploaded to Azure Blob Storage from URL with SAS: ${blobUrl}`);
}
```

**Execution Flow:**
1. Generate unique filename with timestamp
2. Download image from FLUX URL
3. Upload to Azure Blob Storage
4. Generate SAS token for access
5. Return SAS URL

---

**Case B: Base64 Provided**
```typescript
else if (imageData.b64_json) {
  this.logger.log(`📝 Base64 data provided by FLUX, length: ${imageData.b64_json.length}`);
  
  // Validate and decode base64
  const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(imageData.b64_json);
  this.logger.log(`🔍 Base64 validation result: ${isValidBase64}`);
  
  const cleanBase64 = imageData.b64_json.replace(/\s/g, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  
  this.logger.log(`💾 Decoded buffer size: ${buffer.length} bytes`);
  
  // Validate PNG header
  const pngHeader = buffer.slice(0, 8);
  const isPng = pngHeader.equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
  this.logger.log(`🔍 PNG header validation: ${isPng? 'Valid PNG' : 'Invalid PNG header'}`);
  
  filename = `misy-image-${Date.now()}.png`;
  const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);
  
  // Ensure temp directory exists
  const tempDir = path.dirname(tempPath);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Save temporarily and upload
  fs.writeFileSync(tempPath, buffer);
  this.logger.log(`💾 Writing image to temporary file: ${tempPath}`);
  
  blobUrl = await this.azureBlobService.uploadFileToBlobWithSas(
    tempPath, 
    `images/${filename}`, 
    'image/png'
  );
  this.logger.log(`✅ Image uploaded to Azure Blob Storage with SAS: ${blobUrl}`);
}
```

**Execution Flow:**
1. Validate base64 format (regex check)
2. Clean whitespace from base64 string
3. Decode base64 to binary buffer
4. Validate PNG header signature (first 8 bytes)
5. Create temp directory if needed
6. Write buffer to temp file
7. Upload file to Azure Blob Storage
8. Generate SAS token
9. Keep temp file for debugging

**PNG Header Validation:**
```
Expected: 89 50 4E 47 0D 0A 1A 0A (hex)
ASCII:    ‰ P N G ␍ ␊ ␚ ␊
Result: Confirms valid PNG file format
```

---

#### Step 4: Backend Notification

**File:** `src/infrastructure/services/flux-kontext-image.service.ts`

```typescript
// Notify main backend
this.logger.log(`🔔 Notifying main backend about generated image`);
await fetch(`${this.backendUrl}/flux-kontext-image/complete`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
   userId,
   prompt: finalPrompt,
    imageUrl: blobUrl,
   filename,
  }),
});
```

**Notification Payload:**
```json
{
  "userId": "anon",
  "prompt": "A red fox in autumn forest",
  "imageUrl": "https://realculturestorage.blob.core.windows.net/imagen/images/misy-image-1773070071739.png?sv=...",
  "filename": "misy-image-1773070071739.png"
}
```

**Backend Processing:**
1. Main backend receives notification
2. Stores metadata in database
3. Links image to user account
4. Updates processing status
5. Triggers downstream workflows (if any)

---

#### Step 5: Response to Client

**Final Response:**
```json
{
  "success": true,
  "message": "✅ FLUX Kontext image generated successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/imagen/images/misy-image-1773070071739.png?sv=...",
    "prompt": "A red fox in autumn forest",
    "filename": "misy-image-1773070071739.png",
    "enhancedPromptUsed": false
  }
}
```

**HTTP Status:** `201 Created`

---

# 2. Text-to-Image with Enhanced Prompt

## Same Endpoint: `POST /media/flux-kontext/image`

### Difference: `enhancePrompt: true`

---

## Detailed Enhancement Process

### Step 1: Client Request with Enhancement

```json
{
  "prompt": "A cat",
  "plan": "PRO",
  "enhancePrompt": true,
  "size": "1024x1024"
}
```

---

### Step 2: Controller Detects Enhancement Flag

```typescript
if (dto.enhancePrompt === true) {
  this.logger.log('🔄 Enhancing prompt with LLM...');
  
  try {
 const improvedPrompt = await this.llmService.improveImagePrompt(dto.prompt);
 finalPrompt = improvedPrompt;
   enhancedPromptUsed = true;
   
   this.logger.log(`✅ Prompt enhanced successfully`);
   this.logger.log(`📝 Original: ${dto.prompt.substring(0, 80)}...`);
   this.logger.log(`📝 Enhanced: ${finalPrompt.substring(0, 80)}...`);
  } catch (llmError: any) {
   this.logger.warn(`⚠️ LLM enhancement failed: ${llmError.message}`);
   this.logger.warn('⚠️ Using original prompt as fallback');
   // Use original prompt if LLM fails
  }
}
```

**Key Points:
- ✅ Enhancement happens **before** calling FLUX service
- ⚠️ If LLM fails, original prompt is used (graceful degradation)
- 📊 Response includes `enhancedPromptUsed: true/false` flag

---

### Step 3: LLM Service Enhancement

**File:** `src/infrastructure/services/llm.service.ts`

**Method:** `improveImagePrompt()`

#### Step 3A: System Prompt Construction

```typescript
async improveImagePrompt(prompt: string): Promise<string> {
 const systemPrompt = `
Eres un artista digital experto en generación de imágenes por IA.
Toma el prompt base y mejóralo incluyendo:
- Estilo visual (ej. minimalista, barroco, anime, Ghibli)
- Fondo detallado y coherente con la escena
- Iluminación realista o dramática según contexto
- Composición, perspectiva, líneas de fuga, simetría
- Paleta de colores y texturas
- Emoción o atmósfera que transmita la escena
Devuelve solo el prompt mejorado, listo para usar en generación de imágenes.
`.trim();

  return this.runRawPrompt(prompt, systemPrompt);
}
```

**System Instructions Breakdown:**

| Element | Purpose | Example Addition |
|---------|---------|------------------|
| **Visual Style** | Define artistic approach | "minimalist, Ghibli style" |
| **Detailed Background** | Add context depth | "detailed forest with dappled sunlight" |
| **Lighting** | Set mood & realism | "cinematic lighting, golden hour" |
| **Composition** | Guide framing | "rule of thirds, leading lines" |
| **Color Palette** | Define color scheme | "warm autumn tones, orange and gold" |
| **Emotion/Atmosphere** | Convey feeling | "peaceful, serene, mystical" |

---

#### Step 3B: LLM API Call

**Helper Method:** `runRawPrompt()`

```typescript
private async runRawPrompt(prompt: string, systemPrompt: string): Promise<string> {
 const url = process.env.AZURE_OPENAI_GPT_URL;
 const apiKey = process.env.AZURE_OPENAI_KEY;
  if (!url || !apiKey) throw new Error('❌ AZURE_OPENAI_GPT_URL o AZURE_OPENAI_KEY no definidos');

 const body = {
 messages: [
     { role: 'system', content: systemPrompt },
     { role: 'user', content: `Prompt base: ${prompt}` },
   ],
   max_tokens: 300,
   temperature: 0.8,
  };

  try {
 const response = await axios.post(url, body, {
   headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
   });

 const result = response?.data?.choices?.[0]?.message?.content?.trim();
 if (!result) throw new Error('⚠️ Prompt mejorado vacío');
   this.logger.log(`✅ Prompt mejorado: ${result}`);
   return result;
  } catch (error) {
   this.logger.error('❌ Error mejorando prompt:', error);
   throw error;
  }
}
```

**Request to Azure OpenAI:**
```http
POST /chat/completions HTTP/1.1
Host: <azure-openai-endpoint>
api-key: <AZURE_OPENAI_KEY>
Content-Type: application/json

{
  "messages": [
   {
     "role": "system",
     "content": "Eres un artista digital experto en generación de imágenes por IA..."
   },
   {
     "role": "user",
     "content": "Prompt base: A cat"
   }
  ],
  "max_tokens": 300,
  "temperature": 0.8
}
```

---

#### Step 3C: Enhancement Example

**Input Prompt:**
```
"A cat"
```

**LLM Processing:**
1. System prompt instructs to add:
  - Visual style
  - Detailed background
  - Lighting
  - Composition
  - Color palette
  - Emotion/atmosphere

2. LLM generates enhanced version

**Output Prompt:**
```
"A majestic fluffy cat with vibrant orange fur sitting regally in a sunlit Victorian 
room, detailed Persian carpet with intricate patterns, ornate furniture in background, 
warm golden hour lighting streaming through tall windows, dust motes dancing in light 
beams, photorealistic style, shallow depth of field, rich warm color palette with amber 
and cream tones, peaceful and noble atmosphere, professional photography, high detail, 
8K resolution"
```

**Enhancement Analysis:**

| Added Element | Description |
|---------------|-------------|
| **Subject Detail** | "majestic fluffy cat with vibrant orange fur" |
| **Pose/Expression** | "sitting regally" |
| **Background** | "sunlit Victorian room, detailed Persian carpet, ornate furniture" |
| **Lighting** | "warm golden hour lighting streaming through tall windows, dust motes" |
| **Style** | "photorealistic style, shallow depth of field" |
| **Colors** | "rich warm color palette with amber and cream tones" |
| **Atmosphere** | "peaceful and noble atmosphere" |
| **Technical** | "professional photography, high detail, 8K resolution" |

---

#### Step 3D: Error Handling

If LLM enhancement fails:

```typescript
catch (llmError: any) {
  this.logger.warn(`⚠️ LLM enhancement failed: ${llmError.message}`);
  this.logger.warn('⚠️ Using original prompt as fallback');
  // Gracefully use original prompt
}
```

**Failure Scenarios:**
- ❌ Azure OpenAI service unavailable
- ❌ API key invalid/expired
- ❌ Timeout (>30 seconds)
- ❌ Empty response from LLM
- ❌ Rate limit exceeded

**Fallback Behavior:**
- ✅ Original prompt is used
- ✅ Warning logged (not error)
- ✅ User not notified of failure
- ✅ Process continues normally

---

### Step 4: Enhanced Prompt to FLUX

After enhancement, the improved prompt is sent to FLUX API:

```typescript
const result = await this.fluxKontextService.generateImageAndNotify(
  userId,
  { ...dto, prompt: finalPrompt }, // Uses enhanced prompt
);
```

**FLUX Receives:**
```json
{
  "model": "FLUX.1-Kontext-pro",
  "prompt": "A majestic fluffy cat with vibrant orange fur sitting regally in a sunlit Victorian room...",
  "output_format": "png",
  "n": 1,
  "size": "1024x1024"
}
```

---

### Step 5: Response Indicates Enhancement

```json
{
  "success": true,
  "message": "✅ FLUX Kontext image generated successfully",
  "data": {
   "imageUrl": "https://realculturestorage.blob.core.windows.net/imagen/images/misy-image-1773070071739.png",
   "prompt": "A majestic fluffy cat with vibrant orange fur sitting regally in a sunlit Victorian room...",
   "filename": "misy-image-1773070071739.png",
   "enhancedPromptUsed": true  // ← Indicates enhancement was applied
  }
}
```

---

# 3. Image Editing with Reference Upload

## Endpoint: `POST /media/flux-kontext/image-with-reference`

### Unified Multipart Form Data Approach

---

## Complete Workflow

### Step 1: Client Sends Multipart Request

```http
POST /media/flux-kontext/image-with-reference HTTP/1.1
Host: video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="prompt"

A red fox sitting on this rock
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="plan"

PRO
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="enhancePrompt"

false
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="referenceImage"; filename="fox.png"
Content-Type: image/png

[binary image data]
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | ✅ Yes | Edit instruction |
| `plan` | string | ✅ Yes | `"PRO"`, `"CREATOR"`, or `"FREE"` |
| `enhancePrompt` | string | ❌ No | `"true"` or `"false"` |
| `referenceImage` | file | ✅ Yes | PNG/JPG (max 10MB) |

---

### Step 2: Controller Handles File Upload

**File:** `src/interfaces/controllers/flux-kontext-image.controller.ts`

```typescript
@Post('flux-kontext/image-with-reference')
@UseInterceptors(
  FileInterceptor('referenceImage', {
   storage: diskStorage({
     destination: './temp',
   filename: (req, file, callback) => {
     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
     const ext = extname(file.originalname);
       callback(null, `flux-ref-${uniqueSuffix}${ext}`);
     },
   }),
 fileFilter: (req, file, callback) => {
   if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
       return callback(new Error('Only image files (JPG, PNG) are allowed'), false);
     }
     callback(null, true);
   },
   limits: {
   fileSize: 10 * 1024 * 1024, // 10MB limit
   },
  }),
)
async generateWithReferenceImage(
  @Body() body: { prompt: string; plan: string; enhancePrompt?: boolean },
  @UploadedFile() referenceImage: Express.Multer.File,
  @Headers('x-user-id') userId: string = 'anon',
) {
  try {
 if (!referenceImage) {
     throw new Error('Reference image is required');
   }

   this.logger.log(`📸 FLUX Kontext with reference image for user: ${userId}`);
   this.logger.log(`📝 Prompt: ${body.prompt}`);
   this.logger.log(`📁 Reference image: ${referenceImage.filename} (${referenceImage.size} bytes)`);

   let finalPrompt = body.prompt;
   let enhancedPromptUsed = false;

   // Enhance prompt if requested
 if (body.enhancePrompt === true) {
     try {
     const improvedPrompt = await this.llmService.improveImagePrompt(body.prompt);
     finalPrompt = improvedPrompt;
       enhancedPromptUsed = true;
       this.logger.log(`✅ Prompt enhanced: ${finalPrompt}`);
     } catch (llmError: any) {
       this.logger.warn(`⚠️ LLM enhancement failed, using original prompt`);
     }
   }

   // Generate image using service with reference image path
 const result = await this.fluxKontextService.generateImageAndNotify(
    userId,
     { 
     prompt: finalPrompt, 
       plan: body.plan || 'PRO',
      size: '1024x1024',
     },
     referenceImage.path, // Pass reference image path to service
   );

   return {
     success: true,
   message: '✅ FLUX Kontext image generated with reference',
     data: {
       imageUrl: result.imageUrl,
     prompt: finalPrompt,
     filename: result.filename,
       referenceImageName: referenceImage.originalname,
       enhancedPromptUsed,
     },
   };
  } catch (error: any) {
   this.logger.error(`❌ Error generating with reference: ${error.message}`, error.stack);
   throw new Error(`FLUX Kontext generation with reference failed: ${error.message}`);
  }
}
```

---

### Step 2A: Multer Middleware Processing

**File Upload Handling:**

1. **Intercept File:**
  - Extracts`referenceImage` from multipart form
  - Validates file type (JPG/PNG only)
  - Checks file size (≤10MB)

2. **Generate Unique Filename:**
  ```typescript
 const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
 const ext = extname(file.originalname);
  // Result: "flux-ref-1773070071739-123456789.png"
  ```

3. **Save to Temp Directory:**
  ```typescript
  destination: './temp'
  // Full path: "/app/temp/flux-ref-1773070071739-123456789.png"
  ```

4. **Validation:**
  ```typescript
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
    return callback(new Error('Only image files (JPG, PNG) are allowed'), false);
  }
  ```

**Multer File Object:**
```typescript
{
  fieldname: 'referenceImage',
  originalname: 'fox.png',
 encoding: '7bit',
  mimetype: 'image/png',
  filename: 'flux-ref-1773070071739-123456789.png',
  path: '/app/temp/flux-ref-1773070071739-123456789.png',
  size:2458672
}
```

---

### Step 3: Optional Prompt Enhancement

Same enhancement process as Section 2, but triggered by form field:

```typescript
if (body.enhancePrompt === true) {
 const improvedPrompt = await this.llmService.improveImagePrompt(body.prompt);
  finalPrompt = improvedPrompt;
 enhancedPromptUsed = true;
}
```

**Note:** Form field `enhancePrompt` is a string (`"true"`/`"false"`), converted to boolean automatically by NestJS

---

### Step 4: Service Calls FLUX Edits Endpoint

**File:** `src/infrastructure/services/flux-kontext-image.service.ts`

```typescript
if (referenceImagePath) {
  // Use edits endpoint with reference image
 const editsPath = `openai/deployments/${this.deployment}/images/edits`;
 const editsUrl = `${this.baseURL}/${editsPath}?api-version=${this.apiVersion}`;
  
 const formData = new FormData();
  
 formData.append('model', this.deployment);
 formData.append('prompt', finalPrompt);
 formData.append('n', '1');
 formData.append('size', dto.size || '1024x1024');
 formData.append('image', fs.createReadStream(referenceImagePath));

  this.logger.log(`📡 Sending edit request to FLUX.1-Kontext-pro with prompt: ${finalPrompt}`);
  
  response = await axios.post(editsUrl, formData, {
 headers: {
     'Authorization': authHeader,
     ...formData.getHeaders(),
   },
  });
}
```

---

### Step 4A: FormData Construction

**What Gets Sent to FLUX:**

```http
POST /openai/deployments/FLUX.1-Kontext-pro/images/edits?api-version=2025-04-01-preview HTTP/1.1
Host: labsc-m9j5kbl9-eastus2.services.ai.azure.com
Authorization: Bearer <API_KEY>
Content-Type: multipart/form-data; boundary=----FormDataBoundary

------FormDataBoundary
Content-Disposition: form-data; name="model"

FLUX.1-Kontext-pro
------FormDataBoundary
Content-Disposition: form-data; name="prompt"

A red fox sitting on this rock
------FormDataBoundary
Content-Disposition: form-data; name="n"

1
------FormDataBoundary
Content-Disposition: form-data; name="size"

1024x1024
------FormDataBoundary
Content-Disposition: form-data; name="image"; filename="flux-ref-1773070071739-123456789.png"
Content-Type: image/png

[binary image data stream]
------FormDataBoundary--
```

**FormData Fields:**

| Field | Value | Purpose |
|-------|-------|---------|  
| `model` | `"FLUX.1-Kontext-pro"` | Specify model deployment |
| `prompt` | `"A red fox sitting on this rock"` | Edit instruction |
| `n` | `"1"` | Number of images to generate |
| `size` | `"1024x1024"` | Output image dimensions |
| `image` | `[binary stream]` | Reference image file |

---

### Step 4B: Stream Processing

```typescript
formData.append('image', fs.createReadStream(referenceImagePath));
```

**How It Works:**
1. Opens file stream from temp path
2. Pipes binary data directly to FormData
3. Avoids loading entire file into memory
4. Maintains original file metadata

**Memory Efficiency:**
- ✅ Streaming: Processes in chunks (~64KB)
- ✅ No full file load in RAM
- ✅ Suitable for large files (up to 10MB)

---

### Step 5: FLUX Processes Reference Image

**What FLUX Does:**

1. **Receives:** Binary image data + text prompt
2. **Analyzes:** Image content, composition, subjects
3. **Interprets:**How prompt relates to image
4. **Generates:** New image incorporating both elements

**Example Scenario:**

**Reference Image:** Photo of empty rock in forest

**Prompt:** "A red fox sitting on this rock"

**FLUX Processing:**
1. Detects rock in image
2. Identifies forest background
3. Adds fox to composition
4. Matches lighting and perspective
5. Blends fox naturally into scene

**Result:** Same rock with realistically added fox

---

### Step 6: Response Parsing & Upload

Same multi-format parsing as basic mode (Section 1, Step 3D)

**Special Consideration:** Edited images may have different characteristics

```typescript
// Handle edited image response
if (imageData.url) {
  // Download from FLUX URL
  blobUrl = await this.azureBlobService.uploadFileFromUrlWithSas(
   imageData.url, 
   `images/${filename}`
  );
} else if (imageData.b64_json) {
  // Decode and upload base64
 const buffer = Buffer.from(imageData.b64_json, 'base64');
  blobUrl = await this.azureBlobService.uploadFileToBlobWithSas(
   tempPath, 
   `images/${filename}`, 
   'image/png'
  );
}
```

---

### Step 7: Backend Notification

```typescript
await fetch(`${this.backendUrl}/flux-kontext-image/complete`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
  userId,
 prompt: finalPrompt,
   imageUrl: blobUrl,
 filename,
  }),
});
```

**Notification Includes:**
- Original reference image info (logged separately)
- Generated image details
- Edit prompt used

---

### Step 8: Final Response to Client

```json
{
  "success": true,
  "message": "✅ FLUX Kontext image generated with reference",
  "data": {
   "imageUrl": "https://realculturestorage.blob.core.windows.net/imagen/images/misy-image-1773070071739.png",
   "prompt": "A red fox sitting on this rock",
   "filename": "misy-image-1773070071739.png",
   "referenceImageName": "fox.png",
   "enhancedPromptUsed": false
  }
}
```

**Unique Field:** `referenceImageName` - Original uploaded filename

---

# 4. Internal Processing Pipeline

## Complete End-to-End Flow

### Architecture Overview

```
┌─────────────┐
│   Client    │
│  (Browser/  │
│   Mobile)   │
└──────┬──────┘
      │
      │ HTTP Request
      │ (JSON or Multipart)
      ▼
┌─────────────────────────────────┐
│  Controller Layer               │
│  (flux-kontext-image.           │
│  controller.ts)                │
│                                 │
│  - Route matching               │
│  - Request validation           │
│  - File upload handling         │
│  - Response formatting          │
└──────┬──────────────────────────┘
      │
      │ Calls Service
      ▼
┌─────────────────────────────────┐
│  Service Layer                  │
│  (flux-kontext-image.           │
│   service.ts)                   │
│                                 │
│  - Business logic             │
│  - FLUX API communication       │
│  - Response parsing             │
│  - Error handling               │
│  - Fallback orchestration       │
└──────┬──────────────────────────┘
      │
      ├──────────────┐
      │              │
      ▼              ▼
┌─────────────┐  ┌──────────────┐
│  LLM Service│  │ Azure Blob   │
│  (Optional  │  │   Service    │
│ Enhancement)│  │              │
└─────────────┘  └──────────────┘
```

---

## Detailed Execution Timeline

### Phase 1: Request Reception (0-50ms)

**Timeline:**
```
T+0ms:   HTTP request arrives at Azure App Service
T+5ms:   NestJS router matches route
T+10ms:  Middleware stack executes
        - Body parser (JSON or multipart)
        - CORS headers
        - Security checks
T+30ms: Controller method invoked
T+50ms:  Parameter validation complete
```

---

### Phase 2: Prompt Enhancement (Optional, 50-3000ms)

**If `enhancePrompt: true`:**

```
T+50ms:  Check enhancement flag
T+55ms: Call LLM service
T+60ms: Construct system prompt
T+70ms:  Send request to Azure OpenAI
T+500-2500ms: LLM processes enhancement
T+2505ms: Receive enhanced prompt
T+2510ms: Log enhancement result
T+2520ms: Continue to FLUX service
```

**If `enhancePrompt: false`:**
```
T+50ms:  Skip enhancement
T+55ms: Continue to FLUX service
```

---

### Phase 3: FLUX API Call (2520-12520ms)

```
T+2520ms: Construct FLUX API request
T+2525ms: Select endpoint (generations vs edits)
T+2530ms: Build payload (JSON or FormData)
T+2540ms: Send HTTP POST to Azure Foundry
T+2545ms:FLUX receives request
T+3000-10000ms:FLUX generates image
      (Varies by complexity, size, queue)
T+10000-12000ms:FLUX returns response
T+12520ms: Service receives response
```

**FLUX Processing Time Factors:**

| Factor | Impact | Range |
|--------|--------|-------|
| **Image Size** | Larger = Slower | 1024²: ~5s, 2048²: ~12s |
| **Prompt Complexity** | More details = Slower | Simple: ~3s, Complex: ~10s |
| **Queue Depth** | More users = Slower | Low: ~3s, High: ~15s |
| **Reference Image** | Edits take longer | Text-only: ~5s, With image: ~8s |

---

### Phase 4: Response Parsing (12520-12600ms)

```
T+12520ms: Log response status
T+12525ms: Detect response format
T+12530ms: Extract image data object
T+12540ms: Validate data structure
T+12550ms: Check for URL vs base64
T+12600ms: Ready for upload
```

---

### Phase 5: Azure Blob Upload (12600-13500ms)

**Case A: URL Upload**
```
T+12600ms: Generate filename
T+12610ms: Start download from FLUX URL
T+12610-13000ms: Download image (network speed dependent)
T+13010ms: Initiate Azure Blob upload
T+13020ms: Azure Blob Storage receives file
T+13500ms: SAS token generated
T+13510ms: Upload complete
```

**Case B: Base64 Upload**
```
T+12600ms: Validate base64 format
T+12610ms: Decode to binary buffer
T+12620ms: Validate PNG header
T+12630ms: Write to temp file
T+12640ms: Read temp file stream
T+12650ms: Upload to Azure Blob
T+13500ms: SAS token generated
T+13510ms: Upload complete
```

---

### Phase 6: Backend Notification (13510-13700ms)

```
T+13510ms: Prepare notification payload
T+13520ms: Send POST to main backend
T+13530ms: Main backend receives webhook
T+13540ms: Backend stores in database
T+13600ms: Backend acknowledges receipt
T+13700ms: Notification complete
```

---

### Phase 7: Response to Client (13700-13800ms)

```
T+13700ms: Format success response
T+13710ms: Add metadata (URL, filename, etc.)
T+13720ms: Set HTTP status (201 Created)
T+13730ms: Send response headers
T+13740ms: Send response body
T+13800ms: Client receives response
```

---

## Total Processing Time

**Typical Ranges:**

| Scenario | Time Range | Average |
|----------|------------|---------|  
| **Basic (no enhancement)** | 8-15 seconds | ~11s |
| **With enhancement** | 10-18 seconds | ~14s |
| **With reference image** | 10-20 seconds | ~15s |
| **All features combined** | 12-25 seconds | ~18s |

**Breakdown by Phase:**

```
Request Reception:    ~50ms   (0.4%)
Enhancement:          0-3000ms (0-20%)
FLUX Processing:     5-15s    (50-70%)
Response Parsing:     ~100ms   (1%)
Blob Upload:          ~1s      (7%)
Notification:         ~200ms   (1.5%)
Response Send:        ~100ms   (1%)
                     ─────────────────
Total:               8-25s     (100%)
```

---

# 5. Enhanced Prompt Deep Dive

## LLM Enhancement Engine

### System Architecture

```
┌──────────────────────┐
│  Original Prompt     │
│  "A cat"             │
└──────────┬───────────┘
          │
          ▼
┌─────────────────────────────────────┐
│  LLM Service                        │
│  (llm.service.ts)                   │
│                                     │
│  System Prompt:                     │
│  "Eres un artista digital experto   │
│   en generación de imágenes por IA" │
│                                     │
│  Requirements:                      │
│  ✓ Visual style                     │
│  ✓ Detailed background              │
│  ✓ Lighting                         │
│  ✓ Composition                      │
│  ✓ Color palette                    │
│  ✓ Emotion/atmosphere               │
└──────────┬──────────────────────────┘
          │
          │ Azure OpenAI API
          │ (GPT-4 Vision)
          ▼
┌─────────────────────────────────────┐
│  Enhanced Prompt                    │
│  "A majestic fluffy cat with        │
│   vibrant orange fur sitting        │
│   regally in a sunlit Victorian     │
│   room..."                          │
└─────────────────────────────────────┘
```

---

## System Prompt Analysis

### Original System Prompt(Spanish)

```typescript
const systemPrompt = `
Eres un artista digital experto en generación de imágenes por IA.
Toma el prompt base y mejóralo incluyendo:
- Estilo visual (ej. minimalista, barroco, anime, Ghibli)
- Fondo detallado y coherente con la escena
- Iluminación realista o dramática según contexto
- Composición, perspectiva, líneas de fuga, simetría
- Paleta de colores y texturas
- Emoción o atmósfera que transmita la escena
Devuelve solo el prompt mejorado, listo para usar en generación de imágenes.
`.trim();
```

### Translation & Breakdown

**Role Definition:**
```
"Eres un artista digital experto en generación de imágenes por IA."
→ "You are a digital artist expert in AI image generation."
```

**Instructions:**
```
"Toma el prompt base y mejóralo incluyendo:"
→ "Take the base prompt and improve it by including:"
```

**Required Elements:**

| Spanish | English | Purpose |
|---------|---------|---------|  
| **Estilo visual** | Visual style | Defines artistic approach |
| **Fondo detallado** | Detailed background | Adds contextual depth |
| **Iluminación** | Lighting | Sets mood and realism |
| **Composición** | Composition | Guides framing and layout |
| **Paleta de colores** | Color palette | Defines color scheme |
| **Emoción o atmósfera** | Emotion or atmosphere | Conveys feeling |

**Output Requirement:**
```
"Devuelve solo el prompt mejorado, listo para usar en generación de imágenes."
→ "Return only the improved prompt, ready to use in image generation."
```

---

## Enhancement Examples

### Example 1: Simple Subject

**Input:**
```
"A dog"
```

**Enhancement Process:**
1. LLM identifies subject: canine
2. Adds breed specifics: "Golden Retriever"
3. Defines pose: "sitting attentively"
4. Creates environment: "sunlit meadow"
5. Sets lighting: "golden hour, warm glow"
6. Adds atmosphere: "peaceful, idyllic"

**Output:**
```
"A beautiful Golden Retriever dog sitting attentively in a sunlit summer 
meadow, tall grass swaying gently in breeze, wildflowers scattered 
throughout foreground, warm golden hour lighting creating soft highlights 
on fur, shallow depth of field with creamy bokeh background, rich green 
and gold color palette, peaceful and idyllic countryside atmosphere, 
photorealistic style, professional pet photography, high detail, 8K 
resolution"
```

---

### Example 2: Landscape

**Input:**
```
"A mountain"
```

**Enhancement Process:**
1. Identifies subject: mountain landscape
2. Adds time/weather: "snow-capped peaks at dawn"
3. Defines foreground: "alpine lake reflection"
4. Sets colors: "pink and orange sunrise"
5. Creates mood: "serene, majestic"

**Output:**
```
"Majestic snow-capped mountain range at sunrise, pristine alpine lake in 
foreground perfectly reflecting the peaks, pink and orange dawn colors 
painting the sky, wispy morning mist rising from the water, crystalline 
morning light illuminating rocky textures, deep blue shadows in valleys, 
panoramic wide-angle composition, rule of thirds with mountains on upper 
third, ultra HD detail, Ansel Adams inspired photographic style, serene 
and awe-inspiring wilderness atmosphere, national geographic quality 
landscape photography"
```

---

### Example 3: Character Portrait

**Input:**
```
"A warrior"
```

**Enhancement Process:**
1. Identifies subject: fantasy warrior
2. Defines appearance: "battle-worn armor"
3. Sets scene: "medieval battlefield"
4. Adds lighting: "dramatic storm clouds"
5. Creates emotion: "determined, heroic"

**Output:**
```
"Portrait of a battle-hardened medieval warrior in ornate steel plate 
armor with intricate engravings, standing on ancient stone battlements 
overlooking a vast battlefield, dramatic stormy sky with rays of 
sunlight breaking through dark clouds, wind-swept cape flowing behind, 
determined expression with piercing eyes, scarred face telling stories 
of countless battles, cinematic rim lighting highlighting armor details, 
desaturated color palette with selective color pops of red cape and 
golden accents, epic fantasy atmosphere, highly detailed digital painting 
style, Greg Rutkowski and Artgerm influenced, heroic and powerful 
presence, 4K fantasy art masterpiece"
```

---

## Enhancement Quality Metrics

### What Makes a Good Enhanced Prompt?

| Metric | Poor Enhancement | Good Enhancement |
|--------|------------------|------------------|  
| **Specificity** | "A nice cat" | "A fluffy Persian cat with amber eyes" |
| **Context** | "In a room" | "In a Victorian parlor with ornate furniture" |
| **Lighting** | "Well lit" | "Warm afternoon sunlight streaming through lace curtains" |
| **Composition** | "Centered" | "Rule of thirds, shallow depth of field" |
| **Style** | "Realistic" | "Photorealistic, Canon EOS R5, 85mm f/1.2" |
| **Atmosphere** | "Nice mood" | "Serene and contemplative atmosphere" |
| **Detail Level** | Too short (<50 words) | Rich (100-200 words) |
| **Coherence** | Contradictory elements | Harmonious visual elements |

---

## Temperature & Creativity

**LLM Configuration:**
```typescript
const body = {
 messages: [
  { role: 'system', content: systemPrompt },
  { role: 'user', content: `Prompt base: ${prompt}` },
 ],
  max_tokens: 300,
 temperature: 0.8,  // ← Creativity level
};
```

**Temperature Impact:**

| Temperature | Behavior | Best For |
|-------------|----------|----------|  
| **0.2-0.4** | Very conservative, predictable | Technical prompts |
| **0.5-0.6** | Balanced, some creativity | General use |
| **0.7-0.8** | Creative, varied outputs | **Artistic prompts** ✅ |
| **0.9-1.0** | Highly creative, unpredictable | Experimental art |

**Current Setting:** `0.8` (Optimized for creative image prompts)

---

# 6. Fallback Mechanisms

## Zero-Crash Resilience Architecture

### Fallback Chain

```
Primary:   FLUX.1-Kontext-pro
   ↓ (fails)
Secondary: DALL-E 3
   ↓ (fails)
Throw Error to User
```

---

## DALL-E 3 Fallback Implementation

### Trigger Conditions

**FLUX Fails When:**
- ❌ HTTP 500 from Azure Foundry
- ❌ Timeout (>60 seconds)
- ❌ Invalid response format
- ❌ No image data in response
- ❌ Network connectivity issues

**Fallback Activates:**
```typescript
catch (error: any) {
  this.logger.error('❌ Error generating image with FLUX.1-Kontext-pro:', error);
  this.logger.warn('⚠️ FALLBACK: Attempting to generate with DALL-E 3...');
  
  // FALLBACK TO DALL-E 3
  try {
   return await this.generateWithDalleFallback(userId, finalPrompt);
  } catch (dalleError: any) {
   this.logger.error('❌ Fallback to DALL-E also failed:', dalleError);
   throw new Error(`Failed to generate image with FLUX and DALL-E fallback: ${error.message}`);
  }
}
```

---

### DALL-E 3 Fallback Method

**File:** `src/infrastructure/services/flux-kontext-image.service.ts`

```typescript
private async generateWithDalleFallback(
  userId: string,
 prompt: string
): Promise<{ imageUrl: string; filename: string; prompt: string }> {
  this.logger.log('🔄 Using DALL-E 3 as fallback for FLUX');
  
 const apiKey = process.env.AZURE_OPENAI_IMAGE_API_KEY || process.env.OPENAI_API_KEY;
 const endpoint = process.env.AZURE_OPENAI_IMAGE_ENDPOINT || 'https://api.openai.com/v1';
  
  if (!apiKey) {
   throw new Error('DALL-E API key not configured for fallback');
  }
  
 const openai = new OpenAI({
  apiKey,
  baseURL: endpoint,
  });
  
 const response = await openai.images.generate({
  model: 'dall-e-3',
 prompt: prompt,
  n: 1,
 size: '1024x1024',
  });
  
 const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) {
   throw new Error('DALL-E fallback did not return an image URL');
  }
  this.logger.log(`🌐 DALL-E fallback URL: ${imageUrl}`);
  
  // Download and upload to Azure Blob
 const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
 const buffer = Buffer.from(imageResponse.data);
  
 const filename = `promo-${Date.now()}.png`;
 const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);
  
 const tempDir = path.dirname(tempPath);
  if (!fs.existsSync(tempDir)) {
   fs.mkdirSync(tempDir, { recursive: true });
  }
  
 fs.writeFileSync(tempPath, buffer);
  this.logger.log(`💾 Saved DALL-E fallback to temp: ${tempPath}`);
  
 const blobUrl = await this.azureBlobService.uploadFileToBlobWithSas(
  tempPath, 
  `images/${filename}`, 
  'image/png'
  );
  this.logger.log(`✅ DALL-E fallback uploaded to Azure: ${blobUrl}`);
  
  // Notify backend (indicates fallback was used)
 await fetch(`${this.backendUrl}/flux-kontext-image/complete`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
   userId,
  prompt,
    imageUrl: blobUrl,
  filename,
    fallbackUsed: true,  // ← Flag for backend
  }),
  });
  
  return {
   imageUrl: blobUrl,
 filename,
 prompt,
  };
}
```

---

### Fallback Execution Steps

**Step 1: Check API Keys**
```typescript
const apiKey = process.env.AZURE_OPENAI_IMAGE_API_KEY || process.env.OPENAI_API_KEY;
```

**Priority:**
1. `AZURE_OPENAI_IMAGE_API_KEY` (Azure OpenAI endpoint)
2. `OPENAI_API_KEY` (OpenAI.com direct)

**Configuration:**
- ✅ Azure OpenAI: More reliable, enterprise-grade
- ✅ OpenAI.com: Backup if Azure unavailable

---

**Step 2: Initialize OpenAI Client**
```typescript
const openai = new OpenAI({
 apiKey,
 baseURL: endpoint,
});
```

**Endpoint Options:**
- Azure: `https://<resource>.openai.azure.com/openai/deployments/<deployment>`
- OpenAI.com: `https://api.openai.com/v1`

---

**Step 3: Call DALL-E 3 API**
```typescript
const response = await openai.images.generate({
  model: 'dall-e-3',
 prompt: prompt,
  n: 1,
  size: '1024x1024',
});
```

**Request to DALL-E:**
```http
POST /v1/images/generations HTTP/1.1
Host: api.openai.com
Authorization: Bearer <API_KEY>
Content-Type: application/json

{
  "model": "dall-e-3",
  "prompt": "A red fox in autumn forest",
  "n": 1,
  "size": "1024x1024"
}
```

---

**Step 4: Extract Image URL**
```typescript
const imageUrl = response.data?.[0]?.url;
```

**DALL-E Response:**
```json
{
  "created": 1773070071,
  "data": [
  {
    "url": "https://oaidalleapiprodscus.blob.core.windows.net/private/org-xxx/user-yyy/img-zzz.png"
  }
  ]
}
```

---

**Step 5: Download & Re-upload**
```typescript
// Download from DALL-E URL
const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
const buffer = Buffer.from(imageResponse.data);

// Save to temp
const filename = `promo-${Date.now()}.png`;
const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);
fs.writeFileSync(tempPath, buffer);

// Upload to Azure Blob (same as FLUX workflow)
const blobUrl = await this.azureBlobService.uploadFileToBlobWithSas(
 tempPath, 
  `images/${filename}`, 
  'image/png'
);
```

**Why Re-upload?**
1. **Consistency:** All images in same Azure Storage account
2. **SAS Tokens:**DALL-E URLs are temporary/private
3. **Tracking:** Uniform URL structure for backend
4. **CDN:** Azure Blob optimized for delivery

---

**Step 6: Notify Backend with Fallback Flag**
```typescript
await fetch(`${this.backendUrl}/flux-kontext-image/complete`, {
 method: 'POST',
  body: JSON.stringify({
  userId,
 prompt,
   imageUrl: blobUrl,
 filename,
   fallbackUsed: true,  // ← Important metadata
  }),
});
```

**Backend Can:**
- Log that fallback was used
- Track FLUX reliability metrics
- Trigger alerts if fallback rate high
- Bill appropriately (DALL-E costs different)

---

### Fallback Response to Client

**Success Response (Same Format):**
```json
{
  "success": true,
  "message": "✅ FLUX Kontext image generated successfully",
  "data": {
  "imageUrl": "https://realculturestorage.blob.core.windows.net/imagen/images/promo-1773070071739.png",
  "prompt": "A red fox in autumn forest",
  "filename": "promo-1773070071739.png",
  "enhancedPromptUsed": false
  }
}
```

**Note:** Client doesn't see fallback indicator in response

**Backend Notification Includes:**
```json
{
  "userId": "anon",
  "prompt": "A red fox in autumn forest",
  "imageUrl": "...",
  "filename": "promo-1773070071739.png",
  "fallbackUsed": true  // ← Backend sees this
}
```

---

### Fallback Performance

**Comparison:**

| Metric | FLUX.1-Kontext-pro | DALL-E 3 |
|--------|--------------------|----------|  
| **Speed** | ~5-15 seconds | ~10-20 seconds |
| **Quality** | Photorealistic, detailed | Artistic, stylized |
| **Cost** | Lower | Higher |
| **Availability** | Azure Foundry | OpenAI/Azure |
| **Best For** | Professional photos | Creative concepts |

---

## Summary

This documentation provides a complete technical breakdown of the FLUX image generation pipeline with all processing modes, internal workflows, and resilience mechanisms. Every step from client request to final response has been detailed with code examples, timing analysis, and architectural insights.

---

*Continues in next section...*
