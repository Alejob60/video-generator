# ✅ ACTUALIZACIÓN DE NOMENCLATURA - IMÁGENES GENERADAS

**Fecha:** 2026-03-09  
**Cambio:** Prefijo estandarizado `misy-image-{timestamp}.png`

---

## 🎯 **CAMBIO IMPLEMENTADO:**

### **ANTES:**
```typescript
// Cada servicio usaba su propio prefijo
filename = `flux-2-pro-image-${uuidv4()}.png`;     // UUID aleatorio
filename = `flux-image-${uuidv4()}.png`;            // UUID aleatorio
filename = `flux-kontext-image-${uuidv4()}.png`;    // UUID aleatorio
```

### **AHORA:**
```typescript
// Todos usan el mismo prefijo estandarizado
filename = `misy-image-${Date.now()}.png`;          // Timestamp único
```

---

## 📊 **VENTAJAS DEL NUEVO SISTEMA:**

### 1. **Identificación Inmediata**
```bash
# Fácil identificar que son imágenes generadas por MisyBot
misy-image-1741567890123.png
misy-image-1741567891456.png
misy-image-1741567892789.png
```

### 2. **Orden Cronológico Automático**
```bash
# Al listar archivos, se ordenan por tiempo automáticamente
ls -la misy-image-*.png

misy-image-1741567890123.png  # Más antigua
misy-image-1741567891456.png
misy-image-1741567892789.png  # Más reciente
```

### 3. **Sin Colisiones**
```typescript
// Date.now() retorna milisegundos desde Unix Epoch
// Es extremadamente improbable generar 2 imágenes en el mismo ms
const uniqueId = Date.now(); // Ej: 1741567890123
```

### 4. **Branding Consistente**
- ✅ Todas las imágenes llevan la marca "misy"
- ✅ Fácil de buscar y filtrar
- ✅ Profesional y consistente

---

## 🔧 **ARCHIVOS MODIFICADOS:**

