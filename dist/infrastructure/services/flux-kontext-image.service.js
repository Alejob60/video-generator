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
var FluxKontextImageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxKontextImageService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const azure_blob_service_1 = require("./azure-blob.service");
const llm_service_1 = require("./llm.service");
const form_data_1 = __importDefault(require("form-data"));
const openai_1 = require("openai");
let FluxKontextImageService = FluxKontextImageService_1 = class FluxKontextImageService {
    constructor(azureBlobService, llmService) {
        this.azureBlobService = azureBlobService;
        this.llmService = llmService;
        this.logger = new common_1.Logger(FluxKontextImageService_1.name);
        this.baseURL = process.env.FLUX_KONTEXT_PRO_BASE_URL || 'https://labsc-m9j5kbl9-eastus2.services.ai.azure.com';
        this.deployment = process.env.FLUX_KONTEXT_PRO_DEPLOYMENT || 'FLUX.1-Kontext-pro';
        this.apiVersion = '2025-04-01-preview';
        this.apiKey = process.env.FLUX_KONTEXT_PRO_API_KEY || '';
        this.backendUrl = process.env.MAIN_BACKEND_URL;
    }
    async generateImageAndNotify(userId, dto, referenceImagePath) {
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
        const authHeader = `Bearer ${this.apiKey}`;
        let response;
        try {
            if (referenceImagePath) {
                const editsPath = `openai/deployments/${this.deployment}/images/edits`;
                const editsUrl = `${this.baseURL}/${editsPath}?api-version=${this.apiVersion}`;
                const formData = new form_data_1.default();
                formData.append('model', this.deployment);
                formData.append('prompt', finalPrompt);
                formData.append('n', '1');
                formData.append('size', dto.size || '1024x1024');
                formData.append('image', fs.createReadStream(referenceImagePath));
                this.logger.log(`📡 Sending edit request to FLUX.1-Kontext-pro with prompt: ${finalPrompt}`);
                response = await axios_1.default.post(editsUrl, formData, {
                    headers: {
                        'Authorization': authHeader,
                        ...formData.getHeaders(),
                    },
                });
            }
            else {
                const generationsPath = `openai/deployments/${this.deployment}/images/generations`;
                const generationsUrl = `${this.baseURL}/${generationsPath}?api-version=${this.apiVersion}`;
                const payload = {
                    model: this.deployment,
                    prompt: finalPrompt,
                    output_format: 'png',
                    n: 1,
                    size: dto.size || '1024x1024',
                };
                this.logger.log(`📡 Sending request to FLUX.1-Kontext-pro with payload: ${JSON.stringify(payload, null, 2)}`);
                response = await axios_1.default.post(generationsUrl, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader,
                    },
                    responseType: 'json',
                });
            }
            this.logger.log(`📥 FLUX API Response Status: ${response.status}`);
            this.logger.log(`🔍 FLUX API Response Type: response.data=${typeof response.data}, isArray=${Array.isArray(response.data)}`);
            let imageData;
            if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
                if (response.data.b64_json) {
                    imageData = response.data;
                    this.logger.log('📊 Using direct response.data.b64_json format');
                }
                else if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                    imageData = response.data.data[0];
                    this.logger.log('📊 Using response.data.data[0] format');
                }
                else if (response.data.choices && Array.isArray(response.data.choices) && response.data.choices.length > 0) {
                    imageData = response.data.choices[0];
                    this.logger.log('📊 Using response.data.choices[0] format');
                }
            }
            else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                imageData = response.data[0];
                this.logger.log('📊 Using response.data[0] format');
            }
            else if (response.choices && Array.isArray(response.choices) && response.choices.length > 0) {
                imageData = response.choices[0];
                this.logger.log('📊 Using response.choices[0] format');
            }
            else {
                this.logger.error(`❌ Unexpected response structure. Keys: ${Object.keys(response.data || {}).join(', ')}`);
                throw new Error('No image data received from FLUX API - unexpected response format');
            }
            this.logger.log(`📊 FLUX API Response - Has URL: ${!!imageData.url}, Has b64_json: ${!!imageData.b64_json}`);
            let blobUrl;
            let filename;
            if (imageData.url) {
                this.logger.log(`🌐 Image URL provided by FLUX: ${imageData.url}`);
                filename = `misy-image-${Date.now()}.png`;
                blobUrl = await this.azureBlobService.uploadFileFromUrlWithSas(imageData.url, `images/${filename}`);
                this.logger.log(`✅ Image uploaded to Azure Blob Storage from URL with SAS: ${blobUrl}`);
            }
            else if (imageData.b64_json) {
                this.logger.log(`📝 Base64 data provided by FLUX, length: ${imageData.b64_json.length}`);
                const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(imageData.b64_json);
                this.logger.log(`🔍 Base64 validation result: ${isValidBase64}`);
                const cleanBase64 = imageData.b64_json.replace(/\s/g, '');
                const buffer = Buffer.from(cleanBase64, 'base64');
                this.logger.log(`💾 Decoded buffer size: ${buffer.length} bytes`);
                const pngHeader = buffer.slice(0, 8);
                const isPng = pngHeader.equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
                this.logger.log(`🔍 PNG header validation: ${isPng ? 'Valid PNG' : 'Invalid PNG header'}`);
                filename = `misy-image-${Date.now()}.png`;
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
                throw new Error('Unexpected response format from FLUX API - no URL or base64 data found');
            }
            this.logger.log(`🔔 Notifying main backend about generated image`);
            await fetch(`${this.backendUrl}/flux-kontext-image/complete`, {
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
            this.logger.error('❌ Error generating image with FLUX.1-Kontext-pro:', error);
            this.logger.warn('⚠️ FALLBACK: Attempting to generate with DALL-E 3...');
            try {
                return await this.generateWithDalleFallback(userId, finalPrompt);
            }
            catch (dalleError) {
                this.logger.error('❌ Fallback to DALL-E also failed:', dalleError);
                throw new Error(`Failed to generate image with FLUX and DALL-E fallback: ${error.message}`);
            }
        }
    }
    async generateWithDalleFallback(userId, prompt) {
        this.logger.log('🔄 Using DALL-E 3 as fallback for FLUX');
        const apiKey = process.env.AZURE_OPENAI_IMAGE_API_KEY || process.env.OPENAI_API_KEY;
        const endpoint = process.env.AZURE_OPENAI_IMAGE_ENDPOINT || 'https://api.openai.com/v1';
        if (!apiKey) {
            throw new Error('DALL-E API key not configured for fallback');
        }
        const openai = new openai_1.OpenAI({
            apiKey,
            baseURL: endpoint,
        });
        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024',
        });
        const imageUrl = response.data?.[0]?.url;
        if (!imageUrl) {
            throw new Error('DALL-E fallback did not return an image URL');
        }
        this.logger.log(`🌐 DALL-E fallback URL: ${imageUrl}`);
        const imageResponse = await axios_1.default.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(imageResponse.data);
        const filename = `promo-${Date.now()}.png`;
        const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);
        const tempDir = path.dirname(tempPath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        fs.writeFileSync(tempPath, buffer);
        this.logger.log(`💾 Saved DALL-E fallback to temp: ${tempPath}`);
        const blobUrl = await this.azureBlobService.uploadFileToBlobWithSas(tempPath, `images/${filename}`, 'image/png');
        this.logger.log(`✅ DALL-E fallback uploaded to Azure: ${blobUrl}`);
        await fetch(`${this.backendUrl}/flux-kontext-image/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                prompt,
                imageUrl: blobUrl,
                filename,
                fallbackUsed: true,
            }),
        });
        return {
            imageUrl: blobUrl,
            filename,
            prompt,
        };
    }
    async generateImage(dto, referenceImagePath) {
        const result = await this.generateImageAndNotify('internal', dto, referenceImagePath);
        return {
            imageUrl: result.imageUrl,
            filename: result.filename,
        };
    }
};
exports.FluxKontextImageService = FluxKontextImageService;
exports.FluxKontextImageService = FluxKontextImageService = FluxKontextImageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [azure_blob_service_1.AzureBlobService,
        llm_service_1.LLMService])
], FluxKontextImageService);
//# sourceMappingURL=flux-kontext-image.service.js.map