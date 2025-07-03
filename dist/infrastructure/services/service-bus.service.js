"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ServiceBusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceBusService = void 0;
const common_1 = require("@nestjs/common");
const service_bus_1 = require("@azure/service-bus");
const config_1 = require("@nestjs/config");
const util = __importStar(require("util"));
let ServiceBusService = ServiceBusService_1 = class ServiceBusService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ServiceBusService_1.name);
        this.senders = {};
        const connStr = this.configService.get('AZURE_SERVICE_BUS_CONNECTION');
        if (!connStr) {
            throw new Error('❌ AZURE_SERVICE_BUS_CONNECTION no está definida');
        }
        this.sbClient = new service_bus_1.ServiceBusClient(connStr);
        const videoQueue = this.configService.get('AZURE_SERVICE_BUS_QUEUE');
        const imageQueue = this.configService.get('AZURE_SERVICE_BUS_QUEUE_IMAGE');
        if (videoQueue) {
            this.senders['video'] = this.sbClient.createSender(videoQueue);
        }
        if (imageQueue) {
            this.senders['image'] = this.sbClient.createSender(imageQueue);
        }
    }
    async sendVideoJobMessage(jobId, timestamp, metadata) {
        if (!this.senders['video']) {
            throw new Error('❌ Cola de video no está configurada correctamente');
        }
        const messageBody = {
            jobId,
            audioId: timestamp,
            ...metadata,
        };
        try {
            await this.senders['video'].sendMessages({
                body: messageBody,
                timeToLive: 1000 * 60 * 10,
            });
            this.logger.log(`📤 Video Job enviado: jobId=${jobId}, audioId=${timestamp}`);
        }
        catch (error) {
            this.handleError(error, 'video');
        }
    }
    async sendImageJobMessage(userId, prompt) {
        if (!this.senders['image']) {
            throw new Error('❌ Cola de imagen no está configurada correctamente');
        }
        const messageBody = {
            userId,
            prompt,
            timestamp: Date.now(),
        };
        try {
            await this.senders['image'].sendMessages({
                body: messageBody,
                timeToLive: 1000 * 60 * 10,
            });
            this.logger.log(`🖼️ Imagen encolada para userId=${userId}`);
        }
        catch (error) {
            this.handleError(error, 'image');
        }
    }
    handleError(error, queueType) {
        const errorMsg = error instanceof Error
            ? error.message
            : util.inspect(error, { depth: 2, colors: false });
        this.logger.error(`❌ Error en cola '${queueType}':\n${errorMsg}`);
        throw error;
    }
    async onModuleDestroy() {
        this.logger.log('🔌 Cerrando conexión con Azure Service Bus...');
        await Promise.all([
            ...Object.values(this.senders).map((s) => s.close()),
            this.sbClient.close(),
        ]);
        this.logger.log('✅ Conexión a Service Bus cerrada correctamente');
    }
};
exports.ServiceBusService = ServiceBusService;
exports.ServiceBusService = ServiceBusService = ServiceBusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ServiceBusService);
//# sourceMappingURL=service-bus.service.js.map