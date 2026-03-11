const axios = require('axios');

async function testFluxEndpoint() {
   console.log('\n🧪 TESTING FLUX ENDPOINT\n');
    
   const body = {
       prompt: "A red fox in autumn forest",
       plan: "PRO"
    };
    
    try {
       const response = await axios.post(
            'https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-kontext/image',
            body,
            {
               headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
       console.log('✅ SUCCESS!');
       console.log('Status:', response.status);
       console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
       console.log('❌ ERROR:', error.response?.status || error.message);
        
        if (error.response?.data) {
           console.log('\n📄 Error Response:');
           console.log(JSON.stringify(error.response.data, null, 2));
        }
        
        if (error.request) {
           console.log('\n📡 Request details:');
           console.log('URL:', error.config?.url);
           console.log('Method:', error.config?.method);
           console.log('Body:', error.config?.data);
        }
    }
}

testFluxEndpoint();
