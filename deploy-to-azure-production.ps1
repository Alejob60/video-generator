# 📁 deploy-to-azure-production.ps1
# Script de despliegue automatizado para Azure en PowerShell

Write-Host "🚀 INICIANDO DESPLIEGUE EN AZURE" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Variables de configuración
$RESOURCE_GROUP = "realculture-rg"
$CONTAINER_REGISTRY = "realcultureacr"
$IMAGE_NAME = "video-generator"
$TAG = "latest"
$APP_SERVICE = "video-converter"
$SUBSCRIPTION_ID = "a466ea69-1312-4361-95e1-f1c8524bea91"

Write-Host "🔧 Configuración:" -ForegroundColor Cyan
Write-Host "  Resource Group: $RESOURCE_GROUP" -ForegroundColor White
Write-Host "  Container Registry: $CONTAINER_REGISTRY" -ForegroundColor White
Write-Host "  Image: $IMAGE_NAME:$TAG" -ForegroundColor White
Write-Host "  App Service: $APP_SERVICE" -ForegroundColor White
Write-Host "------------------------------" -ForegroundColor Cyan

try {
    # 1. Verificar instalación de Azure CLI
    Write-Host "🔍 Verificando Azure CLI..." -ForegroundColor Yellow
    $azVersion = az --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Azure CLI no encontrado. Por favor instálalo primero." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Azure CLI encontrado" -ForegroundColor Green

    # 2. Login a Azure
    Write-Host "🔐 Verificando autenticación en Azure..." -ForegroundColor Yellow
    $account = az account show 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  No autenticado en Azure. Iniciando login..." -ForegroundColor Yellow
        az login
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error en login de Azure" -ForegroundColor Red
            exit 1
        }
    }
    Write-Host "✅ Autenticado en Azure" -ForegroundColor Green

    # 3. Establecer suscripción
    Write-Host "📋 Estableciendo suscripción..." -ForegroundColor Yellow
    az account set --subscription $SUBSCRIPTION_ID
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error estableciendo suscripción" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Suscripción establecida" -ForegroundColor Green

    # 4. Construir imagen Docker
    Write-Host "🏗️  Construyendo imagen Docker..." -ForegroundColor Yellow
    docker build -t "$IMAGE_NAME`:$TAG" .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error construyendo imagen Docker" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Imagen Docker construida" -ForegroundColor Green

    # 5. Etiquetar para Azure Container Registry
    Write-Host "🏷️  Etiquetando imagen para ACR..." -ForegroundColor Yellow
    docker tag "$IMAGE_NAME`:$TAG" "$CONTAINER_REGISTRY.azurecr.io/$IMAGE_NAME`:$TAG"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error etiquetando imagen" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Imagen etiquetada" -ForegroundColor Green

    # 6. Login al Container Registry
    Write-Host "🔓 Iniciando sesión en Azure Container Registry..." -ForegroundColor Yellow
    az acr login --name $CONTAINER_REGISTRY
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error iniciando sesión en ACR" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Sesión ACR iniciada" -ForegroundColor Green

    # 7. Publicar imagen en ACR
    Write-Host "📤 Publicando imagen en Azure Container Registry..." -ForegroundColor Yellow
    docker push "$CONTAINER_REGISTRY.azurecr.io/$IMAGE_NAME`:$TAG"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error publicando imagen en ACR" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Imagen publicada en ACR" -ForegroundColor Green

    # 8. Configurar credenciales para App Service
    Write-Host "🔑 Configurando credenciales para App Service..." -ForegroundColor Yellow
    az webapp config container set `
        --name $APP_SERVICE `
        --resource-group $RESOURCE_GROUP `
        --docker-custom-image-name "$CONTAINER_REGISTRY.azurecr.io/$IMAGE_NAME`:$TAG" `
        --docker-registry-server-url "https://$CONTAINER_REGISTRY.azurecr.io"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error configurando App Service" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ App Service configurado" -ForegroundColor Green

    # 9. Reiniciar App Service
    Write-Host "🔄 Reiniciando aplicación web..." -ForegroundColor Yellow
    az webapp restart --name $APP_SERVICE --resource-group $RESOURCE_GROUP
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error reiniciando App Service" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ App Service reiniciado" -ForegroundColor Green

    # 10. Esperar a que la aplicación esté disponible
    Write-Host "⏱️  Esperando a que la aplicación esté disponible..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60

    # 11. Verificar estado de la aplicación
    Write-Host "🔍 Verificando estado de la aplicación..." -ForegroundColor Yellow
    $appStatus = az webapp show --name $APP_SERVICE --resource-group $RESOURCE_GROUP --query "state" -o tsv
    Write-Host "Estado de la aplicación: $appStatus" -ForegroundColor White

    # 12. Obtener URL de la aplicación
    $appUrl = az webapp show --name $APP_SERVICE --resource-group $RESOURCE_GROUP --query "defaultHostName" -o tsv
    Write-Host "🌐 URL de la aplicación: https://$appUrl" -ForegroundColor Green

    # 13. Pruebas de conectividad
    Write-Host "🧪 Realizando pruebas de conectividad..." -ForegroundColor Yellow
    
    try {
        $statusResponse = Invoke-WebRequest -Uri "https://$appUrl/status" -Method GET -TimeoutSec 30
        if ($statusResponse.StatusCode -eq 200) {
            Write-Host "✅ Status endpoint: OK" -ForegroundColor Green
        } else {
            Write-Host "❌ Status endpoint: HTTP $($statusResponse.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Status endpoint: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }

    try {
        $healthResponse = Invoke-WebRequest -Uri "https://$appUrl/health" -Method GET -TimeoutSec 30
        if ($healthResponse.StatusCode -eq 200) {
            Write-Host "✅ Health endpoint: OK" -ForegroundColor Green
        } else {
            Write-Host "❌ Health endpoint: HTTP $($healthResponse.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Health endpoint: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "🎉 DESPLIEGUE COMPLETADO" -ForegroundColor Green
    Write-Host "========================" -ForegroundColor Green
    Write-Host "Aplicación disponible en: https://$appUrl" -ForegroundColor Cyan
    Write-Host "Recuerda verificar todos los endpoints funcionales" -ForegroundColor Yellow

} catch {
    Write-Host "❌ Error durante el despliegue: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}