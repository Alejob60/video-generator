const axios = require('axios');

// URL de la aplicación desplegada
const BASE_URL = 'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net';

async function testEndpoint() {
  console.log('🚀 Probando endpoint de FLUX.1-Kontext-pro...');
  console.log(`📍 URL base: ${BASE_URL}`);
  
  try {
    // Primero, verifiquemos qué rutas están disponibles
    console.log('\n🔍 Verificando rutas disponibles...');
    
    // Intentar acceder al endpoint directamente
    console.log('\n📝 Probando endpoint POST /media/flux-kontext-image');
    const response = await axios.post(`${BASE_URL}/media/flux-kontext-image`, {
      prompt: 'Test image',
      plan: 'PRO'
    }, {
      timeout: 10000
    });
    
    console.log('✅ Éxito:');
    console.log('   Estado:', response.status);
    console.log('   Datos:', response.data);
    
  } catch (error) {
    console.error('❌ Error:');
    if (error.response) {
      console.error('   Estado:', error.response.status);
      console.error('   Datos:', error.response.data);
      console.error('   Headers:', error.response.headers);
    } else if (error.request) {
      console.error('   No se recibió respuesta del servidor');
      console.error('   Error:', error.message);
    } else {
      console.error('   Error:', error.message);
    }
    
    // También probemos una ruta que sabemos que existe
    console.log('\n🔄 Probando ruta conocida /health');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`, {
        timeout: 10000
      });
      console.log('✅ Ruta /health funciona:');
      console.log('   Estado:', healthResponse.status);
      console.log('   Datos:', healthResponse.data);
    } catch (healthError) {
      console.error('❌ Error en ruta /health:');
      if (healthError.response) {
        console.error('   Estado:', healthError.response.status);
        console.error('   Datos:', healthError.response.data);
      }
    }
  }
}

// Ejecutar la prueba
testEndpoint();