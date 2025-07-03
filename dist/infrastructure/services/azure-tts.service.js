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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AzureTTSService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureTTSService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const get_audio_duration_1 = require("get-audio-duration");
const llm_service_1 = require("./llm.service");
let AzureTTSService = AzureTTSService_1 = class AzureTTSService {
    constructor(llmService) {
        this.llmService = llmService;
        this.logger = new common_1.Logger(AzureTTSService_1.name);
        this.apiUrl = 'https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4o-mini-tts/audio/speech?api-version=2025-03-01-preview';
        this.apiKey = process.env.AZURE_TTS_KEY;
        this.voice = process.env.AZURE_TTS_VOICE || 'nova';
        this.model = 'gpt-4o-mini-tts';
        const duration = 30;
    }
    async generateAudioFromPrompt(prompt) {
        this.logger.log(`🧠 Generando libreto desde prompt: "${prompt}"`);
        const duration = 30;
        const script = await this.llmService.generateNarrativeScript(prompt, duration);
        const audioBuffer = await this.synthesizeAudio(script);
        const filename = `audio-${(0, uuid_1.v4)()}.mp3`;
        const audioPath = path.join(__dirname, '../../../public/audio', filename);
        fs.writeFileSync(audioPath, audioBuffer);
        this.logger.log(`✅ Audio guardado localmente en: ${audioPath}`);
        const finalDuration = await (0, get_audio_duration_1.getAudioDurationInSeconds)(audioPath);
        return {
            script,
            audioPath,
            fileName: filename,
            duration: finalDuration,
        };
    }
    async synthesizeAudio(text) {
        try {
            this.logger.log(`🎤 Generando audio con voz: ${this.voice}`);
            const payload = {
                model: this.model,
                input: text,
                voice: this.voice,
            };
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            };
            const response = await axios_1.default.post(this.apiUrl, payload, {
                headers,
                responseType: 'arraybuffer',
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`❌ Error generando audio: ${error?.response?.status} - ${error?.response?.data}`);
            throw new Error('Error al generar audio');
        }
    }
};
exports.AzureTTSService = AzureTTSService;
exports.AzureTTSService = AzureTTSService = AzureTTSService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [llm_service_1.LLMService])
], AzureTTSService);
//# sourceMappingURL=azure-tts.service.js.map