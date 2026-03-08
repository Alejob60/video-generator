# Script simple para probar el endpoint de FLUX Kontext localmente

Write-Host "Prueba de endpoint FLUX Kontext local..." -ForegroundColor Cyan

# Verificar que la aplicacion este corriendo
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:8080/health" -Method GET -UseBasicParsing
    Write-Host "Servicio saludable: $($healthResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "No se puede conectar al servicio local." -ForegroundColor Red
    exit 1
}

# Crear una imagen de prueba basica
"Imagen de prueba" > "test-image.jpg"

Write-Host "Enviando solicitud al endpoint..." -ForegroundColor Cyan

# Probar el endpoint con parametros minimos requeridos
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/media/flux-kontext-image" -Method POST -Body @{
        prompt = "Un hermoso paisaje montanoso al atardecer"
        plan = "CREATOR"
    } -UseBasicParsing
    
    Write-Host "Exito! Codigo de estado: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Respuesta:" -ForegroundColor Green
    Write-Host $response.Content -ForegroundColor White
    
} catch {
    Write-Host "Error en la solicitud:" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Codigo de estado: $statusCode" -ForegroundColor Red
        Write-Host "Descripcion: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    } else {
        Write-Host "Mensaje: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Limpiar
Remove-Item "test-image.jpg" -ErrorAction SilentlyContinue

Write-Host "Prueba completada." -ForegroundColor Cyan