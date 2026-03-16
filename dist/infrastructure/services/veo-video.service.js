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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var VeoVideoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeoVideoService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const azure_blob_service_1 = require("./azure-blob.service");
const service_bus_1 = require("@azure/service-bus");
function b64decode(b64EncodedString) {
    return Buffer.from(b64EncodedString, 'base64');
}
let VeoVideoService = VeoVideoService_1 = class VeoVideoService {
    constructor(azureBlobService) {
        this.azureBlobService = azureBlobService;
        this.logger = new common_1.Logger(VeoVideoService_1.name);
        this.apiKey = process.env.VERTEX_API_KEY || '';
        this.projectId = process.env.VERTEX_PROJECT_ID || 'orbital-prime-vision';
        this.location = process.env.VERTEX_LOCATION || 'us-central1';
        this.model = process.env.VEO3_MODEL || 'veo-3.1-generate-001';
        this.backendUrl = process.env.MAIN_BACKEND_URL;
        this.serviceBusConnection = process.env.AZURE_SERVICE_BUS_CONNECTION;
        this.serviceBusQueue = process.env.AZURE_SERVICE_BUS_QUEUE || 'video';
        this.sbClient = null;
        try {
            const { genai } = require('@google/genai');
            this.client = new genai.Client({
                project: this.projectId,
                location: this.location,
                apiKey: this.apiKey,
            });
            this.logger.log('✅ Google GenAI client initialized');
        }
        catch (error) {
            this.logger.warn(`⚠️ Google GenAI SDK not fully configured: ${error.message}`);
            this.logger.warn('📝 Will use fallback REST API method');
        }
        if (this.serviceBusConnection) {
            this.sbClient = new service_bus_1.ServiceBusClient(this.serviceBusConnection);
            this.logger.log('✅ Service Bus client initialized');
        }
        else {
            this.logger.warn('⚠️ Service Bus connection not configured - will process synchronously');
        }
    }
    async queueVideoGeneration(userId, dto, options) {
        this.logger.log(`🎬 [${userId}] Queueing VEO3 video generation`);
        const jobId = (0, uuid_1.v4)();
        try {
            if (!this.sbClient) {
                throw new Error('Service Bus client not initialized');
            }
            const sender = this.sbClient.createSender(this.serviceBusQueue);
            const message = {
                body: {
                    jobId,
                    userId,
                    type: 'veo3-video-generation',
                    prompt: dto.prompt,
                    duration: dto.videoLength || 5,
                    plan: 'pro',
                    options: options || {},
                    timestamp: Date.now(),
                },
            };
            await sender.sendMessages(message);
            await sender.close();
            this.logger.log(`✅ Video generation queued - Job ID: ${jobId}`);
            return {
                jobId,
                status: 'queued',
            };
        }
        catch (error) {
            this.logger.error(`❌ Error queuing video: ${error.message}`, error.stack);
            throw error;
        }
    }
    async callVeoApiWithSdk(dto) {
        try {
            this.logger.log(`📡 Sending request to VEO3 via Google GenAI SDK`);
            this.logger.log(`Model: ${this.model}`);
            const genai = require('@google/genai');
            const types = genai.types || genai;
            const source = {
                prompt: dto.prompt,
            };
            const config = {
                aspectRatio: dto.aspectRatio || '16:9',
                number_of_videos: 1,
                duration_seconds: dto.videoLength || 5,
                person_generation: 'allow_all',
                generate_audio: false,
                resolution: '720p',
                seed: 0,
            };
            this.logger.log(`📋 Source: ${JSON.stringify(source)}`);
            this.logger.log(`📋 Config: ${JSON.stringify(config)}`);
            const operation = await this.client.models.generateVideos(this.model, source, config);
            this.logger.log(`📥 VEO3 SDK Response - Operation: ${operation.name}`);
            return operation;
        }
        catch (error) {
            this.logger.error(`❌ VEO3 SDK error: ${error.message}`, error.stack);
            throw error;
        }
    }
    async callVeoApi(dto) {
        const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}:predictLongRunning`;
        const payload = {
            instances: [
                {
                    prompt: dto.prompt,
                },
            ],
            parameters: {
                aspectRatio: dto.aspectRatio || '16:9',
                videoLength: dto.videoLength || 5,
                fps: dto.fps || 24,
                negativePrompt: dto.negativePrompt || 'blurry, low quality, distorted',
            },
        };
        this.logger.log(`📡 Sending request to VEO3 LongRunning API: ${endpoint}`);
        this.logger.log(`Model: ${this.model}`);
        this.logger.log(`Payload: ${JSON.stringify(payload, null, 2)}`);
        const response = await axios_1.default.post(endpoint, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                key: this.apiKey,
            },
        });
        this.logger.log(`📥 VEO3 API Response Status: ${response.status}`);
        this.logger.log(`📋 Operation Name: ${response.data.name}`);
        return response.data;
    }
    async pollForCompletion(operation) {
        this.logger.log('⏳ Polling for video generation completion...');
        let attempts = 0;
        const maxAttempts = 90;
        const pollInterval = 10000;
        while (attempts < maxAttempts) {
            attempts++;
            const elapsedTime = Math.round((attempts * pollInterval) / 1000 / 60);
            this.logger.log(`   Poll attempt ${attempts}/${maxAttempts} (${elapsedTime} min elapsed)...`);
            try {
                let result;
                if (this.client && operation.name) {
                    this.logger.log('   🔧 Using SDK for polling');
                    result = await this.client.operations.get(operation.name);
                }
                else {
                    this.logger.log('   🔧 Using REST API for polling');
                    throw new Error('REST API polling not supported - requires SDK');
                }
                if (result.done) {
                    this.logger.log('✅ Video generation complete!');
                    if (result.error) {
                        throw new Error(`Operation failed: ${JSON.stringify(result.error)}`);
                    }
                    return result;
                }
                if (result.metadata) {
                    this.logger.log(`   Progress: ${JSON.stringify(result.metadata)}`);
                }
                this.logger.log('   Video not ready yet, waiting...');
            }
            catch (error) {
                this.logger.warn(`   Poll error: ${error.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        throw new Error('Video generation timeout after 15 minutes. The operation may still be running.');
    }
    extractVideoData(result) {
        if (!result.response) {
            throw new Error('No response found in operation result');
        }
        const response = result.response;
        if (!response.generatedVideos || response.generatedVideos.length === 0) {
            throw new Error('No videos generated in response');
        }
        const generatedVideo = response.generatedVideos[0];
        let videoBytes;
        if (generatedVideo.video?.bytes) {
            this.logger.log('📊 Using direct base64 bytes format');
            videoBytes = b64decode(generatedVideo.video.bytes);
        }
        else if (generatedVideo.video?.uri) {
            throw new Error('Video URI format not yet implemented. Requires GCS download.');
        }
        else {
            throw new Error('Video data not found in expected format');
        }
        this.logger.log(`📊 Video size: ${videoBytes.length} bytes (${(videoBytes.length / 1024 / 1024).toFixed(2)} MB)`);
        return videoBytes;
    }
    async generateVideo(dto) {
        const operation = await this.callVeoApiWithSdk(dto);
        const result = await this.pollForCompletion(operation);
        const videoBytes = this.extractVideoData(result);
        const filename = `veo-video-${Date.now()}.mp4`;
        const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);
        const tempDir = path.dirname(tempPath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        fs.writeFileSync(tempPath, videoBytes);
        const blobUrl = await this.azureBlobService.uploadFileToBlobWithSas(tempPath, `videos/${filename}`, 'video/mp4');
        return {
            videoUrl: blobUrl,
            filename,
        };
    }
};
exports.VeoVideoService = VeoVideoService;
exports.VeoVideoService = VeoVideoService = VeoVideoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [azure_blob_service_1.AzureBlobService])
], VeoVideoService);
//# sourceMappingURL=veo-video.service.js.map