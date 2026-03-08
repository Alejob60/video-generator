// 📁 src/infrastructure/services/website-dna.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AzureOpenAI } from 'openai';
import { ExtractWebsiteDnaDto, ExtractionMode } from '../../interfaces/dto/extract-website-dna.dto';

@Injectable()
export class WebsiteDnaService {
  private readonly logger = new Logger(WebsiteDnaService.name);
  private readonly openai: AzureOpenAI;

  constructor() {
    this.openai = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_KEY!,
      endpoint: process.env.AZURE_OPENAI_GPT_URL!.replace('/chat/completions', ''),
      apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
      deployment: process.env.AZURE_OPENAI_GPT_DEPLOYMENT!,
    });
  }

  async extractDna(dto: ExtractWebsiteDnaDto, userId: string) {
    try {
      // 1. Obtener contenido del sitio si no se proporcionó
      let content = dto.html_structure;
      if (!content) {
        content = await this.scrapeWebsiteContent(dto.url);
      }

      // 2. Preparar el prompt del sistema
      const systemPrompt = this.getSystemPrompt();
      
      // 3. Preparar el prompt de usuario
      const userPrompt = this.getUserPrompt(dto.url, content, dto.extraction_mode || ExtractionMode.FULL);

      // 4. Llamar a GPT-4o para el análisis
      this.logger.log(`🤖 Enviando análisis a GPT-4o para URL: ${dto.url}`);
      
      const response = await this.openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_GPT_DEPLOYMENT!,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1, // Bajo para consistencia
        max_tokens: 2000,
      });

      // 5. Parsear la respuesta JSON
      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('No se recibió respuesta del modelo de IA');
      }

      // 6. Validar y retornar el JSON
      const dnaResult = this.parseAndValidateDnaResponse(aiResponse);
      
      this.logger.log(`🧬 ADN extraído exitosamente para ${dto.url}`);
      
      return {
        url: dto.url,
        extraction_mode: dto.extraction_mode || 'full',
        plan: dto.plan,
        userId,
        ...dnaResult
      };

    } catch (error: any) {
      this.logger.error(`❌ Error en extracción de ADN: ${error.message}`);
      throw error;
    }
  }

  private async scrapeWebsiteContent(url: string): Promise<string> {
    try {
      this.logger.log(`🌐 Scraping contenido de: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      // Extraer solo el body para reducir tamaño
      const bodyMatch = response.data.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const bodyContent = bodyMatch ? bodyMatch[1] : response.data;
      
      // Limitar el tamaño del contenido
      const maxLength = 15000;
      const truncatedContent = bodyContent.length > maxLength 
        ? bodyContent.substring(0, maxLength) + '... [contenido truncado]'
        : bodyContent;

      this.logger.log(`📄 Contenido obtenido (${truncatedContent.length} caracteres)`);
      return truncatedContent;

    } catch (error: any) {
      this.logger.error(`❌ Error scraping ${url}: ${error.message}`);
      throw new Error(`No se pudo acceder al sitio web: ${error.message}`);
    }
  }

  private getSystemPrompt(): string {
    return `Actúa como un experto en Design Systems y Arquitecto de Información. Tu objetivo es realizar una ingeniería inversa del 'ADN' de un sitio web a partir del contenido o código proporcionado.

Tu tarea consiste en entregar un objeto JSON estricto con las siguientes secciones:

1. Visual Identity (CSS DNA): Extrae la paleta de colores (hex), tipografías (primaria/secundaria), radios de borde (border-radius), y estilos de botones.

2. Content Strategy: Resume el tono de voz, la propuesta de valor principal y los pilares de contenido del sitio.

3. UI Patterns: Identifica los componentes clave (hero, pricing tables, testimonials) y sus estructuras.

4. Design Instructions: Genera un bloque de 'instrucciones maestras' en formato de variables CSS o clases de Tailwind para replicar este estilo en nuevos proyectos.

Restricciones:
- No inventes datos que no estén en la fuente
- Si no detectas una fuente específica, sugiere una de Google Fonts que sea visualmente similar
- El output debe ser exclusivamente JSON válido
- Usa nombres de variables semánticos y consistentes
- Incluye comentarios explicativos cuando sea relevante`;
  }

  private getUserPrompt(url: string, content: string, mode: ExtractionMode): string {
    return `Analiza el siguiente contenido extraído del sitio web ${url}:

${content}

Genera el informe de ADN siguiendo el esquema JSON definido. Asegúrate de:
- Separar los colores de fondo de los colores de acento
- Definir el 'spacing' predominante
- Identificar las fuentes principales y secundarias
- Extraer patrones de diseño repetitivos
- Sugerir valores CSS/Tailwind reutilizables

Modo de extracción: ${mode}
Enfoque en: ${this.getModeDescription(mode)}`;
  }

  private getModeDescription(mode: ExtractionMode): string {
    const descriptions = {
      [ExtractionMode.FULL]: 'Análisis completo de todos los aspectos',
      [ExtractionMode.VISUAL]: 'Enfoque en elementos visuales y estilos',
      [ExtractionMode.CONTENT]: 'Enfoque en estrategia de contenido y texto',
      [ExtractionMode.STRUCTURE]: 'Enfoque en arquitectura y organización'
    };
    return descriptions[mode] || 'Análisis general';
  }

  private parseAndValidateDnaResponse(response: string): any {
    try {
      // Extraer JSON del response (manejar posibles prefijos)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se encontró estructura JSON válida en la respuesta');
      }

      const jsonData = JSON.parse(jsonMatch[0]);
      
      // Validación básica de estructura esperada
      const requiredSections = ['brand_dna', 'logical_orders', 'css_tokens'];
      const missingSections = requiredSections.filter(section => !(section in jsonData));
      
      if (missingSections.length > 0) {
        this.logger.warn(`⚠️ Secciones faltantes en respuesta: ${missingSections.join(', ')}`);
      }

      return jsonData;
    } catch (error: any) {
      this.logger.error(`❌ Error parseando respuesta JSON: ${error.message}`);
      this.logger.debug(`Respuesta recibida: ${response.substring(0, 200)}...`);
      throw new Error('La IA devolvió una respuesta con formato JSON inválido');
    }
  }
}