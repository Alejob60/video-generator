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
var VeoVideoController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeoVideoController = void 0;
const common_1 = require("@nestjs/common");
const veo_video_service_1 = require("../../infrastructure/services/veo-video.service");
let VeoVideoController = VeoVideoController_1 = class VeoVideoController {
    constructor(veoVideoService) {
        this.veoVideoService = veoVideoService;
        this.logger = new common_1.Logger(VeoVideoController_1.name);
    }
    async generateVideo(dto, userId = 'anon') {
        try {
            this.logger.log(`🎬 Generating VEO3 video for user: ${userId}`);
            this.logger.log(`📝 Prompt: ${dto.prompt.substring(0, 100)}...`);
            const result = await this.veoVideoService.generateVideoAndNotify(userId, dto);
            return {
                success: true,
                message: '✅ VEO3 video generated successfully',
                data: {
                    videoUrl: result.videoUrl,
                    prompt: result.prompt,
                    filename: result.filename,
                },
            };
        }
        catch (error) {
            this.logger.error(`❌ Error: ${error.message}`, error.stack);
            throw new Error(`VEO3 video generation failed: ${error.message}`);
        }
    }
};
exports.VeoVideoController = VeoVideoController;
__decorate([
    (0, common_1.Post)('veo/video'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VeoVideoController.prototype, "generateVideo", null);
exports.VeoVideoController = VeoVideoController = VeoVideoController_1 = __decorate([
    (0, common_1.Controller)('media'),
    __metadata("design:paramtypes", [veo_video_service_1.VeoVideoService])
], VeoVideoController);
//# sourceMappingURL=veo-video.controller.js.map