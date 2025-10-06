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
var AzureTTSService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureTTSService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const get_audio_duration_1 = require("get-audio-duration");
const azure_blob_service_1 = require("./azure-blob.service");
let AzureTTSService = AzureTTSService_1 = class AzureTTSService {
    constructor(blobService) {
        this.blobService = blobService;
        this.logger = new common_1.Logger(AzureTTSService_1.name);
        this.apiUrl = `${process.env.AZURE_TTS_ENDPOINT}/openai/deployments/${process.env.AZURE_TTS_DEPLOYMENT}/audio/speech?api-version=${process.env.AZURE_TTS_API_VERSION}`;
        this.apiKey = process.env.AZURE_TTS_KEY;
        this.voice = process.env.AZURE_TTS_VOICE || 'nova';
        this.model = 'gpt-4o-mini-tts';
    }
    async generateAudioFromPrompt(prompt) {
        const filename = `audio-${(0, uuid_1.v4)()}.mp3`;
        const localDir = path.join(__dirname, '../../../public/audio');
        const localPath = path.join(localDir, filename);
        try {
            if (!fs.existsSync(localDir))
                fs.mkdirSync(localDir, { recursive: true });
            this.logger.log(`📡 Enviando texto a Azure TTS...`);
            const payload = {
                model: this.model,
                input: prompt,
                voice: this.voice,
            };
            const response = await axios_1.default.post(this.apiUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
                responseType: 'arraybuffer',
            });
            if (!response.data || response.data.length < 1000) {
                this.logger.error(`❌ Respuesta inválida de Azure TTS`);
                throw new Error('No se recibió contenido de audio válido');
            }
            fs.writeFileSync(localPath, response.data);
            const duration = await (0, get_audio_duration_1.getAudioDurationInSeconds)(localPath);
            this.logger.log(`☁️ Subiendo a Azure Blob Storage...`);
            await this.blobService.uploadFileToBlob(localPath, `audio/${filename}`, 'audio/mpeg');
            const blobUrl = await this.blobService.generateSasUrl(`audio/${filename}`, 86400);
            fs.unlinkSync(localPath);
            this.logger.log(`✅ Audio generado y subido correctamente`);
            return {
                script: prompt,
                duration,
                filename,
                blobUrl,
            };
        }
        catch (error) {
            this.logger.error(`❌ Error al generar audio con Azure TTS`);
            this.logger.error(error?.message || 'Error desconocido');
            if (fs.existsSync(localPath))
                fs.unlinkSync(localPath);
            if (error.code === 'ECONNREFUSED' ||
                error.message?.includes('Resource not found') ||
                error.message?.includes('ENOTFOUND')) {
                this.logger.warn('⚠️ Reinicio simulado por error crítico...');
                this.triggerSelfRestart();
            }
            throw new Error('Error generando audio, pero el sistema sigue funcionando');
        }
    }
    triggerSelfRestart() {
        const isAzure = process.env.WEBSITE_INSTANCE_ID;
        if (isAzure) {
            this.logger.warn('🔄 Reinicio simulado en Azure: finalizando proceso actual...');
            setTimeout(() => process.exit(1), 3000);
        }
        else {
            this.logger.warn('🔁 Reinicio local omitido (no es entorno Azure)');
        }
    }
};
exports.AzureTTSService = AzureTTSService;
exports.AzureTTSService = AzureTTSService = AzureTTSService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [azure_blob_service_1.AzureBlobService])
], AzureTTSService);
//# sourceMappingURL=azure-tts.service.js.map