#!/bin/bash
# Script para desplegar fixes rápidamente sin rebuild completo

echo "🚀 Iniciando despliegue rápido de fixes..."

# Etiqueta para la nueva imagen
IMAGE_TAG="video-generator-fixes-$(date +%Y%m%d-%H%M%S)"

# Crear imagen con fixes usando imagen base existente
echo "🔧 Creando imagen con fixes..."
docker build -f Dockerfile.simple -t realcultureacr.azurecr.io/$IMAGE_TAG .

if [ $? -eq 0 ]; then
    echo "✅ Imagen creada exitosamente: $IMAGE_TAG"
    
    # Push a Azure Container Registry
    echo "📤 Subiendo imagen a Azure Container Registry..."
    docker push realcultureacr.azurecr.io/$IMAGE_TAG
    
    if [ $? -eq 0 ]; then
        echo "✅ Imagen subida exitosamente"
        
        # Desplegar a Azure App Service
        echo "🌐 Desplegando a Azure App Service..."
        az webapp config container set \
            --name realculture-video-generator \
            --resource-group realculture-rg \
            --docker-custom-image-name realcultureacr.azurecr.io/$IMAGE_TAG \
            --docker-registry-server-url https://realcultureacr.azurecr.io
        
        if [ $? -eq 0 ]; then
            echo "✅ Despliegue completado exitosamente!"
            echo "📊 Verificando estado..."
            az webapp show --name realculture-video-generator --resource-group realculture-rg --query "state"
        else
            echo "❌ Error en el despliegue"
        fi
    else
        echo "❌ Error subiendo la imagen"
    fi
else
    echo "❌ Error creando la imagen"
fi