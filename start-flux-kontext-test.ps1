# Script para compilar e iniciar la aplicación con los cambios de FLUX.1-Kontext-pro
Write-Host "🚀 Iniciando aplicación con soporte para FLUX.1-Kontext-pro..." -ForegroundColor Green

# Compilar la aplicación
Write-Host "🏗️  Compilando la aplicación..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilación exitosa!" -ForegroundColor Green
    
    # Iniciar la aplicación
    Write-Host "🏃 Iniciando la aplicación..." -ForegroundColor Yellow
    npm run start
} else {
    Write-Host "❌ Error en la compilación. Por favor revise los errores." -ForegroundColor Red
}