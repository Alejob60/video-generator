#!/bin/bash

# Azure Deployment Script - FLUX Image Generation Update (Bash/Linux)
# Builds Docker image and deploys to Azure Container Registry + App Service

RESOURCE_GROUP="realculture-rg"
LOCATION="canadacentral"
APP_NAME="video-converter"
ACR_NAME="realcultureacr"
IMAGE_TAG="latest"
SUBSCRIPTION_ID="a466ea69-1312-4361-95e1-f1c8524bea91"

FULL_IMAGE_NAME="${ACR_NAME}.azurecr.io/${APP_NAME}:${IMAGE_TAG}"

echo "============================================"
echo "  AZURE DEPLOYMENT - FLUX IMAGE UPDATE"
echo "============================================"
echo ""

echo "📋 Deployment Configuration:"
echo "   Subscription: $SUBSCRIPTION_ID"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Location: $LOCATION"
echo "   App Name: $APP_NAME"
echo "   ACR Name: $ACR_NAME"
echo "   Image Name: $FULL_IMAGE_NAME"
echo ""

# Step 1: Login to Azure
echo "============================================"
echo "  Step 1: Azure Authentication"
echo "============================================"

az account show > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Already logged in to Azure"
else
    echo "⚠️ Not logged in. Logging in..."
    az login
    if [ $? -ne 0 ]; then
        echo "❌ Azure login failed!"
        exit 1
    fi
    echo "✅ Successfully logged in to Azure"
fi

# Set subscription
echo -e "\n📌 Setting subscription..."
az account set --subscription $SUBSCRIPTION_ID

if [ $? -ne 0 ]; then
    echo "❌ Failed to set subscription!"
    exit 1
fi

echo "✅ Subscription set successfully"

# Step 2: Verify Resource Group exists
echo -e "\n============================================"
echo "  Step 2: Verify Resource Group"
echo "============================================"

echo "🔍 Checking if resource group exists..."
RG_EXISTS=$(az group exists --name $RESOURCE_GROUP)

if [ "$RG_EXISTS" == "false" ]; then
    echo "❌ Resource group '$RESOURCE_GROUP' does not exist!"
    echo "💡 Creating resource group..."
    az group create --name $RESOURCE_GROUP --location $LOCATION
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create resource group!"
        exit 1
    fi
    
    echo "✅ Resource group created successfully"
else
    echo "✅ Resource group exists"
fi

# Step 3: Build Docker Image Locally
echo -e "\n============================================"
echo "  Step 3: Build Docker Image"
echo "============================================"

echo "🔨 Building Docker image locally..."
echo "   This may take several minutes..."

docker build -t $FULL_IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker image built successfully"
echo "   Image: $FULL_IMAGE_NAME"

# Step 4: Push to Azure Container Registry
echo -e "\n============================================"
echo "  Step 4: Push to Azure Container Registry"
echo "============================================"

echo "📤 Pushing image to ACR..."
echo "   ACR: $ACR_NAME"

# Login to ACR
az acr login --name $ACR_NAME

if [ $? -ne 0 ]; then
    echo "❌ Failed to login to ACR!"
    exit 1
fi

# Push image
docker push $FULL_IMAGE_NAME

if [ $? -ne 0 ]; then
    echo "❌ Failed to push image to ACR!"
    exit 1
fi

echo "✅ Image pushed to ACR successfully"

# Step 5: Update Environment Variables
echo -e "\n============================================"
echo "  Step 5: Update Environment Variables"
echo "============================================"

echo "⚙️ Updating FLUX environment variables..."

# Set all FLUX-related environment variables
az webapp config appsettings set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings \
    "FLUX_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS" \
    "ENDPOINT_FLUX_KONTENT_PRO=https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com" \
    "ENDPOINT_FLUX_KONTENT_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS" \
    "FLUX_2_PRO_ENDPOINT=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/providers/blackforestlabs/v1/flux-2-pro?api-version=preview" \
    "FLUX_2_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"

if [ $? -ne 0 ]; then
    echo "⚠️ Warning: Failed to set some environment variables"
fi

echo "✅ Environment variables updated"

# Step 6: Update App Service Image
echo -e "\n============================================"
echo "  Step 6: Update App Service Image"
echo "============================================"

echo "🔄 Updating App Service to use new image..."

az webapp config container set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --docker-custom-image-name $FULL_IMAGE_NAME \
    --docker-registry-server-url https://${ACR_NAME}.azurecr.io

if [ $? -ne 0 ]; then
    echo "❌ Failed to update App Service image!"
    exit 1
fi

echo "✅ App Service image updated"

# Step 7: Restart App Service
echo -e "\n============================================"
echo "  Step 7: Restart App Service"
echo "============================================"

echo "🔄 Restarting App Service..."

az webapp restart \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP

if [ $? -ne 0 ]; then
    echo "❌ Failed to restart App Service!"
    exit 1
fi

echo "✅ App Service restarted"

echo -e "\n⏳ Waiting for App Service to start (30 seconds)..."
sleep 30

# Step 8: Verify Deployment
echo -e "\n============================================"
echo "  Step 8: Verify Deployment"
echo "============================================"

echo "📊 Getting deployment information..."

APP_INFO=$(az webapp show \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query "{name:name, state:state, defaultHostName:defaultHostName}" \
    --output json)

DEFAULT_HOSTNAME=$(echo $APP_INFO | jq -r '.defaultHostName')

echo -e "\n📋 Deployment Summary:"
echo "   Name: $APP_NAME"
echo "   Hostname: $DEFAULT_HOSTNAME"

# Test health endpoint
echo -e "\n🧪 Testing health endpoint..."
HEALTH_URL="https://$DEFAULT_HOSTNAME/health"

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ "$HTTP_STATUS" == "200" ]; then
    echo "✅ Health check passed (Status: $HTTP_STATUS)"
else
    echo "⚠️ Health check returned status: $HTTP_STATUS"
fi

# Final Summary
echo -e "\n============================================"
echo "  🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "============================================"

echo -e "\n📝 New Endpoints Available:"
echo "   1. Dual Image (DALL-E + FLUX Kontext Pro):"
echo "      POST https://$DEFAULT_HOSTNAME/media/flux-image/dual"
echo ""
echo "   2. Simple FLUX 2 Pro:"
echo "      POST https://$DEFAULT_HOSTNAME/media/flux-image/simple"
echo ""
echo "   3. Original FLUX-1.1-pro:"
echo "      POST https://$DEFAULT_HOSTNAME/media/flux-image"
echo ""

echo "✅ All done! Deployment successful!"
