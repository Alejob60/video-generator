# FLUX Endpoint Debug Test
Write-Host "`n🔍 FLUX ENDPOINT DEBUG TEST" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "Test started at: $timestamp" -ForegroundColor Yellow

# Test configuration
$baseUrl = "https://video-converter-drfqdchmdeaehwcd.canadacentral-01.azurewebsites.net"
$body = @{
   prompt= "A red fox in autumn forest"
   plan= "PRO"
    enhancePrompt= $false
} | ConvertTo-Json

Write-Host "`n📡 Testing endpoint: POST /media/flux-kontext/image" -ForegroundColor Cyan
Write-Host "Payload: $body" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod `
        -Uri "$baseUrl/media/flux-kontext/image" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
   Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
   Write-Host "Response: $($response.message)" -ForegroundColor Gray
   Write-Host "Data: $($response.data | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $statusDesc = $_.Exception.Response.StatusDescription
    
   Write-Host "`n❌ HTTP $statusCode - $statusDesc" -ForegroundColor Red
   Write-Host "`nException Type: $($_.Exception.GetType().Name)" -ForegroundColor Yellow
   Write-Host"Message: $($_.Exception.Message)" -ForegroundColor Yellow
    
    # Try to read error response body
    try {
        $errorResponse = $_.Exception.Response
        if ($errorResponse -ne $null) {
            $reader = New-Object System.IO.StreamReader($errorResponse.GetResponseStream())
            $reader.BaseStream.Position= 0
            $errorBody = $reader.ReadToEnd()
            
           Write-Host "`n📄 ERROR RESPONSE BODY:" -ForegroundColor Cyan
           Write-Host $errorBody -ForegroundColor Red
            
            # Try to parse as JSON
            try {
                $jsonError = $errorBody | ConvertFrom-Json
               Write-Host "`nParsed Error:" -ForegroundColor Cyan
                $jsonError | Format-List | Out-String | Write-Host -ForegroundColor Gray
            } catch {}
        }
    } catch {
       Write-Host "`n⚠️ Could not read error body" -ForegroundColor Yellow
    }
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "Test completed at: $(Get-Date-Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
