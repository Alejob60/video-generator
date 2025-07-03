"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var LLMService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const openai_1 = require("openai");
let LLMService = LLMService_1 = class LLMService {
    constructor() {
        this.logger = new common_1.Logger(LLMService_1.name);
        const apiKey = process.env.AZURE_OPENAI_API_KEY;
        if (!apiKey)
            throw new Error('❌ Falta AZURE_OPENAI_API_KEY');
        this.openai = new openai_1.OpenAI({ apiKey });
    }
    async generateNarrativeScript(prompt, duration) {
        const url = process.env.AZURE_OPENAI_GPT_URL;
        const apiKey = process.env.AZURE_OPENAI_KEY;
        if (!url || !apiKey) {
            throw new Error('❌ AZURE_OPENAI_GPT_URL o AZURE_OPENAI_KEY no definidos');
        }
        const wordLimitMap = { 20: 45, 30: 70, 60: 140 };
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
            const response = await axios_1.default.post(url, body, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey,
                },
            });
            const raw = response?.data?.choices?.[0]?.message?.content?.trim();
            const parsed = JSON.parse(raw);
            const script = parsed?.script;
            if (!script)
                throw new Error('❌ Campo "script" no encontrado');
            this.logger.log('✅ Libreto generado correctamente');
            return script;
        }
        catch (error) {
            this.logger.error('❌ Error generando libreto:', error);
            throw error;
        }
    }
    async improveVideoPrompt(prompt) {
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
    async improveImagePrompt(prompt) {
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
    async generateMusicPrompt(prompt) {
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
    async runPromptImprover(prompt, systemPrompt) {
        const url = process.env.AZURE_OPENAI_GPT_URL;
        const apiKey = process.env.AZURE_OPENAI_KEY;
        if (!url || !apiKey)
            throw new Error('❌ AZURE_OPENAI_GPT_URL o AZURE_OPENAI_KEY no definidos');
        const body = {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Prompt base: ${prompt}` },
            ],
            max_tokens: 300,
            temperature: 0.8,
        };
        try {
            const response = await axios_1.default.post(url, body, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey,
                },
            });
            const result = response?.data?.choices?.[0]?.message?.content?.trim();
            if (!result)
                throw new Error('⚠️ Prompt mejorado vacío');
            this.logger.log(`✅ Prompt mejorado: ${result}`);
            return result;
        }
        catch (error) {
            this.logger.error('❌ Error mejorando prompt:', error);
            throw error;
        }
    }
    async describeAndImproveImage(imagePath) {
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
    async classifyImageType(imagePath) {
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
};
exports.LLMService = LLMService;
exports.LLMService = LLMService = LLMService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LLMService);
//# sourceMappingURL=llm.service.js.map