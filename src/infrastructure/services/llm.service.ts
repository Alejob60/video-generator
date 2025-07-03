// src/infrastructure/services/llm.service.ts
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

  // 1. Libretos narrativos para voz/audio
  async generateNarrativeScript(prompt: string, duration: number): Promise<string> {
    const url = process.env.AZURE_OPENAI_GPT_URL;
    const apiKey = process.env.AZURE_OPENAI_KEY;

    if (!url || !apiKey) {
      throw new Error('❌ AZURE_OPENAI_GPT_URL o AZURE_OPENAI_KEY no definidos');
    }

    const wordLimitMap: Record<number, number> = { 20: 45, 30: 70, 60: 140 };
    const wordLimit = wordLimitMap[duration] || 60;

    const systemPrompt = `
      Eres un generador experto de libretos narrativos hablados para niños, jóvenes o contenido educativo. 
      Devuelve únicamente un JSON:
      {
        "script": "Texto narrado aquí, con máximo ${wordLimit} palabras, sin saludos ni despedidas."
      }
      No escribas nada fuera del JSON.
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
      this.logger.log(`✍️ Generando libreto narrativo (${duration}s) desde: ${url}`);
      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
      });

      const raw = response?.data?.choices?.[0]?.message?.content?.trim();
      const parsed = JSON.parse(raw);
      const script = parsed?.script;

      if (!script) throw new Error('❌ Campo "script" no encontrado');
      this.logger.log('✅ Libreto generado correctamente');
      return script;
    } catch (error) {
      this.logger.error('❌ Error generando libreto:', error);
      throw error;
    }
  }

  // 2. Mejora prompt visual para video
  async improveVideoPrompt(prompt: string): Promise<string> {
    return this.runPromptImprover(prompt, `
      Eres un experto en diseño cinematográfico para IA. 
      Mejora este prompt para generar un video, incluyendo:
      - Escenario detallado: estilo, texturas, fondo.
      - Movimiento de cámara: panorámica, zoom, enfoque.
      - Iluminación: suave, intensa, dramática.
      - Detalles visuales y estilo: brillante, oscuro, fantasioso, realista.
      No escribas introducciones. Solo el prompt mejorado.
    `.trim());
  }

  // 3. Mejora prompt para imagen
  async improveImagePrompt(prompt: string): Promise<string> {
    return this.runPromptImprover(prompt, `
      Eres un experto en generación de imágenes para IA. 
      Mejora el prompt incluyendo:
      - Estilo visual (ej. minimalista, barroco, moderno).
      - Fondo (paisaje, urbano, surrealista).
      - Iluminación (brillante, oscura, suave).
      - Composición: simetría, regla de los tercios, líneas de fuga.
      Devuelve solo el prompt mejorado, sin explicaciones.
    `.trim());
  }

  // 4. Genera prompt para música IA
  async generateMusicPrompt(prompt: string): Promise<string> {
    return this.runPromptImprover(prompt, `
      Eres un compositor de música IA. 
      A partir del tema indicado, crea una descripción que incluya:
      - Género musical (ej. pop, electrónica, jazz).
      - Ritmo y BPM.
      - Instrumentación principal (ej. guitarra, sintetizador, percusión).
      - Ambiente emocional (ej. alegre, relajante, épico).
      Devuelve solo el prompt mejorado para IA de música.
    `.trim());
  }

  // Auxiliar para mejorar prompts
  private async runPromptImprover(prompt: string, systemPrompt: string): Promise<string> {
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
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
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

  // Análisis visual para imagen
  async describeAndImproveImage(imagePath: string): Promise<string> {
    const buffer = await fs.promises.readFile(imagePath);
    const base64 = buffer.toString('base64');

    const result = await this.openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Describe esta imagen como si fuera un producto y sugiere un nuevo fondo atractivo para marketing.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${base64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const content = result.choices?.[0]?.message?.content?.trim();
    this.logger.log(`🧠 Prompt generado desde imagen: ${content}`);
    return content || 'Producto con fondo profesional neutro';
  }

  // Clasificación rápida de imagen
  async classifyImageType(imagePath: string): Promise<string> {
    const buffer = await fs.promises.readFile(imagePath);
    const base64 = buffer.toString('base64');

    const result = await this.openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Responde con una sola palabra: persona, producto, mascota, paisaje u otro.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${base64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 10,
    });

    const classification = result.choices?.[0]?.message?.content?.trim().toLowerCase();
    this.logger.log(`🔍 Clasificación detectada: ${classification}`);
    return classification || 'otro';
  }
}
