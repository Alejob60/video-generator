# 🎥 VEO3 Video Generation - Google Vertex AI Integration

## ✅ **Updated Implementation for Google Vertex AI LongRunning API**

---

## 🔍 **Key Discovery: predictLongRunning Endpoint**

Google VEO3 requires the use of the **LongRunning Operations API** instead of the standard `:predict` endpoint.

### ❌ **Incorrect (Original)**
```
POST /v1/projects/{project}/locations/{location}/publishers/google/models/{model}:predict
```

**Error Response:**
```json
{
  "error": {
    "code": 429,
    "message": "Veo must be accessed through the Vertex PredictLongRunning API. Please follow https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/overview for Veo usage.",
    "status": "RESOURCE_EXHAUSTED"
  }
}
```

### ✅ **Correct (Updated)**
```
POST /v1/projects/{project}/locations/{location}/publishers/google/models/{model}:predictLongRunning
```

---

## 📋 **Complete Flow**

### **Step 1: Initiate Video Generation**

**Request:**
```http
POST https://aiplatform.googleapis.com/v1/projects/orbital-prime-vision/locations/us-central1/publishers/google/models/veo-3.1-generate-001:predictLongRunning?key={API_KEY}
Content-Type: application/json

{
  "instances": [
    {
      "prompt": "A cinematic drone shot of a futuristic city at sunset"
    }
  ],
  "parameters": {
    "aspectRatio": "16:9",
    "videoLength": 5,
    "fps": 24,
    "negativePrompt": "blurry, low quality, distorted"
  }
}
```

**Response:**
```json
{
  "name": "projects/orbital-prime-vision/locations/us-central1/jobs/{JOB_ID}",
  "metadata": {
    "@type": "type.googleapis.com/google.cloud.aiplatform.v1.GenericOperationMetadata",
    "createTime": "2026-03-16T22:45:00Z",
    "updateTime": "2026-03-16T22:45:00Z"
  }
}
```

---

### **Step 2: Poll for Completion**

**Polling Endpoint:**
```http
GET https://aiplatform.googleapis.com/v1/projects/orbital-prime-vision/locations/us-central1/jobs/{JOB_ID}?key={API_KEY}
```

**Polling Strategy:**
- **Interval:** 10 seconds
- **Max Attempts:** 90 (15 minutes total)
- **Timeout:** 15 minutes recommended

**In-Progress Response:**
```json
{
  "name": "projects/orbital-prime-vision/locations/us-central1/jobs/{JOB_ID}",
  "metadata": {
    "@type": "type.googleapis.com/google.cloud.aiplatform.v1.GenericOperationMetadata",
    "createTime": "2026-03-16T22:45:00Z",
    "updateTime": "2026-03-16T22:46:00Z"
  },
  "done": false
}
```

---

### **Step 3: Get Result**

**Completed Response:**
```json
{
  "name": "projects/orbital-prime-vision/locations/us-central1/jobs/{JOB_ID}",
  "metadata": {
    "@type": "type.googleapis.com/google.cloud.aiplatform.v1.GenericOperationMetadata",
    "createTime": "2026-03-16T22:45:00Z",
    "updateTime": "2026-03-16T22:50:00Z"
  },
  "done": true,
  "response": {
    "generatedVideos": [
      {
        "video": {
          "bytes": "base64_encoded_video_data_here..."
        }
      }
    ]
  }
}
```

---

## ⏱️ **Timing Information**

### **Typical Generation Times**

| Video Length | Typical Time | Max Time |
|--------------|--------------|----------|
| 5 seconds | 3-8 minutes | 15 minutes |
| 10 seconds | 5-12 minutes | 20 minutes |
| 15+ seconds | 8-15 minutes | 30 minutes |

### **Recommended Timeout Settings**

```typescript
// Conservative settings
maxAttempts: 90        // 15 minutes @ 10s polling
pollInterval: 10000    // 10 seconds

// Aggressive settings
maxAttempts: 180       // 30 minutes @ 10s polling
pollInterval: 10000    // 10 seconds
```

---

## 💻 **PowerShell Test Script**

Run the test script:

```powershell
.\test-veo3-longrunning.ps1
```

**Expected Output:**
```
🎬 Testing VEO3 Video Generation with LongRunning API
============================================================

📡 Step 1: Initiating video generation...
✅ Request accepted!
📋 Operation Name: projects/orbital-prime-vision/locations/us-central1/jobs/1234567890

⏳ Step 2: Polling for completion (this may take 5-15 minutes)...
   Attempt 1/90 (0.2 min elapsed)
   Attempt 2/90 (0.3 min elapsed)
   ...
   Attempt 35/90 (5.8 min elapsed)
   
✅ Video generation complete!
📊 Response received:
{
  "generatedVideos": [
    {
      "video": {
        "bytes": "base64_data..."
      }
    }
  ]
}

🎥 SUCCESS: 1 video(s) generated!
   ✅ Video ready (15.5 MB)

✨ VEO3 test completed successfully!
```

