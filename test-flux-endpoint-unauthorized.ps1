# Test Flux Endpoint with Invalid Authentication
$uri = "http://localhost:8080/media/flux-image"
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer invalid-token"
}

$body = @{
    prompt = "A beautiful sunset over mountains"
    plan = "FREE"
    isJsonPrompt = $true
} | ConvertTo-Json

Write-Host "Sending request to $uri with invalid auth" -ForegroundColor Green
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