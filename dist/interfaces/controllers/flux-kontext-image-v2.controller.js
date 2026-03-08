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
var FluxKontextImageV2Controller_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxKontextImageV2Controller = void 0;
const common_1 = require("@nestjs/common");
const flux_kontext_image_v2_service_1 = require("../../infrastructure/services/flux-kontext-image-v2.service");
const generate_flux_kontext_image_dto_1 = require("../dto/generate-flux-kontext-image.dto");
let FluxKontextImageV2Controller = FluxKontextImageV2Controller_1 = class FluxKontextImageV2Controller {
    constructor(fluxKontextImageV2Service) {
        this.fluxKontextImageV2Service = fluxKontextImageV2Service;
        this.logger = new common_1.Logger(FluxKontextImageV2Controller_1.name);
    }
    async generateFluxKontextImage(dto, req) {
        const userId = req.user?.id || 'anon';
        try {
            this.logger.log(`📸 Generating FLUX.1-Kontext-pro image for user ${userId} with prompt: ${dto.prompt}`);
            const result = await this.fluxKontextImageV2Service.generateImage(dto);
            this.logger.log(`✅ FLUX.1-Kontext-pro image generated successfully for user ${userId}`);
            return {
                success: true,
                message: '✅ FLUX.1-Kontext-pro image generated successfully',
                result,
            };
        }
        catch (error) {
            this.logger.error(`❌ Error generating FLUX.1-Kontext-pro image for user ${userId}:`, error);
            throw new common_1.HttpException(`Error generating FLUX.1-Kontext-pro image: ${error.message || error}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.FluxKontextImageV2Controller = FluxKontextImageV2Controller;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_flux_kontext_image_dto_1.GenerateFluxKontextImageDto, Object]),
    __metadata("design:returntype", Promise)
], FluxKontextImageV2Controller.prototype, "generateFluxKontextImage", null);
exports.FluxKontextImageV2Controller = FluxKontextImageV2Controller = FluxKontextImageV2Controller_1 = __decorate([
    (0, common_1.Controller)('media/flux-kontext-image-v2'),
    __metadata("design:paramtypes", [typeof (_a = typeof flux_kontext_image_v2_service_1.FluxKontextImageV2Service !== "undefined" && flux_kontext_image_v2_service_1.FluxKontextImageV2Service) === "function" ? _a : Object])
], FluxKontextImageV2Controller);
//# sourceMappingURL=flux-kontext-image-v2.controller.js.map