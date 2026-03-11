#!/usr/bin/env pwsh

# 🚀 BUILD & DEPLOY AUTOMÁTICO A AZURE

Write-Host "`n🚀 INICIANDO BUILD & DEPLOY A AZURE" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Configuración
$acrName = "realcultureacr"
$appName = "video-converter"
$resourceGroup = "realculture-rg"
$imageTag = "latest"

# Paso 1: Build de la imagen Docker
Write-Host "`n📦 PASO 1: Creando imagen Docker..." -ForegroundColor Yellow
$imageName = "$($acrName).azurecr.io/$($appName):$imageTag"

docker build -t $imageName .

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ ERROR: Build de Docker falló" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Imagen Docker creada: $imageName" -ForegroundColor Green

# Paso 2: Login en Azure CLI
Write-Host "`n🔐 PASO 2: Verificando Azure login..." -ForegroundColor Yellow
try {
    $account = az account show --query id -o tsv 2>$null
    if (-not $account) {
        Write-Host "📝 Logging in to Azure..." -ForegroundColor Yellow
        az login --output none
    } else {
        Write-Host "✅ Azure login confirmado" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Azure CLI no está disponible" -ForegroundColor Red
    Write-Host "   Instalar desde: https://aka.ms/installazurecliwindows" -ForegroundColor Gray
    exit 1
}

# Paso 3: Login en ACR
Write-Host "`n🔑 PASO 3: Logueando en Azure Container Registry..." -ForegroundColor Yellow
az acr login --name $acrName

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: No se pudo hacer login en ACR" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Login en ACR exitoso" -ForegroundColor Green

# Paso 4: Push a ACR
Write-Host "`n📤 PASO 4: Subiendo imagen a ACR..." -ForegroundColor Yellow
docker push $imageName

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Push a ACR falló" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Imagen subida a ACR: $imageName" -ForegroundColor Green

# Paso 5: Configurar App Service
Write-Host "`n⚙️  PASO 5: Configurando App Service..." -ForegroundColor Yellow
az webapp config container set `
  --name $appName `
  --resource-group $resourceGroup `
  --docker-custom-image-name $imageName `
  --docker-registry-server-url https://$acrName.azurecr.io

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Configuración de App Service falló" -ForegroundColor Red
    exit 1
}

Write-Host "✅ App Service configurado" -ForegroundColor Green

# Paso 6: Reiniciar App Service
Write-Host "`n🔄 PASO 6: Reiniciando App Service..." -ForegroundColor Yellow
az webapp restart `
  --name $appName `
  --resource-group $resourceGroup

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Error reiniciando App Service (pero ya está desplegado)" -ForegroundColor Yellow
} else {
    Write-Host "✅ App Service reiniciado" -ForegroundColor Green
}

# Resumen final
Write-Host "`n📊 RESUMEN DEL DEPLOY:" -ForegroundColor Cyan
Write-Host "   Resource Group: $resourceGroup" -ForegroundColor Gray
Write-Host "   App Service: $appName" -ForegroundColor Gray
Write-Host "   ACR: $acrName" -ForegroundColor Gray
Write-Host "   Imagen: $imageName" -ForegroundColor Gray
Write-Host "   URL: https://$appName.azurewebsites.net" -ForegroundColor Gray

Write-Host "`n⏳ Esperar 2-3 minutos para que los cambios surtan efecto" -ForegroundColor Yellow

Write-Host "`n🧪 Comandos para verificar:" -ForegroundColor Cyan
Write-Host "   curl https://$appName.azurewebsites.net/health" -ForegroundColor Gray
Write-Host "   curl -X POST 'https://$appName.azurewebsites.net/media/flux-kontext/image' -d '{`"prompt`":`"test`",`"plan`":`"PRO`",`"enhancePrompt`":true}'" -ForegroundColor Gray

Write-Host "`n✅ DEPLOY COMPLETADO EXITOSAMENTE!" -ForegroundColor Green