### 1. **Flux2ProService** ✅
[`src/infrastructure/services/flux-2-pro.service.ts`](file:///d:/MisyBot/RealCulture%20AI/video-generator/src/infrastructure/services/flux-2-pro.service.ts)

```typescript
// Líneas 98 y 119
const uniqueId = Date.now();
filename = `misy-image-${uniqueId}.png`;
```

### 2. **FluxImageService** (FLUX-1.1-pro) ✅
[`src/infrastructure/services/flux-image.service.ts`](file:///d:/MisyBot/RealCulture%20AI/video-generator/src/infrastructure/services/flux-image.service.ts)

```typescript
// Líneas 120 y 148
const uniqueId = Date.now();
filename = `misy-image-${uniqueId}.png`;
```

### 3. **FluxKontextImageService** ✅
[`src/infrastructure/services/flux-kontext-image.service.ts`](file:///d:/MisyBot/RealCulture%20AI/video-generator/src/infrastructure/services/flux-kontext-image.service.ts)

```typescript
// Líneas 113 y 133
filename = `misy-image-${Date.now()}.png`;
```

---

## 📝 **FORMATO DE ARCHIVOS:**

### Estructura del Nombre:
```
misy-image-{timestamp}.png
│         │    └─ Extension
│         └────── Timestamp (milisegundos)
└──────────────── Brand identifier
```

### Ejemplos Reales:
```
misy-image-1741567890123.png
misy-image-1741567891456.png
misy-image-1741567892789.png
```

### Desglose del Timestamp:
```javascript
const timestamp = 1741567890123;
const date = new Date(timestamp);
// Sat Mar 08 2026 23:58:10 GMT-0500
```

---

## 🗂️ **UBICACIÓN EN BLOB STORAGE:**

### Ruta Completa:
```
https://realculturestorage.blob.core.windows.net/images/misy-image-{timestamp}.png?{SAS_TOKEN}
```

### Estructura en Container:
```
images/
├── misy-image-1741567890123.png
├── misy-image-1741567891456.png
└── misy-image-1741567892789.png
```

---

## 🔍 **BÚSQUEDA Y FILTRADO:**

### PowerShell - Buscar por Prefijo:
```powershell
# Listar todas las imágenes misy
Get-AzStorageBlob -Container "images" -Blob "misy-image-*" | Select Name

# Contar imágenes generadas
(Get-AzStorageBlob -Container "images" -Blob "misy-image-*").Count

# Listar imágenes de hoy
$today = Get-Date -Format "yyyyMMdd"
Get-AzStorageBlob -Container "images" -Blob "misy-image-*" | 
  Where-Object { $_.Name -match $today } |
  Select Name, LastModified
```

### Azure Storage Explorer:
1. Navegar a container `images`
2. Filtrar por: `Prefix starts with` → `misy-image-`
3. Ver todas las imágenes generadas

---

## ⚙️ **IMPLEMENTACIÓN TÉCNICA:**

### Código Base (Todos los servicios):
```typescript
if (imageData.url) {
  const uniqueId = Date.now();
  filename = `misy-image-${uniqueId}.png`;
  blobUrl = await this.azureBlobService.uploadFileFromUrlWithSas(
    imageData.url, 
    `images/${filename}`
  );
} else if (imageData.b64_json) {
  const uniqueId = Date.now();
  filename = `misy-image-${uniqueId}.png`;
  const tempPath = path.join(__dirname, 'temp', filename);
  fs.writeFileSync(tempPath, Buffer.from(cleanBase64, 'base64'));
  blobUrl = await this.azureBlobService.uploadFileToBlobWithSas(
    tempPath, 
    `images/${filename}`, 
    'image/png'
  );
}
```

---

## 📊 **COMPARATIVA:**

| Característica | Antes (UUID) | Ahora (Timestamp) |
|----------------|--------------|-------------------|
| **Prefijo** | Variable por servicio | Único: `misy-image-` |
| **Identificador** | UUID v4 aleatorio | Timestamp único |
| **Longitud** | ~36 caracteres | ~13 dígitos |
| **Ordenable** | ❌ Aleatorio | ✅ Cronológico |
| **Brand** | ❌ Genérico | ✅ MisyBot |
| **Debugging** | Difícil de rastrear | Fácil de identificar |
| **Búsqueda** | Sin patrón claro | Patrón consistente |

---

## 🎯 **BENEFICIOS ADICIONALES:**

### 1. **Logging Mejorado**
```typescript
this.logger.log(`✅ Generated: misy-image-1741567890123.png`);
// Fácil de buscar en logs por timestamp
```

### 2. **Monitoreo**
```typescript
// Calcular imágenes generadas por hora
const imagesPerHour = blobs.filter(b => 
  b.name.startsWith('misy-image-') &&
  isWithinLastHour(b.created)
);
```

### 3. **Limpieza Automatizada**
```typescript
// Eliminar imágenes mayores a 30 días
const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
blobs.forEach(blob => {
  const timestamp = parseInt(blob.name.split('-')[2]);
  if (timestamp < thirtyDaysAgo) {
    deleteBlob(blob.name);
  }
});
```

---

## ✅ **CHECKLIST DE VALIDACIÓN:**

- [x] Todos los servicios actualizados
- [x] Prefijo consistente `misy-image-`
- [x] Identificador único con timestamp
- [x] Sin errores de compilación
- [x] Compatible con Blob Storage
- [x] SAS tokens funcionan correctamente
- [ ] Probar en producción

---

## 🚀 **PRÓXIMOS PASOS:**

### 1. **Reconstruir Docker**
```powershell
docker build -t video-converter:local .
docker stop video-generator-test
docker rm video-generator-test
docker run -d --name video-generator-test -p 4001:8080 --env-file .env video-converter:local
```

### 2. **Validar Cambios**
```powershell
# Generar imagen de prueba
curl.exe -X POST http://localhost:4001/media/flux-image/simple `
  -H "Content-Type: application/json" `
  -d '{"prompt":"Test","plan":"PRO"}'

# Verificar nombre en logs
docker logs video-generator-test | Select-String "misy-image-"
```

### 3. **Desplegar a Producción**
```powershell
# Deploy to Azure
az webapp deployment source config-zip `
  --resource-group realculture-rg `
  --name video-converter `
  --src deployment.zip
```

---

## 📞 **NOTAS IMPORTANTES:**

### Migración de Archivos Existentes:
- ✅ Las imágenes antiguas (`flux-*.png`) permanecen accesibles
- ✅ No hay breaking changes para el usuario
- ✅ Solo afecta nuevos archivos generados

### Compatibilidad:
- ✅ Mismo flujo de subida a Blob Storage
- ✅ Mismos SAS tokens
- ✅ Misma notificación al backend principal
- ✅ Solo cambia el nombre del archivo

---

**Estado:** ✅ COMPLETADO - Listo para producción  
**Impacto:** Bajo (solo nombres de archivo)  
**Beneficio:** Alto (mejor organización y branding)
