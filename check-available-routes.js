const axios = require('axios');

// URL de la aplicación desplegada
const BASE_URL = 'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net';

async function checkAvailableRoutes() {
  console.log('🚀 Verificando rutas disponibles en la aplicación...');
  console.log(`📍 URL base: ${BASE_URL}`);
  
  // Lista de rutas comunes que podrían estar disponibles
  const routesToCheck = [
    '/', 
    '/health',
    '/status',
    '/videos',
    '/videos/health',
    '/videos/generate',
    '/media/image',
    '/media/flux-image',
    '/media/flux-image/dual',
    '/audio',
    '/audio/generate',
    '/llm',
    '/llm/generate-json',
    '/media/flux-kontext-image'
  ];
  
  for (const route of routesToCheck) {
    try {
      const url = `${BASE_URL}${route}`;
      console.log(`\n🔍 Verificando ${url}...`);
      
      // Intentar diferentes métodos HTTP
      const methods = ['GET', 'POST', 'HEAD'];
      let routeFound = false;
      
      for (const method of methods) {
        try {
          const response = await axios({
            method: method,
            url: url,
            timeout: 5000,
            validateStatus: () => true // No lanzar error por códigos de estado no exitosos
          });
          
          if (response.status !== 404 && response.status !== 405) {
            console.log(`   ✅ ${method} ${route} - Estado: ${response.status}`);
            if (response.data && typeof response.data === 'object') {
              console.log(`      Datos:`, JSON.stringify(response.data, null, 2));
            }
            routeFound = true;
            break;
          }
        } catch (error) {
          // Ignorar errores de timeout o conexión
        }
      }
      
      if (!routeFound) {
        console.log(`   ❌ ${route} no encontrado (404)`);
      }
    } catch (error) {
      console.log(`   ❌ Error al verificar ${route}: ${error.message}`);
    }
  }
  
  console.log('\n✅ Verificación de rutas completada.');
}

// Ejecutar la verificación
checkAvailableRoutes();