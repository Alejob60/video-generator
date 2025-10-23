const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test both the direct API call and our service implementation
async function compareFluxCalls() {
  console.log('=== FLUX API Call Comparison ===\n');
  
  // 1. Direct API call
  console.log('1. Testing Direct API Call...');
  try {
    const directResponse = await axios.post(
      'https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX-1.1-pro/images/generations?api-version=2025-04-01-preview',
      {
        prompt: 'A simple blue square',
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
    
    const directData = directResponse.data.data?.[0];
    console.log('   Direct API Response Structure:');
    console.log('   - Keys:', Object.keys(directData));
    console.log('   - Has URL:', !!directData.url);
    console.log('   - Has b64_json:', !!directData.b64_json);
    if (directData.b64_json) {
      console.log('   - Base64 length:', directData.b64_json.length);
    }
    
    // Save direct API image
    if (directData.b64_json) {
      const buffer = Buffer.from(directData.b64_json, 'base64');
      fs.writeFileSync('direct-api-image.png', buffer);
      console.log('   - Direct API image saved as direct-api-image.png');
    }
    
  } catch (error) {
    console.error('   Error with direct API call:', error.message);
  }
  
  // 2. Our service implementation
  console.log('\n2. Testing Our Service Implementation...');
  try {
    const serviceResponse = await axios.post('http://localhost:4000/media/flux-image', {
      prompt: 'A simple blue square',
      plan: 'PRO',
      size: '1024x1024'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   Service Response:');
    console.log('   - Success:', serviceResponse.data.success);
    console.log('   - Image URL:', serviceResponse.data.data.imageUrl);
    console.log('   - Filename:', serviceResponse.data.data.filename);
    
    // Download the image from our service
    const imageResponse = await axios.get(serviceResponse.data.data.imageUrl, {
      responseType: 'arraybuffer'
    });
    
    fs.writeFileSync('service-image.png', imageResponse.data);
    console.log('   - Service image saved as service-image.png');
    
  } catch (error) {
    console.error('   Error with service implementation:', error.message);
  }
  
  console.log('\n=== Comparison Complete ===');
}

compareFluxCalls();