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
var VeoVideoQueueConsumerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeoVideoQueueConsumerService = void 0;
const common_1 = require("@nestjs/common");
const service_bus_1 = require("@azure/service-bus");
const veo_video_service_1 = require("./veo-video.service");
const azure_blob_service_1 = require("./azure-blob.service");
const azure_tts_service_1 = require("./azure-tts.service");
let VeoVideoQueueConsumerService = VeoVideoQueueConsumerService_1 = class VeoVideoQueueConsumerService {
    constructor(veoVideoService, azureBlobService, ttsService) {
        this.veoVideoService = veoVideoService;
        this.azureBlobService = azureBlobService;
        this.ttsService = ttsService;
        this.logger = new common_1.Logger(VeoVideoQueueConsumerService_1.name);
        this.sbClient = null;
        const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION;
        this.serviceBusQueue = process.env.AZURE_SERVICE_BUS_QUEUE || 'video';
        this.backendUrl = process.env.MAIN_BACKEND_URL;
        if (connectionString) {
            this.sbClient = new service_bus_1.ServiceBusClient(connectionString);
            this.logger.log('✅ VEO3 Queue Consumer initialized');
        }
        else {
            this.logger.warn('⚠️ Service Bus connection not configured');
        }
    }
    async onModuleInit() {
        if (!this.sbClient) {
            this.logger.warn('⚠️ Cannot start VEO3 queue consumer - no Service Bus connection');
            return;
        }
        try {
            await this.startProcessingMessages();
        }
        catch (error) {
            this.logger.error(`❌ Error starting VEO3 queue consumer: ${error.message}`, error.stack);
        }
    }
    async startProcessingMessages() {
        if (!this.sbClient) {
            this.logger.warn('⚠️ Service Bus client not available');
            return;
        }
        this.logger.log(`📡 Starting to process VEO3 messages from queue: ${this.serviceBusQueue}`);
        const receiver = this.sbClient.createReceiver(this.serviceBusQueue);
        const messages = await receiver.receiveMessages(1, { maxWaitTimeInMs: 5000 });
        for (const message of messages) {
            try {
                await this.processMessage(message);
                await receiver.completeMessage(message);
            }
            catch (error) {
                this.logger.error(`❌ Error processing VEO3 message: ${error.message}`, error.stack);
                await receiver.abandonMessage(message);
            }
        }
        setTimeout(() => this.startProcessingMessages(), 1000);
    }
    async processMessage(message) {
        const { jobId, userId, prompt, duration, options } = message.body;
        this.logger.log(`🎬 [${jobId}] Processing VEO3 video generation for user: ${userId}`);
        this.logger.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
        this.logger.log(`⏱️ Duration: ${duration}s`);
        try {
            this.logger.log('🔧 Generating video with VEO3...');
            const videoResult = await this.veoVideoService.generateVideo({
                prompt,
                videoLength: duration,
                aspectRatio: '16:9',
                fps: 24,
                negativePrompt: 'blurry, low quality, distorted',
            });
            this.logger.log(`✅ Video generated: ${videoResult.filename}`);
            let audioUrl;
            let script;
            if (options?.useVoice) {
                try {
                    this.logger.log('🎤 Generating TTS audio...');
                    const audioResult = await this.ttsService.generateAudioFromPrompt(prompt);
                    audioUrl = audioResult.blobUrl;
                    script = audioResult.script;
                    this.logger.log('✅ Audio generated');
                }
                catch (err) {
                    this.logger.warn(`⚠️ TTS generation failed: ${err.message}`);
                }
            }
            const completePayload = {
                jobId,
                userId,
                type: 'veo3-complete',
                status: 'completed',
                videoUrl: videoResult.videoUrl,
                filename: videoResult.filename,
                prompt,
                duration,
                audioUrl,
                script,
                subtitles: options?.useSubtitles ? 'pendiente' : undefined,
                music: options?.useMusic ? 'pendiente' : undefined,
                completedAt: Date.now(),
            };
            this.logger.log(`🔔 Notifying main backend: ${this.backendUrl}/veo-video/complete`);
            try {
                const response = await fetch(`${this.backendUrl}/veo-video/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(completePayload),
                });
                if (response.ok) {
                    this.logger.log('✅ Main backend notified successfully');
                }
                else {
                    this.logger.warn(`⚠️ Backend notification failed: ${response.status}`);
                }
            }
            catch (err) {
                this.logger.error(`❌ Failed to notify backend: ${err.message}`);
            }
            this.logger.log(`✅ [${jobId}] VEO3 video generation completed successfully`);
        }
        catch (error) {
            this.logger.error(`❌ [${jobId}] VEO3 video generation failed: ${error.message}`, error.stack);
            try {
                await fetch(`${this.backendUrl}/veo-video/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jobId,
                        userId,
                        type: 'veo3-complete',
                        status: 'failed',
                        error: error.message,
                        failedAt: Date.now(),
                    }),
                });
            }
            catch (notifyError) {
                this.logger.error(`❌ Failed to notify backend of error: ${notifyError.message}`);
            }
            throw error;
        }
    }
};
exports.VeoVideoQueueConsumerService = VeoVideoQueueConsumerService;
exports.VeoVideoQueueConsumerService = VeoVideoQueueConsumerService = VeoVideoQueueConsumerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [veo_video_service_1.VeoVideoService,
        azure_blob_service_1.AzureBlobService,
        azure_tts_service_1.AzureTTSService])
], VeoVideoQueueConsumerService);
//# sourceMappingURL=veo-video-queue-consumer.service.js.map