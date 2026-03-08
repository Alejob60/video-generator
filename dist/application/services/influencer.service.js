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
var InfluencerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfluencerService = void 0;
const common_1 = require("@nestjs/common");
const service_bus_service_1 = require("../../infrastructure/services/service-bus.service");
const mock_influencer_service_1 = require("../../infrastructure/services/mock-influencer.service");
let InfluencerService = InfluencerService_1 = class InfluencerService {
    constructor(mockInfluencerService, bus) {
        this.mockInfluencerService = mockInfluencerService;
        this.bus = bus;
        this.logger = new common_1.Logger(InfluencerService_1.name);
    }
    async initiateInfluencerGeneration(userId, dto) {
        this.logger.log(`🎬 Initiating influencer video generation for user: ${userId}`);
        const isAuthenticated = await this.mockInfluencerService.authenticate();
        if (!isAuthenticated) {
            throw new Error('❌ Failed to authenticate with influencer API');
        }
        const { jobId, status } = await this.mockInfluencerService.generateVideoJob(dto);
        this.logger.log(`📋 Job created with ID: ${jobId}, status: ${status}`);
        await this.bus.sendInfluencerJobMessage(jobId, userId, {
            imageUrl: dto.imageUrl,
            script: dto.script,
            voiceId: dto.voiceId,
            plan: dto.plan,
            timestamp: Date.now(),
        });
        this.logger.log(`✅ Influencer job ${jobId} sent to queue for processing`);
        return {
            jobId,
            message: 'Influencer video generation initiated successfully',
        };
    }
};
exports.InfluencerService = InfluencerService;
exports.InfluencerService = InfluencerService = InfluencerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_influencer_service_1.MockInfluencerService,
        service_bus_service_1.ServiceBusService])
], InfluencerService);
//# sourceMappingURL=influencer.service.js.map