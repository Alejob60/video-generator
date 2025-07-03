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
var PromoImageController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoImageController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const promo_image_service_1 = require("../../infrastructure/services/promo-image.service");
const generate_promo_image_dto_1 = require("../dto/generate-promo-image.dto");
let PromoImageController = PromoImageController_1 = class PromoImageController {
    constructor(promoImageService) {
        this.promoImageService = promoImageService;
        this.logger = new common_1.Logger(PromoImageController_1.name);
    }
    async generateImage(dto, file, req) {
        const userId = req.user?.id || 'anon';
        if (!dto.prompt && !file?.path) {
            throw new common_1.HttpException('❌ Debes enviar un prompt o una imagen.', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            this.logger.log(`📸 Generando imagen para el usuario ${userId}`);
            const result = await this.promoImageService.generateAndNotify(userId, {
                prompt: dto.prompt,
                imagePath: file?.path || undefined,
            });
            this.logger.log(`✅ Imagen generada con éxito para usuario ${userId}`);
            return {
                success: true,
                message: '✅ Imagen generada correctamente',
                result,
            };
        }
        catch (error) {
            this.logger.error(`❌ Error generando imagen para usuario ${userId}:`, error);
            throw new common_1.HttpException('Error generando imagen.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.PromoImageController = PromoImageController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
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
    __metadata("design:paramtypes", [generate_promo_image_dto_1.GeneratePromoImageDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PromoImageController.prototype, "generateImage", null);
exports.PromoImageController = PromoImageController = PromoImageController_1 = __decorate([
    (0, common_1.Controller)('media/image'),
    __metadata("design:paramtypes", [promo_image_service_1.PromoImageService])
], PromoImageController);
//# sourceMappingURL=promo-image.controller.js.map