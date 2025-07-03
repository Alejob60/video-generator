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
var VideoQueueConsumerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoQueueConsumerService = void 0;
const common_1 = require("@nestjs/common");
const service_bus_1 = require("@azure/service-bus");
const video_service_1 = require("../services/video.service");
const error_util_1 = require("../../common/utils/error.util");
let VideoQueueConsumerService = VideoQueueConsumerService_1 = class VideoQueueConsumerService {
    constructor(videoService) {
        this.videoService = videoService;
        this.logger = new common_1.Logger(VideoQueueConsumerService_1.name);
        this.connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION;
        this.queueName = process.env.AZURE_SERVICE_BUS_QUEUE || 'video-processing-queue';
    }
    async onModuleInit() {
        if (!this.connectionString || !this.queueName) {
            this.logger.error('❌ Configuración de Azure Service Bus incompleta.');
            throw new Error('Faltan variables de entorno para conectar con Service Bus.');
        }
        this.sbClient = new service_bus_1.ServiceBusClient(this.connectionString);
        this.receiver = this.sbClient.createReceiver(this.queueName, {
            receiveMode: 'peekLock',
        });
        this.logger.log(`📥 Suscrito correctamente a la cola: ${this.queueName}`);
        this.receiver.subscribe({
            processMessage: async (message) => {
                await this.handleMessageWithRetry(message);
            },
            processError: async (args) => {
                this.logger.error('⚠️ Error en el receptor de mensajes:', (0, error_util_1.safeErrorMessage)(args.error));
            },
        });
    }
    async handleMessageWithRetry(message, attempt = 1) {
        const maxRetries = 3;
        try {
            await this.handleMessage(message);
            await this.receiver.completeMessage(message);
        }
        catch (error) {
            const msg = (0, error_util_1.safeErrorMessage)(error);
            this.logger.error(`❌ Fallo en intento ${attempt}: ${msg}`);
            if (attempt < maxRetries) {
                this.logger.warn(`🔁 Reintentando procesamiento (intento ${attempt + 1}/${maxRetries})...`);
                setTimeout(() => this.handleMessageWithRetry(message, attempt + 1), 2000);
            }
            else {
                this.logger.error(`❌ Fallo definitivo al procesar mensaje: ${msg}`);
                await this.receiver.deadLetterMessage(message, {
                    deadLetterReason: 'ProcessingFailed',
                    deadLetterErrorDescription: msg,
                });
            }
        }
    }
    async handleMessage(message) {
        const data = message.body;
        if (!data?.jobId || !data?.audioId || !data?.script) {
            throw new Error('❌ Mensaje inválido: Faltan campos requeridos.');
        }
        this.logger.log(`📨 Mensaje recibido:
🆔 Job ID: ${data.jobId}
🎧 Audio ID: ${data.audioId}
🧠 Narración: ${data.narration}
💬 Subtítulos: ${data.subtitles}
⏱️ Duración: ${data.n_seconds}`);
        await this.videoService.processGeneratedAssets(data.jobId, data.audioId, {
            script: data.script,
            narration: data.narration ?? false,
            subtitles: data.subtitles ?? false,
            n_seconds: data.n_seconds ?? 20,
            prompt: data.prompt ?? '',
        });
        this.logger.log(`✅ Procesamiento exitoso para jobId=${data.jobId}`);
    }
    async onModuleDestroy() {
        this.logger.log('🛑 Cerrando conexiones con Azure Service Bus...');
        await Promise.all([
            this.receiver?.close(),
            this.sbClient?.close(),
        ]);
        this.logger.log('✅ Consumer desconectado correctamente.');
    }
};
exports.VideoQueueConsumerService = VideoQueueConsumerService;
exports.VideoQueueConsumerService = VideoQueueConsumerService = VideoQueueConsumerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [video_service_1.VideoService])
], VideoQueueConsumerService);
//# sourceMappingURL=video-queue-consumer.service.js.map