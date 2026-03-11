"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageGenerationModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const flux_kontext_image_controller_1 = require("../../interfaces/controllers/flux-kontext-image.controller");
const dalle_image_controller_1 = require("../../interfaces/controllers/dalle-image.controller");
const upload_controller_1 = require("../../interfaces/controllers/upload.controller");
const flux_kontext_image_service_1 = require("../services/flux-kontext-image.service");
const dalle_image_service_1 = require("../services/dalle-image.service");
const azure_blob_service_1 = require("../services/azure-blob.service");
const llm_service_1 = require("../services/llm.service");
let ImageGenerationModule = class ImageGenerationModule {
};
exports.ImageGenerationModule = ImageGenerationModule;
exports.ImageGenerationModule = ImageGenerationModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        controllers: [flux_kontext_image_controller_1.FluxKontextImageController, dalle_image_controller_1.DalleImageController, upload_controller_1.UploadController],
        providers: [flux_kontext_image_service_1.FluxKontextImageService, dalle_image_service_1.DalleImageService, azure_blob_service_1.AzureBlobService, llm_service_1.LLMService],
        exports: [flux_kontext_image_service_1.FluxKontextImageService, dalle_image_service_1.DalleImageService, llm_service_1.LLMService],
    })
], ImageGenerationModule);
//# sourceMappingURL=image-generation.module.js.map