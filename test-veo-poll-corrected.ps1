# VEO3 Video Generation - Poll with Correct API Endpoint
# Uses the proper Vertex AI operations endpoint format

Write-Host "🎬 Checking VEO3 Video Status (Corrected Endpoint)" -ForegroundColor Cyan
Write-Host "=" * 60

$env:VERTEX_API_KEY = "AQ.Ab8RN6LuAtNfSN2NXv8cn0zsclWio1xDmtux_w0Wql3yZzvD3w"
$PROJECT_ID = "orbital-prime-vision"
$LOCATION = "us-central1"

# Read operation name from file
if (Test-Path "veo-operation-name.txt") {
    $fullOperationName = Get-Content "veo-operation-name.txt" -Raw
    $fullOperationName = $fullOperationName.Trim()
    
    Write-Host "`n📋 Full Operation Name:" -ForegroundColor Cyan
    Write-Host $fullOperationName -ForegroundColor Gray
    
    # Try different endpoint formats
    $endpoints = @(
        # Format 1: Direct operation path
        "https://${LOCATION}-aiplatform.googleapis.com/v1/${fullOperationName}?key=${env:VERTEX_API_KEY}",
        
        # Format 2: Using projects.locations.operations.get pattern  
        "https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/operations/$(Split-Path $fullOperationName -Leaf)?key=${env:VERTEX_API_KEY}"
    )
    
    foreach ($url in $endpoints) {
        Write-Host "`n🔗 Trying URL:" -ForegroundColor Yellow
        Write-Host $url -ForegroundColor Gray
        
        try {
            $status = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
            
            Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
            Write-Host "`n📊 Response:" -ForegroundColor Cyan
            Write-Host ($status | ConvertTo-Json -Depth 10) -ForegroundColor Gray
            
            if ($status.done) {
                Write-Host "`n✅ Video generation complete!" -ForegroundColor Green
                
                if ($status.response.generatedVideos) {
                    Write-Host "🎥 Videos generated: $($status.response.generatedVideos.Count)" -ForegroundColor Green
                    
                    foreach ($video in $status.response.generatedVideos) {
                        if ($video.video.bytes) {
                            $sizeMB = [math]::Round($video.video.bytes.Length / 1MB, 2)
                            Write-Host "   Size: ${sizeMB} MB" -ForegroundColor Cyan
                            
                            # Save video
                            $videoBytes = [Convert]::FromBase64String($video.video.bytes)
                            $outputFile = "veo-video-$(Get-Date -Format 'yyyyMMdd-HHmmss').mp4"
                            [System.IO.File]::WriteAllBytes("$PSScriptRoot\$outputFile", $videoBytes)
                            Write-Host "   💾 Saved to: $outputFile" -ForegroundColor Cyan
                        }
                    }
                }
            } else {
                Write-Host "`n⏳ Still processing..." -ForegroundColor Yellow
            }
            
            break
            
        } catch {
            Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
            
            if ($url -eq $endpoints[-1]) {
                Write-Host "`n❌ All endpoint formats failed." -ForegroundColor Red
                exit 1
            }
        }
    }
    
} else {
    Write-Host "`n❌ Error: veo-operation-name.txt not found!" -ForegroundColor Red
    Write-Host "Run .\test-veo-init.ps1 first to start video generation." -ForegroundColor Yellow
    exit 1
}
