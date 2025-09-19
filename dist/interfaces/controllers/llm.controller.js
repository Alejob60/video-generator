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
var LLMController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMController = void 0;
const common_1 = require("@nestjs/common");
const llm_service_1 = require("../../infrastructure/services/llm.service");
let LLMController = LLMController_1 = class LLMController {
    constructor(llmService) {
        this.llmService = llmService;
        this.logger = new common_1.Logger(LLMController_1.name);
    }
    async generatePromptJson(dto, req) {
        const userId = req?.user?.id || 'admin';
        if (!dto.prompt || dto.prompt.trim().length < 5) {
            throw new common_1.HttpException('El prompt debe tener al menos 5 caracteres.', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            this.logger.log(`📝 [${userId}] Generando JSON editable del prompt`);
            const improvedPrompt = await this.llmService.improveVideoPrompt(dto.prompt.trim());
            const jsonEditable = JSON.stringify(improvedPrompt, null, 2);
            return { success: true, message: 'Prompt JSON generado', result: { promptJson: jsonEditable } };
        }
        catch (err) {
            this.logger.error(`❌ Error generando JSON: ${err instanceof Error ? err.message : err}`);
            return { success: false, message: 'Error interno generando prompt JSON' };
        }
    }
};
exports.LLMController = LLMController;
__decorate([
    (0, common_1.Post)('generate-json'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LLMController.prototype, "generatePromptJson", null);
exports.LLMController = LLMController = LLMController_1 = __decorate([
    (0, common_1.Controller)('llm'),
    __metadata("design:paramtypes", [llm_service_1.LLMService])
], LLMController);
//# sourceMappingURL=llm.controller.js.map