// 📁 test-flux-kontext-direct.js

const axios = require('axios');

async function testFluxKontextDirect() {
  console.log('🧪 Testing FLUX Kontext Direct to Foundry...\n');

  const apiKey = '7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS';
  const baseUrl = 'https://labsc-m9j5kbl9-eastus2.services.ai.azure.com';
  const deployment = 'FLUX.1-Kontext-pro';
  const apiVersion = '2025-04-01-preview';

  // Correct API structure for FLUX.1-Kontext-pro
  const payload = {
    model: deployment,
    prompt: "A photograph of a red fox in autumn forest, photorealistic style",
    n: 1,
    size: "1024x1024",
    response_format: "b64_json"
  };

  console.log('📝 Payload:', JSON.stringify(payload, null, 2));
  console.log('\n🌐 Endpoint:', `${baseUrl}/models/${deployment}/deployments/${deployment}/images/generations?api-version=${apiVersion}`);
  console.log('\n🔑 API Key:', apiKey.substring(0, 20) + '...');

  try {
    const response = await axios.post(
      `${baseUrl}/models/${deployment}/deployments/${deployment}/images/generations?api-version=${apiVersion}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': apiKey,
        },
      }
    );

    console.log('\n✅ SUCCESS!');
    console.log('\n📊 Response Status:', response.status);
    console.log('\n📦 Response Data:');
    
    if (response.data && response.data.data && response.data.data[0]) {
      console.log('\nImage URL:', response.data.data[0].url || 'N/A (using b64_json)');
      console.log('Base64 Length:', response.data.data[0].b64_json?.length || 'N/A');
      
      if (response.data.data[0].b64_json) {
        console.log('Base64 Sample (first 100 chars):', response.data.data[0].b64_json.substring(0, 100));
      }
    }

    console.log('\nFull Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('\n❌ ERROR!');
    console.log('\nError Message:', error.message);
    
    if (error.response) {
      console.log('\nStatus Code:', error.response.status);
      console.log('\nResponse Data:', JSON.stringify(error.response.data, null, 2));
      console.log('\nResponse Headers:', error.response.headers);
    } else if (error.request) {
      console.log('\nNo response received. Request:', error.request);
    } else {
      console.log('\nRequest Error:', error.message);
    }
  }
}

testFluxKontextDirect();
