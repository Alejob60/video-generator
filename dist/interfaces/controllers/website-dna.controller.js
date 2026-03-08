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
var WebsiteDnaController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteDnaController = void 0;
const common_1 = require("@nestjs/common");
const website_dna_service_1 = require("../../infrastructure/services/website-dna.service");
const extract_website_dna_dto_1 = require("../dto/extract-website-dna.dto");
let WebsiteDnaController = WebsiteDnaController_1 = class WebsiteDnaController {
    constructor(websiteDnaService) {
        this.websiteDnaService = websiteDnaService;
        this.logger = new common_1.Logger(WebsiteDnaController_1.name);
    }
    async extractWebsiteDna(dto, req) {
        const userId = req.user?.id || 'anon';
        const requestId = Date.now();
        try {
            this.logger.log(`🧬 Iniciando extracción de ADN para sitio: ${dto.url} (Usuario: ${userId}, Request ID: ${requestId})`);
            const result = await this.websiteDnaService.extractDna(dto, userId);
            this.logger.log(`✅ ADN extraído exitosamente para ${dto.url} (Request ID: ${requestId})`);
            return {
                success: true,
                message: '✅ ADN del sitio web extraído exitosamente',
                requestId,
                result,
            };
        }
        catch (error) {
            this.logger.error(`❌ Error extrayendo ADN para ${dto.url} (Request ID: ${requestId}):`, error);
            throw new common_1.HttpException(`Error extrayendo ADN del sitio: ${error.message || error}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.WebsiteDnaController = WebsiteDnaController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [extract_website_dna_dto_1.ExtractWebsiteDnaDto, Object]),
    __metadata("design:returntype", Promise)
], WebsiteDnaController.prototype, "extractWebsiteDna", null);
exports.WebsiteDnaController = WebsiteDnaController = WebsiteDnaController_1 = __decorate([
    (0, common_1.Controller)('media/website-dna'),
    __metadata("design:paramtypes", [website_dna_service_1.WebsiteDnaService])
], WebsiteDnaController);
//# sourceMappingURL=website-dna.controller.js.map