# Instrucciones para FLUX.1-Kontext-pro

## Descripción

FLUX.1-Kontext-pro es un modelo avanzado de generación de imágenes que puede crear nuevas imágenes a partir de prompts de texto y también editar imágenes existentes utilizando una imagen de referencia.

## Casos de Uso

### 1. Generación de Imágenes desde Texto
Crear nuevas imágenes completamente nuevas basadas en descripciones textuales.

**Prompt recomendado**:
```
{
  "scene_description": "Una descripción detallada de la escena deseada",
  "visual_elements": ["elemento1", "elemento2", "elemento3"],
  "style": "estilo artístico deseado",
  "mood": "atmosfera o emoción deseada",
  "color_palette": ["color1", "color2", "color3"],
  "composition": "tipo de encuadre y composición",
  "lighting": "tipo de iluminación",
  "details": "detalles específicos importantes"
}
```

### 2. Edición de Imágenes con Referencia
Modificar una imagen existente manteniendo características específicas de una imagen de referencia.

**Cómo funciona**:
1. Cargar una imagen de referencia
2. Proporcionar un prompt descriptivo
3. El modelo combinará elementos de la imagen de referencia con la descripción del prompt

## Mejores Prácticas para Prompts

### Para Generación de Imágenes
1. **Sea específico**: Incluya detalles sobre estilo, colores, iluminación y composición
2. **Use descripciones visuales**: Enfóquese en elementos visuales en lugar de conceptos abstractos
3. **Especifique el estilo**: Indique claramente el estilo artístico deseado (fotografía, pintura, dibujo, etc.)
4. **Incluya detalles técnicos**: Mencione aspectos como encuadre, profundidad de campo, tipo de lente

### Para Edición con Referencia
1. **Describa lo que quiere mantener**: Identifique elementos específicos de la imagen de referencia que desea conservar
2. **Especifique cambios deseados**: Indique claramente qué aspectos desea modificar
3. **Mencione el contexto**: Proporcione información sobre el entorno o situación deseada

## Ejemplos de Prompts

### Ejemplo 1: Generación de Producto
```json
{
  "scene_description": "Zapatillas deportivas flotando sobre un fondo minimalista blanco",
  "visual_elements": [
    "zapatillas blancas con detalles en negro",
    "cordones fluorescentes",
    "suela transparente",
    "sombra suave debajo"
  ],
  "style": "fotografía comercial de productos",
  "mood": "moderno y limpio",
  "color_palette": [
    "blanco", "negro", "gris", "toque de verde fluorescente"
  ],
  "composition": "plano cenital, producto centrado, fondo completamente blanco",
  "lighting": "iluminación de estudio suave y uniforme",
  "details": "textura de la malla visible, reflejos sutiles en la suela"
}
```

### Ejemplo 2: Edición con Referencia
```json
{
  "scene_description": "Retrato de una persona con el estilo y textura de la imagen de referencia",
  "visual_elements": [
    "rostro frontal mirando a cámara",
    "expresión neutra y profesional",
    "fondo desenfocado"
  ],
  "style": "copiar el estilo artístico de la imagen de referencia",
  "mood": "profesional y confiable",
  "color_palette": [
    "tonos de piel naturales", "fondo neutro"
  ],
  "composition": "primer plano centrado, espacio suficiente alrededor",
  "lighting": "iluminación natural suave desde el frente",
  "details": "mantener la textura y calidad de la imagen de referencia"
}
```

## Parámetros Adicionales

### Tamaño de Imagen
- `1024x1024`: Calidad estándar, equilibrado
- `1024x768`: Formato horizontal, ideal para paisajes
- `768x1024`: Formato vertical, ideal para retratos

### Planes de Usuario
- `FREE`: Acceso básico con limitaciones
- `CREATOR`: Calidad mejorada y más opciones
- `PRO`: Máxima calidad y todas las funciones

## Consideraciones Técnicas

### Formatos de Imagen Soportados
- PNG
- JPEG
- WEBP

### Tamaño Máximo de Imagen de Referencia
- 10 MB

### Tiempo de Procesamiento
- Generación de imagen nueva: 5-15 segundos
- Edición con referencia: 10-25 segundos

## Solución de Problemas

### Problemas Comunes
1. **Imágenes borrosas**: Intente especificar "alta resolución" o "detalle nítido" en el prompt
2. **Colores incorrectos**: Sea más específico en la paleta de colores
3. **Composición extraña**: Detalle más precisamente el encuadre y disposición

### Errores de API
1. **400 Bad Request**: Verifique que todos los campos requeridos estén presentes y en el formato correcto
2. **401 Unauthorized**: Asegúrese de que las credenciales de Azure estén configuradas correctamente
3. **500 Internal Server Error**: Intente nuevamente; puede ser un problema temporal del servicio

## Consejos Avanzados

1. **Iteración**: Use la salida de una generación como punto de partida para ediciones posteriores
2. **Combinación de estilos**: Para combinar estilos, mencione explícitamente ambos en el prompt
3. **Control de calidad**: Especifique "alta calidad" o "resolución ultra alta" para mejores resultados
4. **Detalles técnicos**: Incluya términos como "8K", "fotografía profesional", "detalle extremo" para resultados más nítidos