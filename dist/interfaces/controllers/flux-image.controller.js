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
var FluxImageController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxImageController = void 0;
const common_1 = require("@nestjs/common");
const flux_image_service_1 = require("../../infrastructure/services/flux-image.service");
const promo_image_service_1 = require("../../infrastructure/services/promo-image.service");
const generate_promo_image_dto_1 = require("../dto/generate-promo-image.dto");
const generate_flux_image_dto_1 = require("../dto/generate-flux-image.dto");
let FluxImageController = FluxImageController_1 = class FluxImageController {
    constructor(fluxImageService, promoImageService) {
        this.fluxImageService = fluxImageService;
        this.promoImageService = promoImageService;
        this.logger = new common_1.Logger(FluxImageController_1.name);
    }
    async generateFluxImage(dto, req) {
        const userId = req.user?.id || 'anon';
        try {
            this.logger.log(`📸 Generating FLUX image for user ${userId} with prompt: ${dto.prompt}`);
            const result = await this.fluxImageService.generateImageAndNotify(userId, dto);
            this.logger.log(`✅ FLUX image generated successfully for user ${userId}`);
            return {
                success: true,
                message: '✅ FLUX image generated successfully',
                data: {
                    imageUrl: result.imageUrl,
                    filename: result.filename,
                    userId,
                    prompt: result.prompt
                }
            };
        }
        catch (error) {
            this.logger.error(`❌ Error generating FLUX image for user ${userId}:`, error);
            throw new common_1.HttpException(`Error generating FLUX image: ${error.message || error}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateDual(dto, req) {
        const userId = req.user?.id || 'anon';
        const promoResult = await this.promoImageService.generateAndNotify(userId, { prompt: dto.prompt, useFlux: false });
        const fluxUrl = await this.fluxImageService.generateFromPromoDto(dto);
        return { promo: promoResult.imageUrl, flux: fluxUrl };
    }
};
exports.FluxImageController = FluxImageController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_flux_image_dto_1.GenerateFluxImageDto, Object]),
    __metadata("design:returntype", Promise)
], FluxImageController.prototype, "generateFluxImage", null);
__decorate([
    (0, common_1.Post)('/dual'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_promo_image_dto_1.GeneratePromoImageDto, Object]),
    __metadata("design:returntype", Promise)
], FluxImageController.prototype, "generateDual", null);
exports.FluxImageController = FluxImageController = FluxImageController_1 = __decorate([
    (0, common_1.Controller)('media/flux-image'),
    __metadata("design:paramtypes", [flux_image_service_1.FluxImageService,
        promo_image_service_1.PromoImageService])
], FluxImageController);
//# sourceMappingURL=flux-image.controller.js.map