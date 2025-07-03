"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let LLMService = class LLMService {
    async generateScriptFromPrompt(prompt) {
        const azureOpenAiKey = process.env.AZURE_OPENAI_KEY;
        const azureOpenAiEndpoint = process.env.AZURE_OPENAI_GPT_ENDPOINT;
        const deploymentId = process.env.AZURE_OPENAI_GPT_DEPLOYMENT;
        const body = {
            messages: [
                {
                    role: 'system',
                    content: 'Actúa como guionista. Genera un libreto breve para un video educativo de 20 segundos. Usa lenguaje claro y amigable para niños.',
                },
                {
                    role: 'user',
                    content: prompt,
                }
            ],
            max_tokens: 250,
            temperature: 0.7,
        };
        const response = await axios_1.default.post(`${azureOpenAiEndpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=2024-02-15-preview`, body, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': azureOpenAiKey,
            },
        });
        return response.data.choices[0].message.content.trim();
    }
};
exports.LLMService = LLMService;
exports.LLMService = LLMService = __decorate([
    (0, common_1.Injectable)()
], LLMService);
//# sourceMappingURL=11m.service.js.map