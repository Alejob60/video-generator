# Configuración de Variables de Entorno para FLUX.1-Kontext-pro

## Descripción
Este documento explica cómo configurar las variables de entorno necesarias para el funcionamiento del nuevo endpoint FLUX.1-Kontext-pro.

## Variables de Entorno Requeridas

### FLUX.1-Kontext-pro
```env
# Endpoint para generación de imágenes
ENDPOINT_FLUX_KONTENT_PRO=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview

# Clave API para autenticación
ENDPOINT_FLUX_KONTENT_PRO_API_KEY=7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS
```

### Otras Variables Requeridas
```env
# URL del backend principal para notificaciones
MAIN_BACKEND_URL=https://tu-backend-principal.azurewebsites.net
```

## Configuración

### 1. Crear el archivo .env
Crea un archivo llamado `.env` en la raíz del proyecto si aún no existe.

### 2. Agregar las variables
Agrega las siguientes líneas al archivo `.env`:

```env
ENDPOINT_FLUX_KONTENT_PRO=https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview
ENDPOINT_FLUX_KONTENT_PRO_API_KEY=tu-clave-api-aqui
MAIN_BACKEND_URL=https://tu-backend-principal.azurewebsites.net
```

### 3. Verificar la configuración
Puedes verificar que las variables estén correctamente configuradas ejecutando:

```bash
node test-env-variables.js
```

O en PowerShell:

```powershell
./test-flux-kontext-env.ps1
```

## Pruebas

### Verificación de Variables
El script `test-env-variables.js` verificará que todas las variables necesarias estén configuradas correctamente.

### Prueba de Funcionalidad
Una vez configuradas las variables, puedes probar el endpoint con:

```bash
node example-flux-kontext-request.js
```

O usando los scripts de PowerShell:

```powershell
./test-flux-kontext-generation.ps1
./test-flux-kontext-with-reference.ps1
```

## Notas de Seguridad

1. **Nunca** commitees el archivo `.env` al repositorio
2. Asegúrate de que el archivo `.env` esté en `.gitignore`
3. Usa variables de entorno diferentes para entornos de desarrollo, staging y producción
4. Rota las claves API periódicamente

## Problemas Comunes

### Variables No Configuradas
Si olvidas configurar alguna variable, recibirás un mensaje de error indicando cuál falta.

### Errores de Autenticación
Si la clave API no es válida, recibirás errores de autenticación al intentar usar el endpoint.

### Problemas de Conectividad
Verifica que el endpoint sea accesible desde tu entorno de ejecución.