# Test script for FLUX.1-Kontext-pro with reference image
Write-Host "🚀 Testing FLUX.1-Kontext-pro with reference image..." -ForegroundColor Green

# Test image path (adjust as needed)
$testImagePath = "test-image.png"

# Check if test image exists
if (Test-Path $testImagePath) {
    Write-Host "🖼️  Found test image: $testImagePath" -ForegroundColor Cyan
    
    # Test with reference image using curl
    Write-Host "📝 Sending request with reference image..." -ForegroundColor Yellow
    
    # Using curl to send multipart form data
    curl -X POST "http://localhost:8080/media/flux-kontext-image" `
         -F "referenceImage=@$testImagePath" `
         -F "prompt=A beautiful landscape in the style of the reference image" `
         -F "plan=PRO" `
         -F "size=1024x1024"
         
    Write-Host "✅ Request sent!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Test image not found: $testImagePath" -ForegroundColor Red
    Write-Host "Please place a test image named 'test-image.png' in the project root directory." -ForegroundColor Yellow
}

Write-Host "🏁 Test completed!" -ForegroundColor Green