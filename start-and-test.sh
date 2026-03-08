#!/bin/bash
# Start application and run tests automatically

echo "============================================"
echo "  FLUX IMAGE GENERATION - AUTO TEST"
echo "============================================"
echo ""

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t video-converter:local .

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build complete!"
echo ""

# Start container
echo "🚀 Starting container..."
docker rm -f video-converter-test 2>/dev/null

docker run -d \
  --name video-converter-test \
  -p 4000:8080 \
  --env-file .env \
  video-converter:local

if [ $? -ne 0 ]; then
    echo "❌ Failed to start container!"
    exit 1
fi

echo "✅ Container started!"
echo "⏳ Waiting for service to be ready (30 seconds)..."
sleep 30

# Check health
echo "🧪 Checking health endpoint..."
curl -s http://localhost:4000/health | jq .

if [ $? -ne 0 ]; then
    echo "❌ Service not responding!"
    docker logs video-converter-test
    exit 1
fi

echo ""
echo "✅ Service is ready!"
echo ""
echo "============================================"
echo "  READY FOR TESTING"
echo "============================================"
echo ""
echo "Container Name: video-converter-test"
echo "URL: http://localhost:4000"
echo ""
echo "Now run the test script:"
echo "  pwsh -File ./test-local-3-modes.ps1"
echo ""
