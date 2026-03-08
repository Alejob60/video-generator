// 📁 test-flux-correction.js
const axios = require('axios');

async function testFluxCorrection() {
  console.log('🧪 PRUEBA DE CORRECCIÓN FLUX.1-KONTENT-PRO');
  console.log('=' .repeat(50));

  const testPayload = {
    prompt: "A beautiful landscape with mountains and sunset",
    isJsonPrompt: false,
    plan: "PRO"
  };

  console.log('📤 Payload de prueba:');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('-'.repeat(30));

  try {
    const response = await axios.post('http://localhost:8080/media/flux-kontext-image-v2', testPayload, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ RESPUESTA EXITOSA:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ ERROR EN LA PRUEBA:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

testFluxCorrection();