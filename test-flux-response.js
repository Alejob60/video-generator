const axios = require('axios');

async function testFluxApiResponse() {
  const apiKey = process.env.FLUX_API_KEY;
  const endpoint = 'https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/flux-1.1-pro-hf/images/generations?api-version=2025-04-01-preview';
  
  if (!apiKey) {
    console.error('❌ FLUX_API_KEY no está configurada');
    return;
  }

  const payload = {
    prompt: "A beautiful sunset landscape",
    output_format: "png",
    n: 1,
    size: "1024x1024"
  };

  try {
    console.log('📡 Enviando solicitud a FLUX API...');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      responseType: 'json'
    });

    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Headers:', response.headers);
    console.log('📥 Response Data Structure:');
    console.log('   Keys:', Object.keys(response.data));
    console.log('   Full Response:', JSON.stringify(response.data, null, 2));
    
    // Verificar estructura específica
    if (response.data.data) {
      console.log('📊 Data array length:', response.data.data.length);
      if (response.data.data[0]) {
        console.log('📊 First item keys:', Object.keys(response.data.data[0]));
        console.log('📊 First item:', JSON.stringify(response.data.data[0], null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error calling FLUX API:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
    console.error('Error message:', error.message);
  }
}

testFluxApiResponse();