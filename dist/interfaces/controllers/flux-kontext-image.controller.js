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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxKontextImageController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const flux_kontext_image_service_1 = require("../../infrastructure/services/flux-kontext-image.service");
const llm_service_1 = require("../../infrastructure/services/llm.service");
let FluxKontextImageController = FluxKontextImageController_1 = class FluxKontextImageController {
    constructor(fluxKontextService, llmService) {
        this.fluxKontextService = fluxKontextService;
        this.llmService = llmService;
        this.logger = new common_1.Logger(FluxKontextImageController_1.name);
    }
    async generateFromText(dto, userId = 'anon') {
        try {
            let finalPrompt = dto.prompt;
            let enhancedPromptUsed = false;
            if (dto.enhancePrompt === true) {
                this.logger.log('🔄 Enhancing prompt with LLM...');
                try {
                    const improvedPrompt = await this.llmService.improveImagePrompt(dto.prompt);
                    finalPrompt = improvedPrompt;
                    enhancedPromptUsed = true;
                    this.logger.log(`✅ Prompt enhanced successfully`);
                    this.logger.log(`📝 Original: ${dto.prompt.substring(0, 80)}...`);
                    this.logger.log(`📝 Enhanced: ${finalPrompt.substring(0, 80)}...`);
                }
                catch (llmError) {
                    this.logger.warn(`⚠️ LLM enhancement failed: ${llmError.message}`);
                    this.logger.warn('⚠️ Using original prompt as fallback');
                }
            }
            this.logger.log(`📸 Generating FLUX Kontext image for user: ${userId}`);
            this.logger.log(`📝 Final prompt: ${finalPrompt}`);
            this.logger.log(`📏 Size: ${dto.size || '1024x1024'}`);
            const result = await this.fluxKontextService.generateImageAndNotify(userId, { ...dto, prompt: finalPrompt });
            return {
                success: true,
                message: '✅ FLUX Kontext image generated successfully',
                data: {
                    imageUrl: result.imageUrl,
                    prompt: finalPrompt,
                    filename: result.filename,
                    enhancedPromptUsed,
                },
            };
        }
        catch (error) {
            this.logger.error(`❌ Error: ${error.message}`, error.stack);
            throw new Error(`FLUX Kontext generation failed: ${error.message}`);
        }
    }
    async generateWithReferenceImage(body, referenceImage, userId = 'anon') {
        try {
            if (!referenceImage) {
                throw new Error('Reference image is required');
            }
            this.logger.log(`📸 FLUX Kontext with reference image for user: ${userId}`);
            this.logger.log(`📝 Prompt: ${body.prompt}`);
            this.logger.log(`📁 Reference image: ${referenceImage.filename} (${referenceImage.size} bytes)`);
            let finalPrompt = body.prompt;
            let enhancedPromptUsed = false;
            if (body.enhancePrompt === true) {
                try {
                    const improvedPrompt = await this.llmService.improveImagePrompt(body.prompt);
                    finalPrompt = improvedPrompt;
                    enhancedPromptUsed = true;
                    this.logger.log(`✅ Prompt enhanced: ${finalPrompt}`);
                }
                catch (llmError) {
                    this.logger.warn(`⚠️ LLM enhancement failed, using original prompt`);
                }
            }
            const result = await this.fluxKontextService.generateImageAndNotify(userId, {
                prompt: finalPrompt,
                plan: body.plan || 'PRO',
                size: '1024x1024',
            }, referenceImage.path);
            return {
                success: true,
                message: '✅ FLUX Kontext image generated with reference',
                data: {
                    imageUrl: result.imageUrl,
                    prompt: finalPrompt,
                    filename: result.filename,
                    referenceImageName: referenceImage.originalname,
                    enhancedPromptUsed,
                },
            };
        }
        catch (error) {
            this.logger.error(`❌ Error generating with reference: ${error.message}`, error.stack);
            throw new Error(`FLUX Kontext generation with reference failed: ${error.message}`);
        }
    }
};
exports.FluxKontextImageController = FluxKontextImageController;
__decorate([
    (0, common_1.Post)('flux-kontext/image'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FluxKontextImageController.prototype, "generateFromText", null);
__decorate([
    (0, common_1.Post)('flux-kontext/image-with-reference'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('referenceImage', {
        storage: (0, multer_1.diskStorage)({
            destination: './temp',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                callback(null, `flux-ref-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
                return callback(new Error('Only image files (JPG, PNG) are allowed'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], FluxKontextImageController.prototype, "generateWithReferenceImage", null);
exports.FluxKontextImageController = FluxKontextImageController = FluxKontextImageController_1 = __decorate([
    (0, common_1.Controller)('media'),
    __metadata("design:paramtypes", [flux_kontext_image_service_1.FluxKontextImageService,
        llm_service_1.LLMService])
], FluxKontextImageController);
//# sourceMappingURL=flux-kontext-image.controller.js.map