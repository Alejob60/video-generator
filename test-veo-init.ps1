# VEO3 Video Generation - Test with Correct Endpoint
# Uses veo-001 model with predictLongRunning API

Write-Host "🎬 Testing VEO3 Video Generation (veo-001)" -ForegroundColor Cyan
Write-Host "=" * 60

# Configuration
$env:VERTEX_API_KEY = "AQ.Ab8RN6LuAtNfSN2NXv8cn0zsclWio1xDmtux_w0Wql3yZzvD3w"
$env:PROJECT_ID = "orbital-prime-vision"
$MODEL = "veo-3.1-generate-001"  # ✅ Confirmed working model

# Payload
$body = @'
{
  "instances": [
    {
      "prompt": "A cinematic drone shot of a futuristic city at sunset, flying through skyscrapers with neon lights, photorealistic, 4K quality"
    }
  ],
  "parameters": {
    "aspectRatio": "16:9",
    "videoLength": 5,
    "fps": 24,
    "negativePrompt": "blurry, low quality, distorted"
  }
}
'@

Write-Host "`n📡 Step 1: Initiating video generation..." -ForegroundColor Yellow
Write-Host "Model: $MODEL" -ForegroundColor Gray
Write-Host "Endpoint: predictLongRunning" -ForegroundColor Gray

try {
    # Call predictLongRunning endpoint with correct URL format
    $initUrl = "https://us-central1-aiplatform.googleapis.com/v1/projects/${env:PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL}:predictLongRunning?key=${env:VERTEX_API_KEY}"
    
    Write-Host "`n🔗 Request URL:" -ForegroundColor Cyan
    Write-Host $initUrl -ForegroundColor Gray
    
    Write-Host "`n📦 Payload:" -ForegroundColor Cyan
    Write-Host $body -ForegroundColor Gray
    
    $response = Invoke-RestMethod -Uri $initUrl -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "`n✅ Request accepted!" -ForegroundColor Green
    Write-Host "📋 Operation Name: $($response.name)" -ForegroundColor Cyan
    Write-Host "⏳ Status: Processing..." -ForegroundColor Yellow
    
    # Save operation name for polling
    $operationName = $response.name
    $operationName | Out-File -FilePath "veo-operation-name.txt" -Encoding utf8
    
    Write-Host "`n💾 Operation name saved to: veo-operation-name.txt" -ForegroundColor Cyan
    Write-Host "`n⏰ Next step: Wait 2-5 minutes, then run .\test-veo-poll.ps1 to check status" -ForegroundColor Yellow
    
} catch {
    Write-Host "`n❌ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "`nDetails:" -ForegroundColor Red
        Write-Host $_.ErrorDetails -ForegroundColor Red
    }
    exit 1
}
