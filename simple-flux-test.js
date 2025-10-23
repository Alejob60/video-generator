const axios = require('axios');
const fs = require('fs');

async function testFluxService() {
  console.log('Testing FLUX service...');
  
  try {
    // Test our service
    const response = await axios.post('http://localhost:4000/media/flux-image', {
      prompt: 'A simple blue square',
      plan: 'PRO'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Service Response:');
    console.log('- Success:', response.data.success);
    console.log('- Message:', response.data.message);
    console.log('- Image URL:', response.data.data.imageUrl);
    
    // Download and save the image
    const imageResponse = await axios.get(response.data.data.imageUrl, {
      responseType: 'arraybuffer'
    });
    
    fs.writeFileSync('test-service-image.png', imageResponse.data);
    console.log('- Image saved as test-service-image.png');
    
    // Check file size
    const stats = fs.statSync('test-service-image.png');
    console.log('- File size:', stats.size, 'bytes');
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testFluxService();