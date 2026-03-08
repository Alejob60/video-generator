# Script de despliegue a producción
# Datos del entorno: Canada Central, Grupo de recursos: realculture-rg

Write-Host "Iniciando despliegue a produccion..." -ForegroundColor Green

# Variables de configuración
$resourceGroup = "realculture-rg"
$appServiceName = "video-converter"
$acrName = "realcultureacr"
$imageName = "video-generator"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$newImageTag = "$imageName-fixes-$timestamp"

Write-Host "Construyendo imagen: $newImageTag" -ForegroundColor Yellow

# Construir imagen Docker
docker build -t "$acrName.azurecr.io/$newImageTag" .

if ($LASTEXITCODE -eq 0) {
    Write-Host "Imagen construida exitosamente" -ForegroundColor Green
    
    # Autenticar con Azure Container Registry
    Write-Host "Autenticando con ACR..." -ForegroundColor Yellow
    az acr login --name $acrName
    
    # Push imagen al registro
    Write-Host "Subiendo imagen a ACR..." -ForegroundColor Yellow
    docker push "$acrName.azurecr.io/$newImageTag"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Imagen subida exitosamente" -ForegroundColor Green
        
        # Desplegar a App Service
        Write-Host "Desplegando a App Service..." -ForegroundColor Yellow
        az webapp config container set `
            --name $appServiceName `
            --resource-group $resourceGroup `
            --docker-custom-image-name "$acrName.azurecr.io/$newImageTag" `
            --docker-registry-server-url "https://$acrName.azurecr.io"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Despliegue completado!" -ForegroundColor Green
            Write-Host "Desplegado en: https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net" -ForegroundColor Cyan
            
            # Verificar estado
            Write-Host "Verificando estado..." -ForegroundColor Yellow
            Start-Sleep -Seconds 30
            $status = az webapp show --name $appServiceName --resource-group $resourceGroup --query "state" -o tsv
            Write-Host "Estado del servicio: $status" -ForegroundColor Green
        } else {
            Write-Host "Error en el despliegue" -ForegroundColor Red
        }
    } else {
        Write-Host "Error subiendo la imagen" -ForegroundColor Red
    }
} else {
    Write-Host "Error construyendo la imagen" -ForegroundColor Red
}