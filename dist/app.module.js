"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AppModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const config_1 = require("@nestjs/config");
const service_bus_module_1 = require("./infrastructure/messaging/service-bus.module");
const video_module_1 = require("./infrastructure/modules/video.module");
const audio_module_1 = require("./infrastructure/modules/audio.module");
const promo_image_module_1 = require("./infrastructure/modules/promo-image.module");
const sora_module_1 = require("./infrastructure/modules/sora.module");
const health_controller_1 = require("./interfaces/controllers/health.controller");
const video_queue_consumer_service_1 = require("./infrastructure/services/video-queue-consumer.service");
const promo_image_queue_consumer_service_1 = require("./infrastructure/services/promo-image-queue-consumer.service");
let AppModule = AppModule_1 = class AppModule {
    constructor() {
        this.logger = new common_1.Logger(AppModule_1.name);
    }
    async onModuleInit() {
        this.logger.log('✅ Módulo principal inicializado correctamente.');
        this.logger.log(`🌐 Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = AppModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'public'),
            }),
            service_bus_module_1.ServiceBusModule,
            video_module_1.VideoModule,
            audio_module_1.AudioModule,
            promo_image_module_1.PromoImageModule,
            sora_module_1.SoraModule,
        ],
        controllers: [
            health_controller_1.HealthController,
        ],
        providers: [
            video_queue_consumer_service_1.VideoQueueConsumerService,
            promo_image_queue_consumer_service_1.PromoImageQueueConsumerService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map