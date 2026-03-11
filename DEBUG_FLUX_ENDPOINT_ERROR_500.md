# 🐛 DEBUGGING FLUX ENDPOINT - ERROR 500

## ✅ **CONFIRMADO:**
- ✅ Foundry Directo: **FUNCIONA** (tu curl generó la imagen)
- ❌ Nuestro endpoint `/media/flux-kontext/image`: **ERROR 500**

---

## 🔍 **POSIBLES CAUSAS:**

### **1. Variables de Entorno NO Aplicadas**
Las variables están en Azure pero el código no las está leyendo correctamente.

**Verificación requerida:**
```bash
az webapp config appsettings list --name video-converter --resource-group realculture-rg \
  --query "[?contains(name, 'FLUX_KONTEXT')].{name:name,value:value}" -o table
```

### **2. Error en el Código Durante la Ejecución**
Posibles errores:
- API Key no se está pasando correctamente
- URL mal construida
- Error al leer `MAIN_BACKEND_URL` para notificación
- Error en fallback a DALL-E

### **3. Problema con MAIN_BACKEND_URL**
El servicio intenta notificar a `MAIN_BACKEND_URL` después de generar la imagen. Si esa URL no es accesible o falla, puede causar error 500.

---

## 🔧 **SOLUCIÓN PROPUESTA:**

### **Opción A: Remover Notificación al Backend Temporalmente**

Modificar `flux-kontext-image.service.ts` para hacer **SOLO generación** sin notificación:

```typescript
// Línea 159-168: Comentar notificación al backend
/*
await fetch(`${this.backendUrl}/flux-kontext-image/complete`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,
    prompt: finalPrompt,
    imageUrl: blobUrl,
    filename,
  }),
});
*/
```

### **Opción B: Configurar MAIN_BACKEND_URL Correctamente**

```bash
az webapp config appsettings set \
  --resource-group realculture-rg \
  --name video-converter \
  --settings MAIN_BACKEND_URL="https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net"
```

---

## 🧪 **TEST CON MAIN_BACKEND_URL CORREGIDO:**

Ejecuta este comando y luego prueba el endpoint:

```powershell
# Actualizar MAIN_BACKEND_URL
az webapp config appsettings set `
  --resource-group realculture-rg `
  --name video-converter `
  --settings MAIN_BACKEND_URL="https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net"

# Reiniciar
az webapp restart --name video-converter --resource-group realculture-rg

# Esperar 30 segundos
Start-Sleep -Seconds 30

# Testear
$body = Get-Content "test-flux-direct.json" -Raw
Invoke-WebRequest -Uri "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-kontext/image" `
  -Method POST -Body $body -ContentType "application/json" | Select-Object -ExpandProperty Content
```

---

## 📋 **VARIABLES ACTUALES EN AZURE:**

Según verificación anterior:
```
FLUX_KONTEXT_PRO_BASE_URL=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com
FLUX_KONTEXT_PRO_DEPLOYMENT=FLUX.1-Kontext-pro
FLUX_KONTEXT_PRO_API_VERSION=2025-04-01-preview
FLUX_KONTEXT_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS
MAIN_BACKEND_URL=http://localhost:3000  ← ⚠️ ESTO ESTÁ MAL!
```

**PROBLEMA:** `MAIN_BACKEND_URL=http://localhost:3000` apunta a localhost, NO al servicio en Azure!

---

## ✅ **SOLUCIÓN FINAL:**

```powershell
# 1. Corregir MAIN_BACKEND_URL
az webapp config appsettings set `
  --resource-group realculture-rg `
  --name video-converter `
  --settings MAIN_BACKEND_URL="https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net"

# 2. Reiniciar
az webapp restart --name video-converter --resource-group realculture-rg

# 3. Esperar 60 segundos
Start-Sleep -Seconds 60

# 4. Testear
$body = @{prompt="A red fox in autumn forest"; plan="PRO"; enhancePrompt=$false} | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-kontext/image" `
        -Method POST -Body $body -ContentType "application/json" | Select-Object -ExpandProperty Content
    Write-Host "✅ SUCCESS: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: $_" -ForegroundColor Red
}
```

---

## 🎯 **RESUMEN:**

**Causa raíz identificada:** `MAIN_BACKEND_URL` incorrecta causando fallo en notificación post-generación.

**Solución:** Actualizar `MAIN_BACKEND_URL` a la URL correcta del App Service en Azure.

**Próximo paso:** Ejecutar comandos arriba y testear.
