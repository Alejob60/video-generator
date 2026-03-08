import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import { OpenAI } from 'openai';

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private readonly openai: OpenAI;

  constructor() {
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    if (!apiKey) throw new Error('❌ Falta AZURE_OPENAI_API_KEY');
    this.openai = new OpenAI({ apiKey });
  }

  // 1️⃣ Libretos narrativos en JSON mejorados
  async generateNarrativeScript(
    prompt: string,
    duration: number,
    intent: string = 'general'
  ): Promise<{ script: string }> {
    const url = process.env.AZURE_OPENAI_GPT_URL;
    const apiKey = process.env.AZURE_OPENAI_KEY;
    if (!url || !apiKey) throw new Error('❌ AZURE_OPENAI_GPT_URL o AZURE_OPENAI_KEY no definidos');

    const wordLimitMap: Record<number, number> = { 20: 45, 30: 70, 60: 140 };
    const wordLimit = wordLimitMap[duration] || 60;

    // Prompt mejorado para contenido promocional
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

${intent === 'promotional' ? 
  'Enfoque: Crea un mensaje promocional convincente que invite a la acción.' : 
  'Enfoque: Crea un mensaje informativo claro y atractivo.'}

Mantén el script entre ${Math.max(30, wordLimit-20)}-${wordLimit+20} palabras para una duración de ${duration} segundos.
`.trim();

    const body = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Quiero un libreto para: ${prompt}` },
      ],
      max_tokens: 500,
      temperature: 0.7,
    };

    try {
      this.logger.log(`🎙️ Generando libreto narrativo (${duration}s, intención: ${intent}) desde: ${url}`);
      const response = await axios.post(url, body, {
        headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      });

      const raw = response?.data?.choices?.[0]?.message?.content?.trim();
      if (!raw) throw new Error('❌ Respuesta vacía del modelo');
      
      // Intentar parsear como JSON primero
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // Si no es JSON, asumir que es texto plano
        parsed = { script: raw.replace(/^["']|["']$/g, '') }; // Remover comillas si las tiene
      }
      
      if (!parsed?.script) throw new Error('❌ Campo "script" no encontrado');
      this.logger.log('✅ Libreto generado correctamente');
      return parsed;
    } catch (error) {
      this.logger.error('❌ Error generando libreto:', error);
      throw error;
    }
  }

  // 2️⃣ Prompts JSON para video mejorados
  async improveVideoPrompt(prompt: string): Promise<{
    scene: string;
    characters: string[];
    camera: string;
    lighting: string;
    style: string;
    interactionFocus: string;
  }> {
    const systemPrompt = `
Eres un director creativo experto en videos para IA.
Toma el prompt base y conviértelo en el siguiente JSON:
{
  "scene": "Lugar, época, hora del día, clima, colores dominantes",
  "characters": ["Personajes principales, actitud, vestuario, expresión facial"],
  "camera": "Ángulo, movimiento, enfoque, profundidad de campo",
  "lighting": "Tipo, dirección, intensidad, atmósfera",
  "style": "Estilo visual, nivel de detalle, referencias artísticas",
  "interactionFocus": "Elemento central de interacción o acción visual"
}
No incluyas explicaciones, solo devuelve el JSON. Sé preciso, conciso y creativo.
`.trim();

    return this.runJsonPrompt(prompt, systemPrompt);
  }

  // 3️⃣ Prompts mejorados para imagen
  async improveImagePrompt(prompt: string): Promise<string> {
    const systemPrompt = `
Eres un artista digital experto en generación de imágenes por IA.
Toma el prompt base y mejóralo incluyendo:
- Estilo visual (ej. minimalista, barroco, anime, Ghibli)
- Fondo detallado y coherente con la escena
- Iluminación realista o dramática según contexto
- Composición, perspectiva, líneas de fuga, simetría
- Paleta de colores y texturas
- Emoción o atmósfera que transmita la escena
Devuelve solo el prompt mejorado, listo para usar en generación de imágenes.
`.trim();

    return this.runRawPrompt(prompt, systemPrompt);
  }

  // 4️⃣ Prompts mejorados para música IA
  async generateMusicPrompt(prompt: string): Promise<string> {
    const systemPrompt = `
Eres un compositor profesional de música IA.
Toma el prompt base y mejóralo incluyendo:
- Género y subgénero musical
- BPM y tempo sugerido
- Instrumentación principal y secundaria
- Estado emocional y atmósfera
- Dinámica y ritmo de la pieza
- Textura y efectos de sonido relevantes
Devuelve solo el prompt mejorado, listo para generar música.
`.trim();

    return this.runRawPrompt(prompt, systemPrompt);
  }

  // 5️⃣ Generador visual a partir de imagen
  async describeAndImproveImage(imagePath: string): Promise<string> {
    const buffer = await fs.promises.readFile(imagePath);
    const base64 = buffer.toString('base64');

    const result = await this.openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: `Describe esta imagen como producto y sugiere fondo para marketing.` },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } },
          ],
        },
      ],
      max_tokens: 300,
    });

    const content = result.choices?.[0]?.message?.content?.trim();
    this.logger.log(`📸 Prompt generado desde imagen: ${content}`);
    return content || 'Producto con fondo profesional neutro';
  }

  // 6️⃣ Clasificación rápida de imagen
  async classifyImageType(imagePath: string): Promise<string> {
    const buffer = await fs.promises.readFile(imagePath);
    const base64 = buffer.toString('base64');

    const result = await this.openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: `Responde con una sola palabra: persona, producto, mascota, paisaje u otro.` },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } },
          ],
        },
      ],
      max_tokens: 10,
    });

    const classification = result.choices?.[0]?.message?.content?.trim().toLowerCase();
    this.logger.log(`🔍 Clasificación detectada: ${classification}`);
    return classification || 'otro';
  }

  // 🧩 Helper: Prompt JSON
  private async runJsonPrompt<T>(prompt: string, systemPrompt: string): Promise<T> {
    const url = process.env.AZURE_OPENAI_GPT_URL;
    const apiKey = process.env.AZURE_OPENAI_KEY;
    if (!url || !apiKey) throw new Error('❌ AZURE_OPENAI_GPT_URL o AZURE_OPENAI_KEY no definidos');

    const body = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Prompt base: ${prompt}` },
      ],
      max_tokens: 600,
      temperature: 0.7,
    };

    try {
      const response = await axios.post(url, body, {
        headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      });

      const result = response?.data?.choices?.[0]?.message?.content?.trim();
      if (!result) throw new Error('⚠️ Respuesta JSON vacía');
      const parsed = JSON.parse(result);
      this.logger.log(`✅ JSON recibido: ${JSON.stringify(parsed)}`);
      return parsed;
    } catch (error) {
      this.logger.error('❌ Error procesando JSON:', error);
      throw error;
    }
  }

  // 🧩 Helper: Prompt raw
  private async runRawPrompt(prompt: string, systemPrompt: string): Promise<string> {
    const url = process.env.AZURE_OPENAI_GPT_URL;
    const apiKey = process.env.AZURE_OPENAI_KEY;
    if (!url || !apiKey) throw new Error('❌ AZURE_OPENAI_GPT_URL o AZURE_OPENAI_KEY no definidos');

    const body = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Prompt base: ${prompt}` },
      ],
      max_tokens: 300,
      temperature: 0.8,
    };

    try {
      const response = await axios.post(url, body, {
        headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      });

      const result = response?.data?.choices?.[0]?.message?.content?.trim();
      if (!result) throw new Error('⚠️ Prompt mejorado vacío');
      this.logger.log(`✅ Prompt mejorado: ${result}`);
      return result;
    } catch (error) {
      this.logger.error('❌ Error mejorando prompt:', error);
      throw error;
    }
  }

  async generateFluxPrompt(dto: any): Promise<string> {
    return `
Two realistic cats dressed as Naruto characters, detailed costumes with headbands and village symbols, photorealistic style, vibrant colors including orange, blue, black, silver, natural fur textures, soft diffused lighting highlighting details, neutral ninja-themed background, medium shot with both cats centered, one slightly in front, direct gaze at camera, hyperrealistic photography, high resolution, professional image quality.

Negative prompt: humans, people, cartoon, anime style, low quality, blurry, text, watermark
`;
  }
}
