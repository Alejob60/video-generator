#!/bin/bash
# 📁 deploy-to-azure-production.sh
# Script de despliegue automatizado para Azure

set -e  # Exit on any error

echo "🚀 INICIANDO DESPLIEGUE EN AZURE"
echo "================================"

# Variables de configuración
RESOURCE_GROUP="realculture-rg"
CONTAINER_REGISTRY="realcultureacr"
IMAGE_NAME="video-generator"
TAG="latest"
APP_SERVICE="video-converter"

echo "🔧 Configuración:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Container Registry: $CONTAINER_REGISTRY"
echo "  Image: $IMAGE_NAME:$TAG"
echo "  App Service: $APP_SERVICE"
echo "------------------------------"

# 1. Login a Azure (si no está logueado)
echo "🔐 Verificando autenticación en Azure..."
if ! az account show >/dev/null 2>&1; then
    echo "⚠️  No autenticado en Azure. Iniciando login..."
    az login
fi

# 2. Establecer suscripción
echo "📋 Estableciendo suscripción..."
az account set --subscription "a466ea69-1312-4361-95e1-f1c8524bea91"

# 3. Construir imagen Docker
echo "🏗️  Construyendo imagen Docker..."
docker build -t $IMAGE_NAME:$TAG .

# 4. Etiquetar para Azure Container Registry
echo "🏷️  Etiquetando imagen para ACR..."
docker tag $IMAGE_NAME:$TAG $CONTAINER_REGISTRY.azurecr.io/$IMAGE_NAME:$TAG

# 5. Login al Container Registry
echo "🔓 Iniciando sesión en Azure Container Registry..."
az acr login --name $CONTAINER_REGISTRY

# 6. Publicar imagen en ACR
echo "📤 Publicando imagen en Azure Container Registry..."
docker push $CONTAINER_REGISTRY.azurecr.io/$IMAGE_NAME:$TAG

# 7. Configurar credenciales para App Service
echo "🔑 Configurando credenciales para App Service..."
az webapp config container set \
    --name $APP_SERVICE \
    --resource-group $RESOURCE_GROUP \
    --docker-custom-image-name $CONTAINER_REGISTRY.azurecr.io/$IMAGE_NAME:$TAG \
    --docker-registry-server-url https://$CONTAINER_REGISTRY.azurecr.io

# 8. Reiniciar App Service
echo "🔄 Reiniciando aplicación web..."
az webapp restart --name $APP_SERVICE --resource-group $RESOURCE_GROUP

# 9. Esperar a que la aplicación esté disponible
echo "⏱️  Esperando a que la aplicación esté disponible..."
sleep 60

# 10. Verificar estado de la aplicación
echo "🔍 Verificando estado de la aplicación..."
APP_STATUS=$(az webapp show --name $APP_SERVICE --resource-group $RESOURCE_GROUP --query "state" -o tsv)
echo "Estado de la aplicación: $APP_STATUS"

# 11. Obtener URL de la aplicación
APP_URL=$(az webapp show --name $APP_SERVICE --resource-group $RESOURCE_GROUP --query "defaultHostName" -o tsv)
echo "🌐 URL de la aplicación: https://$APP_URL"

# 12. Prueba de conectividad básica
echo "🧪 Realizando prueba de conectividad..."
curl -f -s -o /dev/null "https://$APP_URL/status" && echo "✅ Status endpoint: OK" || echo "❌ Status endpoint: FAILED"

curl -f -s -o /dev/null "https://$APP_URL/health" && echo "✅ Health endpoint: OK" || echo "❌ Health endpoint: FAILED"

echo ""
echo "🎉 DESPLIEGUE COMPLETADO"
echo "========================"
echo "Aplicación disponible en: https://$APP_URL"
echo "Recuerda verificar todos los endpoints funcionales"