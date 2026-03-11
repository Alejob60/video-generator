# Test FLUX 2 Pro - PowerShell con decodificación base64
# Basado en el código oficial de Microsoft Foundry

$endpoint = "https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com"
$deployment = "FLUX.2-pro"
$apiVersion = "preview"
$subscriptionKey = "7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"

# Construir URL correcta (Foundry endpoint)
$basePath = "providers/blackforestlabs/v1/$deployment"
$params = "?api-version=$apiVersion"
$generationUrl = "$endpoint/$basePath$params"

Write-Host "📡 Endpoint: $generationUrl" -ForegroundColor Cyan

# Payload correcto
$body = @{
    prompt = "robot futurista en un ciudad cberpunk"
    n = 1
    size = "1024x1024"
    output_format = "png"
} | ConvertTo-Json

Write-Host "📝 Payload:" -ForegroundColor Cyan
Write-Host $body | Format-Json

# Hacer petición
Write-Host "`n🔄 Generando imagen..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri $generationUrl -Method Post -ContentType "application/json" -Headers @{ "Api-Key" = $subscriptionKey } -Body $body

Write-Host "`n📥 Response recibido:" -ForegroundColor Green
Write-Host "Keys: $($response.data[0].PSObject.Properties.Name -join ', ')" -ForegroundColor Cyan

# Extraer base64
$b64Img = $response.data[0].b64_json
Write-Host "📏 Base64 length: $($b64Img.Length) chars" -ForegroundColor Cyan

# Decodificar y guardar imagen
$bytes = [System.Convert]::FromBase64String($b64Img)
$outputPath = "misy-image-$(Get-Date -UFormat %s).png"
[System.IO.File]::WriteAllBytes($outputPath, $bytes)

Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
Write-Host "Imagen guardada en: $outputPath" -ForegroundColor Cyan
Write-Host "Tamaño: $([math]::Round((Get-Item $outputPath).Length / 1KB, 2)) KB" -ForegroundColor Cyan
