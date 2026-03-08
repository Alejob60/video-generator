const axios = require('axios');

async function testDeployments() {
  const apiKey = "7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS";
  
  const deployments = [
    "flux-1.1-pro-hf",
    "FLUX.1-Kontext-pro",
    "flux-1.1-pro",
    "FLUX-1.1-pro"
  ];

  for (const deployment of deployments) {
    const endpoint = `https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/${deployment}/images/generations?api-version=2025-04-01-preview`;
    
    const payload = {
      prompt: "A beautiful sunset landscape",
      output_format: "png",
      n: 1,
      size: "1024x1024"
    };

    try {
      console.log(`\n🧪 Testing deployment: ${deployment}`);
      
      const response = await axios.post(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        responseType: 'json'
      });

      console.log(`✅ SUCCESS - Status: ${response.status}`);
      console.log(`   Response keys: ${Object.keys(response.data)}`);
      if (response.data.data) {
        console.log(`   Data items: ${response.data.data.length}`);
        if (response.data.data[0]) {
          console.log(`   Item keys: ${Object.keys(response.data.data[0])}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ FAILED - Deployment: ${deployment}`);
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

testDeployments();