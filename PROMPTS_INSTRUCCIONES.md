# Prompts e Instrucciones para Conexión a Servicios de Imagen

## 1. Conexión al Servicio de Imágenes (DALL·E)

### Prompt Base para Generación de Imágenes con DALL·E
```json
{
  "prompt": "Descripción detallada de la imagen que deseas generar",
  "plan": "FREE|CREATOR|PRO",
  "textOverlay": "Texto opcional para superponer en la imagen"
}
```

### Ejemplo de Uso
```bash
curl -X POST "http://localhost:4000/media/image" \
  -H "Content-Type: application/json" \
  -d '{
  "prompt": "Un hermoso paisaje montañoso al atardecer con ríos y bosques",
  "plan": "FREE"
}'
```

### Parámetros Detallados
- **prompt** (opcional): Descripción descriptiva para la generación de imagen con IA
- **plan** (requerido): Plan del usuario que solicita la imagen
  - `FREE`: 10 créditos por imagen con marca de agua
  - `CREATOR`: Acceso sin marca de agua
  - `PRO`: Acceso sin marca de agua y mayor duración
- **textOverlay** (opcional): Texto que se superpondrá sobre la imagen generada

## 2. Conexión al Servicio FLUX-1.1-pro

### Prompt Base para Generación de Imágenes con FLUX
```json
{
  "prompt": "Descripción detallada de la imagen que deseas generar",
  "plan": "FREE|CREATOR|PRO",
  "useFlux": true,
  "size": "1024x1024"
}
```

### Ejemplo de Uso
```bash
curl -X POST "http://localhost:4000/media/image" \
  -H "Content-Type: application/json" \
  -d '{
  "prompt": "Un robot futurista en un entorno cyberpunk",
  "plan": "FREE",
  "useFlux": true,
  "size": "1024x1024"
}'
```

### Parámetros Detallados
- **prompt** (requerido): Descripción descriptiva para la generación de imagen con IA
- **plan** (requerido): Plan del usuario que solicita la imagen
  - `FREE`: 10 créditos por imagen con marca de agua
  - `CREATOR`: Acceso sin marca de agua
  - `PRO`: Acceso sin marca de agua y mayor duración
- **useFlux** (requerido): Debe ser `true` para usar el modelo FLUX-1.1-pro
- **size** (opcional): Tamaño de la imagen (por defecto "1024x1024")

## 3. Instrucciones para Implementación en Código

### JavaScript/Node.js
```javascript
// Generar imagen con DALL·E
const generarImagenDalle = async () => {
  try {
    const response = await axios.post('http://localhost:4000/media/image', {
      prompt: 'Un hermoso paisaje montañoso al atardecer con ríos y bosques',
      plan: 'FREE'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Imagen generada:', response.data.result.imageUrl);
    return response.data.result.imageUrl;
  } catch (error) {
    console.error('Error al generar imagen:', error.response?.data || error.message);
  }
};

// Generar imagen con FLUX
const generarImagenFlux = async () => {
  try {
    const response = await axios.post('http://localhost:4000/media/image', {
      prompt: 'Un robot futurista en un entorno cyberpunk',
      plan: 'FREE',
      useFlux: true
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Imagen generada con FLUX:', response.data.result.imageUrl);
    return response.data.result.imageUrl;
  } catch (error) {
    console.error('Error al generar imagen con FLUX:', error.response?.data || error.message);
  }
};
```

### Python
```python
import requests
import json

# Generar imagen con DALL·E
def generar_imagen_dalle():
    url = "http://localhost:4000/media/image"
    payload = {
        "prompt": "Un hermoso paisaje montañoso al atardecer con ríos y bosques",
        "plan": "FREE"
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("Imagen generada:", data["result"]["imageUrl"])
        return data["result"]["imageUrl"]
    else:
        print("Error:", response.text)
        return None

# Generar imagen con FLUX
def generar_imagen_flux():
    url = "http://localhost:4000/media/image"
    payload = {
        "prompt": "Un robot futurista en un entorno cyberpunk",
        "plan": "FREE",
        "useFlux": True
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("Imagen generada con FLUX:", data["result"]["imageUrl"])
        return data["result"]["imageUrl"]
    else:
        print("Error:", response.text)
        return None
```

## 4. Respuesta del Servicio

### Formato de Respuesta Exitosa
```json
{
  "success": true,
  "message": "✅ Imagen generada correctamente",
  "result": {
    "imageUrl": "https://realculturestorage.blob.core.windows.net/images/nombre_archivo.png",
    "prompt": "El prompt utilizado para generar la imagen",
    "imagePath": null,
    "filename": "nombre_archivo.png"
  }
}
```

### Campos de la Respuesta
- **success**: Indica si la operación fue exitosa
- **message**: Mensaje descriptivo del resultado
- **result**: Objeto con los detalles del resultado
  - **imageUrl**: URL de la imagen generada (con SAS token)
  - **prompt**: El prompt utilizado para generar la imagen
  - **imagePath**: Ruta local de la imagen (null en este caso)
  - **filename**: Nombre del archivo generado

## 5. Manejo de Errores

### Posibles Errores y Soluciones
1. **400 Bad Request**: 
   - Causa: Prompt o plan faltante
   - Solución: Asegúrate de incluir ambos parámetros requeridos

2. **500 Internal Server Error**:
   - Causa: Problema en el servicio de generación de imágenes
   - Solución: Verifica los logs del servidor y asegúrate de que los servicios de Azure estén configurados correctamente

3. **Error de conexión**:
   - Causa: El servicio no está disponible en el puerto 4000
   - Solución: Verifica que el microservicio esté en ejecución