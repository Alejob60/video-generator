curl -X POST http://localhost:4000/media/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Una ciudad futurista iluminada por neones",
    "plan": "FREE"
  }'
{"success":true,"message":"✅ Imagen generada correctamente","result":{"imageUrl":"https://realculturestorage.blob.core.windows.net/images/promo_20250702225905479.png","prompt":"Una ciudad futurista iluminada por neones, en un estilo visual cyberpunk moderno, con rascacielos de formas angulosas y tecnología avanzada, fondo urbano vibrante con calles mojadas reflejando los colores, iluminación brillante y contrastada con neones de tonos azul y magenta, composición dinámica usando la regla de los tercios para dirigir la mirada hacia el horizonte, líneas de fuga creadas por las luces y la arquitectura que guían hacia el centro de la imagen.","imagePath":null,"filename":"promo_20250702225905479.png"}}