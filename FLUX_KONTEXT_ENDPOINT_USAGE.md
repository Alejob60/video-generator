# Uso del Endpoint FLUX.1-Kontext-pro

## Descripción
Este documento explica cómo utilizar el nuevo endpoint para la IA FLUX.1-Kontext-pro que permite generar imágenes a partir de prompts de texto y también editar imágenes utilizando una imagen de referencia.

## Endpoint
```
POST /media/flux-kontext-image
```

## Funcionalidades
1. **Generación de imágenes**: Crear nuevas imágenes a partir de prompts de texto
2. **Edición de imágenes**: Modificar imágenes existentes utilizando una imagen de referencia

## Parámetros del DTO

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `prompt` | string | Sí | Prompt descriptivo para la generación o edición de imagen |
| `plan` | string | Sí | Plan del usuario ('FREE', 'CREATOR', 'PRO') |
| `size` | string | No | Tamaño de la imagen ('1024x1024', '1024x768', '768x1024') |
| `isJsonPrompt` | boolean | No | Indica si el prompt está en formato JSON |
| `negative_prompt` | string | No | Prompt negativo para excluir elementos |

## Uso

### 1. Generación de Imágenes
Para generar una nueva imagen sin imagen de referencia:

```bash
curl -X POST "http://localhost:8080/media/flux-kontext-image" \
     -H "Content-Type: application/json" \
     -d '{
       "prompt": "A majestic lion in the savannah at sunset",
       "plan": "PRO",
       "size": "1024x1024"
     }'
```

### 2. Edición de Imágenes con Referencia
Para editar una imagen utilizando una imagen de referencia:

```bash
curl -X POST "http://localhost:8080/media/flux-kontext-image" \
     -F "referenceImage=@ruta/a/tu/imagen.png" \
     -F "prompt=Un paisaje hermoso en el estilo de la imagen de referencia" \
     -F "plan=PRO" \
     -F "size=1024x1024"
```

## Respuesta
La respuesta incluye:
- `success`: Boolean indicando si la operación fue exitosa
- `message`: Mensaje descriptivo
- `data`: Objeto con detalles de la imagen generada
  - `imageUrl`: URL de la imagen generada
  - `filename`: Nombre del archivo
  - `userId`: ID del usuario
  - `prompt`: Prompt utilizado

## Autenticación
El endpoint utiliza autenticación con Azure Entra ID a través de `DefaultAzureCredential`.

## Notas
- Las imágenes generadas se almacenan en Azure Blob Storage
- El sistema notifica al backend principal cuando se completa la generación
- Se soporta procesamiento de prompts JSON mediante el servicio LLM