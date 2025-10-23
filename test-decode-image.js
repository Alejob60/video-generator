const fs = require('fs');

// This is the base64 data we got from the direct API call
const base64Data = "iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zUAAA10GNhQlgAADXQanVtYgAAAB5qdW1kYzJwYQARABCAAACqADibcQNj//9kZA=="; // This is just a small sample

console.log('Testing image decoding...');

try {
  // In a real test, we would use the full base64 data
  // For now, let's just verify the format
  console.log('Base64 data length:', base64Data.length);
  
  // Check if it starts with the PNG header
  const buffer = Buffer.from(base64Data, 'base64');
  console.log('Decoded buffer length:', buffer.length);
  
  // Check PNG header
  const pngHeader = buffer.slice(0, 8);
  const expectedHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const isPng = pngHeader.equals(expectedHeader);
  
  console.log('PNG header check:', isPng ? 'Valid PNG' : 'Invalid PNG header');
  console.log('Header bytes:', pngHeader.toString('hex').toUpperCase());
  
  // In a real test with full data, we would save the file:
  // fs.writeFileSync('test-decoded-image.png', buffer);
  // console.log('Image saved as test-decoded-image.png');
  
} catch (error) {
  console.error('Error decoding image:', error.message);
}