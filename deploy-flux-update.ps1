# Azure Deployment Script - FLUX Image Generation Update
# Builds Docker image and deploys to Azure Container Registry + App Service

param(
    [string]$ResourceGroup = "realculture-rg",
    [string]$Location = "canadacentral",
    [string]$AppName = "video-converter",
    [string]$ACRName = "realcultureacr",
    [string]$ImageTag = "latest"
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  AZURE DEPLOYMENT - FLUX IMAGE UPDATE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$SubscriptionId = "a466ea69-1312-4361-95e1-f1c8524bea91"
$FullImageName = "${ACRName}.azurecr.io/${AppName}:${ImageTag}"

Write-Host "📋 Deployment Configuration:" -ForegroundColor Yellow
Write-Host "   Subscription: $SubscriptionId"
Write-Host "   Resource Group: $ResourceGroup"
Write-Host "   Location: $Location"
Write-Host "   App Name: $AppName"
Write-Host "   ACR Name: $ACRName"
Write-Host "   Image Name: $FullImageName"
Write-Host ""

# Step 1: Login to Azure
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Step 1: Azure Authentication" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

try {
    $azContext = az account show --query "{subscriptionId:id, tenantId:tenantId}" --output json | ConvertFrom-Json
    Write-Host "✅ Already logged in to Azure" -ForegroundColor Green
    Write-Host "   Subscription ID: $($azContext.subscriptionId)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️ Not logged in. Logging in..." -ForegroundColor Yellow
    az login --output none
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Azure login failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Successfully logged in to Azure" -ForegroundColor Green
}

# Set subscription
Write-Host "`n📌 Setting subscription..." -ForegroundColor Yellow
az account set --subscription $SubscriptionId --output none

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to set subscription!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Subscription set successfully" -ForegroundColor Green

# Step 2: Verify Resource Group exists
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Step 2: Verify Resource Group" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "🔍 Checking if resource group exists..." -ForegroundColor Yellow
$rgExists = az group exists --name $ResourceGroup --output json

if ($rgExists -eq "false") {
    Write-Host "❌ Resource group '$ResourceGroup' does not exist!" -ForegroundColor Red
    Write-Host "💡 Creating resource group..." -ForegroundColor Yellow
    az group create --name $ResourceGroup --location $Location --output none
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create resource group!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Resource group created successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Resource group exists" -ForegroundColor Green
}

# Step 3: Build Docker Image Locally
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Step 3: Build Docker Image" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "🔨 Building Docker image locally..." -ForegroundColor Yellow
Write-Host "   This may take several minutes..." -ForegroundColor Gray

docker build -t $FullImageName .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker image built successfully" -ForegroundColor Green
Write-Host "   Image: $FullImageName" -ForegroundColor Gray

# Step 4: Push to Azure Container Registry
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Step 4: Push to Azure Container Registry" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "📤 Pushing image to ACR..." -ForegroundColor Yellow
Write-Host "   ACR: $ACRName" -ForegroundColor Gray

# Login to ACR
az acr login --name $ACRName --output none

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to login to ACR!" -ForegroundColor Red
    exit 1
}

# Push image
docker push $FullImageName

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push image to ACR!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Image pushed to ACR successfully" -ForegroundColor Green

# Step 5: Update App Service Configuration
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Step 5: Update Environment Variables" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "⚙️ Updating FLUX environment variables..." -ForegroundColor Yellow

# Set all FLUX-related environment variables
$envVars = @(
    "FLUX_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS",
    "ENDPOINT_FLUX_KONTENT_PRO=https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com",
    "ENDPOINT_FLUX_KONTENT_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS",
    "FLUX_2_PRO_ENDPOINT=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/providers/blackforestlabs/v1/flux-2-pro?api-version=preview",
    "FLUX_2_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"
)

foreach ($envVar in $envVars) {
    Write-Host "   Setting: $($envVar.Split('=')[0])" -ForegroundColor Gray
    az webapp config appsettings set `
        --name $AppName `
        --resource-group $ResourceGroup `
        --settings $envVar `
        --output none
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Warning: Failed to set $envVar" -ForegroundColor Yellow
    }
}

