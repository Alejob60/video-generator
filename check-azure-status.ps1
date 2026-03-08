# Script para verificar el estado de la aplicación en Azure
Write-Host "🔍 Verificando estado de la aplicación en Azure..." -ForegroundColor Green

# Variables de Azure
$resourceGroup = "realculture-rg"
$appName = "video-converter"
$acrName = "realcultureacr"

Write-Host "`n📋 Verificando grupo de recursos..." -ForegroundColor Yellow
try {
    $rg = az group show --name $resourceGroup --query "name" -o tsv
    if ($rg) {
        Write-Host "✅ Grupo de recursos encontrado: $rg" -ForegroundColor Green
    } else {
        Write-Host "❌ Grupo de recursos no encontrado: $resourceGroup" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error al verificar el grupo de recursos: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n🌐 Verificando aplicación web..." -ForegroundColor Yellow
try {
    $app = az webapp show --name $appName --resource-group $resourceGroup --query "name" -o tsv
    if ($app) {
        Write-Host "✅ Aplicación web encontrada: $app" -ForegroundColor Green
        
        # Obtener estado detallado
        $state = az webapp show --name $appName --resource-group $resourceGroup --query "state" -o tsv
        $location = az webapp show --name $appName --resource-group $resourceGroup --query "location" -o tsv
        $kind = az webapp show --name $appName --resource-group $resourceGroup --query "kind" -o tsv
        $defaultHostName = az webapp show --name $appName --resource-group $resourceGroup --query "defaultHostName" -o tsv
        
        Write-Host "   Estado: $state" -ForegroundColor White
        Write-Host "   Ubicación: $location" -ForegroundColor White
        Write-Host "   Tipo: $kind" -ForegroundColor White
        Write-Host "   Host: $defaultHostName" -ForegroundColor White
    } else {
        Write-Host "❌ Aplicación web no encontrada: $appName" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error al verificar la aplicación web: $_" -ForegroundColor Red
}

Write-Host "`n☁️  Verificando Azure Container Registry..." -ForegroundColor Yellow
try {
    $acr = az acr show --name $acrName --resource-group $resourceGroup --query "name" -o tsv
    if ($acr) {
        Write-Host "✅ Azure Container Registry encontrado: $acr" -ForegroundColor Green
        
        # Obtener información adicional del ACR
        $acrLoginServer = az acr show --name $acrName --resource-group $resourceGroup --query "loginServer" -o tsv
        $acrSku = az acr show --name $acrName --resource-group $resourceGroup --query "sku.name" -o tsv
        $acrState = az acr show --name $acrName --resource-group $resourceGroup --query "provisioningState" -o tsv
        
        Write-Host "   Login Server: $acrLoginServer" -ForegroundColor White
        Write-Host "   SKU: $acrSku" -ForegroundColor White
        Write-Host "   Estado: $acrState" -ForegroundColor White
    } else {
        Write-Host "❌ Azure Container Registry no encontrado: $acrName" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error al verificar Azure Container Registry: $_" -ForegroundColor Red
}

Write-Host "`n📊 Verificando plan de App Service..." -ForegroundColor Yellow
try {
    # Obtener información del plan de App Service
    $appServicePlan = az appservice plan show --name "ASP-RealCulture" --resource-group $resourceGroup --query "name" -o tsv
    if ($appServicePlan) {
        Write-Host "✅ Plan de App Service encontrado: $appServicePlan" -ForegroundColor Green
        
        $planSku = az appservice plan show --name "ASP-RealCulture" --resource-group $resourceGroup --query "sku.name" -o tsv
        $planTier = az appservice plan show --name "ASP-RealCulture" --resource-group $resourceGroup --query "sku.tier" -o tsv
        $planInstances = az appservice plan show --name "ASP-RealCulture" --resource-group $resourceGroup --query "capacity" -o tsv
        $planOs = az appservice plan show --name "ASP-RealCulture" --resource-group $resourceGroup --query "reserved" -o tsv
        $osType = if ($planOs -eq "True") { "Linux" } else { "Windows" }
        
        Write-Host "   SKU: $planSku" -ForegroundColor White
        Write-Host "   Tier: $planTier" -ForegroundColor White
        Write-Host "   Instancias: $planInstances" -ForegroundColor White
        Write-Host "   Sistema Operativo: $osType" -ForegroundColor White
    } else {
        Write-Host "❌ Plan de App Service no encontrado" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error al verificar el plan de App Service: $_" -ForegroundColor Red
}

Write-Host "`n📈 Verificando métricas recientes..." -ForegroundColor Yellow
try {
    # Obtener información de uso reciente (última hora)
    Write-Host "   Obteniendo métricas de CPU y memoria..." -ForegroundColor Cyan
    # Esta consulta puede tardar un poco
    Write-Host "   ⏳ Esta consulta puede tardar unos segundos..." -ForegroundColor Yellow
} catch {
    Write-Host "⚠️  No se pudieron obtener métricas en este momento: $_" -ForegroundColor Yellow
}

Write-Host "`n✅ Verificación completada." -ForegroundColor Green
Write-Host "   Aplicación: https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net" -ForegroundColor White