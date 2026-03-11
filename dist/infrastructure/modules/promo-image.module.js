"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoImageModule = void 0;
const common_1 = require("@nestjs/common");
const promo_image_service_1 = require("../services/promo-image.service");
const azure_blob_service_1 = require("../services/azure-blob.service");
const llm_service_1 = require("../services/llm.service");
const promo_image_controller_1 = require("../../interfaces/controllers/promo-image.controller");
let PromoImageModule = class PromoImageModule {
};
exports.PromoImageModule = PromoImageModule;
exports.PromoImageModule = PromoImageModule = __decorate([
    (0, common_1.Module)({
        controllers: [promo_image_controller_1.PromoImageController],
        providers: [promo_image_service_1.PromoImageService, azure_blob_service_1.AzureBlobService, llm_service_1.LLMService],
        exports: [promo_image_service_1.PromoImageService, llm_service_1.LLMService],
    })
], PromoImageModule);
//# sourceMappingURL=promo-image.module.js.map