# 🎥 VEO3 Video Generation - Integration Guide

## Overview

Google VEO3 integration for AI-powered video generation from text prompts.

**⚠️ IMPORTANT:** Uses Vertex AI **LongRunning Operations API** (`:predictLongRunning`) for reliable video generation.

---

## 🔗 Base URL

```
https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net
```

---

## 🎬 Endpoint: POST /media/veo/video

Generate video from text prompt using Google VEO3.

### Request

**Headers:**
```
Content-Type: application/json
x-user-id: <user-identifier> (optional)
```

**Payload (JSON):**
```json
{
  "prompt": "A cinematic drone shot of a futuristic city at sunset",
  "aspectRatio": "16:9",
  "videoLength": 5,
  "fps": 24,
  "negativePrompt": "blurry, low quality, distorted"
}
```

**Field Descriptions:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `prompt` | string | ✅ Yes | - | Text description of the video to generate |
| `aspectRatio` | string | ❌ No | `"16:9"` | Video aspect ratio: `"16:9"`, `"9:16"`, or `"1:1"` |
| `videoLength` | number | ❌ No | `5` | Video duration in seconds |
| `fps` | number | ❌ No | `24` | Frames per second |
| `negativePrompt` | string | ❌ No | `"blurry, low quality, distorted"` | What to avoid in the video |

### Response

**Success (201 Created):**
```json
{
  "success": true,
  "message": "✅ VEO3 video generated successfully",
  "data": {
    "videoUrl": "https://realculturestorage.blob.core.windows.net/imagen/videos/veo-video-1773070071739.mp4?sv=...",
    "prompt": "A cinematic drone shot of a futuristic city at sunset",
    "filename": "veo-video-1773070071739.mp4"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if operation succeeded |
| `message` | string | Human-readable status message |
| `data.videoUrl` | string | SAS URL to generated video in Azure Blob Storage |
| `data.prompt` | string | Original prompt used |
| `data.filename` | string | Filename of generated video |

---

## 💻 Code Examples

### cURL Example

```bash
curl -X POST 'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/veo/video' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "A cinematic drone shot of a futuristic city at sunset, flying through skyscrapers with neon lights, photorealistic, 4K quality",
    "aspectRatio": "16:9",
    "videoLength": 5,
    "fps": 24,
    "negativePrompt": "blurry, low quality, distorted"
  }'
```

### Node.js Example (Axios)

```javascript
const axios = require('axios');

async function generateVideo() {
  try {
   const response = await axios.post(
      'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/veo/video',
      {
       prompt: "A futuristic city with flying cars",
        aspectRatio: "16:9",
        videoLength: 5,
        fps: 24
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

   console.log('✅ Success:', response.data);
   console.log('🎥 Video URL:', response.data.data.videoUrl);
  } catch (error) {
   console.error('❌ Error:', error.response?.data || error.message);
  }
}

generateVideo();
```

### Python Example (Requests)

```python
import requests

url = 'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/veo/video'
payload = {
    "prompt": "A serene mountain landscape at sunrise",
    "aspectRatio": "16:9",
    "videoLength": 5,
    "fps": 24
}

response = requests.post(url, json=payload)

if response.status_code == 201:
    data = response.json()
   print(f"✅ Success: {data['message']}")
   print(f"🎥 Video URL: {data['data']['videoUrl']}")
else:
   print(f"❌ Error: {response.json()}")
```

---

## ⚠️ Important Notes

### Processing Time

- **Typical Range:** 5-15 minutes (varies by video length)
- **Polling Interval:** 10 seconds
- **Timeout:** 15 minutes (configurable up to 30 minutes)
- **API Endpoint:** `:predictLongRunning` (asynchronous operation)

**Generation Times by Video Length:**

| Video Length | Typical Time | Recommended Timeout |
|--------------|--------------|---------------------|
| 5 seconds | 3-8 minutes | 15 minutes |
| 10 seconds | 5-12 minutes | 20 minutes |
| 15+ seconds | 8-15 minutes | 30 minutes |

### Video Specifications

| Property | Value |
|----------|-------|
| **Format** | MP4 (H.264 codec) |
| **Aspect Ratios** | 16:9, 9:16, 1:1 |
| **Length** | 5-60 seconds |
| **FPS** | 24 or 30 |
| **Resolution** | Up to 1080p |

### Limitations

- Maximum 4 videos per request
- Video generation is asynchronous
- Storage: Azure Blob Storage with SAS tokens (1 hour expiry)

---

## 🔐 Authentication

Currently, no authentication required. Optional header:

```
x-user-id: <user-identifier>
```

For tracking and logging purposes.

---

## 📊 Error Handling

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Video generated successfully |
| 400 | Bad Request | Invalid payload or parameters |
| 401 | Unauthorized | Invalid API key |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Vertex AI unavailable |

### Error Response Format

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Detailed error description"
}
```

---

## 🎯 Best Practices

1. **Use descriptive prompts** - More detail = better results
2. **Set appropriate timeout** - Video generation takes 2-10 minutes
3. **Download videos immediately** - SAS tokens expire after 1 hour
4. **Handle errors gracefully** - Implement retry logic for transient failures
5. **Monitor quotas** - Vertex AI has usage limits

---

## 🧪 Testing

### Test Script (Python)

```python
import time
from google import genai
from google.genai import types

client = genai.Client(
    project="orbital-prime-vision",
    location="us-central1",
)

source = types.GenerateVideosSource(
    prompt="A cat playing with yarn",
)

config = types.GenerateVideosConfig(
    aspect_ratio="16:9",
    number_of_videos=1,
    generate_audio=False,
)

operation = client.models.generate_videos(
    model="veo-3.1-generate-001", 
    source=source, 
    config=config
)

while not operation.done:
    print("Waiting...")
    time.sleep(10)
    operation = client.operations.get(operation)

response = operation.result
print(f"Generated {len(response.generated_videos)} videos")
```

---

## 📞 Support & Debugging

### Enable Debug Logging

Check service logs:

```bash
az webapp log tail --name video-converter --resource-group realculture-rg
```

### Check Health

```bash
curl 'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/health'
```

---

## 📄 Changelog

### Version 1.0.0 (March 2026)
- ✅ Added `/media/veo/video` endpoint
- ✅ Google VEO3 integration
- ✅ Azure Blob Storage upload
- ✅ Backend notification webhook
- ✅ Automatic polling and retry logic

---

**Last Updated**: March 16, 2026  
**Document Version**: 1.0.0  
**Author**: RealCulture AI Engineering Team
