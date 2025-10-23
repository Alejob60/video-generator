# Verify JSON prompt fix
Write-Host "Verifying JSON prompt fix..." -ForegroundColor Green

# Test the exact JSON prompt that was causing issues
$jsonPrompt = @{
    scene_description = "Una hamburguesa jugosa con dos capas de carne, cubierta con queso derretido y rodajas frescas de tomate, presentada sobre un plato rústico."
    visual_elements = @(
        "dos capas de carne",
        "queso derretido",
        "rodajas de tomate",
        "pan dorado",
        "plato rústico"
    )
    style = "fotografía gastronómica"
    mood = "apetitoso y acogedor"
    color_palette = @(
        "marrón dorado",
        "rojo brillante",
        "amarillo cálido",
        "verde suave"
    )
    composition = "plano medio centrado, enfoque selectivo sobre la hamburguesa, desenfoque del fondo"
    lighting = "luz cálida lateral para resaltar texturas y jugosidad"
    details = "Queso ligeramente fundido cayendo por los lados, tomate fresco con gotas de humedad, contraste entre el pan crujiente y la carne jugosa"
} | ConvertTo-Json -Depth 10

Write-Host "`n1. Testing JSON prompt with FLUX..." -ForegroundColor Yellow
try {
    $body = @{
        prompt = $jsonPrompt
        plan = "CREATOR"
        useFlux = $true
        isJsonPrompt = $true
    } | ConvertTo-Json -Depth 10

    $startTime = Get-Date
    $response = Invoke-RestMethod -Uri "https://realculture-video-generator.azurewebsites.net/media/image" -Method Post -Body $body -ContentType "application/json"
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalMilliseconds
    
    Write-Host "✅ JSON prompt with FLUX completed in ${duration}ms" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Cyan
    
    if ($response.success -eq $true) {
        Write-Host "✅ Correctly processed JSON prompt and generated image" -ForegroundColor Green
    } else {
        Write-Host "❌ Warning: Request succeeded but success flag is false" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error in JSON prompt with FLUX: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Error details: $($_.ErrorDetails)" -ForegroundColor Red
    }
}

Write-Host "`n2. Testing regular prompt with FLUX (should still work)..." -ForegroundColor Yellow
try {
    $body = @{
        prompt = "A beautiful sunset over the mountains"
        plan = "CREATOR"
        useFlux = $true
    } | ConvertTo-Json -Depth 10

    $startTime = Get-Date
    $response = Invoke-RestMethod -Uri "https://realculture-video-generator.azurewebsites.net/media/image" -Method Post -Body $body -ContentType "application/json"
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalMilliseconds
    
    Write-Host "✅ Regular prompt with FLUX completed in ${duration}ms" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error in regular prompt with FLUX: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Error details: $($_.ErrorDetails)" -ForegroundColor Red
    }
}

Write-Host "`n3. Testing JSON prompt without FLUX (should still work)..." -ForegroundColor Yellow
try {
    $body = @{
        prompt = $jsonPrompt
        plan = "CREATOR"
        isJsonPrompt = $true
    } | ConvertTo-Json -Depth 10

    $startTime = Get-Date
    $response = Invoke-RestMethod -Uri "https://realculture-video-generator.azurewebsites.net/media/image" -Method Post -Body $body -ContentType "application/json"
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalMilliseconds
    
    Write-Host "✅ JSON prompt without FLUX completed in ${duration}ms" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error in JSON prompt without FLUX: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Error details: $($_.ErrorDetails)" -ForegroundColor Red
    }
}

Write-Host "`n✅ JSON prompt fix verification completed!" -ForegroundColor Green