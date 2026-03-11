# 📘 COMANDOS AZURE CLI - VIDEO GENERATOR

## 🔑 LOGIN Y CONFIGURACIÓN

### Login a Azure
```bash
az login --use-device-code
```

### Ver suscripciones disponibles
```bash
az account list --output table
```

### Seleccionar suscripción
```bash
az account set --subscription "<subscription-id>"
```

### Ver información de la suscripción actual
```bash
az account show
```

---

## 📦 RESOURCE GROUP

### Crear resource group
```bash
az group create \
  --name realculture-rg \
  --location canadacentral
```

### Ver resource groups
```bash
az group list --output table
```

### Eliminar resource group (CUIDADO)
```bash
az group delete --name realculture-rg --yes --no-wait
```

---

## 🐳 AZURE CONTAINER REGISTRY (ACR)

### Crear ACR
```bash
az acr create \
  --resource-group realculture-rg \
  --name realcultureregistry \
  --sku Basic \
  --admin-enabled true
```

### Login a ACR
```bash
az acr login --name realcultureregistry
```

### Ver repositorios en ACR
```bash
az acr repository list --name realcultureregistry --output table
```

### Ver tags de un repositorio
```bash
az acr repository show-tags \
  --name realcultureregistry \
  --repository video-converter \
  --output table
```

### Eliminar repositorio
```bash
az acr repository delete \
  --name realcultureregistry \
  --repository video-converter \
  --yes
```

---

## 🌐 APP SERVICE PLAN

### Crear App Service Plan (Linux)
```bash
az appservice plan create \
  --name video-converter-plan \
  --resource-group realculture-rg \
  --sku B3 \
  --is-linux
```

### Ver App Service Plans
```bash
az appservice plan list --resource-group realculture-rg --output table
```

### Actualizar SKU
```bash
az appservice plan update \
  --name video-converter-plan \
  --resource-group realculture-rg \
  --sku P1v2
```

### Eliminar App Service Plan
```bash
az appservice plan delete \
  --name video-converter-plan \
  --resource-group realculture-rg
```

---

## 🚀 WEB APP

### Crear Web App con contenedor
```bash
az webapp create \
  --name video-converter \
  --resource-group realculture-rg \
  --plan video-converter-plan \
  --deployment-container-image-name realcultureregistry.azurecr.io/video-converter:latest
```

### Configurar imagen del contenedor
```bash
az webapp config container set \
  --name video-converter \
  --resource-group realculture-rg \
  --docker-custom-image-name realcultureregistry.azurecr.io/video-converter:latest
```

### Ver configuración de la Web App
```bash
az webapp show \
  --name video-converter \
  --resource-group realculture-rg
```

### Reiniciar Web App
```bash
az webapp restart \
  --name video-converter \
  --resource-group realculture-rg
```

### Iniciar Web App
```bash
az webapp start \
  --name video-converter \
  --resource-group realculture-rg
```

### Detener Web App
```bash
az webapp stop \
  --name video-converter \
  --resource-group realculture-rg
```

### Eliminar Web App
```bash
az webapp delete \
  --name video-converter \
  --resource-group realculture-rg
```

---

## ⚙️ VARIABLES DE ENTORNO (APP SETTINGS)

### Configurar variables
```bash
az webapp config appsettings set \
  --resource-group realculture-rg \
  --name video-converter \
  --settings \
    MAIN_BACKEND_URL="https://tu-backend.com" \
    NODE_ENV="production" \
    PORT="8080" \
    FLUX_KONTEXT_PRO_API_KEY="your-api-key"
```

### Ver variables
```bash
az webapp config appsettings list \
  --name video-converter \
  --resource-group realculture-rg
```

### Eliminar variable
```bash
az webapp config appsettings delete \
  --name video-converter \
  --resource-group realculture-rg \
  --setting-names VARIABLE_NAME
```

---

## 📊 LOGS Y MONITOREO

### Habilitar logs de contenedor
```bash
az webapp log config \
  --name video-converter \
  --resource-group realculture-rg \
  --docker-container-logging filesystem
```

### Ver logs en tiempo real
```bash
az webapp log tail \
  --name video-converter \
  --resource-group realculture-rg
```

### Descargar logs
```bash
az webapp log download \
  --name video-converter \
  --resource-group realculture-rg
```

