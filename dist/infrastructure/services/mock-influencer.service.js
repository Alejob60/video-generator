"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MockInfluencerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockInfluencerService = void 0;
const common_1 = require("@nestjs/common");
let MockInfluencerService = MockInfluencerService_1 = class MockInfluencerService {
    constructor() {
        this.logger = new common_1.Logger(MockInfluencerService_1.name);
    }
    async authenticate() {
        this.logger.log('🔍 Authenticating with mock influencer API...');
        await new Promise(resolve => setTimeout(resolve, 500));
        const apiKey = process.env.MOCK_INFLUENCER_API_KEY;
        if (!apiKey) {
            this.logger.error('❌ MOCK_INFLUENCER_API_KEY not configured');
            return false;
        }
        this.logger.log('✅ Mock influencer API authentication successful');
        return true;
    }
    async generateVideoJob(dto) {
        this.logger.log(`🎬 Initiating influencer video job generation for image: ${dto.imageUrl}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const jobId = `job_inf_${Date.now().toString(36)}_${Math.floor(Math.random() * 100000)}`;
        this.logger.log(`✅ Generated mock influencer job ID: ${jobId}`);
        return {
            jobId,
            status: 'PENDING'
        };
    }
};
exports.MockInfluencerService = MockInfluencerService;
exports.MockInfluencerService = MockInfluencerService = MockInfluencerService_1 = __decorate([
    (0, common_1.Injectable)()
], MockInfluencerService);
//# sourceMappingURL=mock-influencer.service.js.map