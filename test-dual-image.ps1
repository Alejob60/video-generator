# Test Dual Image Endpoint
$uri = "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net/media/flux-image/dual"
$headers = @{
    "Content-Type" = "application/json"
}

# Use the original text prompt
$body = @{
    prompt = "una hamburguesa jugosa doble queso y tomate"
    plan = "FREE"
} | ConvertTo-Json

Write-Host "Sending request to dual endpoint: $uri" -ForegroundColor Green
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