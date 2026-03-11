# 📋 Video Generator API - Backend Integration Guide

## Overview
This document provides a comprehensive guide for integrating with the Video Generator microservice's FLUX Kontext Pro image generation endpoints. All endpoints are production-ready and deployed on Azure.

---

## 🔗 Base URL

```
https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net
```

---

## 📸 Endpoint 1: Text-to-Image Generation

### **POST /media/flux-kontext/image**

Generate images from text prompts using FLUX.1-Kontext-pro model.

### Request

**Headers:**
```
Content-Type: application/json
```

**Payload (JSON):**
```json
{
  "prompt": "A red fox in autumn forest",
  "plan": "PRO",
  "enhancePrompt": false,
  "size": "1024x1024"
}
```

**Field Descriptions:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `prompt` | string | ✅ Yes | - | Text description of the image to generate |
| `plan` | string | ✅ Yes | - | Must be `"PRO"`, `"CREATOR"`, or `"FREE"` |
| `enhancePrompt` | boolean | ❌ No | `false` | If `true`, uses LLM to enhance prompt before generation |
| `size` | string | ❌ No | `"1024x1024"` | Image dimensions (e.g., `"1024x1024"`, `"1920x1080"`) |

### Response

**Success (201 Created):**
```json
{
  "success": true,
  "message": "✅ FLUX Kontext image generated successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/imagen/images/misy-image-1773070071739.png?sv=2025-07-05&spr=https&st=2026-03-09T15%3A27%3A51Z&se=2026-03-10T15%3A27%3A51Z&sr=b&sp=r&sig=...",
    "prompt": "A red fox in autumn forest",
    "filename": "misy-image-1773070071739.png",
    "enhancedPromptUsed": false
  }
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if operation succeeded |
| `message` | string | Human-readable status message |
| `data.imageUrl` | string | SAS URL to generated image in Azure Blob Storage |
| `data.prompt` | string | Actual prompt used (may be enhanced if enabled) |
| `data.filename` | string | Filename of generated image |
| `data.enhancedPromptUsed` | boolean | `true` if LLM enhancement was applied |

**Error (500 Internal Server Error):**
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## 🖼️ Endpoint 2: Image Editing with Reference Upload

### **POST /media/flux-kontext/image-with-reference**

Upload a reference image and generate/edit based on it using FLUX.1-Kontext-pro.

### Request

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
```
prompt: "A red fox sitting on this rock"
plan: "PRO"
enhancePrompt: false
referenceImage: [binary file]
```

**Field Descriptions:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `prompt` | string | ✅ Yes | - | Description of edits/generation |
| `plan` | string | ✅ Yes | - | Must be `"PRO"`, `"CREATOR"`, or `"FREE"` |
| `enhancePrompt` | string | ❌ No | `"false"` | `"true"` or `"false"` - Enhance prompt with LLM |
| `referenceImage` | file | ✅ Yes | - | PNG/JPG image file (max 10MB) |

### Response

**Success (201 Created):**
```json
{
  "success": true,
  "message": "✅ FLUX Kontext image generated with reference",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/imagen/images/misy-image-1773070071739.png?sv=2025-07-05&spr=https&st=2026-03-09T15%3A27%3A51Z&se=2026-03-10T15%3A27%3A51Z&sr=b&sp=r&sig=...",
    "prompt": "A red fox sitting on this rock",
    "filename": "misy-image-1773070071739.png",
    "referenceImageName": "fox.png",
    "enhancedPromptUsed": false
  }
}
```

**Error (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Reference image is required"
}
```

**Error (415 Unsupported Media Type):**
```json
{
  "statusCode": 415,
  "message": "Only image files (JPG, PNG) are allowed"
}
```

---

## 📤 Endpoint 3: Standalone Image Upload

### **POST /upload**

Upload an image to Azure Blob Storage for later use.

### Request

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
```
file: [binary file]
```

### Response

**Success (201 Created):**
```json
{
  "success": true,
  "imageUrl": "https://realculturestorage.blob.core.windows.net/images/fox-1773070071739.png?sv=2025-07-05&spr=https&st=2026-03-09T15%3A27%3A51Z&se=2026-03-10T15%3A27%3A51Z&sr=b&sp=r&sig=...",
  "filename": "fox.png"
}
```

---

## 🧠 Endpoint 4: Prompt Enhancement (Standalone)

### **POST /llm/generate-json**

Enhance a basic prompt using LLM for better image generation results.

### Request

**Headers:**
```
Content-Type: application/json
```

**Payload (JSON):**
```json
{
  "prompt": "A cat",
  "plan": "PRO"
}
```

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "enhancedPrompt": "A majestic fluffy cat with vibrant fur sitting in a sunlit room, professional photography, high detail, cinematic lighting",
  "originalPrompt": "A cat"
}
```

---

## ❤️ Health Check

### **GET /health**

Check if the service is running.

### Response

**Success (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-09T15:27:51.123Z"
}
```

---

## 💻 Code Examples

### cURL Examples

#### 1. Text-to-Image (Basic)
```bash
curl -X POST 'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-kontext/image' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "A cyberpunk street at night with neon lights",
    "plan": "PRO"
  }'
```

