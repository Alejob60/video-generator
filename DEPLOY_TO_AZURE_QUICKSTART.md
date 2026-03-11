# 🚀 DESPLIEGUE RÁPIDO A AZURE - VIDEO GENERATOR

## ⚡ RESUMEN EJECUTIVO

### **Prerrequisitos:**

1. ✅ Tener Docker instalado
2. ✅ Tener Azure CLI instalado
3. ✅ Tener cuenta de Azure activa
4. ✅ Tener permisos de contribuidor en la suscripción

---

## 📋 **PASOS PARA DESPLEGAR**

### **OPCIÓN 1: Script Automático (Recomendado)**

```powershell
# Ejecutar script completo de despliegue
.\deploy-to-azure-complete.ps1
```

**Este script hace TODO automáticamente:**
- Login a Azure
- Crear Resource Group
- Crear App Service Plan
- Construir imagen Docker
- Crear Azure Container Registry
- Subir imagen a ACR
- Crear Web App
- Configurar variables
- Habilitar logs
- Reiniciar aplicación

---

### **OPCIÓN 2: Comandos Manuales**

Si prefieres hacer cada paso manualmente, usa estos comandos:

#### **Paso 1: Login**
```bash
az login --use-device-code
```

#### **Paso 2: Verificar suscripción**
```bash
az account show
```

#### **Paso 3: Crear Resource Group**
```bash
az group create \
  --name realculture-rg \
  --location canadacentral
```

#### **Paso 4: Crear App Service Plan**
```bash
az appservice plan create \
  --name video-converter-plan \
  --resource-group realculture-rg \
  --sku B3 \
  --is-linux
```

#### **Paso 5: Construir imagen Docker**
```bash
docker build -t video-converter:latest .
```

#### **Paso 6: Crear Azure Container Registry**
```bash
az acr create \
  --resource-group realculture-rg \
  --name realcultureregistry \
  --sku Basic \
  --admin-enabled true
```

#### **Paso 7: Login a ACR**
```bash
az acr login --name realcultureregistry
```

#### **Paso 8: Taggear imagen**
```bash
$loginServer = az acr show --name realcultureregistry --query loginServer -o tsv
docker tag video-converter:latest $loginServer/video-converter:latest
```

#### **Paso 9: Push a ACR**
```bash
docker push $loginServer/video-converter:latest
```

#### **Paso 10: Crear Web App**
```bash
az webapp create \
  --name video-converter \
  --resource-group realculture-rg \
  --plan video-converter-plan \
  --deployment-container-image-name "$loginServer/video-converter:latest"
```

#### **Paso 11: Configurar variables**
```bash
az webapp config appsettings set \
  --resource-group realculture-rg \
  --name video-converter \
  --settings \
    MAIN_BACKEND_URL="https://tu-backend-principal.com" \
    NODE_ENV="production" \
    PORT="8080"
```

#### **Paso 12: Reiniciar**
```bash
az webapp restart \
  --name video-converter \
  --resource-group realculture-rg
```

---

## 🔍 **VERIFICAR DESPLIEGUE**

### **Ver estado de la Web App**
```bash
az webapp show \
  --name video-converter \
  --resource-group realculture-rg \
  --query "{status:state, url:defaultHostName}"
```

### **Ver logs en tiempo real**
```bash
az webapp log tail \
  --name video-converter \
  --resource-group realculture-rg
```

### **Probar endpoint**
```bash
curl https://video-converter.azurewebsites.net/health
```

---

## 📊 **URLS IMPORTANTES**

| Recurso | URL |
|---------|-----|
| **Web App** | `https://video-converter.azurewebsites.net` |
| **ACR Portal** | `https://portal.azure.com/#@/resource/subscriptions/<id>/resourceGroups/realculture-rg/providers/Microsoft.ContainerRegistry/registries/realcultureregistry` |
| **App Service** | `https://portal.azure.com/#@/resource/subscriptions/<id>/resourceGroups/realculture-rg/providers/Microsoft.Web/sites/video-converter` |

