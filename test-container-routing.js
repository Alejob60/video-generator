const { BlobServiceClient } = require('@azure/storage-blob');

// Test the container routing logic
async function testContainerRouting() {
  // Simulate the environment variables
  const config = {
    defaultContainerName: 'audio',
    imagesContainerName: 'images',
    videoContainerName: 'videos'
  };

  function getContainerNameFromPath(blobPath) {
    if (blobPath.startsWith('images/')) {
      return config.imagesContainerName;
    } else if (blobPath.startsWith('audio/')) {
      return config.defaultContainerName;
    } else if (blobPath.startsWith('video/')) {
      return config.videoContainerName;
    } else if (blobPath.startsWith('subtitles/')) {
      return config.defaultContainerName;
    }
    return config.defaultContainerName;
  }

  // Test cases
  const testCases = [
    'images/flux-image-123.png',
    'audio/audio-file.mp3',
    'video/video-file.mp4',
    'subtitles/sub-file.srt',
    'random-file.txt'
  ];

  console.log('Testing container routing logic...\n');

  for (const testCase of testCases) {
    const containerName = getContainerNameFromPath(testCase);
    console.log(`Path: "${testCase}" -> Container: "${containerName}"`);
  }

  console.log('\n✅ Container routing logic test completed');
}

testContainerRouting();