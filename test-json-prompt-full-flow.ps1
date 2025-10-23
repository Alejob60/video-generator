# Test JSON prompt full flow with FLUX
Write-Host "Testing JSON prompt full flow with FLUX..." -ForegroundColor Green

# JSON prompt that was causing issues
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

try {
    $body = @{
        prompt = $jsonPrompt
        plan = "CREATOR"
        useFlux = $true
        isJsonPrompt = $true
    } | ConvertTo-Json -Depth 10

    Write-Host "Sending request with JSON prompt..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "https://realculture-video-generator.azurewebsites.net/media/image" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Success! Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Error details: $($_.ErrorDetails)" -ForegroundColor Red
    }
}

Write-Host "`nTest completed!" -ForegroundColor Green