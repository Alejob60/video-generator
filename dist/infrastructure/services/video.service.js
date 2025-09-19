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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var VideoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const service_bus_service_1 = require("./service-bus.service");
const azure_blob_service_1 = require("./azure-blob.service");
const error_util_1 = require("../../common/utils/error.util");
let VideoService = VideoService_1 = class VideoService {
    constructor(bus, azureBlobService) {
        this.bus = bus;
        this.azureBlobService = azureBlobService;
        this.logger = new common_1.Logger(VideoService_1.name);
        this.soraEndpoint = process.env.AZURE_SORA_URL;
        this.apiKey = process.env.AZURE_SORA_API_KEY;
        this.soraApiVersion = process.env.AZURE_SORA_API_VERSION;
        this.ttsUrl = process.env.AZURE_TTS_URL;
        this.ttsVoice = 'nova';
    }
    buildPath(type, timestamp) {
        const base = path_1.default.resolve(__dirname, '../../../public');
        return {
            video: `${base}/videos/sora_video_${timestamp}.mp4`,
            audio: `${base}/audio/audio_${timestamp}.mp3`,
            subtitles: `${base}/subtitles/${timestamp}.srt`,
        }[type];
    }
    async generateFullVideo(options) {
        const timestamp = Date.now();
        this.logger.log(`🚀 Solicitando video con prompt:\n${options.script}`);
        const { data } = await axios_1.default.post(`${this.soraEndpoint}/video/generations/jobs?api-version=${this.soraApiVersion}`, {
            prompt: options.script.slice(0, 500),
            n_variants: 1,
            n_seconds: options.n_seconds || 5,
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
        await this.bus.sendVideoJobMessage(jobId, timestamp, {
            script: options.script,
            narration: options.useVoice,
            subtitles: options.useSubtitles,
        });
        return { jobId, timestamp };
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
                this.logger.warn(`⚠️ Error al consultar estado (intento ${attempts + 1}): ${(0, error_util_1.safeErrorMessage)(err)}`);
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
                this.logger.warn(`🔁 Error al verificar URL (${attempts + 1}): ${(0, error_util_1.safeErrorMessage)(err)}`);
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
        const writer = fs_1.default.createWriteStream(targetPath);
        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }
    async downloadTTS(text, targetPath) {
        const response = await axios_1.default.post(this.ttsUrl, {
            model: 'gpt-4o-mini-tts',
            input: text,
            voice: this.ttsVoice,
        }, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            responseType: 'stream',
        });
        const writer = fs_1.default.createWriteStream(targetPath);
        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }
    generateSubtitles(script, subtitlePath) {
        const lines = script.split('.').map(s => s.trim()).filter(Boolean);
        const srt = lines.map((line, i) => {
            const start = `00:00:${String(i * 2).padStart(2, '0')},000`;
            const end = `00:00:${String(i * 2 + 1).padStart(2, '0')},800`;
            return `${i + 1}\n${start} --> ${end}\n${line}\n`;
        }).join('\n');
        fs_1.default.writeFileSync(subtitlePath, srt);
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
    __param(0, (0, common_1.Inject)(service_bus_service_1.ServiceBusService)),
    __metadata("design:paramtypes", [service_bus_service_1.ServiceBusService,
        azure_blob_service_1.AzureBlobService])
], VideoService);
//# sourceMappingURL=video.service.js.map