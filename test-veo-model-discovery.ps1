# VEO3 Video Generation - Test with Correct Model Discovery
# Tests multiple model names to find the correct one

Write-Host "🔍 Testing VEO3 Model Names" -ForegroundColor Cyan
Write-Host "=" * 60

$env:VERTEX_API_KEY = "AQ.Ab8RN6LuAtNfSN2NXv8cn0zsclWio1xDmtux_w0Wql3yZzvD3w"
$PROJECT_ID = "orbital-prime-vision"
$LOCATION = "us-central1"

# Possible model names to test
$modelNames = @(
    "veo-001",
    "veo-3.1-generate-001", 
    "veo-3.0-generate-001",
    "veo-preview",
    "veo-1.0"
)

foreach ($model in $modelNames) {
    Write-Host "`n🧪 Testing model: $model" -ForegroundColor Yellow
    
    $testUrl = "https://$LOCATION-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${model}:predictLongRunning?key=${env:VERTEX_API_KEY}"
    
    $body = @'
{
  "instances": [{"prompt": "test"}],
  "parameters": {"aspectRatio": "16:9", "videoLength": 5}
}
'@
    
    try {
        $response = Invoke-RestMethod -Uri $testUrl -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        
        Write-Host "   ✅ SUCCESS! Model '$model' is available!" -ForegroundColor Green
        Write-Host "   Operation: $($response.name)" -ForegroundColor Cyan
        
        # Save working model name
        $model | Out-File -FilePath "veo-working-model.txt" -Encoding utf8
        Write-Host "   💾 Model name saved to veo-working-model.txt" -ForegroundColor Gray
        
        break
        
    } catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "   ❌ NOT FOUND - Model '$model' does not exist or no access" -ForegroundColor Red
        } elseif ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "   ⚠️ BAD REQUEST - Model might exist but payload incomplete" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n" + "=" * 60
Write-Host "Testing complete!" -ForegroundColor Cyan
