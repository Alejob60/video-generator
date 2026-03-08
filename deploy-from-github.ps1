# Script para desplegar la aplicacion desde GitHub a Azure
Write-Host "Iniciando despliegue desde GitHub a Azure..." -ForegroundColor Green

# Variables
$resourceGroup = "realculture-rg"
$appName = "video-converter"

Write-Host "Verificando estado de la aplicacion..." -ForegroundColor Yellow
$status = az webapp show --name $appName --resource-group $resourceGroup --query "state" -o tsv
Write-Host "Estado actual de la aplicacion: $status" -ForegroundColor Green

Write-Host "Activando despliegue desde GitHub..." -ForegroundColor Yellow
# Esto activara un despliegue desde el repositorio GitHub conectado
az webapp deployment source sync --name $appName --resource-group $resourceGroup
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error activando despliegue desde GitHub." -ForegroundColor Red
    exit 1
}
Write-Host "Despliegue desde GitHub activado." -ForegroundColor Green

Write-Host "Reiniciando aplicacion web..." -ForegroundColor Yellow
az webapp restart --name $appName --resource-group $resourceGroup
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error reiniciando aplicacion web." -ForegroundColor Red
    exit 1
}
Write-Host "Aplicacion web reiniciada." -ForegroundColor Green

Write-Host "Verificando estado de la aplicacion..." -ForegroundColor Yellow
$status = az webapp show --name $appName --resource-group $resourceGroup --query "state" -o tsv
Write-Host "Estado de la aplicacion: $status" -ForegroundColor Green

Write-Host "Despliegue completado!" -ForegroundColor Green
Write-Host "Aplicacion disponible en: https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net" -ForegroundColor Cyan