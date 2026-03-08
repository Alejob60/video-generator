# Script para compilar e iniciar la aplicación con el nuevo servicio FLUX.1-Kontext-pro

Write-Host "Compilando e iniciando la aplicación con FLUX.1-Kontext-pro..." -ForegroundColor Green

# Limpiar compilación anterior
Write-Host "`n1. Limpiando compilación anterior..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Directorio 'dist' eliminado" -ForegroundColor Green
}

# Instalar dependencias
Write-Host "`n2. Instalando dependencias..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}

# Compilar la aplicación
Write-Host "`n3. Compilando la aplicación..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Aplicación compilada correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al compilar la aplicación" -ForegroundColor Red
    exit 1
}

# Verificar que los archivos del nuevo servicio existen
Write-Host "`n4. Verificando archivos del nuevo servicio..." -ForegroundColor Yellow
$requiredFiles = @(
    "dist/infrastructure/services/flux-kontext-image.service.js",
    "dist/infrastructure/modules/flux-kontext-image.module.js",
    "dist/interfaces/controllers/flux-kontext-image.controller.js",
    "dist/interfaces/dto/generate-flux-kontext-image.dto.js"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "❌ Algunos archivos del nuevo servicio no fueron compilados correctamente" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Todos los archivos del nuevo servicio están presentes" -ForegroundColor Green

# Iniciar la aplicación
Write-Host "`n5. Iniciando la aplicación..." -ForegroundColor Yellow
Write-Host "La aplicación se iniciará en el puerto 3000. Presione CTRL+C para detener." -ForegroundColor Cyan
Write-Host "Puede probar el nuevo endpoint en: http://localhost:3000/media/flux-kontext-image" -ForegroundColor Cyan

npm run start:dev

Write-Host "`n✅ Script completado!" -ForegroundColor Green