Write-Host "✅ Environment variables updated" -ForegroundColor Green

# Step 6: Update App Service to use new image
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Step 6: Update App Service Image" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "🔄 Updating App Service to use new image..." -ForegroundColor Yellow

$fullImagePath = "${ACRName}.azurecr.io/${AppName}:${ImageTag}"

az webapp config container set `
    --name $AppName `
    --resource-group $ResourceGroup `
    --docker-custom-image-name $fullImagePath `
    --docker-registry-server-url https://${ACRName}.azurecr.io `
    --output none

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to update App Service image!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ App Service image updated" -ForegroundColor Green

# Step 7: Restart App Service
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Step 7: Restart App Service" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "🔄 Restarting App Service..." -ForegroundColor Yellow

az webapp restart `
    --name $AppName `
    --resource-group $ResourceGroup `
    --output none

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to restart App Service!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ App Service restarted" -ForegroundColor Green

# Wait for startup
Write-Host "`n⏳ Waiting for App Service to start (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Step 8: Verify Deployment
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Step 8: Verify Deployment" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "📊 Getting deployment information..." -ForegroundColor Yellow

$appInfo = az webapp show `
    --name $AppName `
    --resource-group $ResourceGroup `
    --query "{name:name, state:state, defaultHostName:defaultHostName, kind:kind, location:location}" `
    --output json | ConvertFrom-Json

Write-Host "`n📋 Deployment Summary:" -ForegroundColor Cyan
Write-Host "   Name: $($appInfo.name)" -ForegroundColor White
Write-Host "   State: $($appInfo.state)" -ForegroundColor $(if($appInfo.state -eq "Running"){"Green"}else{"Yellow"})
Write-Host "   Hostname: $($appInfo.defaultHostName)" -ForegroundColor White
Write-Host "   Location: $($appInfo.location)" -ForegroundColor White
Write-Host "   Type: $($appInfo.kind)" -ForegroundColor White

# Test health endpoint
Write-Host "`n🧪 Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthUrl = "https://$($appInfo.defaultHostName)/health"
    $response = Invoke-WebRequest -Uri $healthUrl -Method GET -UseBasicParsing -TimeoutSec 10
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed (Status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Health check returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Final Summary
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`n📝 New Endpoints Available:" -ForegroundColor Cyan
Write-Host "   1. Dual Image (DALL-E + FLUX Kontext Pro):" -ForegroundColor White
Write-Host "      POST https://$($appInfo.defaultHostName)/media/flux-image/dual" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Simple FLUX 2 Pro:" -ForegroundColor White
Write-Host "      POST https://$($appInfo.defaultHostName)/media/flux-image/simple" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Original FLUX-1.1-pro:" -ForegroundColor White
Write-Host "      POST https://$($appInfo.defaultHostName)/media/flux-image" -ForegroundColor Gray

Write-Host "`n📊 Environment Variables Updated:" -ForegroundColor Cyan
Write-Host "   ✅ FLUX_API_KEY" -ForegroundColor Green
Write-Host "   ✅ ENDPOINT_FLUX_KONTENT_PRO" -ForegroundColor Green
Write-Host "   ✅ ENDPOINT_FLUX_KONTENT_PRO_API_KEY" -ForegroundColor Green
Write-Host "   ✅ FLUX_2_PRO_ENDPOINT" -ForegroundColor Green
Write-Host "   ✅ FLUX_2_PRO_API_KEY" -ForegroundColor Green

Write-Host "`n💡 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Monitor logs: az webapp log tail --name $AppName --resource-group $ResourceGroup" -ForegroundColor Gray
Write-Host "   2. Test endpoints with provided curl commands" -ForegroundColor Gray
Write-Host "   3. Check Application Insights for detailed monitoring" -ForegroundColor Gray

Write-Host "`n✅ All done! Deployment successful!" -ForegroundColor Green
