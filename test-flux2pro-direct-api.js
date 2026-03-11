// Test directo a FLUX 2 Pro API
const axios = require('axios');
require('dotenv').config();

const endpoint = process.env.FLUX_2_PRO_ENDPOINT;
const apiKey = process.env.FLUX_2_PRO_API_KEY;

console.log('🔍 Testing FLUX 2 Pro API directly...\n');
console.log('Endpoint:', endpoint);
console.log('API Key present:', !!apiKey);
console.log('\n');

const payload = {
  model: 'FLUX.2-pro',
  prompt: 'A photograph of a red fox in an autumn forest',
  width: 1024,
  height: 1024,
  n: 1,
};

console.log('📤 Payload:', JSON.stringify(payload, null, 2));
console.log('\n');

axios.post(endpoint, payload, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
})
.then(response => {
  console.log('✅ SUCCESS! Status:', response.status);
  console.log('\n📥 Response keys:', Object.keys(response.data).join(', '));
  
  // Check response structure
  if (response.data.choices && response.data.choices.length > 0) {
    console.log('\n🖼️  Found choices array with', response.data.choices.length, 'items');
    const firstChoice = response.data.choices[0];
    console.log('   First choice keys:', Object.keys(firstChoice).join(', '));
    
    if (firstChoice.b64_json) {
      console.log('   ✅ Has b64_json! Length:', firstChoice.b64_json.length);
      console.log('   Preview:', firstChoice.b64_json.substring(0, 50) + '...');
    } else if (firstChoice.url) {
      console.log('   ✅ Has URL!', firstChoice.url);
    } else {
      console.log('   ❌ No image data found');
      console.log('   Full choice:', JSON.stringify(firstChoice, null, 2).substring(0, 500));
    }
  } else if (response.data.data && response.data.data.length > 0) {
    console.log('\n🖼️  Found data array with', response.data.data.length, 'items');
    const firstData = response.data.data[0];
    console.log('   First data keys:', Object.keys(firstData).join(', '));
    
    if (firstData.b64_json) {
      console.log('   ✅ Has b64_json! Length:', firstData.b64_json.length);
    } else if (firstData.url) {
      console.log('   ✅ Has URL!', firstData.url);
    }
  } else {
    console.log('❌ Unexpected response structure');
    console.log('Full response:', JSON.stringify(response.data, null, 2).substring(0, 1000));
  }
})
.catch(error => {
  console.error('❌ ERROR:', error.message);
  if (error.response) {
    console.error('\n📊 Status:', error.response.status);
    console.error('📄 Response:', JSON.stringify(error.response.data, null, 2).substring(0, 500));
  } else if (error.request) {
    console.error('📡 No response received');
  } else {
    console.error('⚙️  Request error:', error.message);
  }
});
