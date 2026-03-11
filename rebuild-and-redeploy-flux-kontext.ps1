# 🔄 REBUILD & REDEPLOY - FLUX KONTEXT FIX

Write-Host "🔄 Rebuild and Redeploy - Flux Kontext Endpoints Fix" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# ======================================
# PASO 1: Limpiar build anterior
# ======================================
Write-Host "`n🧹 PASO 1: Limpiando build anterior..." -ForegroundColor Yellow

if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Carpeta dist eliminada" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No existe carpeta dist" -ForegroundColor Gray
}

# ======================================
# PASO 2: Instalar dependencias
# ======================================
Write-Host "`n📦 PASO 2: Instalando dependencias..." -ForegroundColor Yellow

npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencias instaladas" -ForegroundColor Green

# ======================================
# PASO 3: Construir proyecto
# ======================================
Write-Host "`n🔨 PASO 3: Construyendo proyecto..." -ForegroundColor Yellow

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error construyendo el proyecto" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Proyecto construido exitosamente" -ForegroundColor Green

# ======================================
# PASO 4: Verificar controllers
# ======================================
Write-Host "`n🔍 PASO 4: Verificando controllers compilados..." -ForegroundColor Yellow

$fluxControllers = Get-ChildItem -Path "dist\**\flux*.controller.js" -Recurse
foreach ($controller in $fluxControllers) {
    Write-Host "  ✅ $($controller.Name)" -ForegroundColor Green
}

# ======================================
# PASO 5: Crear deployment package
# ======================================
Write-Host "`n📦 PASO 5: Creando paquete de deployment..." -ForegroundColor Yellow

# Excluir node_modules y archivos innecesarios
$excludeFromBuild = @(
    "node_modules",
    ".git",
    ".vscode",
    ".github",
    "*.md",
    "*.ps1",
    "*.sh",
    ".env",
    ".env.example",
    "logs",
    "temp",
    "test-*.js",
    "test-*.ts",
    "test-*.ps1",
    "test-*.sh",
    "azure-pipelines.yml",
    "host.json",
    "applicationsettings.json",
    "swagger.yaml",
    "Dockerfile*",
    ".dockerignore",
    "deployment.zip"
)

# Crear deployment.zip
Compress-Archive -Path "dist\*" `
    -DestinationPath "deployment.zip" `
    -Force `
    -CompressionLevel Optimize

Write-Host "✅ deployment.zip creado" -ForegroundColor Green

# ======================================
# PASO 6: Desplegar a Azure
# ======================================
Write-Host "`n🚀 PASO 6: Desplegando a Azure..." -ForegroundColor Yellow

$resourceGroup = "realculture-rg"
$appName = "video-converter"

# Ruta completa de Azure CLI
$azPath = "C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"

if (-not (Test-Path $azPath)) {
    Write-Host "❌ Azure CLI no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "Deploying to: $appName ($resourceGroup)" -ForegroundColor Cyan

& $azPath webapp deployment source config-zip `
    --resource-group $resourceGroup `
    --name $appName `
    --src deployment.zip

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment completado exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error en el deployment" -ForegroundColor Red
    exit 1
}

# ======================================
# PASO 7: Reiniciar App Service
# ======================================
Write-Host "`n🔄 PASO 7: Reiniciando App Service..." -ForegroundColor Yellow

& $azPath webapp restart `
    --name $appName `
    --resource-group $resourceGroup

Write-Host "✅ App Service reiniciado" -ForegroundColor Green

# ======================================
# RESUMEN FINAL
# ======================================
Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "✅ REBUILD & REDEPLOY COMPLETADO" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan

Write-Host "`n🌐 URLs de los endpoints:" -ForegroundColor Yellow
Write-Host "  Base: https://$appName.azurewebsites.net" -ForegroundColor Cyan
Write-Host ""
Write-Host "  POST /media/flux-kontext/image" -ForegroundColor White
Write-Host "  POST /media/flux-kontext/edit" -ForegroundColor White
Write-Host "  POST /media/flux-image/simple" -ForegroundColor White
Write-Host "  POST /media/flux-image/dual" -ForegroundColor White
Write-Host "  POST /media/image" -ForegroundColor White
Write-Host ""

Write-Host "📊 Ver logs en tiempo real:" -ForegroundColor Yellow
Write-Host "  az webapp log tail --name $appName --resource-group $resourceGroup" -ForegroundColor Gray
Write-Host ""

Write-Host "🧪 Testear endpoint:" -ForegroundColor Yellow
Write-Host @"
curl -X POST "https://$appName.azurewebsites.net/media/flux-kontext/image" `
  -H "Content-Type: application/json" `
  -d '{
    "prompt": "A red fox in autumn forest",
    "plan": "PRO",
    "size": "1024x1024"
  }'
"@ -ForegroundColor Gray
Write-Host ""
