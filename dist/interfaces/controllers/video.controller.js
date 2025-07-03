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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
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
const fs = __importStar(require("fs"));
const axios_1 = __importDefault(require("axios"));
let VideoController = VideoController_1 = class VideoController {
    constructor(llmService, soraClient, ttsService, azureBlobService) {
        this.llmService = llmService;
        this.soraClient = soraClient;
        this.ttsService = ttsService;
        this.azureBlobService = azureBlobService;
        this.logger = new common_1.Logger(VideoController_1.name);
    }
    async generateVideo(dto, req) {
        const userId = req.user?.id || 'anon';
        const duration = dto.duration || 10;
        if (!dto.prompt) {
            throw new common_1.HttpException('Prompt requerido', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            this.logger.log(`🎬 [${userId}] Iniciando generación de video...`);
            const improvedPrompt = await this.llmService.improveVideoPrompt(dto.prompt);
            this.logger.log(`✨ Prompt mejorado:\n${improvedPrompt}`);
            const soraResponse = await this.soraClient.requestVideo(improvedPrompt, duration);
            const { video_url, job_id, generation_id, file_name } = soraResponse;
            if (!video_url || !job_id || !generation_id || !file_name) {
                this.logger.error(`❌ Respuesta incompleta desde sora-video:\n${JSON.stringify(soraResponse)}`);
                throw new common_1.HttpException('Error en microservicio Sora', common_1.HttpStatus.BAD_GATEWAY);
            }
            this.logger.log(`🎥 Video generado exitosamente: ${video_url}`);
            const result = {
                prompt: improvedPrompt,
                videoUrl: video_url,
                fileName: file_name,
                soraJobId: job_id,
                generationId: generation_id,
                duration,
                userId,
                timestamp: Date.now(),
            };
            if (dto.useVoice) {
                this.logger.log('🎙️ Generando narración con TTS...');
                const audioResult = await this.ttsService.generateAudioFromPrompt(improvedPrompt);
                const blobName = `audio/${audioResult.fileName}`;
                await this.azureBlobService.uploadFileToBlob(audioResult.audioPath, blobName, 'audio/mpeg');
                const audioUrl = await this.azureBlobService.generateSasUrl(blobName, 86400);
                fs.unlinkSync(audioResult.audioPath);
                result.audioUrl = audioUrl;
                result.script = audioResult.script;
            }
            if (dto.useSubtitles) {
                this.logger.log('📝 Subtítulos solicitados (pendiente generación en versión 2)');
                result.subtitles = 'pendiente';
            }
            if (dto.useMusic) {
                this.logger.log('🎵 Música solicitada (pendiente generación en versión 2)');
                result.music = 'pendiente';
            }
            return {
                success: true,
                message: 'Video generado correctamente',
                result,
            };
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                this.logger.error('❌ Axios error:', error.response?.data || error.message);
            }
            else {
                this.logger.error('❌ Error inesperado:', error);
            }
            throw new common_1.HttpException('Error al generar video', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
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