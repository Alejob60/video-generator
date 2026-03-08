# Script para verificar las variables de entorno de FLUX.1-Kontext-pro
Write-Host "🔍 Verificando variables de entorno para FLUX.1-Kontext-pro..." -ForegroundColor Green

# Verificar si el archivo .env existe
if (Test-Path ".env") {
    Write-Host "📁 Archivo .env encontrado" -ForegroundColor Cyan
    
    # Leer el archivo .env
    $envContent = Get-Content ".env"
    
    # Buscar las variables específicas
    $endpoint = $envContent -match "ENDPOINT_FLUX_KONTENT_PRO=" | ForEach-Object { ($_ -split "=", 2)[1] }
    $apiKey = $envContent -match "ENDPOINT_FLUX_KONTENT_PRO_API_KEY=" | ForEach-Object { ($_ -split "=", 2)[1] }
    
    Write-Host "`n🧪 Variables de entorno FLUX.1-Kontext-pro:" -ForegroundColor Yellow
    if ($endpoint) {
        Write-Host "   ENDPOINT_FLUX_KONTENT_PRO: $endpoint" -ForegroundColor Green
    } else {
        Write-Host "   ENDPOINT_FLUX_KONTENT_PRO: ❌ NO CONFIGURADO" -ForegroundColor Red
    }
    
    if ($apiKey) {
        Write-Host "   ENDPOINT_FLUX_KONTENT_PRO_API_KEY: ✅ CONFIGURADO" -ForegroundColor Green
    } else {
        Write-Host "   ENDPOINT_FLUX_KONTENT_PRO_API_KEY: ❌ NO CONFIGURADO" -ForegroundColor Red
    }
    
    # Verificar si ambas variables están configuradas
    if ($endpoint -and $apiKey) {
        Write-Host "`n✅ ¡Variables de entorno FLUX.1-Kontext-pro configuradas correctamente!" -ForegroundColor Green
        Write-Host "   Puedes proceder a ejecutar la aplicación." -ForegroundColor Cyan
    } else {
        Write-Host "`n⚠️  Variables de entorno FLUX.1-Kontext-pro incompletas." -ForegroundColor Yellow
        Write-Host "   Por favor, verifica el archivo .env" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Archivo .env no encontrado" -ForegroundColor Red
    Write-Host "Por favor, crea un archivo .env basado en .env.example" -ForegroundColor Yellow
}

Write-Host "`n📄 Contenido del archivo .env.example:" -ForegroundColor Blue
Get-Content ".env.example" | Select-String "ENDPOINT_FLUX_KONTENT_PRO"