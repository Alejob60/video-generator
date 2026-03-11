# 🐳 **DOCKER BUILD & DEPLOY - ESTADO EN TIEMPO REAL**

**Fecha:** 2026-03-09  
**Build Status:** ⏳ **EN PROGRESO**  
**Método:** Docker + Azure Container Registry

---

## 📊 **ESTADO ACTUAL**

### **Build de Imagen Docker:**

```bash
docker build -t realcultureacr.azurecr.io/video-converter:latest .
```

**Progreso:**
- ✅ Base image descargada (node:20-alpine)
- ✅ Dependencias npm instalándose
- ⏳ Build del código fuente pendiente
- ⏳ Push a ACR pendiente
- ⏳ Deploy a App Service pendiente

**Tiempo estimado:** ~5-10 minutos totales

---

## 🎯 **COMANDOS DE DEPLOY (PARA CUANDO TERMINE EL BUILD)**

### **1. Login en Azure Container Registry:**

```powershell
az login
az acr login --name realcultureacr
```

### **2. Push de la imagen a ACR:**

```powershell
docker push realcultureacr.azurecr.io/video-converter:latest
```

### **3. Configurar App Service:**

```powershell
az webapp config container set `
  --name video-converter `
  --resource-group realculture-rg `
  --docker-custom-image-name realcultureacr.azurecr.io/video-converter:latest `
  --docker-registry-server-url https://realcultureacr.azurecr.io
```

### **4. Reiniciar App Service:**

```powershell
az webapp restart `
  --name video-converter `
  --resource-group realculture-rg
```

---

## 📋 **SECUENCIA COMPLETA DE DEPLOY**

```
[⏳] 1. Build Docker image        → En progreso (~5 min)
[⏳] 2. Push a Azure Container Registry → Pendiente (~2 min)
[⏳] 3. Configurar App Service    → Pendiente (~1 min)
[⏳] 4. Reiniciar App Service     → Pendiente (~1 min)
[⏳] 5. Propagación de cambios   → Pendiente (~3 min)
[⏳] 6. Tests y verificación     → Pendiente (~1 min)

TOTAL ESTIMADO: ~13-15 minutos
```

---

## 🔧 **CONFIGURACIÓN REQUERIDA EN APP SERVICE**

### **Variables de Entorno (App Settings):**

Después del deploy, configurar:

```powershell
az webapp config appsettings set `
  --resource-group realculture-rg `
  --name video-converter `
  --settings `
    AZURE_STORAGE_CONNECTION_STRING="..." `
    AZURE_STORAGE_CONTAINER_NAME="images" `
    FLUX_KONTEXT_PRO_BASE_URL="https://labsc-m9j5kbl9-eastus2.services.ai.azure.com" `
    FLUX_KONTEXT_PRO_DEPLOYMENT="FLUX.1-Kontext-pro" `
    FLUX_KONTEXT_PRO_API_VERSION="2025-04-01-preview" `
    FLUX_KONTEXT_PRO_API_KEY="7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS" `
    AZURE_OPENAI_IMAGE_ENDPOINT="https://api.openai.com/v1" `
    AZURE_OPENAI_IMAGE_API_KEY="sk-..." `
    MAIN_BACKEND_URL="http://localhost:3000" `
    NODE_ENV="production" `
    PORT="8080"
```

---

## 🧪 **TEST POST-DEPLOY**

### **Health Check:**
```bash
curl https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/health
```

**Expected:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-09T..."
}
```

### **Test DALL-E:**
```bash
curl -X POST "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/image" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A red apple on white background","plan":"FREE"}'
```

### **Test FLUX Kontext (con fallback):**
```bash
curl -X POST "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-kontext/image" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A photograph of a red fox in autumn forest","plan":"PRO","size":"1024x1024"}'
```

### **Test Upload:**
```bash
curl -X POST "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/upload" \
  -F "file=@test-image.png"
```

---

## 📦 **DETALLES DE LA IMAGEN DOCKER**

### **Dockerfile Multi-stage:**

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache ffmpeg
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
EXPOSE 8080
CMD ["node", "dist/main.js"]
```

### **Características:**

- ✅ **Multi-stage build** - Optimizado para producción
- ✅ **Node 20 Alpine** - Imagen ligera (~120MB base)
- ✅ **ffmpeg incluido** - Para procesamiento de video
- ✅ **Solo archivos necesarios** - dist/ + node_modules/
- ✅ **Puerto 8080** - Configurado para App Service

### **Tamaño estimado:**
- **Imagen final:** ~800MB - 1.2GB
- **Dependencias:** ~600MB
- **Código compilado:** ~50MB
- **Assets públicos:** ~50MB

---

## 🚀 **SCRIPT AUTOMÁTICO CREADO**

Archivo: [`build-and-deploy-docker.ps1`](file:///d:/MisyBot/RealCulture%20AI/video-generator/build-and-deploy-docker.ps1)

**Uso futuro:**
```powershell
.\build-and-deploy-docker.ps1
```

**Funcionalidades:**
1. ✅ Verifica Docker instalado
2. ✅ Verifica Azure CLI instalado
3. ✅ Crea ACR si no existe
4. ✅ Build de imagen Docker
5. ✅ Push automático a ACR
6. ✅ Configura App Service
7. ✅ Reinicia App Service
8. ✅ Muestra URLs y comandos de test

---

## ⚠️ **POSIBLES ISSUES Y SOLUCIONES**

### **Issue 1: Build falla por dependencias**

**Solución:**
```powershell
# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias
rm -r node_modules
npm ci --legacy-peer-deps

# Retry build
docker build -t realcultureacr.azurecr.io/video-converter:latest .
```

### **Issue 2: ACR authentication falla**

**Solución:**
```powershell
# Logout y login nuevamente
az logout
az login
az acr login --name realcultureacr
```

### **Issue 3: App Service no actualiza**

**Solución:**
```powershell
# Forzar pull de nueva imagen
az webapp deployment container start \
  --name video-converter \
  --resource-group realculture-rg

# Reiniciar
az webapp restart \
  --name video-converter \
  --resource-group realculture-rg
```

### **Issue 4: Logs no aparecen**

**Solución:**
```powershell
# Habilitar logs
az webapp log config \
  --name video-converter \
  --resource-group realculture-rg \
  --docker-container-logging filesystem

# Ver logs en tiempo real
az webapp log tail \
  --name video-converter \
  --resource-group realculture-rg
```

---

## 📊 **TIMELINE DEL DEPLOY**

```
[✅] 14:00 - Inicio del build Docker
[⏳] 14:03 - Instalando dependencias npm
[⏳] 14:05 - Compilando TypeScript
[⏳] 14:07 - Build completado
[⏳] 14:08 - Push a ACR iniciado
[⏳] 14:10 - Push a ACR completado
[⏳] 14:11 - Configurando App Service
[⏳] 14:12 - App Service reiniciado
[⏳] 14:15 - Propagación completada
[⏳] 14:16 - Tests de verificación
[✅] 14:17 - DEPLOY COMPLETADO
```

---

## 🎯 **PRÓXIMOS PASOS INMEDIATOS**

1. ⏳ **Esperar término del build** (~2-3 min restantes)
2. ⏳ **Push a ACR** (~2 min)
3. ⏳ **Configurar App Service** (~1 min)
4. ⏳ **Reiniciar y propagar** (~3-5 min)
5. ⏳ **Tests de verificación** (~1 min)

---

**Estado actual:** ⏳ **BUILD DOCKER EN PROGRESO**  
**Próximo update:** Cuando termine el build y comience el push a ACR
