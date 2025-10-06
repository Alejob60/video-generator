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
var PromoImageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoImageService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("openai");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const llm_service_1 = require("./llm.service");
const azure_blob_service_1 = require("./azure-blob.service");
const flux_image_service_1 = require("./flux-image.service");
let PromoImageService = PromoImageService_1 = class PromoImageService {
    constructor(llmService, azureBlobService, fluxImageService) {
        this.llmService = llmService;
        this.azureBlobService = azureBlobService;
        this.fluxImageService = fluxImageService;
        this.logger = new common_1.Logger(PromoImageService_1.name);
        this.endpoint = process.env.AZURE_OPENAI_IMAGE_ENDPOINT;
        this.deployment = process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT;
        this.apiVersion = process.env.AZURE_OPENAI_IMAGE_API_VERSION;
        this.backendUrl = process.env.MAIN_BACKEND_URL;
        this.apiKey = process.env.AZURE_OPENAI_IMAGE_API_KEY;
        this.openai = new openai_1.OpenAI({
            apiKey: this.apiKey,
            baseURL: this.endpoint,
        });
    }
    async generateAndNotify(userId, input) {
        let { prompt, imagePath, useFlux } = input;
        let improvedPrompt = null;
        if (!prompt && !imagePath) {
            throw new Error('Debe proporcionar un prompt o una ruta de imagen.');
        }
        if (prompt) {
            improvedPrompt = await this.llmService.improveImagePrompt(prompt);
        }
        else if (imagePath) {
            const type = await this.llmService.classifyImageType(imagePath);
            const basePrompt = await this.llmService.describeAndImproveImage(imagePath);
            switch (type) {
                case 'producto':
                    improvedPrompt = `${basePrompt}. Fondo blanco profesional con luz suave y superficie reflectante.`;
                    break;
                case 'persona':
                    improvedPrompt = `${basePrompt}. Fondo de estudio moderno con iluminación suave.`;
                    break;
                case 'mascota':
                    improvedPrompt = `${basePrompt}. Fondo colorido con elementos divertidos.`;
                    break;
                case 'paisaje':
                    improvedPrompt = `${basePrompt}. Mejorar contraste y profundidad del fondo.`;
                    break;
                default:
                    improvedPrompt = basePrompt;
            }
            this.logger.log(`🎨 Prompt ajustado según tipo "${type}": ${improvedPrompt}`);
        }
        let azureUrl;
        let localFilename;
        if (useFlux && prompt) {
            this.logger.log(`🤖 Usando FLUX-1.1-pro para generar imagen para usuario ${userId}`);
            const fluxDto = {
                prompt: improvedPrompt,
                plan: 'FREE'
            };
            const fluxResult = await this.fluxImageService.generateImage(fluxDto);
            azureUrl = fluxResult.imageUrl;
            localFilename = fluxResult.filename;
        }
        else {
            this.logger.log(`🤖 Usando DALL·E para generar imagen para usuario ${userId}`);
            const result = await this.generateImageWithText({
                prompt: improvedPrompt,
            });
            azureUrl = result.azureUrl;
            localFilename = result.localFilename;
        }
        await fetch(`${this.backendUrl}/promo-image/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                prompt: improvedPrompt,
                imageUrl: azureUrl,
                filename: localFilename,
                useFlux: useFlux || false,
            }),
        });
        return {
            imageUrl: azureUrl,
            prompt: improvedPrompt,
            imagePath: null,
            filename: localFilename,
        };
    }
    async generateImageWithText({ prompt, }) {
        const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
        const outputDir = path.resolve('public/uploads');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            this.logger.log(`📁 Carpeta creada: ${outputDir}`);
        }
        const baseImagePath = await this.generateImageFromPrompt(prompt);
        const fallbackName = `promo_${timestamp}.png`;
        const fallbackPath = path.join(outputDir, fallbackName);
        fs.copyFileSync(baseImagePath, fallbackPath);
        this.logger.log('🧾 Imagen generada directamente, sin FFmpeg.');
        const uploadedUrl = await this.azureBlobService.uploadToContainer(fallbackPath, 'images');
        this.logger.log(`✅ Imagen subida a Azure Blob Storage: ${uploadedUrl}`);
        return {
            azureUrl: uploadedUrl,
            localFilename: fallbackName,
        };
    }
    async generateImageFromPrompt(prompt) {
        if (!prompt)
            throw new Error('Prompt vacío');
        const blockedTerms = ['garras', 'arma', 'pelea', 'violencia', 'sangre'];
        const isBlocked = blockedTerms.some(term => prompt.toLowerCase().includes(term));
        if (isBlocked) {
            throw new Error('El prompt contiene palabras que pueden violar las políticas de contenido de Azure.');
        }
        this.logger.log(`📡 Solicitando imagen a Azure con prompt: ${prompt}`);
        const client = new openai_1.AzureOpenAI({
            apiKey: this.apiKey,
            endpoint: this.endpoint,
            deployment: this.deployment,
            apiVersion: this.apiVersion,
        });
        try {
            const result = await client.images.generate({
                prompt,
                n: 1,
                size: '1024x1024',
                style: 'vivid',
                quality: 'standard',
            });
            const imageUrl = result.data?.[0]?.url;
            if (!imageUrl)
                throw new Error('No se pudo obtener la URL de la imagen generada.');
            const filename = `generated_${Date.now()}.png`;
            const outputDir = path.resolve('public/uploads');
            const localPath = path.join(outputDir, filename);
            this.logger.log(`🌐 Imagen recibida desde Azure. URL: ${imageUrl}`);
            const response = await fetch(imageUrl);
            const buffer = await response.arrayBuffer();
            fs.writeFileSync(localPath, Buffer.from(buffer));
            this.logger.log(`💾 Imagen descargada y guardada en: ${localPath}`);
            return localPath;
        }
        catch (error) {
            const policyViolation = error?.error?.code === 'content_policy_violation';
            if (policyViolation) {
                this.logger.error('🔒 Azure bloqueó el contenido por política.');
                throw new Error('Azure bloqueó el contenido del prompt por considerarlo sensible. Intenta con otra descripción.');
            }
            this.logger.error('❌ Error generando imagen desde Azure DALL·E.', error);
            throw new Error('Error generando imagen desde Azure DALL·E.');
        }
    }
};
exports.PromoImageService = PromoImageService;
exports.PromoImageService = PromoImageService = PromoImageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [llm_service_1.LLMService,
        azure_blob_service_1.AzureBlobService,
        flux_image_service_1.FluxImageService])
], PromoImageService);
//# sourceMappingURL=promo-image.service.js.map