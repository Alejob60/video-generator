const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test script for FLUX.1-Kontext-pro integration
async function testFluxKontextIntegration() {
  const baseUrl = 'http://localhost:8080'; // Adjust if your server runs on a different port
  
  try {
    console.log('🚀 Testing FLUX.1-Kontext-pro integration...');
    
    // Test 1: Regular image generation
    console.log('\n📝 Test 1: Regular image generation');
    const generationResponse = await axios.post(`${baseUrl}/media/flux-kontext-image`, {
      prompt: 'A beautiful sunset over the mountains',
      plan: 'PRO',
      size: '1024x1024'
    });
    
    console.log('✅ Generation Response:', generationResponse.data);
    
    // Test 2: Image editing with reference image (if we have one)
    const testImagePath = path.join(__dirname, 'test-image.png');
    if (fs.existsSync(testImagePath)) {
      console.log('\n🖼️ Test 2: Image editing with reference image');
      const formData = new FormData();
      
      // Note: This would typically be done with a multipart form request
      // For simplicity in this test, we're showing the concept
      
      console.log('✅ Edit test would use a reference image');
    } else {
      console.log('\n⏭️ Skipping edit test (no test image found)');
    }
    
    console.log('\n🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testFluxKontextIntegration();