#!/usr/bin/env pwsh

# 🚀 BUILD DOCKER Y DEPLOY A AZURE CONTAINER REGISTRY

Write-Host "`n🐳 DOCKER BUILD & AZURE DEPLOY" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Configuración
$resourceGroup = "realculture-rg"
$location = "canadacentral"
$acrName = "realcultureacr"
$appName = "video-converter"
$imageTag = "latest"

# Verificar Docker
Write-Host "`n🔍 Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado. Instalar desde: https://docs.docker.com/desktop/" -ForegroundColor Red
    exit 1
}

# Login en Azure (si Az module está disponible)
Write-Host "`n🔐 Verificando Azure login..." -ForegroundColor Yellow
try {
    $azAccount = az account show --query id -o tsv 2>$null
    if (-not $azAccount) {
        Write-Host "📝 Logging in to Azure..." -ForegroundColor Yellow
        az login --output none
    } else {
        Write-Host "✅ Azure login confirmado" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Azure CLI no disponible. Solo haré build de la imagen Docker." -ForegroundColor Yellow
    $azureCliAvailable = $false
}

if ($azAccount) {
    $azureCliAvailable = $true
    
    # Crear Resource Group si no existe
    Write-Host "`n📁 Verificando Resource Group..." -ForegroundColor Yellow
    az group create --name $resourceGroup --location $location --output none
    
    # Crear Azure Container Registry si no existe
    Write-Host "📦 Verificando Container Registry..." -ForegroundColor Yellow
    $acrExists = az acr show --name $acrName --resource-group $resourceGroup --query id -o tsv 2>$null
    if (-not $acrExists) {
        Write-Host "🆕 Creando Container Registry '$acrName'..." -ForegroundColor Yellow
        az acr create `
          --resource-group $resourceGroup `
          --name $acrName `
          --sku Basic `
          --admin-enabled true `
          --output none
        
        Write-Host "✅ Container Registry creado" -ForegroundColor Green
    } else {
        Write-Host "✅ Container Registry ya existe" -ForegroundColor Green
    }
    
    # Login en ACR
    Write-Host "`n🔑 Logueando en Container Registry..." -ForegroundColor Yellow
    az acr login --name $acrName --output none
    Write-Host "✅ Login en ACR completado" -ForegroundColor Green
}

# Build de la imagen Docker
Write-Host "`n🏗️ Construyendo imagen Docker..." -ForegroundColor Cyan
$imageName = "$($acrName).azurecr.io/$($appName):$imageTag"

docker build -t $imageName .

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Imagen Docker construida exitosamente!" -ForegroundColor Green
    Write-Host "   Image: $imageName" -ForegroundColor Gray
} else {
    Write-Host "`n❌ Error construyendo la imagen Docker" -ForegroundColor Red
    exit 1
}

# Push a ACR (si Azure CLI está disponible)
if ($azureCliAvailable) {
    Write-Host "`n📤 Subiendo imagen a Azure Container Registry..." -ForegroundColor Cyan
    docker push $imageName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Imagen subida a ACR exitosamente!" -ForegroundColor Green
        Write-Host "   Repository: $imageName" -ForegroundColor Gray
    } else {
        Write-Host "`n❌ Error subiendo imagen a ACR" -ForegroundColor Red
        exit 1
    }
    
    # Configurar App Service para usar la imagen
    Write-Host "`n⚙️ Configurando App Service..." -ForegroundColor Yellow
    
    # Actualizar App Service para usar la imagen del ACR
    az webapp config container set `
      --name $appName `
      --resource-group $resourceGroup `
      --docker-custom-image-name $imageName `
      --docker-registry-server-url https://$acrName.azurecr.io `
      --output none
    
    Write-Host "✅ App Service configurado con la imagen" -ForegroundColor Green
    
    # Reiniciar App Service
    Write-Host "`n🔄 Reiniciando App Service..." -ForegroundColor Yellow
    az webapp restart `
      --name $appName `
      --resource-group $resourceGroup `
      --output none
    
    Write-Host "✅ App Service reiniciado" -ForegroundColor Green
    
    # Mostrar información
    Write-Host "`n🎉 DEPLOY COMPLETADO!" -ForegroundColor Green
    Write-Host "`n📊 Información:" -ForegroundColor Cyan
    Write-Host "   Image: $imageName" -ForegroundColor Gray
    Write-Host "   App URL: https://$appName.azurewebsites.net" -ForegroundColor Gray
    Write-Host "   ACR: https://portal.azure.com/#@/resource/subscriptions/a466ea69-1312-4361-95e1-f1c8524bea91/resourceGroups/$resourceGroup/providers/Microsoft.ContainerRegistry/registries/$acrName" -ForegroundColor Gray
    
    Write-Host "`n⏳ Esperar 3-5 minutos para que los cambios surtan efecto" -ForegroundColor Yellow
    
    Write-Host "`n🧪 Comandos para testear:" -ForegroundColor Cyan
    Write-Host "   curl https://$appName.azurewebsites.net/health" -ForegroundColor Gray
    Write-Host "   curl -X POST 'https://$appName.azurewebsites.net/media/image' -H 'Content-Type: application/json' -d '{`"prompt`":`"test`",`"plan`":`"FREE`"}'" -ForegroundColor Gray
    
} else {
    Write-Host "`n⚠️ Azure CLI no disponible - Solo build local completado" -ForegroundColor Yellow
    Write-Host "`n📝 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "   1. Instalar Azure CLI: https://aka.ms/installazurecliwindows" -ForegroundColor Gray
    Write-Host "   2. Ejecutar:" -ForegroundColor Gray
    Write-Host "      az login" -ForegroundColor Gray
    Write-Host "      az acr login --name $acrName" -ForegroundColor Gray
    Write-Host "      docker push $imageName" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Configurar App Service:" -ForegroundColor Gray
    Write-Host "      az webapp config container set --name $appName --resource-group $resourceGroup --docker-custom-image-name $imageName" -ForegroundColor Gray
    Write-Host "      az webapp restart --name $appName --resource-group $resourceGroup" -ForegroundColor Gray
}

Write-Host "`n✅ PROCESO COMPLETADO!" -ForegroundColor Green
