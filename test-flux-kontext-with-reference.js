const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Test FLUX.1-Kontext-pro endpoint with reference image
async function testFluxKontextWithReference() {
  try {
    console.log('Testing FLUX.1-Kontext-pro endpoint with reference image...');
    
    // First, create a simple test image (1x1 pixel PNG)
    const testImagePath = 'test-ref-image.png';
    const imageBytes = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00, 
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0xDA, 0x63, 0x60, 0x00, 0x00, 0x00, 
      0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(testImagePath, imageBytes);
    
    // Create form data
    const form = new FormData();
    form.append('referenceImage', fs.createReadStream(testImagePath));
    form.append('dto', JSON.stringify({
      prompt: 'A beautiful landscape with mountains and lakes, in the style of the reference image',
      plan: 'CREATOR',
      size: '1024x1024'
    }));
    
    console.log('\n1. Testing image generation with reference image...');
    const response = await axios.post('http://localhost:3000/media/flux-kontext-image', form, {
      headers: {
        ...form.getHeaders()
      }
    });
    
    console.log('✅ Success! Response:', response.data);
    
    // Clean up test image
    fs.unlinkSync(testImagePath);
    
    console.log('\n✅ FLUX.1-Kontext-pro endpoint testing with reference image completed!');
  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
  }
}

testFluxKontextWithReference();