### Habilitar Application Insights
```bash
az monitor app-insights component create \
  --app video-converter-insights \
  --location canadacentral \
  --kind web \
  --resource-group realculture-rg \
  --application-type web
```

---

## 🔐 CERTIFICADOS SSL

### Agregar certificado personalizado
```bash
az webapp config ssl bind \
  --certificate-thumbprint <thumbprint> \
  --name video-converter \
  --resource-group realculture-rg \
  --ssl-type SNI
```

### Ver certificados
```bash
az webapp config ssl list \
  --resource-group realculture-rg \
  --output table
```

---

## 🔄 DEPLOYMENT

### Deploy desde ZIP
```bash
az webapp deployment source config-zip \
  --resource-group realculture-rg \
  --name video-converter \
  --src deployment.zip
```

### Deploy desde GitHub (CI/CD)
```bash
az webapp deployment github-actions add \
  --name video-converter \
  --resource-group realculture-rg \
  --repo owner/repo \
  --branch main \
  --token <github-token>
```

### Ver historial de deployments
```bash
az webapp deployment list \
  --name video-converter \
  --resource-group realculture-rg \
  --output table
```

---

## 🐛 TROUBLESHOOTING

### Ver estado de la Web App
```bash
az webapp show \
  --name video-converter \
  --resource-group realculture-rg \
  --query "{status:state, url:defaultHostName}"
```

### Ver uso de recursos
```bash
az monitor metrics list \
  --resource "/subscriptions/<sub-id>/resourceGroups/realculture-rg/providers/Microsoft.Web/sites/video-converter" \
  --metric "CpuPercentage,MemoryPercentage" \
  --interval PT1M \
  --timespan PT1H
```

### Escalar verticalmente
```bash
az appservice plan update \
  --name video-converter-plan \
  --resource-group realculture-rg \
  --sku P1v2
```

### Escalar horizontalmente
```bash
az appservice plan update \
  --name video-converter-plan \
  --resource-group realculture-rg \
  --number-of-workers 3
```

---

## 🧹 LIMPIEZA

### Eliminar todo el resource group
```bash
az group delete \
  --name realculture-rg \
  --yes \
  --no-wait
```

### Ver recursos por eliminar
```bash
az resource list \
  --resource-group realculture-rg \
  --output table
```

---

## 📋 SCRIPT AUTOMATIZADO

### Ejecutar script completo de despliegue
```powershell
# PowerShell
.\deploy-to-azure-complete.ps1
```

### O usar Bash
```bash
pwsh -File deploy-to-azure-complete.ps1
```

---

## 🔍 COMANDOS ÚTILES

### Ver todas las regiones disponibles
```bash
az account list-locations --output table
```

### Ver cuotas de App Service
```bash
az appservice list-usage \
  --resource-group realculture-rg \
  --name video-converter-plan
```

### Exportar plantilla ARM
```bash
az group export \
  --name realculture-rg \
  --output json > azure-template.json
```

### Validar deployment
```bash
az deployment group validate \
  --resource-group realculture-rg \
  --template-file azure-template.json
```

---

## 💡 TIPS IMPORTANTES

1. **Siempre verifica la región antes de crear recursos**
   ```bash
   az account list-locations --query "[].{Name:name, DisplayName:displayName}" -o table
   ```

2. **Usa tags para organizar recursos**
   ```bash
   az tag create \
     --resource-id "/subscriptions/<sub-id>/resourceGroups/realculture-rg" \
     --tags Environment=Production Project=VideoGenerator
   ```

3. **Habilita diagnósticos temprano**
   ```bash
   az monitor diagnostic-settings create \
     --name app-diagnostics \
     --resource <resource-id> \
     --logs '[{"category": "AppServiceConsoleLogs", "enabled": true}]' \
     --workspace-id <log-analytics-workspace-id>
   ```

4. **Configura alertas de monitoreo**
   ```bash
   az monitor metrics alert create \
     --name high-cpu-alert \
     --resource-group realculture-rg \
     --scopes <webapp-resource-id> \
     --condition "avg CpuPercentage > 80" \
     --window-size 5m \
     --evaluation-frequency 1m
   ```

---

**Referencia Oficial:** https://docs.microsoft.com/cli/azure/
