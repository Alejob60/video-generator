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
var SoraService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoraService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const azure_blob_service_1 = require("./azure-blob.service");
const llm_service_1 = require("./llm.service");
let SoraService = SoraService_1 = class SoraService {
    constructor(azureBlobService, llmService) {
        this.azureBlobService = azureBlobService;
        this.llmService = llmService;
        this.logger = new common_1.Logger(SoraService_1.name);
        this.endpoint = process.env.AZURE_SORA_URL;
        this.deployment = process.env.AZURE_SORA_DEPLOYMENT;
        this.apiVersion = process.env.AZURE_SORA_API_VERSION || '2025-02-15-preview';
        this.apiKey = process.env.AZURE_SORA_API_KEY;
    }
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'api-key': this.apiKey,
        };
    }
    async createVideoJob(prompt, duration) {
        const cleanPrompt = await this.llmService.improveVideoPrompt(prompt);
        const url = `${this.endpoint}/openai/deployments/${this.deployment}/video/generations/jobs?api-version=${this.apiVersion}`;
        this.logger.log(`🌐 Enviando POST a: ${url}`);
        this.logger.log(`🚀 Prompt mejorado enviado: ${cleanPrompt}`);
        const body = {
            prompt: cleanPrompt,
            n_seconds: duration,
            n_variants: 1,
            height: 720,
            width: 1280,
        };
        try {
            const response = await axios_1.default.post(url, body, { headers: this.getHeaders() });
            const jobId = response.data.id;
            this.logger.log(`📨 Job de video creado con ID: ${jobId}`);
            return jobId;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                this.logger.error('❌ Error creando el job de video en Sora:', error.response?.data || error.message);
            }
            else {
                this.logger.error('❌ Error inesperado:', error);
            }
            throw new Error('Fallo al crear el job de video en Sora');
        }
    }
    async waitForVideo(jobId) {
        const statusUrl = `${this.endpoint}/openai/deployments/${this.deployment}/video/generations/jobs/${jobId}?api-version=${this.apiVersion}`;
        const maxAttempts = 60;
        const intervalMs = 5000;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            this.logger.log(`⏳ Esperando video (intento ${attempt})...`);
            await new Promise((resolve) => setTimeout(resolve, intervalMs));
            const response = await axios_1.default.get(statusUrl, { headers: this.getHeaders() });
            const status = response.data.status;
            this.logger.log(`🛰 Estado actual del job: ${status}`);
            if (status === 'succeeded') {
                const generations = response.data.generations ?? [];
                this.logger.debug(`📦 Respuesta completa del job:\n${JSON.stringify(response.data, null, 2)}`);
                if (generations.length > 0) {
                    const generationId = generations[0].id;
                    const videoUrl = `${this.endpoint}/openai/deployments/${this.deployment}/video/generations/${generationId}/content/video?api-version=${this.apiVersion}`;
                    this.logger.log(`🎬 Generation ID: ${generationId}`);
                    this.logger.log(`🔗 URL del video: ${videoUrl}`);
                    this.logger.log('⏱ Esperando 15 segundos adicionales para disponibilidad del archivo...');
                    await new Promise((resolve) => setTimeout(resolve, 15000));
                    return { url: videoUrl };
                }
                else {
                    this.logger.warn('⚠️ El video fue marcado como generado pero no se devolvió ninguna generación.');
                    throw new Error('Video generado pero sin contenido accesible.');
                }
            }
            else if (status === 'failed') {
                this.logger.error(`❌ Job ${jobId} fallido:`, JSON.stringify(response.data, null, 2));
                throw new Error('La generación del video falló.');
            }
        }
        throw new Error('⏰ Tiempo agotado esperando el video de Sora.');
    }
    async uploadVideoToBlob(videoUrl, filename) {
        const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);
        this.logger.log(`⬇️ Descargando video temporalmente: ${tempPath}`);
        this.logger.log(`📡 Desde: ${videoUrl}`);
        const response = await axios_1.default.get(videoUrl, {
            responseType: 'arraybuffer',
            headers: {
                ...this.getHeaders(),
                Accept: 'video/mp4',
            },
        });
        fs.writeFileSync(tempPath, response.data);
        this.logger.log('📦 Video descargado localmente.');
        const blobUrl = await this.azureBlobService.uploadFileToBlob(tempPath, filename, 'video/mp4');
        fs.unlinkSync(tempPath);
        this.logger.log(`☁️ Video subido a Azure Blob: ${blobUrl}`);
        return blobUrl;
    }
    async generateAndUploadVideo(prompt, duration) {
        const jobId = await this.createVideoJob(prompt, duration);
        const { url: videoUrl } = await this.waitForVideo(jobId);
        const filename = `video-${(0, uuid_1.v4)()}.mp4`;
        const blobUrl = await this.uploadVideoToBlob(videoUrl, filename);
        return {
            blobUrl,
            jobId,
        };
    }
};
exports.SoraService = SoraService;
exports.SoraService = SoraService = SoraService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [azure_blob_service_1.AzureBlobService,
        llm_service_1.LLMService])
], SoraService);
//# sourceMappingURL=sora.service.js.map