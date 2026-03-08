# 🧪 Image Generation Endpoints - Testing Guide

## 📋 Overview

The system now supports **THREE modes** of image generation:

| Mode | Description | Endpoint | Technology |
|------|-------------|----------|------------|
| **DALL-E Only** | Generate with DALL-E 3 | `/media/image` | Azure OpenAI DALL-E 3 |
| **FLUX Only** | Generate with FLUX | `/media/image` or `/media/flux-image` | FLUX-1.1-pro |
| **Dual** | Generate BOTH simultaneously | `/media/flux-image/dual` | DALL-E 3 + FLUX.1-Kontext-pro |
| **Simple FLUX 2** | Generate with FLUX 2 Pro | `/media/flux-image/simple` | FLUX 2 Pro |

---

## 🎯 Test Scripts Created

### 1. Complete Local Testing
```powershell
.\test-all-image-endpoints.ps1
```
**Tests all 5 endpoints with detailed validation**

### 2. Quick Azure Testing
```powershell
.\test-azure-quick.ps1
```
**Fast test for Azure deployment**

---

## 📝 Expected JSON Responses

### 1️⃣ DALL-E Only (`useFlux: false`)

**Request:**
```json
{
  "prompt": "A beautiful sunset over mountains",
  "plan": "FREE",
  "useFlux": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Image generated successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/promo_20260308.png",
    "filename": "promo_20260308.png",
    "userId": "anon",
    "prompt": "A beautiful sunset over mountains"
  }
}
```

---

### 2️⃣ FLUX Only (`useFlux: true`)

**Request:**
```json
{
  "prompt": "A futuristic robot in a cyberpunk city",
  "plan": "FREE",
  "useFlux": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ FLUX image generated successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/flux-image-xxx.png",
    "filename": "flux-image-xxx.png",
    "userId": "anon",
    "prompt": "A futuristic robot in a cyberpunk city"
  }
}
```

---

### 3️⃣ Direct FLUX Endpoint

**Request:**
```json
{
  "prompt": "A cat wearing sunglasses",
  "plan": "CREATOR"
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ FLUX image generated successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/flux-image-yyy.png",
    "filename": "flux-image-yyy.png",
    "userId": "anon",
    "prompt": "A cat wearing sunglasses"
  }
}
```

---

### 4️⃣ Dual Generation (DALL-E + FLUX Kontext Pro) ⭐ NEW

**Request:**
```json
{
  "prompt": "A futuristic robot in a cyberpunk city with neon lights",
  "plan": "PRO"
}
```

**Response:**
```json
{
  "promo": "https://realculturestorage.blob.core.windows.net/images/promo_xxx_dalle.png",
  "flux": "https://realculturestorage.blob.core.windows.net/images/flux-kontext-xxx.png"
}
```

**What happens:**
- Generates **TWO images** simultaneously
- `promo`: DALL-E 3 image
- `flux`: FLUX.1-Kontext-pro image
- Returns **BOTH URLs** in a single response

---

### 5️⃣ Simple FLUX 2 Pro ⭐ NEW

**Request:**
```json
{
  "prompt": "A beautiful landscape with mountains and lakes",
  "plan": "FREE",
  "size": "1024x1024"
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ FLUX 2 Pro image generated successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/flux-2-pro-xxx.png",
    "filename": "flux-2-pro-xxx.png",
    "userId": "anon",
    "prompt": "A beautiful landscape with mountains and lakes"
  }
}
```

---

## 🔧 Manual Testing with curl

### Test DALL-E Only
```bash
curl -X POST https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset",
    "plan": "FREE",
    "useFlux": false
  }'
```

### Test FLUX Only
```bash
curl -X POST https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A futuristic robot",
    "plan": "FREE",
    "useFlux": true
  }'
```

### Test Dual (Both)
```bash
curl -X POST https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-image/dual \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Cyberpunk city with neon lights",
    "plan": "PRO"
  }'
```

### Test FLUX 2 Pro
```bash
curl -X POST https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-image/simple \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Mountain landscape",
    "plan": "FREE",
    "size": "1024x1024"
  }'
```

---

## ✅ Validation Checklist

Before deploying to production, verify:

- [ ] **DALL-E endpoint works** (`useFlux: false`)
  - Returns image URL in response
  - Image is stored in Azure Blob Storage
  
- [ ] **FLUX endpoint works** (`useFlux: true`)
  - Returns image URL in response
  - Uses FLUX-1.1-pro model
  
- [ ] **Direct FLUX endpoint works**
  - `/media/flux-image` responds correctly
  - Returns proper JSON structure
  
- [ ] **Dual endpoint works** ⭐
  - Returns BOTH `promo` and `flux` URLs
  - Both images are generated
  - Response time is acceptable (< 30 seconds)
  
- [ ] **FLUX 2 Pro endpoint works** ⭐
  - Returns success flag
  - Returns image URL
  - Proper error handling

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to service"
**Solution:** Start the application locally
```bash
npm run start:dev
```

### Issue: "Environment variables not set"
**Solution:** Check `.env` file has all FLUX variables:
```env
FLUX_API_KEY=...
ENDPOINT_FLUX_KONTENT_PRO=...
ENDPOINT_FLUX_KONTENT_PRO_API_KEY=...
FLUX_2_PRO_ENDPOINT=...
FLUX_2_PRO_API_KEY=...
```

### Issue: "Dual endpoint returns only one image"
**Solution:** This is expected if one service fails. Check logs:
```bash
az webapp log tail --name video-converter --resource-group realculture-rg
```

### Issue: "Timeout error"
**Solution:** Image generation can take 10-20 seconds. Increase timeout:
```powershell
$ProgressPreference = 'SilentlyContinue'
Invoke-RestMethod -Uri $url -Method POST -Body $body -TimeoutSec 60
```

---

## 📊 Performance Expectations

| Endpoint | Avg Response Time | Success Rate |
|----------|------------------|--------------|
| DALL-E Only | 5-10 seconds | ~95% |
| FLUX Only | 5-10 seconds | ~95% |
| Direct FLUX | 5-10 seconds | ~95% |
| Dual | 10-20 seconds | ~90% |
| FLUX 2 Pro | 5-10 seconds | ~95% |

---

## 🎯 Quick Reference

### Three Modes Summary:

1. **DALL-E Mode** → `"useFlux": false`
2. **FLUX Mode** → `"useFlux": true`
3. **Dual Mode** → Use `/media/flux-image/dual` endpoint

### JSON Response Keys:

- **Standard endpoints**: `data.imageUrl`
- **Dual endpoint**: `promo` + `flux`
- **All responses**: Include `success`, `message`, and relevant data

---

**Created:** 2026-03-08  
**Version:** 2.0.0  
**Status:** Ready for Testing ✅
