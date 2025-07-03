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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PromoImageQueueConsumerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoImageQueueConsumerService = void 0;
const common_1 = require("@nestjs/common");
const service_bus_1 = require("@azure/service-bus");
const promo_image_service_1 = require("../services/promo-image.service");
const error_util_1 = require("../../common/utils/error.util");
const node_fetch_1 = __importDefault(require("node-fetch"));
let PromoImageQueueConsumerService = PromoImageQueueConsumerService_1 = class PromoImageQueueConsumerService {
    constructor(promoImageService) {
        this.promoImageService = promoImageService;
        this.logger = new common_1.Logger(PromoImageQueueConsumerService_1.name);
        this.connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION;
        this.queueName = process.env.AZURE_SERVICE_BUS_QUEUE_IMAGE || 'promo-image-queue';
        this.backendUrl = process.env.MAIN_BACKEND_URL || 'http://localhost:3001';
    }
    async onModuleInit() {
        if (!this.connectionString || !this.queueName) {
            this.logger.error('❌ Configuración de Azure Service Bus incompleta para cola de imagen.');
            throw new Error('Faltan variables de entorno para cola de imagen.');
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
                this.logger.error('⚠️ Error en la cola de imágenes:', (0, error_util_1.safeErrorMessage)(args.error));
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
                this.logger.error(`❌ Fallo definitivo al procesar mensaje de imagen: ${msg}`);
                await this.receiver.deadLetterMessage(message, {
                    deadLetterReason: 'ProcessingFailed',
                    deadLetterErrorDescription: msg,
                });
            }
        }
    }
    async handleMessage(message) {
        const { userId, prompt, imagePath, textOverlay } = message.body;
        if (!userId || (!prompt && !imagePath)) {
            throw new Error('❌ Mensaje de imagen inválido: faltan campos requeridos.');
        }
        this.logger.log(`🖼️ Procesando imagen para userId=${userId} con prompt="${prompt || ''}"`);
        const result = await this.promoImageService.generateAndNotify(userId, {
            prompt,
            imagePath,
            textOverlay,
        });
        this.logger.log(`✅ Imagen generada: ${result.filename}`);
        try {
            const notifyUrl = `${this.backendUrl}/media/register-image`;
            const res = await (0, node_fetch_1.default)(notifyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    prompt: result.prompt,
                    imageUrl: result.imageUrl,
                    filename: result.filename,
                    plan: result.plan || 'FREE',
                }),
            });
            if (!res.ok) {
                const body = await res.text();
                throw new Error(`Respuesta no exitosa del backend: ${res.status} ${body}`);
            }
            this.logger.log(`📨 Imagen registrada correctamente en backend para userId=${userId}`);
        }
        catch (err) {
            this.logger.error(`❌ Error notificando al backend principal: ${(0, error_util_1.safeErrorMessage)(err)}`);
        }
    }
    async onModuleDestroy() {
        this.logger.log('🛑 Cerrando conexiones con Azure Service Bus (cola de imagen)...');
        await Promise.all([
            this.receiver?.close(),
            this.sbClient?.close(),
        ]);
        this.logger.log('✅ Consumer de promo-image desconectado correctamente.');
    }
};
exports.PromoImageQueueConsumerService = PromoImageQueueConsumerService;
exports.PromoImageQueueConsumerService = PromoImageQueueConsumerService = PromoImageQueueConsumerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [promo_image_service_1.PromoImageService])
], PromoImageQueueConsumerService);
//# sourceMappingURL=promo-image-queue-consumer.service.js.map