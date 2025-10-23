const axios = require('axios');

// Test FLUX API directly
async function testFluxApi() {
  const endpoint = 'https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX-1.1-pro/images/generations';
  const apiVersion = '2025-04-01-preview';
  const apiKey = process.env.FLUX_API_KEY || '7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS'; // You'll need to add this to your .env file
  const url = `${endpoint}?api-version=${apiVersion}`;
  
  const payload = {
    prompt: 'A beautiful sunset over the mountains',
    output_format: 'png',
    n: 1,
    size: '1024x1024'
  };

  try {
    console.log('📡 Sending request to FLUX-1.1-pro with payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      responseType: 'json'
    });

    console.log('📥 FLUX API Response Status:', response.status);
    console.log('📥 FLUX API Response Data:', JSON.stringify(response.data, null, 2));
    
    const imageData = response.data.data?.[0];
    if (!imageData) {
      throw new Error('No image data received from FLUX API');
    }

    // Log the structure of the response for debugging
    console.log('📊 FLUX API Response Structure - Keys:', Object.keys(imageData).join(', '));
    console.log('📊 FLUX API Response - Has URL:', !!imageData.url, 'Has b64_json:', !!imageData.b64_json);
    
    if (imageData.url) {
      console.log('🌐 FLUX provided direct URL, length:', imageData.url.length);
    }
    
    if (imageData.b64_json) {
      console.log('🔤 FLUX provided base64 data, length:', imageData.b64_json.length);
      // Log first 100 characters of base64 for debugging
      console.log('📋 Base64 sample (first 100 chars):', imageData.b64_json.substring(0, 100));
    }
  } catch (error) {
    console.error('❌ Error testing FLUX API:', error.response?.data || error.message);
  }
}

testFluxApi();