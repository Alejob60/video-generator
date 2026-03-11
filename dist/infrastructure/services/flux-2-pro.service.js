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
var Flux2ProService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Flux2ProService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const azure_blob_service_1 = require("./azure-blob.service");
const llm_service_1 = require("./llm.service");
let Flux2ProService = Flux2ProService_1 = class Flux2ProService {
    constructor(azureBlobService, llmService) {
        this.azureBlobService = azureBlobService;
        this.llmService = llmService;
        this.logger = new common_1.Logger(Flux2ProService_1.name);
        this.endpoint = process.env.ENDPOINT_FLUX_KONTENT_PRO || 'https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com';
        this.deployment = 'FLUX.2-pro';
        this.apiVersion = 'preview';
        this.apiKey = process.env.ENDPOINT_FLUX_KONTENT_PRO_API_KEY || '';
        this.backendUrl = process.env.MAIN_BACKEND_URL;
    }
    async generateImageAndNotify(userId, dto) {
        let finalPrompt = dto.prompt;
        if (dto.isJsonPrompt) {
            try {
                finalPrompt = await this.llmService.improveImagePrompt(dto.prompt);
                this.logger.log(`📋 Converted JSON prompt to natural language with LLM: ${finalPrompt}`);
            }
            catch (error) {
                this.logger.warn(`⚠️ Failed to convert JSON prompt with LLM, using as-is: ${error.message}`);
                finalPrompt = dto.prompt;
            }
        }
        this.logger.log(`📋 Using prompt: ${finalPrompt}`);
        const payload = {
            prompt: finalPrompt,
            n: 1,
            size: dto.size || '1024x1024',
            output_format: 'png'
        };
        try {
            this.logger.log(`📡 Sending request to FLUX 2 Pro (Azure Cognitive Services - Foundry)`);
            this.logger.log(`   Endpoint: ${this.endpoint}/providers/blackforestlabs/v1/flux-2-pro`);
            this.logger.log(`   Payload: ${JSON.stringify(payload, null, 2)}`);
            const basePath = `providers/blackforestlabs/v1/${this.deployment}`;
            const params = `?api-version=${this.apiVersion}`;
            const generationsUrl = `${this.endpoint}/${basePath}${params}`;
            const response = await axios_1.default.post(generationsUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Api-Key': this.apiKey,
                },
                responseType: 'json',
            });
            this.logger.log(`📥 FLUX 2 Pro API Response Status: ${response.status}`);
            this.logger.log(`   Response data keys: ${Object.keys(response.data).join(', ')}`);
            const responseStr = JSON.stringify(response.data).substring(0, 500);
            this.logger.log(`   Response preview: ${responseStr}...`);
            let imageData;
            if (response.data.data && response.data.data.length > 0) {
                imageData = response.data.data[0];
            }
            else if (response.data.choices && response.data.choices.length > 0) {
                imageData = response.data.choices[0];
            }
            else {
                throw new Error('No image data received from FLUX 2 Pro API');
            }
            this.logger.log(`📊 FLUX 2 Pro Response - Has URL: ${!!imageData.url}, Has b64_json: ${!!imageData.b64_json}`);
            let blobUrl;
            let filename;
            if (imageData.url) {
                this.logger.log(`🌐 Image URL provided by FLUX 2 Pro: ${imageData.url}`);
                const uniqueId = Date.now();
                filename = `misy-image-${uniqueId}.png`;
                blobUrl = await this.azureBlobService.uploadFileFromUrlWithSas(imageData.url, `images/${filename}`);
                this.logger.log(`✅ Image uploaded to Azure Blob Storage from URL with SAS: ${blobUrl}`);
            }
            else if (imageData.b64_json) {
                this.logger.log(`📝 Base64 data provided by FLUX 2 Pro, length: ${imageData.b64_json.length}`);
                const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(imageData.b64_json);
                this.logger.log(`🔍 Base64 validation result: ${isValidBase64}`);
                const cleanBase64 = imageData.b64_json.replace(/\s/g, '');
                const buffer = Buffer.from(cleanBase64, 'base64');
                this.logger.log(`💾 Decoded buffer size: ${buffer.length} bytes`);
                const pngHeader = buffer.slice(0, 8);
                const isPng = pngHeader.equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
                this.logger.log(`🔍 PNG header validation: ${isPng ? 'Valid PNG' : 'Invalid PNG header'}`);
                const uniqueId = Date.now();
                filename = `misy-image-${uniqueId}.png`;
                const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);
                const tempDir = path.dirname(tempPath);
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                fs.writeFileSync(tempPath, buffer);
                this.logger.log(`💾 Writing image to temporary file: ${tempPath}`);
                blobUrl = await this.azureBlobService.uploadFileToBlobWithSas(tempPath, `images/${filename}`, 'image/png');
                this.logger.log(`✅ Image uploaded to Azure Blob Storage with SAS: ${blobUrl}`);
                this.logger.log(`💾 Keeping temporary file in temp folder: ${tempPath}`);
            }
            else {
                throw new Error('Unexpected response format from FLUX 2 Pro API - no URL or base64 data found');
            }
            this.logger.log(`🔔 Notifying main backend about generated image`);
            await fetch(`${this.backendUrl}/flux-2-pro-image/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    prompt: finalPrompt,
                    imageUrl: blobUrl,
                    filename,
                }),
            });
            return {
                imageUrl: blobUrl,
                filename,
                prompt: finalPrompt,
            };
        }
        catch (error) {
            this.logger.error('❌ Error generating image with FLUX 2 Pro:', error);
            throw new Error(`Failed to generate image with FLUX 2 Pro: ${error.message || error}`);
        }
    }
    async generateImage(dto) {
        const result = await this.generateImageAndNotify('internal', dto);
        return {
            imageUrl: result.imageUrl,
            filename: result.filename,
        };
    }
};
exports.Flux2ProService = Flux2ProService;
exports.Flux2ProService = Flux2ProService = Flux2ProService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [azure_blob_service_1.AzureBlobService,
        llm_service_1.LLMService])
], Flux2ProService);
//# sourceMappingURL=flux-2-pro.service.js.map