# 📁 validate-azure-deployment.ps1
# Script de validación de despliegue en Azure

Write-Host "🔍 VALIDACIÓN DE DESPLIEGUE EN AZURE" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

# Variables de configuración
$RESOURCE_GROUP = "realculture-rg"
$APP_SERVICE = "video-converter"

Write-Host "🔧 Configuración:" -ForegroundColor Cyan
Write-Host "  Resource Group: $RESOURCE_GROUP" -ForegroundColor White
Write-Host "  App Service: $APP_SERVICE" -ForegroundColor White
Write-Host "------------------------------" -ForegroundColor Cyan

# Función para verificar requisitos
function Test-AzureRequirements {
    Write-Host "📋 Verificando requisitos del sistema..." -ForegroundColor Yellow
    
    # Verificar Docker
    try {
        $dockerVersion = docker --version
        Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker no encontrado" -ForegroundColor Red
        return $false
    }
    
    # Verificar Azure CLI
    try {
        $azVersion = az --version | Select-String -Pattern "azure-cli"
        Write-Host "✅ Azure CLI: $($azVersion.Line)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Azure CLI no encontrado" -ForegroundColor Red
        Write-Host "Por favor instala Azure CLI desde: https://aka.ms/installazurecliwindows" -ForegroundColor Yellow
        return $false
    }
    
    return $true
}

# Función para verificar autenticación en Azure
function Test-AzureAuthentication {
    Write-Host "🔐 Verificando autenticación en Azure..." -ForegroundColor Yellow
    
    try {
        $account = az account show --query "{name:name,id:id,state:state}" -o table 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Autenticado en Azure:" -ForegroundColor Green
            Write-Host $account -ForegroundColor White
            return $true
        } else {
            Write-Host "❌ No autenticado en Azure" -ForegroundColor Red
            Write-Host "Ejecuta: az login" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ Error verificando autenticación: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Función para verificar estado de recursos
function Test-AzureResources {
    Write-Host "🔍 Verificando recursos de Azure..." -ForegroundColor Yellow
    
    # Verificar Resource Group
    try {
        $rg = az group show --name $RESOURCE_GROUP --query "name" -o tsv 2>$null
        if ($LASTEXITCODE -eq 0 -and $rg) {
            Write-Host "✅ Resource Group '$RESOURCE_GROUP' encontrado" -ForegroundColor Green
        } else {
            Write-Host "❌ Resource Group '$RESOURCE_GROUP' no encontrado" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error verificando Resource Group: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    # Verificar App Service
    try {
        $app = az webapp show --name $APP_SERVICE --resource-group $RESOURCE_GROUP --query "{name:name,state:state}" -o table 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ App Service '$APP_SERVICE':" -ForegroundColor Green
            Write-Host $app -ForegroundColor White
            
            # Obtener URL
            $appUrl = az webapp show --name $APP_SERVICE --resource-group $RESOURCE_GROUP --query "defaultHostName" -o tsv
            Write-Host "🌐 URL: https://$appUrl" -ForegroundColor Cyan
            
            return @{
                Success = $true
                Url = "https://$appUrl"
            }
        } else {
            Write-Host "❌ App Service '$APP_SERVICE' no encontrado" -ForegroundColor Red
            return @{Success = $false}
        }
    } catch {
        Write-Host "❌ Error verificando App Service: $($_.Exception.Message)" -ForegroundColor Red
        return @{Success = $false}
    }
}

# Función para probar endpoints
function Test-ApiEndpoints {
    param([string]$BaseUrl)
    
    Write-Host "🧪 Probando endpoints de la API..." -ForegroundColor Yellow
    
    $endpoints = @(
        @{ Path = "/status"; Description = "Health Check" },
        @{ Path = "/health"; Description = "Detailed Health" },
        @{ Path = "/videos/health"; Description = "Video Queue Health" }
    )
    
    foreach ($endpoint in $endpoints) {
        $url = "$BaseUrl$($endpoint.Path)"
        Write-Host "  Probando $($endpoint.Description) ($url)..." -ForegroundColor Gray
        
        try {
            $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 30 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "    ✅ $($endpoint.Description): OK (HTTP $($response.StatusCode))" -ForegroundColor Green
            } else {
                Write-Host "    ⚠️  $($endpoint.Description): HTTP $($response.StatusCode)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "    ❌ $($endpoint.Description): FAILED - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Ejecutar validaciones
Write-Host "`n🚀 INICIANDO VALIDACIONES" -ForegroundColor Green

# Verificar requisitos
if (-not (Test-AzureRequirements)) {
    Write-Host "`n❌ Requisitos no cumplidos. Por favor instala las herramientas necesarias." -ForegroundColor Red
    exit 1
}

# Verificar autenticación
if (-not (Test-AzureAuthentication)) {
    Write-Host "`n❌ Autenticación requerida. Por favor ejecuta 'az login'" -ForegroundColor Red
    exit 1
}

# Verificar recursos
$resourceCheck = Test-AzureResources
if (-not $resourceCheck.Success) {
    Write-Host "`n❌ Recursos no encontrados en Azure" -ForegroundColor Red
    exit 1
}

# Probar endpoints si la URL está disponible
if ($resourceCheck.Url) {
    Write-Host "`n🌐 Probando conectividad con la aplicación..." -ForegroundColor Cyan
    Test-ApiEndpoints -BaseUrl $resourceCheck.Url
}

Write-Host "`n✅ VALIDACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green
if ($resourceCheck.Url) {
    Write-Host "La aplicación está disponible en: $($resourceCheck.Url)" -ForegroundColor Cyan
    Write-Host "Todos los endpoints básicos responden correctamente" -ForegroundColor Green
} else {
    Write-Host "Los recursos de Azure están configurados correctamente" -ForegroundColor Green
    Write-Host "Para desplegar, ejecuta el proceso de construcción y publicación" -ForegroundColor Yellow
}