"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const video_service_1 = require("../services/video.service");
const service_bus_service_1 = require("../services/service-bus.service");
const video_queue_consumer_service_1 = require("../services/video-queue-consumer.service");
const promo_image_module_1 = require("./promo-image.module");
const sora_module_1 = require("./sora.module");
const video_controller_1 = require("../../interfaces/controllers/video.controller");
const azure_blob_service_1 = require("../services/azure-blob.service");
const azure_tts_service_1 = require("../services/azure-tts.service");
const llm_service_1 = require("../services/llm.service");
let VideoModule = class VideoModule {
};
exports.VideoModule = VideoModule;
exports.VideoModule = VideoModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, promo_image_module_1.PromoImageModule, sora_module_1.SoraModule],
        controllers: [video_controller_1.VideoController],
        providers: [
            video_service_1.VideoService,
            service_bus_service_1.ServiceBusService,
            video_queue_consumer_service_1.VideoQueueConsumerService,
            azure_blob_service_1.AzureBlobService,
            azure_tts_service_1.AzureTTSService,
            llm_service_1.LLMService,
        ],
        exports: [
            video_service_1.VideoService,
            service_bus_service_1.ServiceBusService,
            azure_blob_service_1.AzureBlobService,
        ],
    })
], VideoModule);
//# sourceMappingURL=video.module.js.map