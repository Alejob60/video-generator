const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Azure Blob Storage configuration from .env
const azureStorageConnectionString = 'DefaultEndpointsProtocol=https;AccountName=realculturestorage;AccountKey=+nx9YvuPMHbwfCldbliWtMRCSRpyxO06Wt9Kq3GPPg10Rvmr5nSNzM95SXJjlmUNQu+um/PV9j5j+ASttFOVKg==;EndpointSuffix=core.windows.net';
const azureStorageContainerName = 'audio';

// Azure Blob Storage client
const { BlobServiceClient } = require('@azure/storage-blob');
const blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageConnectionString);

async function uploadFileToBlob(filePath, blobName, mimeType) {
  const containerClient = blobServiceClient.getContainerClient(azureStorageContainerName);
  await containerClient.createIfNotExists();

  const fileBuffer = fs.readFileSync(filePath);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: {
      blobContentType: mimeType,
    },
  });

  return blockBlobClient.url;
}

async function testFullFlow() {
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
  
  console.log('Testing full flow: FLUX API -> File -> Azure Blob Storage...\n');
  
  try {
    // 1. Get image data from FLUX API
    console.log('1. Calling FLUX API...');
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const imageData = response.data.data?.[0];
    if (!imageData || !imageData.b64_json) {
      throw new Error('No base64 image data received');
    }
    
    console.log('   ✅ FLUX API call successful');
    console.log('   - Base64 length:', imageData.b64_json.length);
    
    // 2. Decode and save to temporary file
    console.log('\n2. Decoding base64 and saving to temporary file...');
    const buffer = Buffer.from(imageData.b64_json, 'base64');
    const filename = `flux-test-${uuidv4()}.png`;
    const tempPath = path.join(__dirname, 'temp', filename);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(tempPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(tempPath, buffer);
    const stats = fs.statSync(tempPath);
    console.log('   ✅ Image saved to temporary file');
    console.log('   - File path:', tempPath);
    console.log('   - File size:', stats.size, 'bytes');
    
    // 3. Upload to Azure Blob Storage
    console.log('\n3. Uploading to Azure Blob Storage...');
    const blobName = `images/${filename}`;
    const blobUrl = await uploadFileToBlob(tempPath, blobName, 'image/png');
    console.log('   ✅ Image uploaded to Azure Blob Storage');
    console.log('   - Blob URL:', blobUrl);
    
    // 4. Clean up temporary file
    console.log('\n4. Cleaning up temporary file...');
    fs.unlinkSync(tempPath);
    console.log('   ✅ Temporary file cleaned up');
    
    console.log('\n🎉 Full flow completed successfully!');
    console.log('🖼️  Final image URL:', blobUrl);
    
  } catch (error) {
    console.error('❌ Error in full flow:', error.response?.data || error.message);
  }
}

testFullFlow();