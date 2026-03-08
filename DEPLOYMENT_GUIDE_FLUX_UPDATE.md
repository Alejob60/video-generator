# 🚀 FLUX Image Generation - Deployment Guide

## 📋 Overview

This deployment updates the video-generator application with **three new FLUX image generation endpoints**:

| Endpoint | Description | Technology |
|----------|-------------|------------|
| `/media/flux-image/dual` | Generate 2 images simultaneously | DALL-E 3 + FLUX.1-Kontext-pro |
| `/media/flux-image/simple` | Generate single image | FLUX 2 Pro |
| `/media/flux-image` | Original FLUX endpoint | FLUX-1.1-pro |

---

## 🎯 Quick Deploy (PowerShell - Windows)

### Prerequisites
- Azure CLI installed (`az --version`)
- Docker Desktop installed
- PowerShell 7+
- Azure subscription access

### One-Command Deployment

```powershell
.\deploy-flux-update.ps1
```

**What it does:**
1. ✅ Authenticates to Azure
2. ✅ Builds Docker image locally
3. ✅ Pushes to Azure Container Registry
4. ✅ Updates environment variables
5. ✅ Deploys to App Service
6. ✅ Restarts the application
7. ✅ Verifies deployment

---

## 🐧 Quick Deploy (Bash/Linux)

```bash
chmod +x deploy-flux-update.sh
./deploy-flux-update.sh
```

---

## 🔧 Manual Deployment Steps

If you prefer to execute each step manually:

### Step 1: Azure Authentication

```powershell
# Login to Azure
az login

# Set subscription
az account set --subscription a466ea69-1312-4361-95e1-f1c8524bea91
```

### Step 2: Build Docker Image

```powershell
# Build locally
docker build -t realcultureacr.azurecr.io/video-converter:latest .
```

### Step 3: Push to ACR

```powershell
# Login to ACR
az acr login --name realcultureacr

# Push image
docker push realcultureacr.azurecr.io/video-converter:latest
```

### Step 4: Update Environment Variables

```powershell
az webapp config appsettings set `
  --name video-converter `
  --resource-group realculture-rg `
  --settings `
  "FLUX_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS" `
  "ENDPOINT_FLUX_KONTENT_PRO=https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com" `
  "ENDPOINT_FLUX_KONTENT_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS" `
  "FLUX_2_PRO_ENDPOINT=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/providers/blackforestlabs/v1/flux-2-pro?api-version=preview" `
  "FLUX_2_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"
```

### Step 5: Update App Service Image

```powershell
az webapp config container set `
  --name video-converter `
  --resource-group realculture-rg `
  --docker-custom-image-name realcultureacr.azurecr.io/video-converter:latest `
  --docker-registry-server-url https://realcultureacr.azurecr.io
```

### Step 6: Restart Application

```powershell
az webapp restart `
  --name video-converter `
  --resource-group realculture-rg
```

### Step 7: Verify Deployment

```powershell
# Get app info
az webapp show `
  --name video-converter `
  --resource-group realculture-rg `
  --query "{name:name, state:state, defaultHostName:defaultHostName}" `
  --output table

# Test health endpoint
curl https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/health
```

---

## 🧪 Testing the New Endpoints

### 1. Test Dual Image Generation (DALL-E + FLUX Kontext)

```powershell
$body = @{
    prompt = "A futuristic robot in a cyberpunk city"
    plan = "PRO"
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Uri "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-image/dual" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" | ConvertTo-Json -Depth 10
```

**Expected Response:**
```json
{
  "promo": "https://realculturestorage.blob.core.windows.net/images/promo_xxx.png",
  "flux": "https://realculturestorage.blob.core.windows.net/images/flux-kontext-xxx.png"
}
```

---

### 2. Test Simple FLUX 2 Pro

```powershell
$body = @{
    prompt = "A beautiful sunset over mountains"
    plan = "FREE"
    size = "1024x1024"
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Uri "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-image/simple" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" | ConvertTo-Json -Depth 10
```

