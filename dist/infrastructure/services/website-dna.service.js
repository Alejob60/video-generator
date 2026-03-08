"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WebsiteDnaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteDnaService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const openai_1 = require("openai");
const extract_website_dna_dto_1 = require("../../interfaces/dto/extract-website-dna.dto");
let WebsiteDnaService = WebsiteDnaService_1 = class WebsiteDnaService {
    constructor() {
        this.logger = new common_1.Logger(WebsiteDnaService_1.name);
        this.openai = new openai_1.AzureOpenAI({
            apiKey: process.env.AZURE_OPENAI_KEY,
            endpoint: process.env.AZURE_OPENAI_GPT_URL.replace('/chat/completions', ''),
            apiVersion: process.env.AZURE_OPENAI_API_VERSION,
            deployment: process.env.AZURE_OPENAI_GPT_DEPLOYMENT,
        });
    }
    async extractDna(dto, userId) {
        try {
            let content = dto.html_structure;
            if (!content) {
                content = await this.scrapeWebsiteContent(dto.url);
            }
            const systemPrompt = this.getSystemPrompt();
            const userPrompt = this.getUserPrompt(dto.url, content, dto.extraction_mode || extract_website_dna_dto_1.ExtractionMode.FULL);
            this.logger.log(`🤖 Enviando análisis a GPT-4o para URL: ${dto.url}`);
            const response = await this.openai.chat.completions.create({
                model: process.env.AZURE_OPENAI_GPT_DEPLOYMENT,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.1,
                max_tokens: 2000,
            });
            const aiResponse = response.choices[0]?.message?.content;
            if (!aiResponse) {
                throw new Error('No se recibió respuesta del modelo de IA');
            }
            const dnaResult = this.parseAndValidateDnaResponse(aiResponse);
            this.logger.log(`🧬 ADN extraído exitosamente para ${dto.url}`);
            return {
                url: dto.url,
                extraction_mode: dto.extraction_mode || 'full',
                plan: dto.plan,
                userId,
                ...dnaResult
            };
        }
        catch (error) {
            this.logger.error(`❌ Error en extracción de ADN: ${error.message}`);
            throw error;
        }
    }
    async scrapeWebsiteContent(url) {
        try {
            this.logger.log(`🌐 Scraping contenido de: ${url}`);
            const response = await axios_1.default.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            const bodyMatch = response.data.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            const bodyContent = bodyMatch ? bodyMatch[1] : response.data;
            const maxLength = 15000;
            const truncatedContent = bodyContent.length > maxLength
                ? bodyContent.substring(0, maxLength) + '... [contenido truncado]'
                : bodyContent;
            this.logger.log(`📄 Contenido obtenido (${truncatedContent.length} caracteres)`);
            return truncatedContent;
        }
        catch (error) {
            this.logger.error(`❌ Error scraping ${url}: ${error.message}`);
            throw new Error(`No se pudo acceder al sitio web: ${error.message}`);
        }
    }
    getSystemPrompt() {
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
    getUserPrompt(url, content, mode) {
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
    getModeDescription(mode) {
        const descriptions = {
            [extract_website_dna_dto_1.ExtractionMode.FULL]: 'Análisis completo de todos los aspectos',
            [extract_website_dna_dto_1.ExtractionMode.VISUAL]: 'Enfoque en elementos visuales y estilos',
            [extract_website_dna_dto_1.ExtractionMode.CONTENT]: 'Enfoque en estrategia de contenido y texto',
            [extract_website_dna_dto_1.ExtractionMode.STRUCTURE]: 'Enfoque en arquitectura y organización'
        };
        return descriptions[mode] || 'Análisis general';
    }
    parseAndValidateDnaResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No se encontró estructura JSON válida en la respuesta');
            }
            const jsonData = JSON.parse(jsonMatch[0]);
            const requiredSections = ['brand_dna', 'logical_orders', 'css_tokens'];
            const missingSections = requiredSections.filter(section => !(section in jsonData));
            if (missingSections.length > 0) {
                this.logger.warn(`⚠️ Secciones faltantes en respuesta: ${missingSections.join(', ')}`);
            }
            return jsonData;
        }
        catch (error) {
            this.logger.error(`❌ Error parseando respuesta JSON: ${error.message}`);
            this.logger.debug(`Respuesta recibida: ${response.substring(0, 200)}...`);
            throw new Error('La IA devolvió una respuesta con formato JSON inválido');
        }
    }
};
exports.WebsiteDnaService = WebsiteDnaService;
exports.WebsiteDnaService = WebsiteDnaService = WebsiteDnaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], WebsiteDnaService);
//# sourceMappingURL=website-dna.service.js.map