const axios = require('axios');
const fs = require('fs');

async function testBase64Decode() {
  const endpoint = 'https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX-1.1-pro/images/generations';
  const apiVersion = '2025-04-01-preview';
  const apiKey = '7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS';
  
  const url = `${endpoint}?api-version=${apiVersion}`;
  const payload = {
    prompt: 'A simple blue square',
    output_format: 'png',
    n: 1,
    size: '1024x1024'
  };
  
  console.log('Testing base64 decoding from FLUX API...\n');
  
  try {
    // Get image data from FLUX API
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const imageData = response.data.data?.[0];
    if (!imageData) {
      throw new Error('No image data received');
    }
    
    console.log('📊 FLUX API Response:');
    console.log('- Keys:', Object.keys(imageData));
    console.log('- Has URL:', !!imageData.url);
    console.log('- Has b64_json:', !!imageData.b64_json);
    
    if (imageData.b64_json) {
      console.log('- Base64 length:', imageData.b64_json.length);
      
      // Validate base64 format
      const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(imageData.b64_json);
      console.log('- Base64 validation:', isValidBase64 ? 'Valid' : 'Invalid');
      
      // Decode base64 to buffer
      const buffer = Buffer.from(imageData.b64_json, 'base64');
      console.log('- Decoded buffer size:', buffer.length, 'bytes');
      
      // Check PNG header
      const pngHeader = buffer.slice(0, 8);
      const expectedHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const isPng = pngHeader.equals(expectedHeader);
      console.log('- PNG header validation:', isPng ? 'Valid PNG' : 'Invalid PNG header');
      console.log('- PNG header bytes:', pngHeader.toString('hex').toUpperCase());
      
      // Save the image
      fs.writeFileSync('test-decoded-image.png', buffer);
      console.log('- Image saved as test-decoded-image.png');
      
      // Verify file size
      const stats = fs.statSync('test-decoded-image.png');
      console.log('- Saved file size:', stats.size, 'bytes');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testBase64Decode();