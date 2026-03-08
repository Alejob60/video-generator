# Test FLUX.1-Kontext-pro endpoint
Write-Host "Testing FLUX.1-Kontext-pro endpoint..." -ForegroundColor Green

# Test 1: Regular image generation
Write-Host "`n1. Testing regular image generation..." -ForegroundColor Yellow
try {
    $body = @{
        prompt = "A beautiful landscape with mountains and lakes"
        plan = "CREATOR"
        size = "1024x1024"
    } | ConvertTo-Json -Depth 10

    $response = Invoke-RestMethod -Uri "https://realculture-video-generator.azurewebsites.net/media/flux-kontext-image" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Success! Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Error details: $($_.ErrorDetails)" -ForegroundColor Red
    }
}

# Test 2: Image generation with reference image
Write-Host "`n2. Testing image generation with reference image..." -ForegroundColor Yellow
try {
    # First, we need to create a simple test image
    $testImagePath = "test-image.png"
    if (-not (Test-Path $testImagePath)) {
        # Create a simple test image (1x1 pixel PNG)
        $imageBytes = [byte[]]@(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0xDA, 0x63, 0x60, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82)
        [System.IO.File]::WriteAllBytes($testImagePath, $imageBytes)
    }

    $boundary = [System.Guid]::NewGuid().ToString()
    $contentType = "multipart/form-data; boundary=`"$boundary`""
    
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"referenceImage`"; filename=`"test-image.png`"",
        "Content-Type: image/png",
        "",
        [System.Convert]::ToBase64String([System.IO.File]::ReadAllBytes($testImagePath)),
        "--$boundary",
        "Content-Disposition: form-data; name=`"dto`"",
        "",
        (@{
            prompt = "A beautiful landscape with mountains and lakes, in the style of the reference image"
            plan = "CREATOR"
            size = "1024x1024"
        } | ConvertTo-Json -Depth 10),
        "--$boundary--"
    )
    
    $bodyString = $bodyLines -join "`r`n"
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyString)
    
    $response = Invoke-RestMethod -Uri "https://realculture-video-generator.azurewebsites.net/media/flux-kontext-image" -Method Post -Body $bodyBytes -ContentType $contentType
    Write-Host "✅ Success! Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Error details: $($_.ErrorDetails)" -ForegroundColor Red
    }
}

Write-Host "`n✅ FLUX.1-Kontext-pro endpoint testing completed!" -ForegroundColor Green