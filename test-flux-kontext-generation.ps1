# Test script for FLUX.1-Kontext-pro image generation
Write-Host "🚀 Testing FLUX.1-Kontext-pro image generation..." -ForegroundColor Green

# Test image generation without reference image
Write-Host "📝 Sending request for image generation..." -ForegroundColor Yellow

# Using curl to send JSON data
curl -X POST "http://localhost:8080/media/flux-kontext-image" `
     -H "Content-Type: application/json" `
     -d '{
       "prompt": "A majestic lion in the savannah at sunset",
       "plan": "PRO",
       "size": "1024x1024"
     }'

Write-Host "`n✅ Request sent!" -ForegroundColor Green
Write-Host "🏁 Test completed!" -ForegroundColor Green