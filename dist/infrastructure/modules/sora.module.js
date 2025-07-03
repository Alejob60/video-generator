"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoraModule = void 0;
const common_1 = require("@nestjs/common");
const sora_service_1 = require("../services/sora.service");
const azure_blob_service_1 = require("../services/azure-blob.service");
const llm_service_1 = require("../services/llm.service");
const sora_video_client_service_1 = require("../services/sora-video-client.service");
let SoraModule = class SoraModule {
};
exports.SoraModule = SoraModule;
exports.SoraModule = SoraModule = __decorate([
    (0, common_1.Module)({
        providers: [sora_service_1.SoraService, azure_blob_service_1.AzureBlobService, llm_service_1.LLMService, sora_video_client_service_1.SoraVideoClientService],
        exports: [sora_service_1.SoraService, sora_video_client_service_1.SoraVideoClientService],
    })
], SoraModule);
//# sourceMappingURL=sora.module.js.map