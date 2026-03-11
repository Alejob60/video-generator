#!/usr/bin/env pwsh

# ⚙️ ACTUALIZAR VARIABLES DE ENTORNO EN AZURE APP SERVICE

param(
    [Parameter(Mandatory=$false)]
    [string]$ConnectionString = ""
)

Write-Host "`n⚙️ ACTUALIZANDO VARIABLES DE ENTORNO EN AZURE" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Configuración
$resourceGroup = "realculture-rg"
$appName = "video-converter"

# Variables de Entorno Actualizadas
$settings = @{
    # Azure Storage (OBLIGATORIO)
    "AZURE_STORAGE_CONNECTION_STRING" = if ($ConnectionString) { $ConnectionString } else { "" }
    "AZURE_STORAGE_CONTAINER_NAME" = "images"
    "AZURE_STORAGE_ACCOUNT_NAME" = "realculturestorage"
    
    # FLUX Kontext Pro (PRINCIPAL - con fallback a DALL-E si falla)
    "FLUX_KONTEXT_PRO_BASE_URL" = "https://labsc-m9j5kbl9-eastus2.services.ai.azure.com"
    "FLUX_KONTEXT_PRO_DEPLOYMENT" = "FLUX.1-Kontext-pro"
    "FLUX_KONTEXT_PRO_API_VERSION" = "2025-04-01-preview"
    "FLUX_KONTEXT_PRO_API_KEY" = "7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"
    
    # DALL-E 3 (FALLBACK para FLUX - OBLIGATORIO para resiliencia)
    "AZURE_OPENAI_IMAGE_ENDPOINT" = "https://api.openai.com/v1"
    "AZURE_OPENAI_IMAGE_API_KEY" = ""  # ← COMPLETAR CON TU API KEY DE OPENAI
    
    # Backend y Configuración
    "MAIN_BACKEND_URL" = "http://localhost:3000"
    "NODE_ENV" = "production"
    "PORT" = "8080"
}

Write-Host "`n📝 Configuración a aplicar:" -ForegroundColor Yellow
foreach ($key in $settings.Keys) {
    $value = $settings[$key]
    if ($value -eq "") {
        Write-Host "   ⚠️  $key = [VACÍO - REQUIERE VALOR]" -ForegroundColor Red
    } else {
        Write-Host "   ✅ $key = $value" -ForegroundColor Gray
    }
}

# Verificar si hay valores vacíos críticos
if ($settings["AZURE_STORAGE_CONNECTION_STRING"] -eq "") {
    Write-Host "`n❌ ERROR: AZURE_STORAGE_CONNECTION_STRING está vacía" -ForegroundColor Red
    Write-Host "   Para obtener el connection string:" -ForegroundColor Yellow
    Write-Host "   az storage account show-connection-string --name realculturestorage --resource-group $resourceGroup --query connectionString --output tsv" -ForegroundColor Gray
    exit 1
}

if ($settings["AZURE_OPENAI_IMAGE_API_KEY"] -eq "") {
    Write-Host "`n⚠️  WARNING: AZURE_OPENAI_IMAGE_API_KEY está vacía" -ForegroundColor Yellow
    Write-Host "   El fallback de FLUX a DALL-E NO funcionará sin esta clave" -ForegroundColor Red
    Write-Host "   ¿Continuar de todas formas? (s/n): " -NoNewline -ForegroundColor Yellow
    $continue = Read-Host
    if ($continue -ne "s" -and $continue -ne "S") {
        Write-Host "Operación cancelada." -ForegroundColor Yellow
        exit 0
    }
}

# Login en Azure si es necesario
Write-Host "`n🔐 Verificando Azure login..." -ForegroundColor Yellow
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

# Aplicar configuración
Write-Host "`n📤 Aplicando configuración a App Service..." -ForegroundColor Cyan

# Construir comando de settings
$settingsArgs = @()
foreach ($key in $settings.Keys) {
    $value = $settings[$key]
    if ($value -ne "") {
        $settingsArgs += "$key=`"$value`""
    }
}

# Ejecutar comando az
Write-Host "🔄 Ejecutando: az webapp config appsettings set" -ForegroundColor Gray

az webapp config appsettings set `
  --resource-group $resourceGroup `
  --name $appName `
  --settings $settingsArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Variables de entorno actualizadas exitosamente!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Error actualizando variables de entorno" -ForegroundColor Red
    exit 1
}

# Reiniciar App Service
Write-Host "`n🔄 Reiniciando App Service para aplicar cambios..." -ForegroundColor Yellow
az webapp restart `
  --name $appName `
  --resource-group $resourceGroup `
  --output none

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ App Service reiniciado" -ForegroundColor Green
} else {
    Write-Host "⚠️  Error reiniciando App Service (pero las variables ya se aplicaron)" -ForegroundColor Yellow
}

# Mostrar resumen
Write-Host "`n📊 RESUMEN:" -ForegroundColor Cyan
Write-Host "   Resource Group: $resourceGroup" -ForegroundColor Gray
Write-Host "   App Service: $appName" -ForegroundColor Gray
Write-Host "   Variables configuradas: $($settings.Count)" -ForegroundColor Gray
Write-Host "   URL: https://$appName.azurewebsites.net" -ForegroundColor Gray

Write-Host "`n⏳ Esperar 2-3 minutos para que los cambios surtan efecto" -ForegroundColor Yellow

Write-Host "`n🧪 Comandos para verificar:" -ForegroundColor Cyan
Write-Host "   curl https://$appName.azurewebsites.net/health" -ForegroundColor Gray
Write-Host "   curl -X POST 'https://$appName.azurewebsites.net/media/image' -d '{`"prompt`":`"test`",`"plan`":`"FREE`"}'" -ForegroundColor Gray

Write-Host "`n✅ PROCESO COMPLETADO!" -ForegroundColor Green
