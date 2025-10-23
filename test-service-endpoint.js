const axios = require('axios');

async function testServiceEndpoint() {
  console.log('Testing service endpoint...\n');
  
  try {
    const response = await axios.post('http://localhost:4000/media/flux-image', {
      prompt: 'A simple red circle',
      plan: 'PRO'
    });
    
    console.log('✅ Service endpoint test successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Service endpoint test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

testServiceEndpoint();