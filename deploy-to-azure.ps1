# Script para construir y desplegar la aplicación a Azure
Write-Host "🚀 Iniciando proceso de construcción y despliegue a Azure..." -ForegroundColor Green

# Verificar que estamos en el directorio correcto
$projectName = "video-generator"
Write-Host "📂 Verificando directorio del proyecto: $projectName" -ForegroundColor Cyan

if (-not (Test-Path "package.json")) {
    Write-Host "❌ No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Verificar que el archivo .env existe
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No se encontró el archivo .env. Se recomienda crearlo antes de desplegar." -ForegroundColor Yellow
    $confirmation = Read-Host "¿Deseas continuar sin el archivo .env? (s/n)"
    if ($confirmation -ne "s") {
        Write-Host "👋 Cancelando despliegue." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "`n🔧 Construyendo la aplicación..." -ForegroundColor Yellow

# Limpiar builds anteriores
Write-Host "🗑️  Limpiando builds anteriores..." -ForegroundColor Cyan
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

# Construir la aplicación
Write-Host "🏗️  Ejecutando compilación..." -ForegroundColor Cyan
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

Write-Host "`n🐳 Construyendo imagen Docker..." -ForegroundColor Yellow

# Construir imagen Docker
$imageName = "video-generator"
$acrName = "realcultureacr"
$tag = "latest"

Write-Host "🏗️  Construyendo imagen Docker: $imageName:$tag" -ForegroundColor Cyan
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

Write-Host "`n☁️  Preparando despliegue a Azure..." -ForegroundColor Yellow

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

Write-Host "`n🔒 Iniciando sesión en Azure Container Registry..." -ForegroundColor Yellow

# Iniciar sesión en Azure (si es necesario)
try {
    Write-Host "🔐 Iniciando sesión en Azure..." -ForegroundColor Cyan
    az login --use-device-code
    Write-Host "✅ Sesión iniciada en Azure." -ForegroundColor Green
} catch {
    Write-Host "ℹ️  Ya estás conectado a Azure o ocurrió un error: $_" -ForegroundColor Yellow
}

# Iniciar sesión en Azure Container Registry
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

Write-Host "`n📤 Subiendo imagen a Azure Container Registry..." -ForegroundColor Yellow

# Subir imagen a Azure Container Registry
try {
    Write-Host "🚀 Subiendo imagen $acrImage..." -ForegroundColor Cyan
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

Write-Host "`n🔄 Reiniciando aplicación web en Azure..." -ForegroundColor Yellow

# Reiniciar la aplicación web para que use la nueva imagen
$appName = "video-converter"
$resourceGroup = "realculture-rg"

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

Write-Host "`n📋 Verificando estado del despliegue..." -ForegroundColor Yellow

# Verificar el estado de la aplicación
try {
    Write-Host "🔍 Verificando estado de la aplicación..." -ForegroundColor Cyan
    $status = az webapp show --name $appName --resource-group $resourceGroup --query "state" -o tsv
    Write-Host "📊 Estado de la aplicación: $status" -ForegroundColor Green
    
    if ($status -eq "Running") {
        Write-Host "✅ La aplicación está en ejecución." -ForegroundColor Green
    } else {
        Write-Host "⚠️  La aplicación no está en ejecución. Estado: $status" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error al verificar el estado de la aplicación: $_" -ForegroundColor Red
}

Write-Host "`n🌐 Información de la aplicación:" -ForegroundColor Yellow
Write-Host "   Nombre: $appName" -ForegroundColor White
Write-Host "   Grupo de recursos: $resourceGroup" -ForegroundColor White
Write-Host "   Imagen: $acrImage" -ForegroundColor White
Write-Host "   Dominio: video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net" -ForegroundColor White

Write-Host "`n🎉 ¡Despliegue completado exitosamente!" -ForegroundColor Green
Write-Host "   La aplicación debería estar disponible en:" -ForegroundColor Cyan
Write-Host "   https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net" -ForegroundColor White

Write-Host "`n📝 Siguientes pasos:" -ForegroundColor Yellow
Write-Host "   1. Verifica que la aplicación esté funcionando correctamente" -ForegroundColor White
Write-Host "   2. Revisa los logs si encuentras problemas" -ForegroundColor White
Write-Host "   3. Monitorea el rendimiento de la aplicación" -ForegroundColor White