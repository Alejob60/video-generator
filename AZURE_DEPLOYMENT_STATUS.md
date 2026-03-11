# ✅ ESTADO DEL DESPLIEGUE EN AZURE - VIDEO GENERATOR

**Fecha:** 2026-03-08  
**Estado:** ✅ **EN PRODUCCIÓN - CORRECTO**

---

## 📊 **INFORMACIÓN DEL RECURSO**

### **Resource Group:**
- **Nombre:** `realculture-rg`
- **Ubicación:** Canada Central
- **Estado:** En ejecución
- **Suscripción:** Patrocinio de Microsoft Azure
- **ID Suscripción:** `a466ea69-1312-4361-95e1-f1c8524bea91`

---

## 🌐 **APLICACIÓN WEB**

### **Configuración Principal:**

| Campo | Valor |
|-------|-------|
| **Nombre** | `video-converter` |
| **URL** | https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net |
| **Estado** | ✅ Correcto |
| **Comprobación de salud** | 100.00% (2/2 correcto) |
| **Modelo de publicación** | Contenedor Docker |
| **Imagen** | `realcultureacr.azurecr.io/video-generator:latest` |
| **Sistema operativo** | Linux |

---

## 💻 **APP SERVICE PLAN**

| Campo | Valor |
|-------|-------|
| **Nombre** | `ASP-RealCulture` |
| **SKU** | PremiumV3 (P1v3) |
| **Instancias** | 2 |
| **Tamaño** | P1v3 |

---

## 🗄️ **CONTAINER REGISTRY**

| Campo | Valor |
|-------|-------|
| **Nombre** | `realcultureacr` |
| **Imagen** | `video-generator:latest` |
| **Full path** | `realcultureacr.azurecr.io/video-generator:latest` |

---

## 🌐 **REDES**

### **Direcciones IP:**

**IP Virtual:**
- `20.48.204.11`

**Direcciones IP de salida principales:**
- `130.107.228.1`
- `130.107.228.5`
- `130.107.228.7`
- `130.107.228.19`
- `130.107.228.28`
- `130.107.228.45`
- `20.48.204.11`

**Todas las IPs de salida:**
```
130.107.228.1, 130.107.228.5, 130.107.228.7, 130.107.228.19, 
130.107.228.28, 130.107.228.45, 20.48.204.11, 130.107.228.60, 
130.107.227.213, 130.107.228.65, 130.107.228.77, 130.107.228.78, 
130.107.228.80, 130.107.224.239, 130.107.227.14, 130.107.227.113, 
130.107.227.140, 130.107.227.184, 130.107.227.207, 130.107.224.128, 
130.107.227.224, 130.107.227.228, 130.107.227.238, 130.107.227.245, 
130.107.227.255, 130.107.228.86, 130.107.228.88, 130.107.228.97, 
130.107.228.101, 130.107.224.81, 130.107.228.104
```

---

## 🔗 **INTEGRACIONES**

### **GitHub:**
- **Repositorio:** https://github.com/Alejob60/video-generator
- **Proyecto vinculado:** ✅ Sí

### **Application Insights:**
- **Estado:** ❌ No configurado

### **Red VNet:**
- **Integración:** ❌ Sin configurar

---

## 🎯 **ENDPOINTS DISPONIBLES**

### **Base URL:**
```
https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net
```

### **Endpoints de Generación de Imágenes:**

#### **1. Dual (DALL-E + FLUX):**
```bash
POST https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/image
```

**Payload:**
```json
{
  "prompt": "A red apple on white background",
  "plan": "FREE",
  "useFlux": false
}
```

#### **2. FLUX 2 Pro Simple:**
```bash
POST https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-image/simple
```

**Payload:**
```json
{
  "prompt": "A beautiful mountain landscape",
  "plan": "PRO",
  "size": "1024x1024"
}
```

#### **3. FLUX Kontext (Texto):**
```bash
POST https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-kontext/image
```

**Payload:**
```json
{
  "prompt": "A red fox in autumn forest",
  "plan": "PRO",
  "size": "1024x1024"
}
```

#### **4. FLUX Kontext (Edición):**
```bash
POST https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-kontext/edit
```

**Payload:**
```json
{
  "prompt": "Make it cyberpunk style",
  "plan": "PRO",
  "size": "1024x1024",
  "referenceImageUrl": "https://...imagen-original.png"
}
```

---

## 🧪 **COMANDOS PARA VERIFICAR**

### **1. Ver estado de la Web App:**
```bash
az webapp show \
  --name video-converter \
  --resource-group realculture-rg \
  --query "{status:state, url:defaultHostName}" \
  --output table
```

### **2. Ver logs en tiempo real:**
```bash
az webapp log tail \
  --name video-converter \
  --resource-group realculture-rg
```

### **3. Ver configuración del contenedor:**
```bash
az webapp config container show \
  --name video-converter \
  --resource-group realculture-rg
```

### **4. Ver variables de entorno:**
```bash
az webapp config appsettings list \
  --name video-converter \
  --resource-group realculture-rg
```

### **5. Probar endpoint de health:**
```bash
curl https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/health
```

### **6. Ver instancias activas:**
```bash
az webapp list-instances \
  --name video-converter \
  --resource-group realculture-rg
```

---

## 💰 **COSTOS ESTIMADOS**

### **Recursos Activos:**

| Recurso | SKU | Cantidad | Costo Mensual (CAD) |
|---------|-----|----------|---------------------|
| App Service Plan | P1v3 (Premium V3) | 2 instancias | ~$200/mes |
| Container Registry | Basic | 1 | ~$3/mes |
| Blob Storage | Standard LRS | Variable | ~$5-10/mes |
| **Total estimado** | | | **~$208-213/mes** |

