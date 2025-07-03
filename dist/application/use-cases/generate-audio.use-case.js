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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateAudioUseCase = void 0;
const common_1 = require("@nestjs/common");
const audio_generator_1 = require("../../domain/services/audio.generator");
const llm_service_1 = require("../../infrastructure/services/llm.service");
let GenerateAudioUseCase = class GenerateAudioUseCase {
    constructor(llmService, audioGenerator) {
        this.llmService = llmService;
        this.audioGenerator = audioGenerator;
    }
    async execute(prompt, duration = 30) {
        const script = await this.llmService.generateNarrativeScript(prompt, duration);
        return this.audioGenerator.generateFromText(script);
    }
};
exports.GenerateAudioUseCase = GenerateAudioUseCase;
exports.GenerateAudioUseCase = GenerateAudioUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [llm_service_1.LLMService,
        audio_generator_1.AudioGenerator])
], GenerateAudioUseCase);
//# sourceMappingURL=generate-audio.use-case.js.map