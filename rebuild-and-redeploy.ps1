# Script para reconstruir y redesplegar la aplicación en Azure
Write-Host "🚀 Reconstruyendo y redesplegando aplicación en Azure..." -ForegroundColor Green

# Variables de Azure (basadas en la información proporcionada)
$resourceGroup = "realculture-rg"
$appName = "video-converter"
$acrName = "realcultureacr"
$imageName = "video-generator"
$tag = "latest"

Write-Host "`n🔧 Paso 1: Construyendo la aplicación..." -ForegroundColor Yellow

# Limpiar y reconstruir la aplicación
Write-Host "🗑️  Limpiando builds anteriores..." -ForegroundColor Cyan
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

Write-Host "🏗️  Compilando aplicación..." -ForegroundColor Cyan
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error durante la compilación." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Compilación completada exitosamente." -ForegroundColor Green
} catch {
    Write-Host "❌ Error durante la compilación: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n🐳 Paso 2: Construyendo imagen Docker..." -ForegroundColor Yellow

# Construir imagen Docker
Write-Host "🏗️  Construyendo imagen Docker..." -ForegroundColor Cyan
try {
    docker build -t "$imageName:$tag" .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error durante la construcción de la imagen Docker." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Imagen Docker construida exitosamente." -ForegroundColor Green
} catch {
    Write-Host "❌ Error durante la construcción de la imagen Docker: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n☁️  Paso 3: Subiendo imagen a Azure Container Registry..." -ForegroundColor Yellow

# Etiquetar la imagen para Azure Container Registry
$acrImage = "$acrName.azurecr.io/$imageName:$tag"
Write-Host "🏷️  Etiquetando imagen para ACR: $acrImage" -ForegroundColor Cyan
try {
    docker tag "$imageName:$tag" $acrImage
    Write-Host "✅ Imagen etiquetada correctamente." -ForegroundColor Green
} catch {
    Write-Host "❌ Error al etiquetar la imagen: $_" -ForegroundColor Red
    exit 1
}

# Iniciar sesión en Azure Container Registry (si es necesario)
try {
    Write-Host "🔐 Iniciando sesión en Azure Container Registry..." -ForegroundColor Cyan
    az acr login --name $acrName
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al iniciar sesión en ACR." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Sesión iniciada en Azure Container Registry." -ForegroundColor Green
} catch {
    Write-Host "❌ Error al iniciar sesión en ACR: $_" -ForegroundColor Red
    exit 1
}

# Subir imagen a Azure Container Registry
try {
    Write-Host "🚀 Subiendo imagen a ACR..." -ForegroundColor Cyan
    docker push $acrImage
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al subir la imagen a ACR." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Imagen subida exitosamente a Azure Container Registry." -ForegroundColor Green
} catch {
    Write-Host "❌ Error al subir la imagen a ACR: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔄 Paso 4: Reiniciando aplicación en Azure..." -ForegroundColor Yellow

# Reiniciar la aplicación web para que use la nueva imagen
try {
    Write-Host "🔄 Reiniciando aplicación web: $appName" -ForegroundColor Cyan
    az webapp restart --name $appName --resource-group $resourceGroup
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al reiniciar la aplicación web." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Aplicación web reiniciada correctamente." -ForegroundColor Green
} catch {
    Write-Host "❌ Error al reiniciar la aplicación web: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Paso 5: Verificando estado..." -ForegroundColor Yellow

# Verificar el estado de la aplicación
try {
    Write-Host "🔍 Verificando estado de la aplicación..." -ForegroundColor Cyan
    $status = az webapp show --name $appName --resource-group $resourceGroup --query "state" -o tsv
    Write-Host "📊 Estado de la aplicación: $status" -ForegroundColor Green
    
    if ($status -eq "Running") {
        Write-Host "✅ ¡La aplicación está en ejecución!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  La aplicación no está en ejecución. Estado: $status" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error al verificar el estado de la aplicación: $_" -ForegroundColor Red
}

Write-Host "`n🌐 Información de despliegue:" -ForegroundColor Yellow
Write-Host "   Aplicación: $appName" -ForegroundColor White
Write-Host "   Grupo de recursos: $resourceGroup" -ForegroundColor White
Write-Host "   Imagen: $acrImage" -ForegroundColor White
Write-Host "   URL: https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net" -ForegroundColor White

Write-Host "`n🎉 ¡Reconstrucción y despliegue completados exitosamente!" -ForegroundColor Green
Write-Host "   La aplicación debería estar disponible en breve en:" -ForegroundColor Cyan
Write-Host "   https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net" -ForegroundColor White