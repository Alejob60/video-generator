# 🚀 SCRIPT DE DESPLIEGUE A AZURE - VIDEO GENERATOR
# Este script despliega la imagen Docker a Azure App Service

# Configurar ruta completa de Azure CLI
$azPath = "C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"
if (-not (Test-Path $azPath)) {
    Write-Host "❌ Azure CLI no encontrado en la ruta predeterminada" -ForegroundColor Red
    Write-Host "Instalar desde: https://docs.microsoft.com/cli/azure/install-azure-cli-windows" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Azure CLI encontrado: $azPath" -ForegroundColor Green
Write-Host ""

# Función auxiliar para ejecutar comandos az
function Invoke-AzCommand {
    param([string]$Command)
    & $azPath cmd.exe /c "az $Command"
    return $LASTEXITCODE
}

Write-Host "🚀 Despliegue a Azure App Service" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# ======================================
# PASO 1: Login a Azure
# ======================================
Write-Host "`n📝 PASO 1: Login a Azure" -ForegroundColor Yellow
Write-Host "Ejecutando: az login --use-device-code" -ForegroundColor Gray

$result = & $azPath login --use-device-code 2>&1
Write-Host $result

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en login. Verifica que Azure CLI esté instalado." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Login exitoso" -ForegroundColor Green

# ======================================
# PASO 2: Seleccionar suscripción
# ======================================
Write-Host "`n💳 PASO 2: Seleccionar suscripción" -ForegroundColor Yellow

$subscriptionsJson = & $azPath account list --query "[].{id:id, name:name}" -o json 2>&1
$subscriptions = $subscriptionsJson | ConvertFrom-Json

if ($subscriptions.Count -eq 0) {
    Write-Host "❌ No se encontraron suscripciones" -ForegroundColor Red
    exit 1
}

Write-Host "`nSuscripciones disponibles:" -ForegroundColor Cyan
$subscriptions | ForEach-Object {
    Write-Host "  - $($_.name) ($($_.id))" -ForegroundColor Gray
}

# Usar la primera suscripción por defecto
$subscriptionId = $subscriptions[0].id
Write-Host "`nUsando suscripción: $($subscriptions[0].name)" -ForegroundColor Cyan
& $azPath account set --subscription $subscriptionId

# ======================================
# PASO 3: Crear Resource Group (si no existe)
# ======================================
Write-Host "`n📦 PASO 3: Verificar Resource Group" -ForegroundColor Yellow

$resourceGroup = "realculture-rg"
$location = "canadacentral"

$existsJson = & $azPath group exists --name $resourceGroup 2>&1
$exists = $existsJson -eq "true"

if (-not $exists) {
    Write-Host "Creando resource group '$resourceGroup' en '$location'..." -ForegroundColor Cyan
    & $azPath group create --name $resourceGroup --location $location
} else {
    Write-Host "✅ Resource group '$resourceGroup' ya existe" -ForegroundColor Green
}

# ======================================
# PASO 4: Crear App Service Plan (si no existe)
# ======================================
Write-Host "`n📋 PASO 4: Verificar App Service Plan" -ForegroundColor Yellow

$appServicePlan = "video-converter-plan"

$planExistsJson = & $azPath appservice plan show `
    --name $appServicePlan `
    --resource-group $resourceGroup `
    --query id `
    -o tsv 2>&1
$planExists = $planExistsJson

if ([string]::IsNullOrWhiteSpace($planExists)) {
    Write-Host "Creando App Service Plan '$appServicePlan'..." -ForegroundColor Cyan
    & $azPath appservice plan create `
        --name $appServicePlan `
        --resource-group $resourceGroup `
        --sku B3 `
        --is-linux
} else {
    Write-Host "✅ App Service Plan '$appServicePlan' ya existe" -ForegroundColor Green
}

# ======================================
# PASO 5: Construir imagen Docker localmente
# ======================================
Write-Host "`n🐳 PASO 5: Construir imagen Docker" -ForegroundColor Yellow

$imageName = "video-converter"
$tag = "latest"

Write-Host "Construyendo imagen: $imageName:$tag" -ForegroundColor Cyan
docker build -t "$imageName:$tag" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error construyendo imagen Docker" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Imagen construida exitosamente" -ForegroundColor Green

# ======================================
# PASO 6: Crear Azure Container Registry (ACR)
# ======================================
Write-Host "`n🗄️ PASO 6: Verificar Azure Container Registry" -ForegroundColor Yellow

$acrName = "realcultureregistry"

$acrExistsJson = & $azPath acr show `
    --name $acrName `
    --resource-group $resourceGroup `
    --query id `
    -o tsv 2>&1
$acrExists = $acrExistsJson

if ([string]::IsNullOrWhiteSpace($acrExists)) {
    Write-Host "Creando Azure Container Registry '$acrName'..." -ForegroundColor Cyan
    & $azPath acr create `
        --resource-group $resourceGroup `
        --name $acrName `
        --sku Basic `
        --admin-enabled true
} else {
    Write-Host "✅ ACR '$acrName' ya existe" -ForegroundColor Green
}

# ======================================
# PASO 7: Login a ACR
# ======================================
Write-Host "`n🔐 PASO 7: Login a Azure Container Registry" -ForegroundColor Yellow

& $azPath acr login --name $acrName

# ======================================
# PASO 8: Taggear imagen para ACR
# ======================================
Write-Host "`n🏷️ PASO 8: Taggear imagen para ACR" -ForegroundColor Yellow

$loginServer = & $azPath acr show --name $acrName --query loginServer -o tsv 2>&1
$fullImageName = "$loginServer/$imageName:$tag"

Write-Host "Taggeando imagen: $fullImageName" -ForegroundColor Cyan
docker tag "$imageName:$tag" $fullImageName

# ======================================
# PASO 9: Push a ACR
# ======================================
Write-Host "`n⬆️ PASO 9: Push de imagen a ACR" -ForegroundColor Yellow

Write-Host "Subiendo imagen a ACR..." -ForegroundColor Cyan
docker push $fullImageName

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error subiendo imagen a ACR" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Imagen subida exitosamente" -ForegroundColor Green

# ======================================
# PASO 10: Crear Web App (si no existe)
# ======================================
Write-Host "`n🌐 PASO 10: Verificar Web App" -ForegroundColor Yellow

$webAppName = "video-converter"

$webAppExistsJson = & $azPath webapp show `
    --name $webAppName `
    --resource-group $resourceGroup `
    --query id `
    -o tsv 2>&1
$webAppExists = $webAppExistsJson

if ([string]::IsNullOrWhiteSpace($webAppExists)) {
    Write-Host "Creando Web App '$webAppName'..." -ForegroundColor Cyan
    & $azPath webapp create `
        --name $webAppName `
        --resource-group $resourceGroup `
        --plan $appServicePlan `
        --deployment-container-image-name "$fullImageName"
} else {
    Write-Host "✅ Web App '$webAppName' ya existe" -ForegroundColor Green
    Write-Host "Actualizando configuración de imagen..." -ForegroundColor Cyan
    & $azPath webapp config container set `
        --name $webAppName `
        --resource-group $resourceGroup `
        --docker-custom-image-name $fullImageName
}

# ======================================
# PASO 11: Configurar variables de entorno
# ======================================
Write-Host "`n⚙️ PASO 11: Configurar variables de entorno" -ForegroundColor Yellow

Write-Host "Configurando app settings..." -ForegroundColor Cyan

& $azPath webapp config appsettings set `
    --resource-group $resourceGroup `
    --name $webAppName `
    --settings `
        MAIN_BACKEND_URL="https://tu-backend-principal.com" `
        NODE_ENV="production" `
        PORT="8080"

Write-Host "✅ Variables configuradas" -ForegroundColor Green

# ======================================
# PASO 12: Habilitar logs
# ======================================
Write-Host "`n📊 PASO 12: Habilitar logs" -ForegroundColor Yellow

& $azPath webapp log config `
    --name $webAppName `
    --resource-group $resourceGroup `
    --docker-container-logging filesystem

& $azPath monitor diagnostic-settings create `
    --name "video-converter-logs" `
    --resource "/subscriptions/$subscriptionId/resourceGroups/$resourceGroup/providers/Microsoft.Web/sites/$webAppName" `
    --logs '[{"category": "AppServiceConsoleLogs", "enabled": true}]' `
    --workspace-id null

Write-Host "✅ Logs habilitados" -ForegroundColor Green

# ======================================
# PASO 13: Reiniciar Web App
# ======================================
Write-Host "`n🔄 PASO 13: Reiniciar Web App" -ForegroundColor Yellow

& $azPath webapp restart `
    --name $webAppName `
    --resource-group $resourceGroup

Write-Host "✅ Web App reiniciada" -ForegroundColor Green

# ======================================
# RESUMEN FINAL
# ======================================
Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan

$webAppUrl = "https://$webAppName.azurewebsites.net"

Write-Host "`n🌐 URL de tu aplicación:" -ForegroundColor Yellow
Write-Host $webAppUrl -ForegroundColor Cyan

Write-Host "`n📊 Ver logs en tiempo real:" -ForegroundColor Yellow
Write-Host "  az webapp log tail --name $webAppName --resource-group $resourceGroup" -ForegroundColor Gray

Write-Host "`n🔍 Ver detalles de la Web App:" -ForegroundColor Yellow
Write-Host "  az webapp show --name $webAppName --resource-group $resourceGroup" -ForegroundColor Gray

Write-Host "`n📦 Ver contenedores en ACR:" -ForegroundColor Yellow
Write-Host "  az acr repository show-tags --name $acrName --repository $imageName" -ForegroundColor Gray

Write-Host "`n⚠️ Para eliminar todos los recursos:" -ForegroundColor Red
Write-Host "  az group delete --name $resourceGroup --yes --no-wait" -ForegroundColor Gray

Write-Host ""
