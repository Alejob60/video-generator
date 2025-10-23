# Análisis: Mejora del Script de Audio

## Problema Identificado

El sistema actual de generación de audio tiene un problema crítico: **no está creando un script adecuado para narración promocional**. Actualmente:

1. **Toma el prompt directamente** y lo envía a Azure TTS
2. **No adapta el contenido** para hacerlo más promocional o coherente
3. **No estructura el mensaje** para una narración efectiva

## Análisis del Flujo Actual

### 1. AudioController
- Recibe el prompt directamente del DTO
- Llama a `AzureTTSService.generateAudioFromPrompt(prompt)` sin procesamiento adicional

### 2. AzureTTSService
- Envía el prompt tal cual a Azure TTS
- No hay mejora ni adaptación del texto
- El resultado es una lectura mecánica del prompt original

### 3. AudioGeneratorService
- Similar al AzureTTSService, envía el prompt directamente
- No hay procesamiento de narrativa

### 4. GenerateAudioUseCase (No utilizado en el flujo principal)
- Este caso de uso sí intenta mejorar el script:
  - Llama a `LLMService.generateNarrativeScript()` para crear un libreto
  - Luego genera audio con `AudioGenerator.generateFromText()`
- **Pero este flujo no se está utilizando en los endpoints activos**

## Solución Propuesta

### Opción 1: Modificar AzureTTSService para mejorar el script
```typescript
// En AzureTTSService.generateAudioFromPrompt()
async generateAudioFromPrompt(prompt: string): Promise<{
  script: string;
  duration: number;
  filename: string;
  blobUrl: string;
}> {
  // 1. Mejorar el prompt para hacerlo más narrativo/promocional
  const improvedScript = await this.llmService.generateNarrativeScript(prompt, 30);
  
  // 2. Usar el script mejorado para la generación de audio
  const payload = {
    model: this.model,
    input: improvedScript.script, // Usar el script mejorado
    voice: this.voice,
  };
  
  // ... resto del proceso
}
```

### Opción 2: Utilizar el GenerateAudioUseCase existente
- Modificar los controladores para usar el caso de uso en lugar del servicio directo
- Esto requeriría inyección de dependencias del caso de uso

### Opción 3: Crear un nuevo servicio intermedio
- Crear un servicio que mejore el script antes de enviarlo a TTS
- Mantener separadas las responsabilidades

## Implementación Recomendada

Recomiendo la **Opción 1** porque:
1. Es la solución más rápida de implementar
2. Mantiene la funcionalidad existente
3. Mejora directamente el resultado percibido por el usuario

## Cambios Necesarios

### 1. Modificar AzureTTSService
```typescript
// Inyectar LLMService
constructor(
  private readonly blobService: AzureBlobService,
  private readonly llmService: LLMService // Nueva dependencia
) {}

// Modificar generateAudioFromPrompt
async generateAudioFromPrompt(prompt: string): Promise<{
  script: string;
  duration: number;
  filename: string;
  blobUrl: string;
}> {
  // Generar un script narrativo mejorado
  const narrativeResult = await this.llmService.generateNarrativeScript(
    prompt, 
    30, // Duración por defecto
    'promotional' // Tipo de narración
  );
  
  const improvedScript = narrativeResult.script;
  
  // Resto del proceso usando improvedScript en lugar de prompt original
  // ...
}
```

### 2. Ajustar el prompt del LLM para contenido promocional
En LLMService.generateNarrativeScript, mejorar el system prompt:

```typescript
const systemPrompt = `
Eres un experto en copywriting y narración promocional para videos de redes sociales.
Tu tarea es convertir el prompt de entrada en un guion de narración efectivo que:

1. Capture atención inmediata (primeras 3 palabras deben ser impactantes)
2. Explique el concepto de forma clara y concisa
3. Cree un llamado a la acción implícito
4. Sea fácil de narrar con entusiasmo
5. Mantenga un tono promocional pero auténtico

Estructura tu respuesta como:
{
  "script": "Texto narrativo optimizado para TTS"
}

Mantén el script entre 50-100 palabras para una duración de 20-30 segundos.
`.trim();
```

## Beneficios de la Implementación

1. **Mejor calidad de narración**: Los audios serán más coherentes y promocionales
2. **Mayor engagement**: Los mensajes tendrán mejor estructura narrativa
3. **Consistencia**: Todos los audios seguirán un formato probado
4. **Compatibilidad**: Sin romper la funcionalidad existente

## Consideraciones

1. **Costo adicional**: Cada generación de audio implicará una llamada extra a LLM
2. **Latencia**: El proceso será ligeramente más lento
3. **Dependencia**: Mayor dependencia de la disponibilidad del servicio LLM

Esta mejora resolverá el problema de que los audios suenen como lecturas mecánicas y los convertirá en narraciones promocionales efectivas.