**Expected Response:**
```json
{
  "success": true,
  "message": "✅ FLUX 2 Pro image generated successfully",
  "data": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/flux-2-pro-xxx.png",
    "prompt": "A beautiful sunset over mountains"
  }
}
```

---

### 3. Test Original FLUX-1.1-pro

```powershell
$body = @{
    prompt = "A cat wearing sunglasses"
    plan = "CREATOR"
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Uri "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-image" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" | ConvertTo-Json -Depth 10
```

---

## 📊 Architecture

### Services Created

1. **FluxKontextImageService** (`src/infrastructure/services/flux-kontext-image.service.ts`)
   - Uses Azure AD authentication
   - Supports reference images (edits endpoint)
   - Generates images with FLUX.1-Kontext-pro

2. **Flux2ProService** (`src/infrastructure/services/flux-2-pro.service.ts`)
   - Uses API Key authentication
   - Latest FLUX 2 Pro model
   - Optimized for speed and quality

3. **Updated Controller** (`src/interfaces/controllers/flux-image.controller.ts`)
   - Added `/dual` endpoint
   - Added `/simple` endpoint
   - Maintains backward compatibility

---

## 🔍 Monitoring & Troubleshooting

### View Real-time Logs

```powershell
az webapp log tail `
  --name video-converter `
  --resource-group realculture-rg
```

### Check Environment Variables

```powershell
az webapp config appsettings list `
  --name video-converter `
  --resource-group realculture-rg `
  --query "[?contains(name, 'FLUX')]" `
  --output table
```

### Common Issues

#### Issue 1: Docker Build Fails
**Solution:** Ensure all dependencies are installed
```powershell
npm install
docker --version
```

#### Issue 2: ACR Push Fails
**Solution:** Verify ACR login
```powershell
az acr login --name realcultureacr --verbose
```

#### Issue 3: App Service Won't Start
**Solution:** Check container logs
```powershell
az webapp log tail `
  --name video-converter `
  --resource-group realculture-rg `
  --type docker
```

#### Issue 4: FLUX Endpoints Return 500
**Solution:** Verify environment variables and check logs
```powershell
# Check env vars
az webapp config appsettings list `
  --name video-converter `
  --resource-group realculture-rg

# Check logs
az webapp log tail `
  --name video-converter `
  --resource-group realculture-rg
```

---

## 📈 Performance Metrics

| Metric | Expected Value |
|--------|----------------|
| Docker Build Time | 2-5 minutes |
| Docker Push Time | 1-3 minutes |
| App Service Restart | 30-60 seconds |
| Total Deployment Time | 5-10 minutes |
| Image Generation (Dual) | 10-20 seconds |
| Image Generation (Simple) | 5-10 seconds |

---

## 💡 Best Practices

1. **Always test locally first** before deploying to production
2. **Monitor logs** during and after deployment
3. **Keep environment variables secure** - never commit `.env` to git
4. **Use staging slots** for critical deployments
5. **Set up Application Insights** for detailed monitoring

---

## 🔄 Rollback Procedure

If something goes wrong:

```powershell
# Rollback to previous image version
az webapp deployment source sync `
  --name video-converter `
  --resource-group realculture-rg

# Or redeploy previous known good version
docker tag realcultureacr.azurecr.io/video-converter:previous realcultureacr.azurecr.io/video-converter:latest
docker push realcultureacr.azurecr.io/video-converter:latest
az webapp restart --name video-converter --resource-group realculture-rg
```

---

## 📞 Support

For issues or questions:
- Check logs: `az webapp log tail --name video-converter --resource-group realculture-rg`
- Review Application Insights
- Contact Azure support if infrastructure issues persist

---

**Created:** 2026-03-08  
**Last Updated:** 2026-03-08  
**Version:** 2.0.0  
**Target:** Production Environment
