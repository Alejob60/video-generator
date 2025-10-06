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
var FluxImageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxImageService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const azure_blob_service_1 = require("./azure-blob.service");
let FluxImageService = FluxImageService_1 = class FluxImageService {
    constructor(azureBlobService) {
        this.azureBlobService = azureBlobService;
        this.logger = new common_1.Logger(FluxImageService_1.name);
        this.endpoint = 'https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX-1.1-pro/images/generations';
        this.apiVersion = '2025-04-01-preview';
        this.apiKey = process.env.FLUX_API_KEY || '';
        this.backendUrl = process.env.MAIN_BACKEND_URL;
    }
    async generateImageAndNotify(userId, dto) {
        let finalPrompt = dto.prompt;
        this.logger.log(`📋 Using prompt as-is: ${finalPrompt}`);
        const url = `${this.endpoint}?api-version=${this.apiVersion}`;
        const payload = {
            prompt: finalPrompt,
            output_format: 'png',
            n: 1,
            size: dto.size || '1024x1024'
        };
        try {
            this.logger.log(`📡 Sending request to FLUX-1.1-pro with payload: ${JSON.stringify(payload, null, 2)}`);
            const response = await axios_1.default.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                responseType: 'json'
            });
            this.logger.log(`📥 FLUX API Response Status: ${response.status}`);
            this.logger.log(`📥 FLUX API Response Headers: ${JSON.stringify(response.headers, null, 2)}`);
            const imageData = response.data.data?.[0];
            if (!imageData) {
                throw new Error('No image data received from FLUX API');
            }
            this.logger.log(`📊 FLUX API Response Structure - Keys: ${Object.keys(imageData).join(', ')}`);
            this.logger.log(`📊 FLUX API Response - Has URL: ${!!imageData.url}, Has b64_json: ${!!imageData.b64_json}`);
            if (imageData.url) {
                this.logger.log(`🌐 FLUX provided direct URL, length: ${imageData.url.length}`);
            }
            if (imageData.b64_json) {
                this.logger.log(`ülü FLUX provided base64 data, length: ${imageData.b64_json.length}`);
                this.logger.log(`📋 Base64 sample (first 100 chars): ${imageData.b64_json.substring(0, 100)}`);
            }
            let blobUrl;
            let filename;
            if (imageData.url) {
                this.logger.log(`🌐 Image URL provided by FLUX: ${imageData.url}`);
                filename = `flux-image-${(0, uuid_1.v4)()}.png`;
                this.logger.log(`📤 Uploading image from URL to Azure Blob Storage`);
                blobUrl = await this.azureBlobService.uploadFileFromUrl(imageData.url, `images/${filename}`);
                this.logger.log(`✅ Image uploaded to Azure Blob Storage from URL: ${blobUrl}`);
            }
            else if (imageData.b64_json) {
                this.logger.log(`ülü Base64 data provided by FLUX, length: ${imageData.b64_json.length}`);
                const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(imageData.b64_json);
                this.logger.log(`🔍 Base64 validation result: ${isValidBase64}`);
                this.logger.log(`📋 Base64 sample (first 100 chars): ${imageData.b64_json.substring(0, 100)}`);
                const cleanBase64 = imageData.b64_json.replace(/\s/g, '');
                this.logger.log(`🧹 Cleaned base64 data, length: ${cleanBase64.length}`);
                const buffer = Buffer.from(cleanBase64, 'base64');
                this.logger.log(`💾 Decoded buffer size: ${buffer.length} bytes`);
                const pngHeader = buffer.slice(0, 8);
                const isPng = pngHeader.equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
                this.logger.log(`🔍 PNG header validation: ${isPng ? 'Valid PNG' : 'Invalid PNG header'}`);
                this.logger.log(`🔍 PNG header bytes: ${pngHeader.toString('hex').toUpperCase()}`);
                filename = `flux-image-${(0, uuid_1.v4)()}.png`;
                const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);
                const tempDir = path.dirname(tempPath);
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                this.logger.log(`💾 Writing image to temporary file: ${tempPath}`);
                fs.writeFileSync(tempPath, buffer);
                const stats = fs.statSync(tempPath);
                this.logger.log(`🔍 Temporary file size: ${stats.size} bytes`);
                const verifyBuffer = fs.readFileSync(tempPath);
                this.logger.log(`🔍 Verification buffer size: ${verifyBuffer.length} bytes`);
                const verifyPngHeader = verifyBuffer.slice(0, 8);
                this.logger.log(`🔍 Verification PNG header bytes: ${verifyPngHeader.toString('hex').toUpperCase()}`);
                this.logger.log(`📤 Uploading image to Azure Blob Storage`);
                blobUrl = await this.azureBlobService.uploadFileToBlob(tempPath, `images/${filename}`, 'image/png');
                this.logger.log(`✅ Image uploaded to Azure Blob Storage: ${blobUrl}`);
                this.logger.log(`💾 Keeping temporary file in temp folder: ${tempPath}`);
            }
            else {
                throw new Error('Unexpected response format from FLUX API - no URL or base64 data found');
            }
            this.logger.log(`🔔 Notifying main backend about generated image`);
            await fetch(`${this.backendUrl}/flux-image/complete`, {
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
                prompt: finalPrompt
            };
        }
        catch (error) {
            this.logger.error('❌ Error generating image with FLUX-1.1-pro:', error);
            throw new Error(`Failed to generate image with FLUX: ${error.message || error}`);
        }
    }
    async generateImage(dto) {
        let finalPrompt = dto.prompt;
        this.logger.log(`📋 Using prompt as-is: ${finalPrompt}`);
        const url = `${this.endpoint}?api-version=${this.apiVersion}`;
        const payload = {
            prompt: finalPrompt,
            output_format: 'png',
            n: 1,
            size: dto.size || '1024x1024'
        };
        try {
            this.logger.log(`📡 Sending request to FLUX-1.1-pro with payload: ${JSON.stringify(payload, null, 2)}`);
            const response = await axios_1.default.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                responseType: 'json'
            });
            this.logger.log(`📥 FLUX API Response Status: ${response.status}`);
            this.logger.log(`📥 FLUX API Response Headers: ${JSON.stringify(response.headers, null, 2)}`);
            const imageData = response.data.data?.[0];
            if (!imageData) {
                throw new Error('No image data received from FLUX API');
            }
            this.logger.log(`📊 FLUX API Response Structure - Keys: ${Object.keys(imageData).join(', ')}`);
            this.logger.log(`📊 FLUX API Response - Has URL: ${!!imageData.url}, Has b64_json: ${!!imageData.b64_json}`);
            if (imageData.url) {
                this.logger.log(`🌐 FLUX provided direct URL, length: ${imageData.url.length}`);
            }
            if (imageData.b64_json) {
                this.logger.log(`ülü FLUX provided base64 data, length: ${imageData.b64_json.length}`);
                this.logger.log(`📋 Base64 sample (first 100 chars): ${imageData.b64_json.substring(0, 100)}`);
            }
            let blobUrl;
            let filename;
            if (imageData.url) {
                this.logger.log(`🌐 Image URL provided by FLUX: ${imageData.url}`);
                filename = `flux-image-${(0, uuid_1.v4)()}.png`;
                this.logger.log(`📤 Uploading image from URL to Azure Blob Storage`);
                blobUrl = await this.azureBlobService.uploadFileFromUrl(imageData.url, `images/${filename}`);
                this.logger.log(`✅ Image uploaded to Azure Blob Storage from URL: ${blobUrl}`);
            }
            else if (imageData.b64_json) {
                this.logger.log(`ülü Base64 data provided by FLUX, length: ${imageData.b64_json.length}`);
                const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(imageData.b64_json);
                this.logger.log(`🔍 Base64 validation result: ${isValidBase64}`);
                this.logger.log(`📋 Base64 sample (first 100 chars): ${imageData.b64_json.substring(0, 100)}`);
                const cleanBase64 = imageData.b64_json.replace(/\s/g, '');
                this.logger.log(`🧹 Cleaned base64 data, length: ${cleanBase64.length}`);
                const buffer = Buffer.from(cleanBase64, 'base64');
                this.logger.log(`💾 Decoded buffer size: ${buffer.length} bytes`);
                const pngHeader = buffer.slice(0, 8);
                const isPng = pngHeader.equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
                this.logger.log(`🔍 PNG header validation: ${isPng ? 'Valid PNG' : 'Invalid PNG header'}`);
                this.logger.log(`🔍 PNG header bytes: ${pngHeader.toString('hex').toUpperCase()}`);
                filename = `flux-image-${(0, uuid_1.v4)()}.png`;
                const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);
                const tempDir = path.dirname(tempPath);
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                this.logger.log(`💾 Writing image to temporary file: ${tempPath}`);
                fs.writeFileSync(tempPath, buffer);
                const stats = fs.statSync(tempPath);
                this.logger.log(`🔍 Temporary file size: ${stats.size} bytes`);
                const verifyBuffer = fs.readFileSync(tempPath);
                this.logger.log(`🔍 Verification buffer size: ${verifyBuffer.length} bytes`);
                const verifyPngHeader = verifyBuffer.slice(0, 8);
                this.logger.log(`🔍 Verification PNG header bytes: ${verifyPngHeader.toString('hex').toUpperCase()}`);
                this.logger.log(`📤 Uploading image to Azure Blob Storage`);
                blobUrl = await this.azureBlobService.uploadFileToBlob(tempPath, `images/${filename}`, 'image/png');
                this.logger.log(`✅ Image uploaded to Azure Blob Storage: ${blobUrl}`);
                this.logger.log(`💾 Keeping temporary file in temp folder: ${tempPath}`);
            }
            else {
                throw new Error('Unexpected response format from FLUX API - no URL or base64 data found');
            }
            return {
                imageUrl: blobUrl,
                filename
            };
        }
        catch (error) {
            this.logger.error('❌ Error generating image with FLUX-1.1-pro:', error);
            throw new Error(`Failed to generate image with FLUX: ${error.message || error}`);
        }
    }
};
exports.FluxImageService = FluxImageService;
exports.FluxImageService = FluxImageService = FluxImageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [azure_blob_service_1.AzureBlobService])
], FluxImageService);
//# sourceMappingURL=flux-image.service.js.map