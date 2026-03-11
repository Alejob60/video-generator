# 🚀 DEPLOY TO AZURE - KUDU API (SIN AZURE CLI)

## ⚡ **DEPLOY INMEDIATO USANDO ZIP DEPLOY API**

### **Opción 1: PowerShell con Publish-AzWebApp**

```powershell
# Requiere módulo Az (más fácil que Azure CLI)
Install-Module -Name Az -Scope CurrentUser -Repository PSGallery -Force

# Login
Connect-AzAccount

# Deploy
Publish-AzWebApp `
  -ResourceGroupName realculture-rg `
  -Name video-converter `
  -ArchivePath deployment.zip `
  -Force
```

---

### **Opción 2: CURL DIRECTO A KUDU API**

```powershell
# Credenciales (necesitas username/password del FTP)
$username = "video-converter\$video-converter"
$password = "TU_PASSWORD_AQUI"

# Crear header de autenticación
$pair = "$($username):$($password)"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$encoded = [Convert]::ToBase64String($bytes)
$headers = @{
    "Authorization" = "Basic $encoded"
    "Content-Type" = "application/zip"
}

# Hacer deploy
Invoke-RestMethod `
  -Uri "https://video-converter.scm.azurewebsites.net/api/zipdeploy" `
  -Method POST `
  -InFile .\deployment.zip `
  -Headers $headers
```

---

### **Opción 3: GIT DEPLOYMENT**

Si tienes configured local git:

```bash
git add .
git commit -m "Deploy FLUX Kontext with fallback"
git push azure main
```

---

### **Opción 4: MANUAL DESDE PORTAL**

1. Ir a: https://portal.azure.com/#@/resource/subscriptions/a466ea69-1312-4361-95e1-f1c8524bea91/resourceGroups/realculture-rg/providers/Microsoft.Web/sites/video-converter

2. **Deployment Center** (menú izquierdo)

3. **Settings** → **Source**: 
   - Opción A: **Zip Deploy**
   - Subir `deployment.zip`
   
   - Opción B: **Local Git**
   - Clonar y hacer push

4. **Apply**

---

## 🔑 **OBTENER CREDENTIALS PARA KUDU API**

### **PowerShell:**

```powershell
# Obtener publish profile
az webapp deployment list-publishing-profiles `
  --name video-converter `
  --resource-group realculture-rg `
  --xml > publish.xml

# Extraer username y password del XML
```

### **O desde Portal:**

1. Azure Portal → video-converter
2. **Get publish profile**
3. Buscar `userPWD` en el archivo descargado

---

## 📦 **SCRIPT RECOMENDADO (ZIP DEPLOY CON CURL)**

Crear `deploy-simple.ps1`:

```powershell
Write-Host "🚀 Deploying to Azure via Kudu API..." -ForegroundColor Cyan

# Config
$resourceGroup = "realculture-rg"
$appName = "video-converter"
$kuduUrl = "https://$appName.scm.azurewebsites.net/api/zipdeploy"

# Get credentials from publish profile
Write-Host "📥 Downloading publish profile..." -ForegroundColor Yellow
az webapp deployment list-publishing-profiles `
  --name $appName `
  --resource-group $resourceGroup `
  --output publish-profile.json 2>$null

if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Azure CLI not available. Please install from: https://aka.ms/installazurecliwindows" -ForegroundColor Red
  Write-Host "`n📝 Alternative: Deploy manually from Azure Portal:" -ForegroundColor Yellow
  Write-Host "   1. Go to: https://portal.azure.com/#@/resource/subscriptions/a466ea69-1312-4361-95e1-f1c8524bea91/resourceGroups/realculture-rg/providers/Microsoft.Web/sites/video-converter" -NoNewline
  Write-Host "   2. Click 'Deployment Center'" -NoNewline
  Write-Host "   3. Upload deployment.zip" -ForegroundColor Cyan
  exit 1
}

# Parse credentials
$publishProfile = Get-Content publish-profile.json | ConvertFrom-Json
$username = $publishProfile.userName
$password = $publishProfile.userPWD

Write-Host "🔐 Using username: $username" -ForegroundColor Gray

# Create auth header
$pair = "$($username):$($password)"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$encoded = [Convert]::ToBase64String($bytes)
$headers = @{
    "Authorization" = "Basic $encoded"
    "Content-Type" = "application/zip"
}

# Deploy
Write-Host "📦 Uploading deployment.zip..." -ForegroundColor Cyan
try {
  Invoke-RestMethod `
    -Uri $kuduUrl `
    -Method POST `
    -InFile .\deployment.zip `
    -Headers $headers
    
  Write-Host "`n✅ DEPLOY COMPLETED!" -ForegroundColor Green
  Write-Host "⏳ Waiting 2-3 minutes for changes to propagate..." -ForegroundColor Yellow
  
  # Restart app
  Write-Host "🔄 Restarting app service..." -ForegroundColor Yellow
  az webapp restart `
    --name $appName `
    --resource-group $resourceGroup `
    --output none
  
  Write-Host "`n🌐 Application URL:" -ForegroundColor Cyan
  Write-Host "   https://$appName.azurewebsites.net" -ForegroundColor White
  
  Write-Host "`n🧪 Test endpoints:" -ForegroundColor Cyan
  Write-Host "   DALL-E: curl -X POST 'https://$appName.azurewebsites.net/media/image' -H 'Content-Type: application/json' -d '{`"prompt`":`"test`",`"plan`":`"FREE`"}'" -ForegroundColor Gray
  Write-Host "   FLUX:   curl -X POST 'https://$appName.azurewebsites.net/media/flux-kontext/image' -H 'Content-Type: application/json' -d '{`"prompt`":`"test`",`"plan`":`"PRO`"}'" -ForegroundColor Gray
  
} catch {
  Write-Host "`n❌ Deploy failed: $_" -ForegroundColor Red
  Write-Host "`n💡 Try manual deploy from Azure Portal" -ForegroundColor Yellow
}

# Cleanup
Remove-Item publish-profile.json -ErrorAction SilentlyContinue
```

---

## 🎯 **EJECUCIÓN RÁPIDA:**

### **Paso 1: Instalar Azure CLI (si no lo tienes)**

Descargar e instalar:
https://aka.ms/installazurecliwindows

### **Paso 2: Ejecutar script**

```powershell
.\deploy-simple.ps1
```

---

## ⚠️ **SI NADA FUNCIONA - DEPLOY MANUAL**

### **Desde Azure Portal:**

1. **Ir al App Service:**
   https://portal.azure.com/#@/resource/subscriptions/a466ea69-1312-4361-95e1-f1c8524bea91/resourceGroups/realculture-rg/providers/Microsoft.Web/sites/video-converter

2. **Deployment Center** (izquierda)

3. **Deployment Options:**
   - Source: **Zip Deploy**
   - Click **"Browse"**
   - Seleccionar `deployment.zip`
   - Click **"OK"**

4. **Esperar 2-3 minutos**

5. **Testear:**
   ```bash
   curl https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/health
   ```

---

## 📊 **STATUS ESPERADO:**

```
✅ Build completed
✅ deployment.zip created (size: ~XX MB)
⏳ Deploy in progress...
⏳ App restarting...
✅ Deploy completed!
🌐 URL: https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net
```

---

**Recomendación:** Usar script `deploy-simple.ps1` o deploy manual desde portal si Azure CLI no está disponible.
