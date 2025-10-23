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
var HealthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@nestjs/config");
let HealthController = HealthController_1 = class HealthController {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(HealthController_1.name);
    }
    getStatus() {
        return {
            status: 'online',
            timestamp: new Date().toISOString(),
            service: 'video-generator',
            version: '1.0.0',
        };
    }
    async getHealth(check = 'basic') {
        if (check === 'full') {
            return await this.performFullHealthCheck();
        }
        return {
            status: 'online',
            timestamp: new Date().toISOString(),
            service: 'video-generator',
            version: '1.0.0',
            note: 'For full health check, use ?check=full parameter'
        };
    }
    async performFullHealthCheck() {
        const results = {
            llm: 'fail',
            tts: 'fail',
            sora: 'fail',
            blob: 'fail',
            backend: 'fail',
        };
        try {
            const gptUrl = this.configService.get('AZURE_OPENAI_GPT_URL');
            const gptKey = this.configService.get('AZURE_OPENAI_KEY');
            if (gptUrl && gptKey) {
                await axios_1.default.post(gptUrl, {
                    messages: [{ role: 'user', content: 'ping' }],
                    temperature: 0,
                    max_tokens: 10,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': gptKey,
                    },
                });
                results.llm = 'ok';
            }
        }
        catch (e) {
            this.logger.warn('❌ LLM check failed');
        }
        try {
            const ttsUrl = this.configService.get('AZURE_TTS_ENDPOINT');
            const ttsKey = this.configService.get('AZURE_TTS_KEY');
            if (ttsUrl && ttsKey) {
                await axios_1.default.post(`${ttsUrl}?api-version=2025-03-01-preview`, {
                    model: 'gpt-4o-mini-tts',
                    input: 'ping',
                    voice: 'nova',
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${ttsKey}`,
                    },
                });
                results.tts = 'ok';
            }
        }
        catch (e) {
            this.logger.warn('❌ TTS check failed');
        }
        try {
            const soraUrl = this.configService.get('SORA_VIDEO_URL');
            if (soraUrl) {
                await axios_1.default.post(`${soraUrl}/video/generate`, {
                    prompt: 'test video',
                    n_seconds: 3,
                    height: 64,
                    width: 64,
                    n_variants: 1,
                });
                results.sora = 'ok';
            }
        }
        catch (e) {
            this.logger.warn('❌ Sora check failed');
        }
        try {
            const blobKey = this.configService.get('AZURE_STORAGE_KEY');
            if (blobKey) {
                results.blob = 'ok';
            }
        }
        catch (e) {
            this.logger.warn('❌ Blob check failed');
        }
        try {
            const backend = this.configService.get('MAIN_BACKEND_URL');
            if (backend) {
                const ping = await axios_1.default.get(`${backend}/ping`);
                if (ping.status === 200)
                    results.backend = 'ok';
            }
        }
        catch (e) {
            this.logger.warn('❌ Backend check failed');
        }
        const status = Object.values(results).every((r) => r === 'ok') ? 'ok' : 'degraded';
        return {
            status,
            services: results,
            timestamp: new Date().toISOString(),
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)('/status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('/health'),
    __param(0, (0, common_1.Query)('check')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealth", null);
exports.HealthController = HealthController = HealthController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HealthController);
//# sourceMappingURL=health.controller.js.map