const fs = require('fs');

// Test decoding base64 data from FLUX API
function testDecodeBase64() {
  // This is a small sample of the base64 data from the previous test
  const base64Data = "iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zUAAA1JGNhQlgAADUkanVtYgAAAB5qdW1kYzJwYQARABCAAACqADibcQNj";

  try {
    // Decode the base64 data
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Save to a file
    const outputPath = 'test-output.png';
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✅ Successfully decoded base64 data and saved to ${outputPath}`);
    console.log(`📄 File size: ${buffer.length} bytes`);
    
    // Check if it starts with PNG header
    const pngHeader = buffer.slice(0, 8);
    const isPng = pngHeader.equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
    console.log(`🔍 PNG header validation: ${isPng ? 'Valid PNG' : 'Invalid PNG header'}`);
    console.log(`🔍 PNG header bytes: ${pngHeader.toString('hex').toUpperCase()}`);
  } catch (error) {
    console.error('❌ Error decoding base64 data:', error.message);
  }
}

testDecodeBase64();