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
var AudioController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioController = void 0;
const common_1 = require("@nestjs/common");
const azure_tts_service_1 = require("../../infrastructure/services/azure-tts.service");
const generate_audio_dto_1 = require("../dto/generate-audio.dto");
let AudioController = AudioController_1 = class AudioController {
    constructor(ttsService) {
        this.ttsService = ttsService;
        this.logger = new common_1.Logger(AudioController_1.name);
    }
    async generateAudio(dto, req) {
        if (!dto.prompt) {
            throw new common_1.HttpException('Prompt requerido', common_1.HttpStatus.BAD_REQUEST);
        }
        const userId = req.user?.id || 'labs';
        const generationId = `gen_${Date.now().toString(36)}_${Math.floor(Math.random() * 10000)}`;
        const timestamp = Date.now();
        try {
            this.logger.log(`🎙️ Generando audio para el usuario ${userId} con prompt:\n${dto.prompt}`);
            const result = await this.ttsService.generateAudioFromPrompt(dto.prompt);
            return {
                success: true,
                message: '🎧 Audio generado con éxito',
                result: {
                    ...result,
                    generationId,
                    userId,
                    timestamp,
                },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            this.logger.error(`❌ Error generando audio: ${errorMessage}`);
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
    __metadata("design:paramtypes", [azure_tts_service_1.AzureTTSService])
], AudioController);
//# sourceMappingURL=audio.controller.js.map