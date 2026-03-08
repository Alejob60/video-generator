# Guía de Despliegue en Azure

## Descripción
Esta guía explica cómo construir y desplegar la aplicación a Azure usando los scripts proporcionados.

## Prerrequisitos
Antes de ejecutar los scripts, asegúrate de tener instalados los siguientes componentes:

1. **Node.js** (versión 20 o superior)
2. **Docker**
3. **Azure CLI**
4. **Credenciales de Azure** con permisos suficientes

## Scripts Disponibles

### 1. `rebuild-and-redeploy.ps1`
Script principal para reconstruir y redesplegar la aplicación.

#### Uso:
```powershell
./rebuild-and-redeploy.ps1
```

#### ¿Qué hace este script?
1. Limpia las compilaciones anteriores
2. Compila la aplicación usando `npm run build`
3. Construye la imagen Docker
4. Sube la imagen a Azure Container Registry
5. Reinicia la aplicación web en Azure
6. Verifica el estado de la aplicación

### 2. `check-azure-status.ps1`
Script para verificar el estado actual de la aplicación en Azure.

#### Uso:
```powershell
./check-azure-status.ps1
```

#### ¿Qué hace este script?
1. Verifica el grupo de recursos
2. Verifica la aplicación web
3. Verifica Azure Container Registry
4. Verifica el plan de App Service
5. Muestra información detallada de cada componente

### 3. `deploy-to-azure.ps1`
Script completo de despliegue (alternativa más detallada).

#### Uso:
```powershell
./deploy-to-azure.ps1
```

## Configuración

### Variables de Entorno
Asegúrate de tener configurado el archivo `.env` con todas las variables necesarias antes de desplegar.

### Azure CLI
Debes estar autenticado en Azure CLI. Si no lo estás, ejecuta:
```powershell
az login
```

## Proceso de Despliegue

### Paso 1: Verificar el estado actual
```powershell
./check-azure-status.ps1
```

### Paso 2: Reconstruir y redesplegar
```powershell
./rebuild-and-redeploy.ps1
```

### Paso 3: Verificar el despliegue
```powershell
./check-azure-status.ps1
```

## Información de la Aplicación

### Detalles de Azure
- **Grupo de recursos**: realculture-rg
- **Nombre de la aplicación**: video-converter
- **Azure Container Registry**: realcultureacr
- **Plan de App Service**: ASP-RealCulture (P1v3: 2)
- **Ubicación**: Canada Central
- **URL**: https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net

### Imagen Docker
- **Nombre**: video-generator
- **Tag**: latest
- **Imagen completa**: realcultureacr.azurecr.io/video-generator:latest

## Resolución de Problemas

### Problemas comunes

#### 1. Error de autenticación en Azure
```powershell
az login
```

#### 2. Error al construir la imagen Docker
Verifica que Docker esté ejecutándose y que tengas permisos suficientes.

#### 3. Error al subir la imagen a ACR
Verifica que estés autenticado en ACR:
```powershell
az acr login --name realcultureacr
```

#### 4. La aplicación no se reinicia correctamente
Verifica el estado de la aplicación:
```powershell
az webapp show --name video-converter --resource-group realculture-rg
```

### Verificación Manual

#### Verificar estado de la aplicación:
```powershell
az webapp show --name video-converter --resource-group realculture-rg --query "state" -o tsv
```

#### Verificar logs de la aplicación:
```powershell
az webapp log tail --name video-converter --resource-group realculture-rg
```

#### Verificar imagen en ACR:
```powershell
az acr repository show-tags --name realcultureacr --repository video-generator
```

## Monitoreo

### Verificar disponibilidad
La aplicación debería estar disponible en:
https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net

### Métricas
Puedes monitorear el rendimiento de la aplicación en Azure Portal.

## Notas Adicionales

1. **Tiempo de despliegue**: El proceso completo puede tardar entre 5-10 minutos.
2. **Tiempo de reinicio**: La aplicación puede tardar hasta 2 minutos en estar completamente disponible después del reinicio.
3. **Cache**: Es posible que necesites refrescar el navegador para ver los cambios.
4. **Logs**: Si encuentras problemas, revisa los logs de la aplicación en Azure Portal.