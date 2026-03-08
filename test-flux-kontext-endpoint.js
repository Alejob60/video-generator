const axios = require('axios');
const fs = require('fs');
const path = require('path');

// URL de la aplicación desplegada
const BASE_URL = 'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net';

async function testFluxKontextEndpoint() {
  console.log('🚀 Probando el nuevo endpoint de FLUX.1-Kontext-pro...');
  console.log(`📍 URL base: ${BASE_URL}`);
  
  try {
    // Test 1: Generación de imagen sin imagen de referencia
    console.log('\n📝 Test 1: Generación de imagen sin imagen de referencia');
    const response1 = await axios.post(`${BASE_URL}/media/flux-kontext-image`, {
      prompt: 'A beautiful sunset over the mountains',
      plan: 'PRO',
      size: '1024x1024'
    }, {
      timeout: 30000 // 30 segundos de timeout
    });
    
    console.log('✅ Respuesta recibida:');
    console.log('   Estado:', response1.status);
    console.log('   Mensaje:', response1.data.message);
    console.log('   URL de imagen:', response1.data.data?.imageUrl);
    console.log('   Prompt usado:', response1.data.data?.prompt);
    
    // Test 2: Generación de imagen con prompt JSON
    console.log('\n📝 Test 2: Generación de imagen con prompt JSON');
    const jsonPrompt = {
      subject: "futuristic cityscape",
      style: "cyberpunk",
      mood: "neon lit",
      details: "flying cars, holographic advertisements, rain-slicked streets"
    };
    
    const response2 = await axios.post(`${BASE_URL}/media/flux-kontext-image`, {
      prompt: JSON.stringify(jsonPrompt),
      plan: 'PRO',
      size: '1024x1024',
      isJsonPrompt: true
    }, {
      timeout: 30000 // 30 segundos de timeout
    });
    
    console.log('✅ Respuesta recibida:');
    console.log('   Estado:', response2.status);
    console.log('   Mensaje:', response2.data.message);
    console.log('   URL de imagen:', response2.data.data?.imageUrl);
    console.log('   Prompt procesado:', response2.data.data?.prompt);
    
    console.log('\n🎉 ¡Todos los tests se completaron exitosamente!');
    console.log('   El endpoint de FLUX.1-Kontext-pro está funcionando correctamente.');
    
  } catch (error) {
    console.error('❌ Error en la prueba:');
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
  }
}

// Ejecutar la prueba
testFluxKontextEndpoint();