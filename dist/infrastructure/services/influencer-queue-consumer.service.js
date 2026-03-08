"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var InfluencerQueueConsumerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfluencerQueueConsumerService = void 0;
const common_1 = require("@nestjs/common");
const service_bus_1 = require("@azure/service-bus");
const error_util_1 = require("../../common/utils/error.util");
const node_fetch_1 = __importDefault(require("node-fetch"));
let InfluencerQueueConsumerService = InfluencerQueueConsumerService_1 = class InfluencerQueueConsumerService {
    constructor() {
        this.logger = new common_1.Logger(InfluencerQueueConsumerService_1.name);
        this.connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION;
        this.queueName = process.env.AZURE_SERVICE_BUS_QUEUE_INFLUENCER || 'influencer-video-queue';
        this.backendUrl = process.env.MAIN_BACKEND_URL || 'http://localhost:3001';
    }
    async onModuleInit() {
        if (!this.connectionString || !this.queueName) {
            this.logger.error('❌ Configuración de Azure Service Bus incompleta para cola de influencers.');
            throw new Error('Faltan variables de entorno para cola de influencers.');
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
                this.logger.error('⚠️ Error en la cola de influencers:', (0, error_util_1.safeErrorMessage)(args.error));
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
                this.logger.error(`❌ Fallo definitivo al procesar mensaje de influencer: ${msg}`);
                await this.receiver.deadLetterMessage(message, {
                    deadLetterReason: 'ProcessingFailed',
                    deadLetterErrorDescription: msg,
                });
            }
        }
    }
    async handleMessage(message) {
        const { jobId, userId, imageUrl, script, voiceId, plan, timestamp } = message.body;
        if (!jobId || !userId || !imageUrl || !script) {
            throw new Error('❌ Mensaje de influencer inválido: faltan campos requeridos.');
        }
        this.logger.log(`👤 Procesando video de influencer para userId=${userId}, jobId=${jobId}`);
        this.logger.log(`🎬 Rendering influencer video job ID: ${jobId}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        const result = {
            videoUrl: `https://fake-azure-storage/influencer_result_${jobId}.mp4`,
            jobId,
            userId,
            imageUrl,
            script,
            voiceId,
            plan,
            timestamp,
            status: 'completed',
            duration: 30,
            resolution: '1080p',
        };
        this.logger.log(`✅ Video de influencer generado: ${result.videoUrl}`);
        try {
            const notifyUrl = `${this.backendUrl}/media/register-influencer-video`;
            const res = await (0, node_fetch_1.default)(notifyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result),
            });
            if (!res.ok) {
                const body = await res.text();
                throw new Error(`Respuesta no exitosa del backend: ${res.status} ${body}`);
            }
            this.logger.log(`📨 Video de influencer registrado correctamente en backend para userId=${userId}`);
        }
        catch (err) {
            this.logger.error(`❌ Error notificando al backend principal: ${(0, error_util_1.safeErrorMessage)(err)}`);
        }
    }
    async onModuleDestroy() {
        this.logger.log('🛑 Cerrando conexiones con Azure Service Bus (cola de influencers)...');
        await Promise.all([
            this.receiver?.close(),
            this.sbClient?.close(),
        ]);
        this.logger.log('✅ Consumer de influencer desconectado correctamente.');
    }
};
exports.InfluencerQueueConsumerService = InfluencerQueueConsumerService;
exports.InfluencerQueueConsumerService = InfluencerQueueConsumerService = InfluencerQueueConsumerService_1 = __decorate([
    (0, common_1.Injectable)()
], InfluencerQueueConsumerService);
//# sourceMappingURL=influencer-queue-consumer.service.js.map