#!/usr/bin/env pwsh

# 🔑 OBTENER AZURE STORAGE CONNECTION STRING Y ACTUALIZAR VARIABLES

Write-Host "`n🔑 OBTENIENDO CONNECTION STRING DE AZURE STORAGE" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$resourceGroup = "realculture-rg"
$storageAccount = "realculturestorage"
$appName = "video-converter"

# Verificar Azure CLI
Write-Host "`n🔍 Verificando Azure CLI..." -ForegroundColor Yellow
try {
    $azVersion = az version 2>$null
    if (-not $azVersion) {
        throw "Azure CLI not found"
    }
    Write-Host "✅ Azure CLI encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI no está disponible" -ForegroundColor Red
    Write-Host "   Instalar desde: https://aka.ms/installazurecliwindows" -ForegroundColor Gray
    exit 1
}

# Login en Azure
Write-Host "`n🔐 Verificando Azure login..." -ForegroundColor Yellow
$account = az account show --query id -o tsv 2>$null
if (-not $account) {
    Write-Host "📝 Logging in to Azure..." -ForegroundColor Yellow
    az login --output none
} else {
    Write-Host "✅ Azure login confirmado" -ForegroundColor Green
}

# Obtener connection string
Write-Host "`n📥 Obteniendo Azure Storage Connection String..." -ForegroundColor Yellow
$connectionString = az storage account show-connection-string `
  --name $storageAccount `
  --resource-group $resourceGroup `
  --query connectionString `
  --output tsv 2>$null

if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrEmpty($connectionString)) {
    Write-Host "`n❌ ERROR: No se pudo obtener el connection string" -ForegroundColor Red
    Write-Host "   Verifica que:" -ForegroundColor Yellow
    Write-Host "   - El storage account '$storageAccount' existe" -ForegroundColor Gray
    Write-Host "   - Tienes permisos en el resource group '$resourceGroup'" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Connection String obtenido exitosamente" -ForegroundColor Green
Write-Host "   Connection String: $($connectionString.Substring(0, [Math]::Min(50, $connectionString.Length)))..." -ForegroundColor Gray

# Ejecutar script de actualización de variables
Write-Host "`n🚀 Ejecutando actualización de variables..." -ForegroundColor Cyan

# Importar el script con las variables
& "$PSScriptRoot\update-azure-env-vars.ps1" -ConnectionString $connectionString

Write-Host "`n✅ PROCESO COMPLETADO!" -ForegroundColor Green
