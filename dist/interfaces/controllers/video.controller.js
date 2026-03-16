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
var VideoController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoController = void 0;
const common_1 = require("@nestjs/common");
const veo_video_service_1 = require("../../infrastructure/services/veo-video.service");
const azure_tts_service_1 = require("../../infrastructure/services/azure-tts.service");
const azure_blob_service_1 = require("../../infrastructure/services/azure-blob.service");
const generate_video_dto_1 = require("../dto/generate-video.dto");
let VideoController = VideoController_1 = class VideoController {
    constructor(veoService, ttsService, azureBlobService) {
        this.veoService = veoService;
        this.ttsService = ttsService;
        this.azureBlobService = azureBlobService;
        this.logger = new common_1.Logger(VideoController_1.name);
    }
    checkHealth() {
        return {
            status: 'ok',
            veo: true,
            timestamp: new Date(),
        };
    }
    async generateVideo(dto, req) {
        const userId = req?.user?.id || 'admin';
        const result = {
            userId,
            timestamp: Date.now(),
            videoUrl: '',
        };
        if (!dto.prompt) {
            this.logger.warn(`[${userId}] ❌ Prompt inválido: "${dto.prompt}"`);
            throw new common_1.HttpException('El prompt es requerido.', common_1.HttpStatus.BAD_REQUEST);
        }
        const duration = dto.n_seconds || 10;
        const plan = typeof dto.plan === 'string' && ['free', 'creator', 'pro'].includes(dto.plan) ? dto.plan : 'free';
        result.duration = duration;
        result.plan = plan;
        try {
            this.logger.log(`🎬 [${userId}] Iniciando generación con duración=${duration}s y plan=${plan}`);
            this.logger.debug(`📤 Enviando solicitud a VEO3 con payload: ${JSON.stringify({ prompt: dto.prompt, duration, plan })}`);
            const veoDto = {
                prompt: typeof dto.prompt === 'string' ? dto.prompt : JSON.stringify(dto.prompt),
                videoLength: Math.min(duration, 60),
                aspectRatio: '16:9',
                fps: 24,
                negativePrompt: 'blurry, low quality, distorted',
            };
            const veoResponse = await this.veoService.generateVideo(veoDto);
            const { videoUrl, filename } = veoResponse;
            if (!videoUrl || !filename) {
                this.logger.warn('⚠️ Respuesta incompleta de VEO3');
                result.error = 'Video no generado correctamente.';
                return {
                    success: false,
                    message: 'Fallo en la generación del video',
                    result,
                };
            }
            result.videoUrl = videoUrl;
            result.fileName = filename;
            result.jobId = filename;
            if (dto.useVoice) {
                try {
                    this.logger.log('🎤 Generando narración TTS...');
                    const audioResult = await this.ttsService.generateAudioFromPrompt(typeof dto.prompt === 'string' ? dto.prompt : JSON.stringify(dto.prompt));
                    result.audioUrl = audioResult.blobUrl;
                    result.script = audioResult.script;
                }
                catch (err) {
                    this.logger.warn(`⚠️ Error en TTS: ${err instanceof Error ? err.message : err}`);
                    result.audioError = 'No se pudo generar el audio';
                }
            }
            if (dto.useSubtitles)
                result.subtitles = 'pendiente';
            if (dto.useMusic)
                result.music = 'pendiente';
            this.logger.log('✅ Video generado correctamente');
            return {
                success: true,
                message: 'Medios generados exitosamente',
                result,
            };
        }
        catch (err) {
            this.logger.error(`❌ Error en flujo general: ${err instanceof Error ? err.message : err}`);
            result.error = 'Fallo inesperado al generar video';
            return {
                success: false,
                message: 'Fallo interno en la generación del video',
                result,
            };
        }
    }
};
exports.VideoController = VideoController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VideoController.prototype, "checkHealth", null);
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_video_dto_1.GenerateVideoDto, Object]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "generateVideo", null);
exports.VideoController = VideoController = VideoController_1 = __decorate([
    (0, common_1.Controller)('videos'),
    __metadata("design:paramtypes", [veo_video_service_1.VeoVideoService,
        azure_tts_service_1.AzureTTSService,
        azure_blob_service_1.AzureBlobService])
], VideoController);
//# sourceMappingURL=video.controller.js.map