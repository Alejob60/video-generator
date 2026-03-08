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
var FluxKontextImageController_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxKontextImageController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const flux_kontext_image_service_1 = require("../../infrastructure/services/flux-kontext-image.service");
const generate_flux_kontext_image_dto_1 = require("../dto/generate-flux-kontext-image.dto");
let FluxKontextImageController = FluxKontextImageController_1 = class FluxKontextImageController {
    constructor(fluxKontextImageService) {
        this.fluxKontextImageService = fluxKontextImageService;
        this.logger = new common_1.Logger(FluxKontextImageController_1.name);
    }
    async generateFluxKontextImage(dto, referenceImage, req) {
        const userId = req.user?.id || 'anon';
        try {
            this.logger.log(`📸 Generating FLUX.1-Kontext-pro image for user ${userId} with prompt: ${dto.prompt}`);
            const result = await this.fluxKontextImageService.generateImageAndNotify(userId, dto, referenceImage?.path);
            this.logger.log(`✅ FLUX.1-Kontext-pro image generated successfully for user ${userId}`);
            return {
                success: true,
                message: '✅ FLUX.1-Kontext-pro image generated successfully',
                data: {
                    imageUrl: result.imageUrl,
                    filename: result.filename,
                    userId,
                    prompt: result.prompt
                }
            };
        }
        catch (error) {
            this.logger.error(`❌ Error generating FLUX.1-Kontext-pro image for user ${userId}:`, error);
            throw new common_1.HttpException(`Error generating FLUX.1-Kontext-pro image: ${error.message || error}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.FluxKontextImageController = FluxKontextImageController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('referenceImage', {
        storage: (0, multer_1.diskStorage)({
            destination: './public/uploads',
            filename: (_req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_flux_kontext_image_dto_1.GenerateFluxKontextImageDto, Object, Object]),
    __metadata("design:returntype", Promise)
], FluxKontextImageController.prototype, "generateFluxKontextImage", null);
exports.FluxKontextImageController = FluxKontextImageController = FluxKontextImageController_1 = __decorate([
    (0, common_1.Controller)('media/flux-kontext-image'),
    __metadata("design:paramtypes", [typeof (_a = typeof flux_kontext_image_service_1.FluxKontextImageService !== "undefined" && flux_kontext_image_service_1.FluxKontextImageService) === "function" ? _a : Object])
], FluxKontextImageController);
//# sourceMappingURL=flux-kontext-image.controller.js.map