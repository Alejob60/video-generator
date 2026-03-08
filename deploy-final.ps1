# Script para desplegar la aplicacion en Azure
Write-Host "Iniciando despliegue en Azure..." -ForegroundColor Green

# Variables
$resourceGroup = "realculture-rg"
$appName = "video-converter"
$acrName = "realcultureacr"
$imageName = "video-generator"
$tag = "latest"

Write-Host "Construyendo la aplicacion..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error durante la compilacion." -ForegroundColor Red
    exit 1
}
Write-Host "Compilacion completada." -ForegroundColor Green

Write-Host "Construyendo imagen Docker..." -ForegroundColor Yellow
docker build -t "${imageName}:${tag}" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error construyendo imagen Docker." -ForegroundColor Red
    exit 1
}
Write-Host "Imagen Docker construida." -ForegroundColor Green

Write-Host "Etiquetando imagen para ACR..." -ForegroundColor Yellow
$acrImage = "${acrName}.azurecr.io/${imageName}:${tag}"
docker tag "${imageName}:${tag}" $acrImage
Write-Host "Imagen etiquetada." -ForegroundColor Green

Write-Host "Iniciando sesion en Azure Container Registry..." -ForegroundColor Yellow
az acr login --name $acrName
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error iniciando sesion en ACR." -ForegroundColor Red
    exit 1
}
Write-Host "Sesion iniciada en ACR." -ForegroundColor Green

Write-Host "Subiendo imagen a Azure Container Registry..." -ForegroundColor Yellow
docker push $acrImage
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error subiendo imagen a ACR." -ForegroundColor Red
    exit 1
}
Write-Host "Imagen subida a ACR." -ForegroundColor Green

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