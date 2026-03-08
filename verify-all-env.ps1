# Script para verificar todas las variables de entorno importantes
Write-Host "🔍 Verificando todas las variables de entorno..." -ForegroundColor Green

# Verificar si el archivo .env existe
if (Test-Path ".env") {
    Write-Host "📁 Archivo .env encontrado" -ForegroundColor Cyan
    
    # Leer el archivo .env
    $envContent = Get-Content ".env"
    
    # Variables de entorno críticas
    $criticalEnvVars = @(
        "AZURE_OPENAI_KEY",
        "AZURE_OPENAI_GPT_URL",
        "AZURE_OPENAI_API_ENDPOINT",
        "AZURE_OPENAI_API_VERSION",
        "AZURE_OPENAI_GPT_DEPLOYMENT",
        "AZURE_TTS_KEY",
        "AZURE_TTS_ENDPOINT",
        "AZURE_TTS_VOICE",
        "AZURE_TTS_API_VERSION",
        "AZURE_TTS_DEPLOYMENT",
        "AZURE_SORA_URL",
        "AZURE_SORA_DEPLOYMENT",
        "AZURE_SORA_API_KEY",
        "AZURE_SORA_API_VERSION",
        "AZURE_SERVICE_BUS_CONNECTION",
        "AZURE_SERVICE_BUS_QUEUE",
        "AZURE_SERVICE_BUS_QUEUE_IMAGE",
        "AZURE_OPENAI_IMAGE_ENDPOINT",
        "AZURE_OPENAI_IMAGE_DEPLOYMENT",
        "AZURE_OPENAI_IMAGE_API_VERSION",
        "AZURE_OPENAI_IMAGE_API_KEY",
        "FLUX_API_KEY",
        "ENDPOINT_FLUX_KONTENT_PRO",
        "ENDPOINT_FLUX_KONTENT_PRO_API_KEY",
        "AZURE_STORAGE_CONNECTION_STRING",
        "AZURE_STORAGE_ACCOUNT_NAME",
        "AZURE_STORAGE_KEY",
        "AZURE_STORAGE_CONTAINER_NAME",
        "AZURE_STORAGE_CONTAINER_IMAGES",
        "AZURE_STORAGE_CONTAINER_VIDEO",
        "SORA_VIDEO_URL",
        "PUBLIC_BASE_URL",
        "MAIN_BACKEND_URL",
        "DB_HOST",
        "DB_PORT",
        "DB_USERNAME",
        "DB_PASSWORD",
        "DB_NAME",
        "DB_SSL",
        "DATABASE_URL",
        "GEMINI_API_KEY"
    )
    
    Write-Host "`n🧪 Verificando variables de entorno críticas:" -ForegroundColor Yellow
    
    $missingVars = @()
    $configuredVars = 0
    
    foreach ($varName in $criticalEnvVars) {
        # Buscar la variable en el archivo .env
        $varLine = $envContent -match "$varName="
        
        if ($varLine) {
            Write-Host "✅ $varName: CONFIGURADO" -ForegroundColor Green
            $configuredVars++
        } else {
            Write-Host "❌ $varName: NO CONFIGURADO" -ForegroundColor Red
            $missingVars += $varName
        }
    }
    
    Write-Host "`n📊 Resumen:" -ForegroundColor Cyan
    Write-Host "   Variables configuradas: $configuredVars/$($criticalEnvVars.Length)" -ForegroundColor White
    
    if ($missingVars.Count -gt 0) {
        Write-Host "`n⚠️  Variables faltantes ($($missingVars.Count)):" -ForegroundColor Yellow
        foreach ($varName in $missingVars) {
            Write-Host "   - $varName" -ForegroundColor Red
        }
        
        Write-Host "`n💡 Recomendación:" -ForegroundColor Cyan
        Write-Host "   Verifica tu archivo .env y asegúrate de que contiene todas las variables requeridas." -ForegroundColor White
        Write-Host "   Puedes usar .env.example como referencia." -ForegroundColor White
    } else {
        Write-Host "`n🎉 ¡Todas las variables de entorno críticas están configuradas!" -ForegroundColor Green
        Write-Host "   La aplicación debería funcionar correctamente." -ForegroundColor White
    }
    
    Write-Host "`n📄 Nota:" -ForegroundColor Cyan
    Write-Host "   Este script verifica las variables más importantes." -ForegroundColor White
    Write-Host "   Algunas variables pueden ser opcionales dependiendo de la funcionalidad que uses." -ForegroundColor White
} else {
    Write-Host "❌ Archivo .env no encontrado" -ForegroundColor Red
    Write-Host "Por favor, crea un archivo .env basado en .env.example" -ForegroundColor Yellow
}