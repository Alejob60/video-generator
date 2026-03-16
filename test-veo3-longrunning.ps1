# VEO3 Video Generation Test - PowerShell
# Tests the complete flow with proper Google Vertex AI LongRunning API

Write-Host "🎬 Testing VEO3 Video Generation with LongRunning API" -ForegroundColor Cyan
Write-Host "=" * 60

# Configuration
$API_KEY = "AQ.Ab8RN6LuAtNfSN2NXv8cn0zsclWio1xDmtux_w0Wql3yZzvD3w"
$PROJECT_ID = "orbital-prime-vision"
$LOCATION = "us-central1"
$MODEL = "veo-3.1-generate-001"

# Payload
$body = @{
    instances = @(
        @{
            prompt = "A cinematic drone shot of a futuristic city at sunset, flying through skyscrapers with neon lights, photorealistic, 4K quality"
        }
    )
    parameters = @{
        aspectRatio = "16:9"
        videoLength = 5
        fps = 24
        negativePrompt = "blurry, low quality, distorted"
    }
} | ConvertTo-Json -Depth 10

Write-Host "`n📡 Step 1: Initiating video generation..." -ForegroundColor Yellow

try {
    # Call predictLongRunning endpoint
    $initUrl = "https://aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:predictLongRunning?key=${API_KEY}"
    
    $response = Invoke-RestMethod -Uri $initUrl -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "✅ Request accepted!" -ForegroundColor Green
    Write-Host "📋 Operation Name: $($response.name)" -ForegroundColor Cyan
    
    $operationName = $response.name
    
    # Poll for completion
    Write-Host "`n⏳ Step 2: Polling for completion (this may take 5-15 minutes)..." -ForegroundColor Yellow
    
    $maxAttempts = 90
    $pollInterval = 10  # seconds
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        $attempt++
        $elapsedMinutes = [math]::Round(($attempt * $pollInterval) / 60, 1)
        
        Write-Host "   Attempt $attempt/$maxAttempts (${elapsedMinutes} min elapsed)" -ForegroundColor Gray
        
        # Get operation status
        $statusUrl = "https://aiplatform.googleapis.com/v1/${operationName}?key=${API_KEY}"
        $status = Invoke-RestMethod -Uri $statusUrl -Method Get
        
        if ($status.done) {
            Write-Host "`n✅ Video generation complete!" -ForegroundColor Green
            
            if ($status.response) {
                Write-Host "📊 Response received:" -ForegroundColor Cyan
                $status.response | ConvertTo-Json -Depth 5
                
                # Check for generated videos
                if ($status.response.generatedVideos -and $status.response.generatedVideos.Count -gt 0) {
                    Write-Host "`n🎥 SUCCESS: $($status.response.generatedVideos.Count) video(s) generated!" -ForegroundColor Green
                    
                    foreach ($video in $status.response.generatedVideos) {
                        if ($video.video) {
                            if ($video.video.bytes) {
                                $sizeMB = [math]::Round($video.video.bytes.Length / 1MB, 2)
                                Write-Host "   ✅ Video ready (${sizeMB} MB)" -ForegroundColor Green
                            } elseif ($video.video.uri) {
                                Write-Host "   📦 Video URI: $($video.video.uri)" -ForegroundColor Cyan
                            }
                        }
                    }
                    
                    Write-Host "`n✨ VEO3 test completed successfully!" -ForegroundColor Green
                    exit 0
                } else {
                    Write-Host "`n❌ No videos found in response" -ForegroundColor Red
                    exit 1
                }
            } else {
                Write-Host "`n❌ No response data found" -ForegroundColor Red
                exit 1
            }
        }
        
        # Check for errors
        if ($status.error) {
            Write-Host "`n❌ Operation failed:" -ForegroundColor Red
            Write-Host ($status.error | ConvertTo-Json) -ForegroundColor Red
            exit 1
        }
        
        # Log metadata if available
        if ($status.metadata) {
            Write-Host "   Progress: $($status.metadata | ConvertTo-Json -Depth 1)" -ForegroundColor Gray
        }
        
        Start-Sleep -Seconds $pollInterval
    }
    
    Write-Host "`n❌ Timeout after 15 minutes. The operation may still be running." -ForegroundColor Red
    Write-Host "Check operation status manually: $operationName" -ForegroundColor Yellow
    exit 1
    
} catch {
    Write-Host "`n❌ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host $_.ErrorDetails -ForegroundColor Red
    exit 1
}
