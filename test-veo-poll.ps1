# VEO3 Video Generation - Poll for Completion
# Checks operation status and retrieves video when ready

Write-Host "🎬 Checking VEO3 Video Generation Status" -ForegroundColor Cyan
Write-Host "=" * 60

# Configuration
$env:VERTEX_API_KEY = "AQ.Ab8RN6LuAtNfSN2NXv8cn0zsclWio1xDmtux_w0Wql3yZzvD3w"

# Read operation name from file
if (Test-Path "veo-operation-name.txt") {
    $operationName = Get-Content "veo-operation-name.txt" -Raw
    Write-Host "`n📋 Operation: $operationName" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Error: veo-operation-name.txt not found!" -ForegroundColor Red
    Write-Host "Run .\test-veo-init.ps1 first to start video generation." -ForegroundColor Yellow
    exit 1
}

try {
    # Check operation status
    $statusUrl = "https://us-central1-aiplatform.googleapis.com/v1/${operationName}?key=${env:VERTEX_API_KEY}"
    
    Write-Host "`n🔗 Status URL:" -ForegroundColor Cyan
    Write-Host $statusUrl -ForegroundColor Gray
    
    $status = Invoke-RestMethod -Uri $statusUrl -Method Get
    
    Write-Host "`n📊 Operation Status:" -ForegroundColor Cyan
    
    if ($status.done) {
        Write-Host "✅ DONE - Video generation complete!" -ForegroundColor Green
        
        if ($status.response) {
            Write-Host "`n📦 Response received:" -ForegroundColor Cyan
            
            # Check for generated videos
            if ($status.response.generatedVideos) {
                $videoCount = $status.response.generatedVideos.Count
                Write-Host "`n🎥 SUCCESS: $videoCount video(s) generated!" -ForegroundColor Green
                
                foreach ($video in $status.response.generatedVideos) {
                    if ($video.video) {
                        if ($video.video.bytes) {
                            $sizeMB = [math]::Round($video.video.bytes.Length / 1MB, 2)
                            Write-Host "`n   ✅ Video Data Available:" -ForegroundColor Green
                            Write-Host "      Size: ${sizeMB} MB" -ForegroundColor Gray
                            Write-Host "      Format: Base64 encoded MP4" -ForegroundColor Gray
                            
                            # Save video bytes to file
                            $videoBytes = [Convert]::FromBase64String($video.video.bytes)
                            $outputFile = "veo-video-$(Get-Date -Format 'yyyyMMdd-HHmmss').mp4"
                            [System.IO.File]::WriteAllBytes("$PSScriptRoot\$outputFile", $videoBytes)
                            Write-Host "      Saved to: $outputFile" -ForegroundColor Cyan
                            
                        } elseif ($video.video.uri) {
                            Write-Host "`n   📦 Video URI:" -ForegroundColor Cyan
                            Write-Host "      $($video.video.uri)" -ForegroundColor Gray
                        }
                    }
                }
                
                Write-Host "`n✨ VEO3 test completed successfully!" -ForegroundColor Green
                
            } else {
                Write-Host "`n⚠️ No videos found in response" -ForegroundColor Yellow
                Write-Host ($status.response | ConvertTo-Json -Depth 5) -ForegroundColor Gray
            }
            
        } else {
            Write-Host "`n⚠️ No response data found" -ForegroundColor Yellow
        }
        
        # Show full response
        Write-Host "`n📄 Full Response:" -ForegroundColor Cyan
        Write-Host ($status | ConvertTo-Json -Depth 10) -ForegroundColor Gray
        
    } else {
        Write-Host "⏳ NOT DONE - Still processing..." -ForegroundColor Yellow
        
        if ($status.metadata) {
            Write-Host "`n📊 Metadata:" -ForegroundColor Cyan
            Write-Host ($status.metadata | ConvertTo-Json -Depth 3) -ForegroundColor Gray
        }
        
        Write-Host "`n💡 Tip: Run this script again in 1-2 minutes to check again." -ForegroundColor Yellow
        
    }
    
} catch {
    Write-Host "`n❌ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "`nDetails:" -ForegroundColor Red
        Write-Host $_.ErrorDetails -ForegroundColor Red
    }
    exit 1
}
