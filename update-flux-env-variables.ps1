# Azure CLI Commands to Update Environment Variables (PowerShell)
# App Service: video-converter
# Resource Group: realculture-rg

Write-Host "=== Updating FLUX Environment Variables ===" -ForegroundColor Cyan

# ===================================================================
# FLUX-1.1-pro Configuration (Primary Image Generation)
# ===================================================================
Write-Host "`n[1/5] Setting FLUX_API_KEY..." -ForegroundColor Yellow
az webapp config appsettings set `
  --name video-converter `
  --resource-group realculture-rg `
  --settings FLUX_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS

# ===================================================================
# FLUX.1-Kontext-pro Configuration (Advanced with Reference Images)
# ===================================================================
Write-Host "`n[2/5] Setting ENDPOINT_FLUX_KONTENT_PRO..." -ForegroundColor Yellow
az webapp config appsettings set `
  --name video-converter `
  --resource-group realculture-rg `
  --settings ENDPOINT_FLUX_KONTENT_PRO=https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com

Write-Host "`n[3/5] Setting ENDPOINT_FLUX_KONTENT_PRO_API_KEY..." -ForegroundColor Yellow
az webapp config appsettings set `
  --name video-converter `
  --resource-group realculture-rg `
  --settings ENDPOINT_FLUX_KONTENT_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS

# ===================================================================
# FLUX 2 Pro Configuration (Future Use)
# ===================================================================
Write-Host "`n[4/5] Setting FLUX_2_PRO_ENDPOINT..." -ForegroundColor Yellow
az webapp config appsettings set `
  --name video-converter `
  --resource-group realculture-rg `
  --settings FLUX_2_PRO_ENDPOINT=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/providers/blackforestlabs/v1/flux-2-pro?api-version=preview

Write-Host "`n[5/5] Setting FLUX_2_PRO_API_KEY..." -ForegroundColor Yellow
az webapp config appsettings set `
  --name video-converter `
  --resource-group realculture-rg `
  --settings FLUX_2_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS

# ===================================================================
# Verify All Settings Were Updated Successfully
# ===================================================================
Write-Host "`n=== Verifying FLUX Settings ===" -ForegroundColor Cyan
az webapp config appsettings list `
  --name video-converter `
  --resource-group realculture-rg `
  --query "[?contains(name, 'FLUX')]" `
  --output table

# ===================================================================
# Restart the App Service to Apply Changes
# ===================================================================
Write-Host "`n=== Restarting App Service ===" -ForegroundColor Cyan
az webapp restart `
  --name video-converter `
  --resource-group realculture-rg

Write-Host "`n⏳ Waiting for restart to complete (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# ===================================================================
# Check Deployment Status
# ===================================================================
Write-Host "`n=== Checking Deployment Status ===" -ForegroundColor Cyan
az webapp show `
  --name video-converter `
  --resource-group realculture-rg `
  --query "{name:name, state:state, defaultHostName:defaultHostName, kind:kind}" `
  --output table

Write-Host "`n✅ Environment variables updated successfully!" -ForegroundColor Green
Write-Host "🌐 Default Hostname: video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net" -ForegroundColor Green
