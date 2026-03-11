# 🚀 DEPLOY AUTOMÁTICO - SIN AZURE CLI

## ⚠️ **AZURE CLI NO DISPONIBLE**

Azure CLI no está instalado en este sistema.

---

## 🎯 **SOLUCIONES RÁPIDAS**

### **Opción A: Instalar Azure CLI (5 minutos)**

1. **Descargar:**
   https://aka.ms/installazurecliwindows

2. **Instalar:**
   ```powershell
   Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile .\AzureCLI.msi
   Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'
   ```

3. **Reiniciar terminal y ejecutar:**
   ```powershell
   az webapp deployment source config-zip `
     --resource-group realculture-rg `
     --name video-converter `
     --src deployment.zip
   
   az webapp restart --name video-converter --resource-group realculture-rg
   ```

---

### **Opción B: Deploy Manual desde Portal (2 minutos)**

1. **Abrir Azure Portal:**
   https://portal.azure.com/#@/resource/subscriptions/a466ea69-1312-4361-95e1-f1c8524bea91/resourceGroups/realculture-rg/providers/Microsoft.Web/sites/video-converter

2. **Deployment Center:**
   - Click **"Deployment Center"** en el menú izquierdo

3. **Zip Deploy:**
   - Settings → Source: **Zip deploy**
   - Click **"Browse"**
   - Seleccionar: `deployment.zip`
   - Click **"OK"**

4. **Esperar 2-3 minutos**

5. **Testear:**
   ```bash
   curl https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/health
   ```

---

### **Opción C: Usar PowerShell Az Module**

```powershell
# Instalar módulo Az
Install-Module -Name Az -Scope CurrentUser -Force

# Login
Connect-AzAccount

# Deploy
Publish-AzWebApp `
  -ResourceGroupName realculture-rg `
  -Name video-converter `
  -ArchivePath .\deployment.zip `
  -Force
```

---

## 📦 **DEPLOYMENT PACKAGE LISTO**

✅ **Archivo creado:** `deployment.zip`  
📊 **Tamaño estimado:** ~50-100 MB  
📁 **Contenido:** Todo el código compilado en `dist/`

---

## 🔍 **VERIFICACIÓN POST-DEPLOY**

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
  -d '{"prompt":"A red apple","plan":"FREE"}'
```

### **Test FLUX Kontext:**
```bash
curl -X POST "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-kontext/image" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A red fox in autumn forest","plan":"PRO","size":"1024x1024"}'
```

---

## 💡 **RECOMENDACIÓN INMEDIATA**

**Usar Opción B (Deploy Manual)** - Es la más rápida:

1. Abrir portal: https://portal.azure.com/#home
2. Buscar "video-converter"
3. Deployment Center → Zip Deploy
4. Subir `deployment.zip`
5. Esperar 2-3 minutos
6. ✅ Listo!

---

## 📊 **ESTADO ACTUAL**

| Item | Estado |
|------|--------|
| **Build** | ✅ Completado |
| **deployment.zip** | ✅ Creado |
| **Azure CLI** | ❌ No disponible |
| **Deploy** | ⏳ Pendiente |
| **Método recomendado** | Manual desde Portal |

---

## 🚀 **TIMELINE ESTIMADO**

```
[✅] Build local: 1 min
[✅] Package zip: 10 sec
[⏳] Deploy manual: 2-3 min
[⏳] Propagación: 2-3 min
[⏳] Tests: 1 min

TOTAL: ~8-10 minutos
```

---

**Próximo paso:** Elegir Opción B (Deploy Manual) o instalar Azure CLI para automatizar.
