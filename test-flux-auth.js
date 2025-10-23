const axios = require('axios');

// Test both authentication methods
async function testAuthMethods() {
  const endpoint = 'https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX-1.1-pro/images/generations';
  const apiVersion = '2025-04-01-preview';
  const apiKey = '7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS'; // FLUX_API_KEY from .env
  
  const url = `${endpoint}?api-version=${apiVersion}`;
  const payload = {
    prompt: 'A simple blue square',
    output_format: 'png',
    n: 1,
    size: '1024x1024'
  };
  
  console.log('Testing FLUX API authentication methods...\n');
  
  // Method 1: Authorization Bearer (current implementation)
  console.log('1. Testing Authorization: Bearer method...');
  try {
    const response1 = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    console.log('   ✅ Success - Status:', response1.status);
    console.log('   📊 Response keys:', Object.keys(response1.data.data?.[0] || {}));
  } catch (error) {
    console.log('   ❌ Failed:', error.response?.status, error.response?.data?.error?.message || error.message);
  }
  
  // Method 2: Api-Key header (from Python example)
  console.log('\n2. Testing Api-Key header method...');
  try {
    const response2 = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey
      }
    });
    console.log('   ✅ Success - Status:', response2.status);
    console.log('   📊 Response keys:', Object.keys(response2.data.data?.[0] || {}));
  } catch (error) {
    console.log('   ❌ Failed:', error.response?.status, error.response?.data?.error?.message || error.message);
  }
  
  // Method 3: Ocp-Apim-Subscription-Key header (alternative)
  console.log('\n3. Testing Ocp-Apim-Subscription-Key header method...');
  try {
    const response3 = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey
      }
    });
    console.log('   ✅ Success - Status:', response3.status);
    console.log('   📊 Response keys:', Object.keys(response3.data.data?.[0] || {}));
  } catch (error) {
    console.log('   ❌ Failed:', error.response?.status, error.response?.data?.error?.message || error.message);
  }
}

testAuthMethods();