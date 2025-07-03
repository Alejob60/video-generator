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
var AudioController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioController = void 0;
const common_1 = require("@nestjs/common");
const azure_tts_service_1 = require("../../infrastructure/services/azure-tts.service");
const azure_blob_service_1 = require("../../infrastructure/services/azure-blob.service");
const llm_service_1 = require("../../infrastructure/services/llm.service");
const generate_audio_dto_1 = require("../dto/generate-audio.dto");
const fs = __importStar(require("fs"));
let AudioController = AudioController_1 = class AudioController {
    constructor(ttsService, llmService, azureBlobService) {
        this.ttsService = ttsService;
        this.llmService = llmService;
        this.azureBlobService = azureBlobService;
        this.logger = new common_1.Logger(AudioController_1.name);
    }
    async generateAudio(dto, req) {
        if (!dto.prompt) {
            throw new common_1.HttpException('Prompt requerido', common_1.HttpStatus.BAD_REQUEST);
        }
        const duration = dto.duration || 20;
        const userId = req.user?.id || 'anon';
        try {
            const script = await this.llmService.generateNarrativeScript(dto.prompt, duration);
            const audioResult = await this.ttsService.generateAudioFromPrompt(script);
            const blobName = `audio/${audioResult.fileName}`;
            await this.azureBlobService.uploadFileToBlob(audioResult.audioPath, blobName, 'audio/mpeg');
            const audioUrl = await this.azureBlobService.generateSasUrl(blobName, 86400);
            fs.unlinkSync(audioResult.audioPath);
            return {
                success: true,
                result: {
                    script,
                    audioUrl,
                    duration: audioResult.duration,
                },
            };
        }
        catch (error) {
            this.logger.error('❌ Error generando audio:', error);
            throw new common_1.HttpException('Error generando audio', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AudioController = AudioController;
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_audio_dto_1.GenerateAudioDto, Object]),
    __metadata("design:returntype", Promise)
], AudioController.prototype, "generateAudio", null);
exports.AudioController = AudioController = AudioController_1 = __decorate([
    (0, common_1.Controller)('audio'),
    __metadata("design:paramtypes", [azure_tts_service_1.AzureTTSService,
        llm_service_1.LLMService,
        azure_blob_service_1.AzureBlobService])
], AudioController);
//# sourceMappingURL=audio.controller.js.map