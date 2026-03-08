# FLUX Environment Variables Update Guide

## 📋 Summary

This update configures **3 FLUX services** for image generation in your Azure App Service:

| Service | Purpose | Status |
|---------|---------|--------|
| **FLUX-1.1-pro** | Primary image generation | ✅ Active |
| **FLUX.1-Kontext-pro** | Advanced (with reference images) | ⚠️ Compiled only |
| **FLUX 2 Pro** | Future use | ❌ Not implemented |

---

## 🚀 Quick Deployment (PowerShell - Recommended)

### Option 1: Run the PowerShell Script
```powershell
.\update-flux-env-variables.ps1
```

### Option 2: Manual Commands (Copy & Paste)

```powershell
# 1. Set FLUX-1.1-pro API Key
az webapp config appsettings set --name video-converter --resource-group realculture-rg --settings FLUX_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS

# 2. Set FLUX.1-Kontext-pro Endpoint
az webapp config appsettings set --name video-converter --resource-group realculture-rg --settings ENDPOINT_FLUX_KONTENT_PRO=https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com

# 3. Set FLUX.1-Kontext-pro API Key
az webapp config appsettings set --name video-converter --resource-group realculture-rg --settings ENDPOINT_FLUX_KONTENT_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS

# 4. Set FLUX 2 Pro Endpoint (future use)
az webapp config appsettings set --name video-converter --resource-group realculture-rg --settings FLUX_2_PRO_ENDPOINT=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/providers/blackforestlabs/v1/flux-2-pro?api-version=preview

# 5. Set FLUX 2 Pro API Key (future use)
az webapp config appsettings set --name video-converter --resource-group realculture-rg --settings FLUX_2_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS

# 6. Restart the application
az webapp restart --name video-converter --resource-group realculture-rg
```

---

## 🖥️ Bash/Linux Commands

If you're using WSL, Git Bash, or Linux:

```bash
chmod +x update-flux-env-variables.sh
./update-flux-env-variables.sh
```

---

## ✅ Verification Commands

After deployment, verify the settings:

### Check all FLUX variables:
```powershell
az webapp config appsettings list `
  --name video-converter `
  --resource-group realculture-rg `
  --query "[?contains(name, 'FLUX')]" `
  --output table
```

### Test the endpoint:
```powershell
curl https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/health
```

---

## 📊 Target Infrastructure

- **App Service Name:** video-converter
- **Resource Group:** realculture-rg
- **Subscription ID:** a466ea69-1312-4361-95e1-f1c8524bea91
- **Region:** Canada Central
- **Default Domain:** video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net
- **Plan:** ASP-RealCulture (P1v3: 2 instances)
- **OS:** Linux
- **Container:** realcultureacr.azurecr.io/video-generator:latest

---

## 🔧 Troubleshooting

### If the script fails:

1. **Check Azure CLI installation:**
   ```powershell
   az --version
   ```

2. **Login to Azure:**
   ```powershell
   az login
   ```

3. **Select correct subscription:**
   ```powershell
   az account set --subscription a466ea69-1312-4361-95e1-f1c8524bea91
   ```

4. **Verify resource group exists:**
   ```powershell
   az group show --name realculture-rg
   ```

---

## 📝 Environment Variables Being Set

```env
# FLUX-1.1-pro (Active)
FLUX_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS

# FLUX.1-Kontext-pro (Compiled service only)
ENDPOINT_FLUX_KONTENT_PRO=https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com
ENDPOINT_FLUX_KONTENT_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS

# FLUX 2 Pro (Future use)
FLUX_2_PRO_ENDPOINT=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/providers/blackforestlabs/v1/flux-2-pro?api-version=preview
FLUX_2_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS
```

---

## ⚡ Expected Output

```
✅ Environment variables updated successfully!
🌐 Default Hostname: video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net
```

---

## 📞 Next Steps

1. Monitor logs after deployment:
   ```powershell
   az webapp log tail --name video-converter --resource-group realculture-rg
   ```

2. Test FLUX image generation endpoint

3. Verify no errors in Application Insights

---

**Created:** 2026-03-08  
**Target:** Production Environment  
**Impact:** Requires application restart (~30 seconds downtime)