---

## 🔧 **Code Changes Made**

### **1. Service Update (`veo-video.service.ts`)**

#### Changed Endpoint:
```typescript
// OLD (❌)
const endpoint = `.../models/${this.model}:predict`;

// NEW (✅)
const endpoint = `.../models/${this.model}:predictLongRunning`;
```

#### Enhanced Polling:
```typescript
// Increased timeout from 10 to 15 minutes
const maxAttempts = 90; // was 60
const pollInterval = 10000; // 10 seconds

// Added progress logging
this.logger.log(`   Poll attempt ${attempts}/${maxAttempts} (${elapsedMinutes} min elapsed)...`);

// Added metadata tracking
if (operation.metadata) {
  this.logger.log(`   Progress: ${JSON.stringify(operation.metadata)}`);
}
```

#### Improved Error Handling:
```typescript
try {
  const response = await axios.get(statusEndpoint, { ... });
  const operation = response.data;
  
  if (operation.done) {
    if (operation.error) {
      throw new Error(`Operation failed: ${JSON.stringify(operation.error)}`);
    }
    return operation;
  }
} catch (error) {
  this.logger.warn(`   Poll error: ${error.message}`);
  // Continue polling on transient errors
}
```

---

## 📊 **Monitoring & Logging**

### **Key Log Messages**

```
🎬 Starting VEO3 video generation for user: anon
📝 Prompt: A cinematic drone shot...
📡 Sending request to VEO3 LongRunning API: https://...
📥 VEO3 API Response Status: 200
📋 Operation Name: projects/orbital-prime-vision/.../jobs/1234567890
⏳ Polling for video generation completion...
📋 Operation: projects/orbital-prime-vision/.../jobs/1234567890
   Poll attempt 1/90 (0.2 min elapsed)...
   Poll attempt 2/90 (0.3 min elapsed)...
   ...
✅ Video generation complete!
📊 Video size: 16252928 bytes (15.50 MB)
💾 Saved video to temp: .../temp/veo-video-1773070071739.mp4
✅ Video uploaded to Azure Blob Storage: https://...
🔔 Notifying main backend about generated video
```

---

## ⚠️ **Important Notes**

### **API Quotas**

- **Concurrent Operations:** Limited by Google Cloud quota
- **Daily Limit:** Check your Vertex AI quota in Google Cloud Console
- **Rate Limits:** Implement exponential backoff on 429 errors

### **Video Storage**

- Videos are returned as base64-encoded bytes
- For large videos (>50MB), consider using GCS URI instead
- Download and upload to Azure Blob Storage immediately

### **Error Scenarios**

| Error Code | Meaning | Action |
|------------|---------|--------|
| 429 | RESOURCE_EXHAUSTED | Use predictLongRunning endpoint |
| 400 | INVALID_ARGUMENT | Check prompt and parameters |
| 401 | UNAUTHENTICATED | Verify API key |
| 403 | PERMISSION_DENIED | Enable Vertex AI API |
| 500 | INTERNAL | Retry with backoff |

---

## 🧪 **Testing Checklist**

- ✅ Use `:predictLongRunning` endpoint
- ✅ Extract operation name from response
- ✅ Poll every 10 seconds
- ✅ Handle metadata updates
- ✅ Check for `done: true` flag
- ✅ Validate `response.generatedVideos` exists
- ✅ Handle base64 video decoding
- ✅ Implement 15-minute timeout
- ✅ Log progress every attempt
- ✅ Handle transient errors gracefully

---

## 📞 **Next Steps**

1. **Test Locally:**
   ```bash
   .\test-veo3-longrunning.ps1
   ```

2. **Deploy to Azure:**
   ```bash
   .\build-and-deploy-final.ps1
   ```

3. **Test Production Endpoint:**
   ```bash
   curl -X POST 'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/veo/video' \
     -H 'Content-Type: application/json' \
     -d '{"prompt":"A cinematic drone shot..."}'
   ```

---

## 📄 **References**

- [Vertex AI Video Generation Overview](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/overview)
- [Long-Running Operations API](https://cloud.google.com/vertex-ai/docs/reference/rest/v1/projects.locations.operations/get)
- [VEO3 Model Documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/video/video-models)

---

**Last Updated**: March 16, 2026  
**Version**: 2.0.0 (LongRunning API)  
**Status**: ✅ Ready for Testing
