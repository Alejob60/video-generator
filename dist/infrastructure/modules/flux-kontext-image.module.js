"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxKontextImageModule = void 0;
const common_1 = require("@nestjs/common");
const flux_kontext_image_service_1 = require("../services/flux-kontext-image.service");
const azure_blob_service_1 = require("../services/azure-blob.service");
const llm_service_1 = require("../services/llm.service");
const flux_kontext_image_controller_1 = require("../../interfaces/controllers/flux-kontext-image.controller");
let FluxKontextImageModule = class FluxKontextImageModule {
};
exports.FluxKontextImageModule = FluxKontextImageModule;
exports.FluxKontextImageModule = FluxKontextImageModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [flux_kontext_image_controller_1.FluxKontextImageController],
        providers: [
            flux_kontext_image_service_1.FluxKontextImageService,
            azure_blob_service_1.AzureBlobService,
            llm_service_1.LLMService,
        ],
        exports: [
            flux_kontext_image_service_1.FluxKontextImageService,
        ],
    })
], FluxKontextImageModule);
//# sourceMappingURL=flux-kontext-image.module.js.map