#### 2. Text-to-Image with Enhancement
```bash
curl -X POST 'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-kontext/image' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "A cat",
    "plan": "PRO",
    "enhancePrompt": true
  }'
```

#### 3. Image Editing with Reference (Multipart)
```bash
curl -X POST 'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-kontext/image-with-reference' \
  -F 'prompt=A red fox sitting on this rock' \
  -F 'plan=PRO' \
  -F 'enhancePrompt=false' \
  -F 'referenceImage=@/path/to/fox.png'
```

#### 4. Standalone Upload
```bash
curl -X POST 'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/upload' \
  -F 'file=@/path/to/image.png'
```

#### 5. Prompt Enhancement
```bash
curl -X POST 'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/llm/generate-json' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "A sunset over mountains",
    "plan": "PRO"
  }'
```

---

### Node.js Example (Axios)

```javascript
const axios = require('axios');

async function generateImage() {
  try {
   const response = await axios.post(
      'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-kontext/image',
      {
       prompt: "A magical forest with glowing mushrooms",
        plan: "PRO",
        enhancePrompt: true
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

   console.log('✅ Success:', response.data);
   console.log('🖼️ Image URL:', response.data.data.imageUrl);
  } catch (error) {
   console.error('❌ Error:', error.response?.data || error.message);
  }
}

generateImage();
```

---

### Python Example (Requests)

```python
import requests

# Text-to-Image
url = 'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-kontext/image'
payload = {
    "prompt": "A serene mountain landscape at sunrise",
    "plan": "PRO",
    "enhancePrompt": True
}

response = requests.post(url, json=payload)

if response.status_code == 201:
    data = response.json()
   print(f"✅ Success: {data['message']}")
   print(f"🖼️ Image URL: {data['data']['imageUrl']}")
else:
   print(f"❌ Error: {response.json()}")
```

---

### PowerShell Example

```powershell
$body = @{
   prompt = "A futuristic city skyline"
    plan = "PRO"
    enhancePrompt = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod `
        -Uri 'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-kontext/image' `
        -Method POST `
        -Body $body `
        -ContentType 'application/json'

    Write-Host"✅ Success: $($response.message)"
    Write-Host"🖼️ Image URL: $($response.data.imageUrl)"
} catch {
    Write-Host"❌ Error: $_"
}
```

---

### C# Example (.NET HttpClient)

```csharp
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class FluxClient
{
   private static readonly HttpClient client = new HttpClient();
   private const string BaseUrl = "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net";

    public async Task GenerateImageAsync()
    {
        var payload = new
        {
           prompt = "A steampunk mechanical dragon",
            plan = "PRO",
            enhancePrompt = true
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await client.PostAsync($"{BaseUrl}/media/flux-kontext/image", content);
        
        if (response.IsSuccessStatusCode)
        {
            var result = await response.Content.ReadAsStringAsync();
           Console.WriteLine($"✅ Success: {result}");
        }
    }
}
```

---

## 🔐 Authentication

Currently, the endpoints do not require authentication headers. However, you can optionally send:

```
x-user-id: <user-identifier>
```

For tracking and logging purposes.

---

## 📊 Error Handling

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful (e.g., prompt enhancement) |
| 201 | Created | Image generated successfully |
| 400 | Bad Request | Invalid payload (missing required fields) |
| 415 | Unsupported Media Type | Invalid file type for uploads |
| 500 | Internal Server Error | Server-side error (check logs) |

### Error Response Format

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Detailed error description (in development mode)"
}
```

---

## 🎯 Best Practices

1. **Always check `success` field** in response before using `imageUrl`
2. **Handle timeouts** - Image generation may take 10-30 seconds
3. **Use `enhancePrompt: true`** for better quality results
4. **Validate file size** before uploading (max 10MB for images)
5. **Store `imageUrl` permanently** - SAS tokens have expiration dates
6. **Implement retry logic** for transient failures (HTTP 500)

---

## 🚀 Production Deployment Info

- **Platform**: Azure App Service (Linux)
- **Resource Group**: `realculture-rg`
- **App Service Name**: `video-converter`
- **Region**: Canada Central
- **Container Registry**: `realcultureacr.azurecr.io`
- **Image Tag**: `video-converter:latest`

---

## 📞 Support & Debugging

### Enable Debug Logging

Add header for verbose responses:
```
x-debug-mode: true
```

### Check Service Health
```bash
curl 'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/health'
```

### View Azure Logs
```bash
az webapp log tail --name video-converter --resource-group realculture-rg
```

---

## 📝 Changelog

### Version 1.0.0 (March 2026)
- ✅ Added `/media/flux-kontext/image` endpoint (text-to-image)
- ✅ Added `/media/flux-kontext/image-with-reference` endpoint (upload + edit)
- ✅ Added `/upload` endpoint (standalone upload)
- ✅ Added `/llm/generate-json` endpoint (prompt enhancement)
- ✅ Implemented automatic fallback to DALL-E 3
- ✅ Enhanced logging and error handling
- ✅ Production deployment on Azure

---

## 📄 License

Proprietary- RealCulture AI

---

**Last Updated**: March 9, 2026  
**Document Version**: 1.0.0
