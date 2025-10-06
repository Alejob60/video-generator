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
var AudioGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const azure_tts_service_1 = require("./azure-tts.service");
const azure_blob_service_1 = require("./azure-blob.service");
const node_fetch_1 = __importDefault(require("node-fetch"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let AudioGeneratorService = AudioGeneratorService_1 = class AudioGeneratorService {
    constructor(ttsService, azureBlobService) {
        this.ttsService = ttsService;
        this.azureBlobService = azureBlobService;
        this.logger = new common_1.Logger(AudioGeneratorService_1.name);
        this.backendUrl = process.env.MAIN_BACKEND_URL;
    }
    async generateAudio(userId, prompt, duration, plan = 'FREE', creditsUsed = 5) {
        try {
            this.logger.log(`🎙️ Generando audio TTS directamente desde el prompt...`);
            const ttsResult = await this.ttsService.generateAudioFromPrompt(prompt);
            const audioPath = ttsResult.filename;
            const fileName = path.basename(audioPath);
            const blobName = `audio/${fileName}`;
            this.logger.log(`☁️ Subiendo audio a Azure Blob: ${blobName}`);
            await this.azureBlobService.uploadFileToBlob(audioPath, blobName, 'audio/mpeg');
            this.logger.log(`🔐 Generando URL segura (SAS, 24h)...`);
            const audioUrl = await this.azureBlobService.generateSasUrl(blobName, 86400);
            this.logger.log(`📡 Notificando al backend principal...`);
            await (0, node_fetch_1.default)(`${this.backendUrl}/audio/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    prompt: prompt,
                    audioUrl,
                    duration: ttsResult.duration,
                    plan,
                    creditsUsed,
                    fileName,
                    status: 'ready',
                    timestamp: Date.now(),
                    source: 'audio-generator',
                }),
            });
            this.logger.log(`✅ Notificación enviada al backend principal`);
            fs.unlinkSync(audioPath);
            return {
                script: prompt,
                audioUrl,
                duration: ttsResult.duration,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`❌ Error generando audio: ${error.message}`, error.stack);
                throw new Error(`Fallo en generación de audio: ${error.message}`);
            }
            else {
                const stringified = JSON.stringify(error);
                this.logger.error(`❌ Error desconocido: ${stringified}`);
                throw new Error('Fallo en generación de audio: error desconocido');
            }
        }
    }
};
exports.AudioGeneratorService = AudioGeneratorService;
exports.AudioGeneratorService = AudioGeneratorService = AudioGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [azure_tts_service_1.AzureTTSService,
        azure_blob_service_1.AzureBlobService])
], AudioGeneratorService);
//# sourceMappingURL=audio-generator.service.js.map