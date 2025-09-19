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
const llm_service_1 = require("../../infrastructure/services/llm.service");
const sora_video_client_service_1 = require("../../infrastructure/services/sora-video-client.service");
const azure_tts_service_1 = require("../../infrastructure/services/azure-tts.service");
const azure_blob_service_1 = require("../../infrastructure/services/azure-blob.service");
const generate_video_dto_1 = require("../dto/generate-video.dto");
let VideoController = VideoController_1 = class VideoController {
    constructor(llmService, soraClient, ttsService, azureBlobService) {
        this.llmService = llmService;
        this.soraClient = soraClient;
        this.ttsService = ttsService;
        this.azureBlobService = azureBlobService;
        this.logger = new common_1.Logger(VideoController_1.name);
    }
    async generateVideo(dto, req) {
        const userId = req?.user?.id || 'admin';
        const result = {
            userId,
            timestamp: Date.now(),
            videoUrl: '',
        };
        if (!dto.prompt || typeof dto.prompt !== 'string' || dto.prompt.trim().length < 10) {
            this.logger.warn(`[${userId}] ❌ Prompt inválido: "${dto.prompt}"`);
            throw new common_1.HttpException('El prompt debe tener al menos 10 caracteres.', common_1.HttpStatus.BAD_REQUEST);
        }
        const duration = 20;
        const plan = typeof dto.plan === 'string' && ['free', 'creator', 'pro'].includes(dto.plan) ? dto.plan : 'free';
        result.duration = duration;
        result.plan = plan;
        try {
            this.logger.log(`🎬 [${userId}] Iniciando generación con duración=${duration}s y plan=${plan}`);
            const soraDisponible = await this.soraClient.isHealthy();
            if (!soraDisponible) {
                this.logger.warn('🚫 Sora no disponible');
                result.error = 'Sora offline';
                return {
                    success: false,
                    message: 'Sora offline',
                    result,
                };
            }
            this.logger.log('🧠 Solicitando mejora del prompt...');
            const improvedPromptObject = await this.llmService.improveVideoPrompt(dto.prompt.trim());
            const improvedPromptString = `${improvedPromptObject.scene}. Characters: ${improvedPromptObject.characters.join(', ')}. Camera: ${improvedPromptObject.camera}. Lighting: ${improvedPromptObject.lighting}. Style: ${improvedPromptObject.style}. Focus: ${improvedPromptObject.interactionFocus}`;
            result.prompt = improvedPromptObject;
            this.logger.debug(`📤 Enviando solicitud a Sora con payload: ${JSON.stringify({ prompt: improvedPromptString, duration, plan })}`);
            const soraResponse = await this.soraClient.requestVideo(improvedPromptString, duration);
            const { video_url, job_id, generation_id, file_name } = soraResponse;
            if (!video_url || !file_name) {
                this.logger.warn('⚠️ Respuesta incompleta de Sora');
                result.error = 'Video no generado correctamente.';
                return {
                    success: false,
                    message: 'Fallo en la generación del video',
                    result,
                };
            }
            result.videoUrl = video_url;
            result.fileName = file_name;
            result.soraJobId = job_id;
            result.generationId = generation_id;
            if (dto.useVoice) {
                try {
                    this.logger.log('🎤 Generando narración TTS...');
                    const audioResult = await this.ttsService.generateAudioFromPrompt(improvedPromptString);
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
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_video_dto_1.GenerateVideoDto, Object]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "generateVideo", null);
exports.VideoController = VideoController = VideoController_1 = __decorate([
    (0, common_1.Controller)('videos'),
    __metadata("design:paramtypes", [llm_service_1.LLMService,
        sora_video_client_service_1.SoraVideoClientService,
        azure_tts_service_1.AzureTTSService,
        azure_blob_service_1.AzureBlobService])
], VideoController);
//# sourceMappingURL=video.controller.js.map