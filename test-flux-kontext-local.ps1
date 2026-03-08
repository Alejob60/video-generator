# Script para probar el endpoint de FLUX Kontext localmente

Write-Host "Prueba de endpoint FLUX Kontext local..." -ForegroundColor Cyan

# Verificar que la aplicacion este corriendo
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:8080/health" -Method GET -UseBasicParsing
    Write-Host "Servicio saludable: $($healthResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "No se puede conectar al servicio local. Asegurate de que la aplicacion este corriendo." -ForegroundColor Red
    exit 1
}

# Crear una imagen de prueba basica si no existe
$imagePath = "test-image.jpg"
"Imagen de prueba para FLUX Kontext" > $imagePath

# Preparar los datos para la solicitud
$uri = "http://localhost:8080/media/flux-kontext-image"

Write-Host "Enviando solicitud al endpoint..." -ForegroundColor Cyan

try {
    # Para PowerShell, usamos el metodo tradicional de form-data
    $boundary = [System.Guid]::NewGuid().ToString()
    $contentType = "multipart/form-data; boundary=`"$boundary`""
    
    # Crear el cuerpo de la solicitud
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"prompt`"",
        "",
        "Un hermoso paisaje montanoso al atardecer",
        "--$boundary",
        "Content-Disposition: form-data; name=`"plan`"",
        "",
        "CREATOR",
        "--$boundary",
        "Content-Disposition: form-data; name=`"size`"",
        "",
        "1024x1024",
        "--$boundary",
        "Content-Disposition: form-data; name=`"referenceImage`"; filename=`"test-image.jpg`"",
        "Content-Type: application/octet-stream",
        "",
        [System.IO.File]::ReadAllText($imagePath),
        "--$boundary--",
        ""
    )
    
    $body = [string]::Join("`r`n", $bodyLines)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
    
    # Enviar la solicitud
    $response = Invoke-WebRequest -Uri $uri -Method POST -ContentType $contentType -Body $bytes -UseBasicParsing
    
    Write-Host "Solicitud completada con exito!" -ForegroundColor Green
    Write-Host "Codigo de estado: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Respuesta:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | Format-List
    
} catch {
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $statusDescription = $_.Exception.Response.StatusDescription
        
        Write-Host "Error en la solicitud:" -ForegroundColor Red
        Write-Host "Codigo de estado: $statusCode" -ForegroundColor Red
        Write-Host "Descripcion: $statusDescription" -ForegroundColor Red
        
        # Leer el contenido de error
        try {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorText = $reader.ReadToEnd()
            Write-Host "Detalles del error:" -ForegroundColor Red
            Write-Host $errorText -ForegroundColor Red
        } catch {
            Write-Host "No se pudieron obtener detalles adicionales del error." -ForegroundColor Red
        }
    } else {
        Write-Host "Error desconocido:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# Limpiar el archivo de prueba
if (Test-Path $imagePath) {
    Remove-Item $imagePath
}

Write-Host "Prueba completada." -ForegroundColor Cyan