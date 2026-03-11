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
var DalleImageController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DalleImageController = void 0;
const common_1 = require("@nestjs/common");
const dalle_image_service_1 = require("../../infrastructure/services/dalle-image.service");
const generate_promo_image_dto_1 = require("../dto/generate-promo-image.dto");
let DalleImageController = DalleImageController_1 = class DalleImageController {
    constructor(dalleService) {
        this.dalleService = dalleService;
        this.logger = new common_1.Logger(DalleImageController_1.name);
    }
    async generateImage(dto, userId = 'anon') {
        try {
            if (!dto.prompt) {
                throw new Error('Prompt is required');
            }
            this.logger.log(`🎨 Generating DALL-E 3 image for user: ${userId}`);
            this.logger.log(`📝 Prompt: ${dto.prompt}`);
            const result = await this.dalleService.generateImage(dto.prompt, dto.plan || 'FREE');
            return {
                success: true,
                message: '✅ Imagen generada correctamente',
                result: {
                    imageUrl: result.imageUrl,
                    prompt: dto.prompt,
                    filename: result.filename,
                },
            };
        }
        catch (error) {
            this.logger.error(`❌ Error: ${error.message}`, error.stack);
            throw new Error(`DALL-E generation failed: ${error.message}`);
        }
    }
};
exports.DalleImageController = DalleImageController;
__decorate([
    (0, common_1.Post)('image'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_promo_image_dto_1.GeneratePromoImageDto, String]),
    __metadata("design:returntype", Promise)
], DalleImageController.prototype, "generateImage", null);
exports.DalleImageController = DalleImageController = DalleImageController_1 = __decorate([
    (0, common_1.Controller)('media'),
    __metadata("design:paramtypes", [dalle_image_service_1.DalleImageService])
], DalleImageController);
//# sourceMappingURL=dalle-image.controller.js.map