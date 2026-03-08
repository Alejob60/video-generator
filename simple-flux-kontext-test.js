const axios = require('axios');

// Test FLUX.1-Kontext-pro endpoint
async function testFluxKontext() {
  try {
    console.log('Testing FLUX.1-Kontext-pro endpoint...');
    
    // Test 1: Regular image generation
    console.log('\n1. Testing regular image generation...');
    const response1 = await axios.post('http://localhost:3000/media/flux-kontext-image', {
      prompt: 'A beautiful landscape with mountains and lakes',
      plan: 'CREATOR',
      size: '1024x1024'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success! Response:', response1.data);
    
    console.log('\n✅ FLUX.1-Kontext-pro endpoint testing completed!');
  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
  }
}

testFluxKontext();