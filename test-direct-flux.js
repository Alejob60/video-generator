const axios = require('axios');

async function testDirectFluxAPI() {
  try {
    const response = await axios.post(
      'https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX-1.1-pro/images/generations?api-version=2025-04-01-preview',
      {
        prompt: 'A photograph of a red fox in an autumn forest',
        output_format: 'png',
        n: 1,
        size: '1024x1024'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS'
        }
      }
    );
    
    console.log('Direct FLUX API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check the structure of the response
    const imageData = response.data.data?.[0];
    if (imageData) {
      console.log('\nResponse Structure:');
      console.log('- Keys:', Object.keys(imageData));
      console.log('- Has URL:', !!imageData.url);
      console.log('- Has b64_json:', !!imageData.b64_json);
      
      if (imageData.b64_json) {
        console.log('- Base64 length:', imageData.b64_json.length);
        console.log('- Base64 sample (first 100 chars):', imageData.b64_json.substring(0, 100));
      }
    }
  } catch (error) {
    console.error('Error calling FLUX API directly:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

testDirectFluxAPI();