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
var InfluencerController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfluencerController = void 0;
const common_1 = require("@nestjs/common");
const influencer_service_1 = require("../../application/services/influencer.service");
const generate_influencer_dto_1 = require("../dto/generate-influencer.dto");
let InfluencerController = InfluencerController_1 = class InfluencerController {
    constructor(influencerService) {
        this.influencerService = influencerService;
        this.logger = new common_1.Logger(InfluencerController_1.name);
    }
    async generateInfluencerVideo(dto, req) {
        const userId = req.user?.id || 'anon';
        try {
            this.logger.log(`🎬 Generating influencer video for user ${userId}`);
            if (!dto.imageUrl || !dto.script || !dto.voiceId) {
                throw new common_1.HttpException('❌ imageUrl, script, and voiceId are required.', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.influencerService.initiateInfluencerGeneration(userId, dto);
            this.logger.log(`✅ Influencer video generation initiated for user ${userId}`);
            return {
                success: true,
                message: 'Influencer video generation initiated successfully',
                statusCode: common_1.HttpStatus.CREATED,
                result: {
                    jobId: result.jobId,
                    userId,
                    timestamp: Date.now(),
                },
            };
        }
        catch (error) {
            this.logger.error(`❌ Error generating influencer video for user ${userId}:`, error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error initiating influencer video generation.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.InfluencerController = InfluencerController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_influencer_dto_1.GenerateInfluencerDto, Object]),
    __metadata("design:returntype", Promise)
], InfluencerController.prototype, "generateInfluencerVideo", null);
exports.InfluencerController = InfluencerController = InfluencerController_1 = __decorate([
    (0, common_1.Controller)('media/influencer'),
    __metadata("design:paramtypes", [influencer_service_1.InfluencerService])
], InfluencerController);
//# sourceMappingURL=influencer.controller.js.map