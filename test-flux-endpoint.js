const http = require('http');

// Test data with isJsonPrompt set to true
const testData = {
  prompt: "A beautiful sunset over mountains",
  plan: "FREE",
  isJsonPrompt: true
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 4000,  // Updated to correct port
  path: '/media/flux-image',  // Updated to correct endpoint
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Response:');
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (err) {
      console.log('Raw response:');
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(postData);
req.end();

console.log('Request sent with data:');
console.log(JSON.stringify(testData, null, 2));