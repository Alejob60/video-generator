# Test JSON Prompt Conversion
$uri = "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-image"
$headers = @{
    "Content-Type" = "application/json"
}

# Test with the original JSON prompt that was causing issues
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
}

# Convert the JSON prompt to a string
$promptString = ($jsonPrompt | ConvertTo-Json -Depth 10) -replace "`n", " " -replace "`r", ""

$body = @{
    prompt = $promptString
    plan = "FREE"
    isJsonPrompt = $true
} | ConvertTo-Json

Write-Host "Sending request with JSON prompt conversion..." -ForegroundColor Green
Write-Host "Request body: $body" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $responseStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}