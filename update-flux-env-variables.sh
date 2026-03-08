# Azure CLI Commands to Update Environment Variables
# App Service: video-converter
# Resource Group: realculture-rg

# ===================================================================
# FLUX-1.1-pro Configuration (Primary Image Generation)
# ===================================================================
az webapp config appsettings set \
  --name video-converter \
  --resource-group realculture-rg \
  --settings FLUX_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS

# ===================================================================
# FLUX.1-Kontext-pro Configuration (Advanced with Reference Images)
# ===================================================================
az webapp config appsettings set \
  --name video-converter \
  --resource-group realculture-rg \
  --settings ENDPOINT_FLUX_KONTENT_PRO=https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com

az webapp config appsettings set \
  --name video-converter \
  --resource-group realculture-rg \
  --settings ENDPOINT_FLUX_KONTENT_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS

# ===================================================================
# FLUX 2 Pro Configuration (Future Use)
# ===================================================================
az webapp config appsettings set \
  --name video-converter \
  --resource-group realculture-rg \
  --settings FLUX_2_PRO_ENDPOINT=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/providers/blackforestlabs/v1/flux-2-pro?api-version=preview

az webapp config appsettings set \
  --name video-converter \
  --resource-group realculture-rg \
  --settings FLUX_2_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS

# ===================================================================
# Verify All Settings Were Updated Successfully
# ===================================================================
az webapp config appsettings list \
  --name video-converter \
  --resource-group realculture-rg \
  --query "[?contains(name, 'FLUX')]" \
  --output table

# ===================================================================
# Restart the App Service to Apply Changes
# ===================================================================
az webapp restart \
  --name video-converter \
  --resource-group realculture-rg

# ===================================================================
# Check Deployment Status
# ===================================================================
az webapp show \
  --name video-converter \
  --resource-group realculture-rg \
  --query "{name:name, state:state, defaultHostName:defaultHostName, kind:kind}" \
  --output table
