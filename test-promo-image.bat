@echo off
REM Script para probar el endpoint /media/image en Windows

REM Variables
set BASE_URL=http://localhost:4000
set ENDPOINT=/media/image

echo Prueba 1: Generar imagen con prompt
curl -X POST "%BASE_URL%%ENDPOINT%" ^
  -H "Content-Type: application/json" ^
  -d "{\"prompt\": \"Un hermoso paisaje montañoso al atardecer con ríos y bosques\", \"plan\": \"FREE\"}"

echo.
echo ----------------------------------------
echo.

echo Prueba 2: Generar imagen con FLUX
curl -X POST "%BASE_URL%%ENDPOINT%" ^
  -H "Content-Type: application/json" ^
  -d "{\"prompt\": \"Un robot futurista en un entorno cyberpunk\", \"plan\": \"FREE\", \"useFlux\": true}"

echo.
echo ----------------------------------------
echo.

echo Prueba 3: Generar imagen con texto superpuesto
curl -X POST "%BASE_URL%%ENDPOINT%" ^
  -H "Content-Type: application/json" ^
  -d "{\"prompt\": \"Una hamburguesa gourmet con ingredientes frescos\", \"textOverlay\": \"¡Oferta Especial!\", \"plan\": \"CREATOR\"}"

echo.
echo ----------------------------------------
echo.

echo Todas las pruebas completadas
pause