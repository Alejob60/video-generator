const axios = require('axios');

async function testFluxEndpoint() {
  try {
    const response = await axios.post('http://localhost:4000/media/flux-image', {
      prompt: 'A beautiful sunset over the mountains',
      plan: 'PRO'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testFluxEndpoint();