---

## ⚙️ **VARIABLES DE ENTORNO CONFIGURADAS**

Para ver las variables actuales:

```bash
az webapp config appsettings list \
  --name video-converter \
  --resource-group realculture-rg \
  --output table
```

### **Variables Recomendadas:**

```env
# Backend Principal
MAIN_BACKEND_URL=https://tu-backend-principal.com

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=realculturestorage;...
AZURE_STORAGE_CONTAINER_NAME=images

# Node.js
NODE_ENV=production
PORT=8080

# FLUX Configuration
FLUX_KONTEXT_PRO_BASE_URL=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com
FLUX_KONTEXT_PRO_DEPLOYMENT=FLUX.1-Kontext-pro
FLUX_KONTEXT_PRO_API_VERSION=2025-04-01-preview
FLUX_KONTEXT_PRO_API_KEY=<tu-api-key>
```

---

## 🔄 **ACTUALIZAR DESPLIEGUE**

### **Opción 1: Desde GitHub (CI/CD)**

Si tienes GitHub Actions configurado:

```bash
# El deployment se hace automáticamente al hacer push a main
git push origin main
```

### **Opción 2: Manual con Docker**

```bash
# 1. Construir nueva imagen
docker build -t video-converter:latest .

# 2. Taggear para ACR
$acrLoginServer = az acr show --name realcultureacr --query loginServer -o tsv
docker tag video-converter:latest $acrLoginServer/video-converter:latest

# 3. Push a ACR
docker push $acrLoginServer/video-converter:latest

# 4. Reiniciar Web App
az webapp restart \
  --name video-converter \
  --resource-group realculture-rg
```

### **Opción 3: Deploy Zip**

```bash
# Crear zip del código
Compress-Archive -Path src/* -DestinationPath deployment.zip -Force

# Desplegar
az webapp deployment source config-zip \
  --resource-group realculture-rg \
  --name video-converter \
  --src deployment.zip
```

---

## 🛡️ **SEGURIDAD RECOMENDADA**

### **1. Configurar HTTPS Only:**
```bash
az webapp update \
  --name video-converter \
  --resource-group realculture-rg \
  --set httpsOnly=true
```

### **2. Restringir IPs (si es necesario):**
```bash
az webapp config ip-restriction add \
  --name video-converter \
  --resource-group realculture-rg \
  --rule-name "AllowOfficeIP" \
  --ip-address "TU_IP_OFICINA/32" \
  --priority 100 \
  --action Allow
```

### **3. Habilitar Managed Identity:**
```bash
az webapp identity assign \
  --name video-converter \
  --resource-group realculture-rg
```

---

## 📈 **MONITOREO RECOMENDADO**

### **1. Configurar Application Insights:**

```bash
# Crear recurso
az monitor app-insights component create \
  --app video-converter-insights \
  --location canadacentral \
  --kind web \
  --resource-group realculture-rg \
  --application-type web

# Vincular con Web App
az webapp config appsettings set \
  --name video-converter \
  --resource-group realculture-rg \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=<instrumentation-key>
```

### **2. Configurar Alertas:**

```bash
# Alerta de CPU alta
az monitor metrics alert create \
  --name high-cpu-alert \
  --resource-group realculture-rg \
  --scopes $(az webapp show --name video-converter --resource-group realculture-rg --query id -o tsv) \
  --condition "avg CpuPercentage > 80" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --severity 3

# Alerta de memoria alta
az monitor metrics alert create \
  --name high-memory-alert \
  --resource-group realculture-rg \
  --scopes $(az webapp show --name video-converter --resource-group realculture-rg --query id -o tsv) \
  --condition "avg MemoryPercentage > 85" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --severity 3
```

---

## 🧹 **LIMPIEZA (SI ES NECESARIO)**

### **Eliminar todo el resource group:**

⚠️ **ADVERTENCIA:** Esto elimina TODOS los recursos permanentemente.

```bash
az group delete \
  --name realculture-rg \
  --yes \
  --no-wait
```

---

## 📞 **SOPORTE Y DOCUMENTACIÓN**

### **Azure Portal:**
- Resource Group: https://portal.azure.com/#@/resource/subscriptions/a466ea69-1312-4361-95e1-f1c8524bea91/resourceGroups/realculture-rg

### **Web App:**
- https://portal.azure.com/#@/resource/subscriptions/a466ea69-1312-4361-95e1-f1c8524bea91/resourceGroups/realculture-rg/providers/Microsoft.Web/sites/video-converter

### **Container Registry:**
- https://portal.azure.com/#@/resource/subscriptions/a466ea69-1312-4361-95e1-f1c8524bea91/resourceGroups/realculture-rg/providers/Microsoft.ContainerRegistry/registries/realcultureacr

### **Documentación:**
- [`COMPLETE_IMAGE_GENERATION_ENDPOINTS.md`](./COMPLETE_IMAGE_GENERATION_ENDPOINTS.md) - Endpoints completos
- [`DEPLOY_TO_AZURE_QUICKSTART.md`](./DEPLOY_TO_AZURE_QUICKSTART.md) - Guía rápida
- [`AZURE_CLI_COMMANDS_GUIDE.md`](./AZURE_CLI_COMMANDS_GUIDE.md) - Comandos CLI

---

**Última actualización:** 2026-03-08  
**Estado:** ✅ EN PRODUCCIÓN
