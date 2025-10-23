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
var VideoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
const service_bus_service_1 = require("./service-bus.service");
const azure_blob_service_1 = require("./azure-blob.service");
const publicDir = path.resolve(__dirname, '../../../public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}
let VideoService = VideoService_1 = class VideoService {
    constructor(bus, azureBlobService) {
        this.bus = bus;
        this.azureBlobService = azureBlobService;
        this.logger = new common_1.Logger(VideoService_1.name);
        this.soraEndpoint = process.env.AZURE_SORA_URL;
        this.apiKey = process.env.AZURE_SORA_API_KEY;
        this.soraApiVersion = process.env.AZURE_SORA_API_VERSION || '2025-02-15-preview';
        this.ttsUrl = process.env.AZURE_TTS_ENDPOINT || 'https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com';
        this.ttsKey = process.env.AZURE_TTS_KEY || process.env.AZURE_OPENAI_KEY;
        this.ttsVoice = process.env.AZURE_TTS_VOICE || 'nova';
        const dirs = ['videos', 'audio', 'subtitles'];
        dirs.forEach(dir => {
            const dirPath = path.join(publicDir, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        });
    }
    buildPath(type, timestamp) {
        const base = path.resolve(__dirname, '../../../public');
        return {
            video: `${base}/videos/sora_video_${timestamp}.mp4`,
            audio: `${base}/audio/audio_${timestamp}.mp3`,
            subtitles: `${base}/subtitles/${timestamp}.srt`,
        }[type];
    }
    async generateFullVideo(dto) {
        try {
            this.logger.log(`🎬 Iniciando generación de video con prompt JSON directo...`);
            const soraPayload = {
                prompt: dto.prompt,
                duration: dto.n_seconds ?? 10,
                realism: "photorealistic",
                physics: "natural",
                lighting: "ambient realistic",
            };
            const { data } = await axios_1.default.post(`${this.soraEndpoint}/video/generations/jobs?api-version=${this.soraApiVersion}`, {
                prompt: JSON.stringify(dto.prompt),
                n_variants: 1,
                n_seconds: dto.n_seconds || 5,
                height: 1080,
                width: 1080,
                model: 'soramodel',
            }, {
                headers: {
                    'api-key': this.apiKey,
                    'Content-Type': 'application/json',
                },
            });
            const jobId = data.id;
            this.logger.log(`📨 Job enviado a Sora con ID: ${jobId}`);
            await this.bus.sendVideoJobMessage(jobId, Date.now(), {
                script: JSON.stringify(dto.prompt),
                prompt: JSON.stringify(dto.prompt),
                n_seconds: dto.n_seconds || 5,
                narration: dto.useVoice || false,
                subtitles: dto.useSubtitles || false,
            });
            return { jobId, timestamp: Date.now() };
        }
        catch (error) {
            this.logger.error(`❌ Error al generar video`, error);
            throw error;
        }
    }
    async processGeneratedAssets(jobId, timestamp, metadata) {
        const statusUrl = `${this.soraEndpoint}/openai/v1/video/generations/jobs/${jobId}?api-version=preview`;
        let status = '';
        let generationId = '';
        let attempts = 0;
        while (status !== 'succeeded' && status !== 'failed' && attempts < 30) {
            try {
                const response = await axios_1.default.get(statusUrl, {
                    headers: { 'api-key': this.apiKey },
                });
                status = response.data.status;
                generationId = response.data.generations?.[0]?.id || '';
                this.logger.log(`🔁 Estado del job ${jobId}: ${status}`);
            }
            catch (err) {
                this.logger.warn(`⚠️ Error al consultar estado (intento ${attempts + 1}): ${safeErrorMessage(err)}`);
            }
            if (status !== 'succeeded') {
                await new Promise(res => setTimeout(res, 5000));
                attempts++;
            }
        }
        if (!generationId) {
            throw new Error('⛔ Generación fallida o incompleta en Sora.');
        }
        const videoUrl = `${this.soraEndpoint}/openai/v1/video/generations/${generationId}/content/video?api-version=preview`;
        await this.waitForUrlAvailable(videoUrl);
        const videoPath = this.buildPath('video', timestamp);
        const audioPath = this.buildPath('audio', timestamp);
        const subtitlePath = this.buildPath('subtitles', timestamp);
        await this.downloadFile(videoUrl, videoPath);
        let audio_blob_url = null;
        let subtitles_blob_url = null;
        if (metadata.narration === true) {
            this.logger.log('🎙️ Generando narración...');
            await this.downloadTTS(metadata.script, audioPath);
            audio_blob_url = await this.azureBlobService.uploadFile(audioPath, 'audio');
        }
        if (metadata.subtitles === true) {
            this.logger.log('📝 Generando subtítulos...');
            this.generateSubtitles(metadata.script, subtitlePath);
            subtitles_blob_url = await this.azureBlobService.uploadFile(subtitlePath, 'subtitles');
        }
        const video_blob_url = await this.azureBlobService.uploadFile(videoPath, 'video');
        this.logger.log(`📤 Video subido: ${video_blob_url}`);
        return {
            success: true,
            message: '🎬 Medios generados exitosamente',
            data: {
                prompt: metadata.script,
                timestamp,
                video_url: video_blob_url,
                audio_url: audio_blob_url,
                subtitles_url: subtitles_blob_url,
            },
        };
    }
    async waitForUrlAvailable(url, maxAttempts = 30, delayMs = 5000) {
        let attempts = 0;
        while (attempts < maxAttempts) {
            try {
                const response = await axios_1.default.head(url, {
                    headers: { 'api-key': this.apiKey },
                    validateStatus: status => status < 500,
                });
                if (response.status === 200) {
                    this.logger.log(`🎯 URL disponible: ${url}`);
                    return;
                }
                this.logger.log(`🕐 Reintentando acceso (${attempts + 1})...`);
            }
            catch (err) {
                this.logger.warn(`🔁 Error al verificar URL (${attempts + 1}): ${safeErrorMessage(err)}`);
            }
            await new Promise(resolve => setTimeout(resolve, delayMs));
            attempts++;
        }
        throw new Error(`⛔ No se pudo acceder al recurso tras ${maxAttempts} intentos: ${url}`);
    }
    async downloadFile(url, targetPath) {
        const response = await axios_1.default.get(url, {
            headers: { 'api-key': this.apiKey },
            responseType: 'stream',
        });
        const writer = fs.createWriteStream(targetPath);
        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }
    async downloadTTS(text, targetPath) {
        try {
            const response = await axios_1.default.post(`${this.ttsUrl}/openai/deployments/gpt-4o-mini-tts/audio/speech?api-version=2025-03-01-preview`, {
                model: 'gpt-4o-mini-tts',
                input: text,
                voice: this.ttsVoice,
            }, {
                headers: {
                    'api-key': this.ttsKey,
                    'Content-Type': 'application/json',
                },
                responseType: 'stream',
            });
            const writer = fs.createWriteStream(targetPath);
            return new Promise((resolve, reject) => {
                response.data.pipe(writer);
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        }
        catch (error) {
            this.logger.error(`❌ Error al generar audio TTS: ${safeErrorMessage(error)}`);
            throw error;
        }
    }
    generateSubtitles(script, subtitlePath) {
        const lines = script.split('.').map(s => s.trim()).filter(Boolean);
        const srt = lines.map((line, i) => {
            const start = `00:00:${String(i * 2).padStart(2, '0')},000`;
            const end = `00:00:${String(i * 2 + 1).padStart(2, '0')},800`;
            return `${i + 1}\n${start} --> ${end}\n${line}\n`;
        }).join('\n');
        fs.writeFileSync(subtitlePath, srt);
    }
    async getVideoJobStatus(jobId) {
        const statusUrl = `${this.soraEndpoint}/openai/v1/video/generations/jobs/${jobId}?api-version=preview`;
        const { data } = await axios_1.default.get(statusUrl, {
            headers: {
                'api-key': this.apiKey,
                'Content-Type': 'application/json',
            },
        });
        return {
            status: data.status,
            generationId: data.generations?.[0]?.id,
        };
    }
};
exports.VideoService = VideoService;
exports.VideoService = VideoService = VideoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [service_bus_service_1.ServiceBusService,
        azure_blob_service_1.AzureBlobService])
], VideoService);
function safeErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}
//# sourceMappingURL=video.service.js.map