---

## ⚠️ **PROBLEMAS COMUNES**

### **Error: "az no se reconoce"**

**Solución:** Instalar Azure CLI
```powershell
winget install Microsoft.AzureCLI
```

Luego reinicia PowerShell y vuelve a intentar.

---

### **Error: "No tienes permisos"**

**Solución:** Solicitar permisos de contribuidor en la suscripción de Azure.

---

### **Error: "Resource group already exists"**

**Solución:** El resource group ya existe, puedes usarlo o eliminarlo primero:
```bash
az group delete --name realculture-rg --yes --no-wait
```

---

### **Error: "Docker not found"**

**Solución:** Instalar Docker Desktop para Windows desde https://docker.com

---

### **Error: "Push denied"**

**Solución:** Hacer login en ACR:
```bash
az acr login --name realcultureregistry
```

---

## 💰 **COSTOS ESTIMADOS**

| Recurso | SKU | Costo Mensual (CAD) |
|---------|-----|---------------------|
| App Service Plan | B3 (Basic) | ~$60/mes |
| App Service Plan | P1v2 (Production) | ~$100/mes |
| ACR | Basic | ~$3/mes |
| **Total estimado** | | **~$63-103/mes** |

---

## 🧹 **LIMPIEZA DE RECURSOS**

### **Eliminar todo (CUIDADO)**
```bash
az group delete \
  --name realculture-rg \
  --yes \
  --no-wait
```

Esto elimina TODOS los recursos del resource group.

---

## 📚 **DOCUMENTACIÓN COMPLETA**

- [`deploy-to-azure-complete.ps1`](./deploy-to-azure-complete.ps1) - Script automático
- [`AZURE_CLI_COMMANDS_GUIDE.md`](./AZURE_CLI_COMMANDS_GUIDE.md) - Todos los comandos Azure CLI
- [`COMPLETE_IMAGE_GENERATION_ENDPOINTS.md`](./COMPLETE_IMAGE_GENERATION_ENDPOINTS.md) - Endpoints completos

---

## ✅ **CHECKLIST POST-DESPLEGUE**

- [ ] Verificar que la Web App esté running
  ```bash
  az webapp show --name video-converter --query state
  ```

- [ ] Probar endpoint de health
  ```bash
  curl https://video-converter.azurewebsites.net/health
  ```

- [ ] Ver logs de la aplicación
  ```bash
  az webapp log tail --name video-converter
  ```

- [ ] Configurar variables de entorno adicionales si es necesario
  ```bash
  az webapp config appsettings list --name video-converter
  ```

- [ ] Habilitar Application Insights para monitoreo avanzado
  ```bash
  az monitor app-insights component create \
    --app video-converter-insights \
    --location canadacentral \
    --kind web \
    --resource-group realculture-rg
  ```

- [ ] Configurar alertas de CPU y memoria
  ```bash
  az monitor metrics alert create \
    --name high-cpu-alert \
    --resource-group realculture-rg \
    --scopes <webapp-resource-id> \
    --condition "avg CpuPercentage > 80"
  ```

---

## 🎯 **SIGUIENTES PASOS**

1. **Configurar CI/CD con GitHub Actions**
   - Crear workflow `.github/workflows/deploy.yml`
   - Configurar secrets de Azure
   - Automatizar deployments

2. **Configurar dominio personalizado**
   - Comprar dominio
   - Configurar DNS records
   - Agregar SSL certificate

3. **Optimizar costos**
   - Usar auto-scaling
   - Configurar reglas de escalado
   - Monitorear uso de recursos

4. **Mejorar seguridad**
   - Configurar VNet integration
   - Habilitar Managed Identity
   - Restringir IPs de entrada

---

**¿Listo para desplegar? Ejecuta:** `.\deploy-to-azure-complete.ps1`
