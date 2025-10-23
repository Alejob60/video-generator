# Test JSON prompt conversion with LLM enhancement
Write-Host "Testing JSON prompt conversion with LLM enhancement..." -ForegroundColor Green

# JSON prompt that was causing issues
$jsonPrompt = @{
    scene_description = "Una hamburguesa jugosa con doble queso derretido y rodajas frescas de tomate, presentada de manera apetitosa sobre un plato rústico."
    visual_elements = @(
        "Pan tostado",
        "Dos capas de queso derretido",
        "Rodajas de tomate rojo brillante",
        "Carne jugosa",
        "Plato rústico",
        "Fondo de cocina desenfocado"
    )
    style = "Fotografía gastronómica de alta resolución"
    mood = "Apetitoso y acogedor"
    color_palette = @(
        "Marrón dorado",
        "Amarillo cálido",
        "Rojo vibrante",
        "Verde suave",
        "Blanco crema"
    )
    composition = "Plano medio, encuadre centrado, enfoque en la hamburguesa con fondo ligeramente difuminado"
    lighting = "Luz natural suave proveniente de un lateral"
    details = "El queso se muestra fundido con ligera textura, el tomate fresco con gotas de humedad, pan con semillas ligeramente tostado"
} | ConvertTo-Json -Depth 10

try {
    $body = @{
        prompt = $jsonPrompt
        plan = "CREATOR"
        isJsonPrompt = $true
        size = "1024x1024"
    } | ConvertTo-Json -Depth 10

    $response = Invoke-RestMethod -Uri "https://realculture-video-generator.azurewebsites.net/media/flux-image" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Success! Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Error details: $($_.ErrorDetails)" -ForegroundColor Red
    }
}