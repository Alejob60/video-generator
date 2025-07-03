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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@nestjs/config");
let HealthController = class HealthController {
    constructor(configService) {
        this.configService = configService;
    }
    getStatus() {
        return {
            status: 'online',
            timestamp: new Date().toISOString(),
            service: 'video-generator',
            version: '1.0.0',
        };
    }
    async getHealth() {
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
            const ttsUrl = this.configService.get('AZURE_TTS_ENDPOINT');
            const ttsKey = this.configService.get('AZURE_TTS_KEY');
            if (ttsUrl && ttsKey) {
                await axios_1.default.post(`${ttsUrl}/audio/speech?api-version=2025-03-01-preview`, `<speak><voice name="nova">ping</voice></speak>`, {
                    headers: {
                        'Content-Type': 'application/ssml+xml',
                        'Ocp-Apim-Subscription-Key': ttsKey,
                    },
                });
                results.tts = 'ok';
            }
            const soraUrl = this.configService.get('SORA_VIDEO_URL');
            if (soraUrl) {
                await axios_1.default.post(`${soraUrl}/video/generate`, {
                    prompt: 'test video',
                    n_seconds: 5,
                    height: 128,
                    width: 128,
                    n_variants: 1,
                });
                results.sora = 'ok';
            }
            const blobKey = this.configService.get('AZURE_STORAGE_KEY');
            if (blobKey) {
                results.blob = 'ok';
            }
            const backend = this.configService.get('MAIN_BACKEND_URL');
            if (backend) {
                const ping = await axios_1.default.get(`${backend}/ping`);
                if (ping.status === 200)
                    results.backend = 'ok';
            }
        }
        catch (error) {
        }
        return {
            status: Object.values(results).every((r) => r === 'ok') ? 'ok' : 'degraded',
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealth", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HealthController);
//# sourceMappingURL=health.controller.js.map