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
const uuid_1 = require("uuid");
const azure_blob_service_1 = require("./azure-blob.service");
const llm_service_1 = require("./llm.service");
const identity_1 = require("@azure/identity");
const form_data_1 = __importDefault(require("form-data"));
let FluxKontextImageService = FluxKontextImageService_1 = class FluxKontextImageService {
    constructor(azureBlobService, llmService) {
        this.azureBlobService = azureBlobService;
        this.llmService = llmService;
        this.logger = new common_1.Logger(FluxKontextImageService_1.name);
        this.generationsEndpoint = `${process.env.ENDPOINT_FLUX_KONTENT_PRO}/openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview`;
        this.apiKey = process.env.ENDPOINT_FLUX_KONTENT_PRO_API_KEY || '7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS';
        this.editsEndpointBase = `${process.env.ENDPOINT_FLUX_KONTENT_PRO}/openai/deployments/FLUX.1-Kontext-pro/images/edits`;
        this.apiVersion = '2025-04-01-preview';
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
        const credential = new identity_1.DefaultAzureCredential();
        const tokenResponse = await credential.getToken("https://cognitiveservices.azure.com/.default");
        let response;
        try {
            if (referenceImagePath) {
                const editsUrl = `${this.editsEndpointBase}?api-version=${this.apiVersion}`;
                const formData = new form_data_1.default();
                formData.append("prompt", finalPrompt);
                formData.append("n", "1");
                formData.append("size", dto.size || '1024x1024');
                formData.append("image", fs.createReadStream(referenceImagePath));
                this.logger.log(`📡 Sending edit request to FLUX.1-Kontext-pro with prompt: ${finalPrompt}`);
                response = await axios_1.default.post(editsUrl, formData, {
                    headers: {
                        'Authorization': 'Bearer ' + tokenResponse.token,
                        ...formData.getHeaders()
                    },
                });
            }
            else {
                const generationsUrl = this.generationsEndpoint;
                const payload = {
                    prompt: finalPrompt,
                    output_format: 'png',
                    n: 1,
                    size: dto.size || '1024x1024'
                };
                this.logger.log(`📡 Sending request to FLUX.1-Kontext-pro with payload: ${JSON.stringify(payload, null, 2)}`);
                response = await axios_1.default.post(generationsUrl, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + tokenResponse.token
                    },
                    responseType: 'json'
                });
            }
            this.logger.log(`📥 FLUX API Response Status: ${response.status}`);
            this.logger.log(`📥 FLUX API Response Headers: ${JSON.stringify(response.headers, null, 2)}`);
            const choices = response.data.choices;
            if (!choices || choices.length === 0) {
                this.logger.error(`❌ No choices found in response. Response data: ${JSON.stringify(response.data)}`);
                throw new Error('No image data received from FLUX API');
            }
            const imageData = choices[0];
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
                filename = `flux-kontext-image-${(0, uuid_1.v4)()}.png`;
                this.logger.log(`📤 Uploading image from URL to Azure Blob Storage with SAS`);
                blobUrl = await this.azureBlobService.uploadFileFromUrlWithSas(imageData.url, `images/${filename}`);
                this.logger.log(`✅ Image uploaded to Azure Blob Storage from URL with SAS: ${blobUrl}`);
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
                this.logger.log(`🔍 PNG header validation: ${isPng ? 'Valid PNG' : 'Invalid PNG header'})`);
                this.logger.log(`🔍 PNG header bytes: ${pngHeader.toString('hex').toUpperCase()}`);
                filename = `flux-kontext-image-${(0, uuid_1.v4)()}.png`;
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
                this.logger.log(`📤 Uploading image to Azure Blob Storage with SAS`);
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
                prompt: finalPrompt
            };
        }
        catch (error) {
            this.logger.error('❌ Error generating image with FLUX.1-Kontext-pro:', error);
            throw new Error(`Failed to generate image with FLUX: ${error.message || error}`);
        }
    }
    async generateImage(dto, referenceImagePath) {
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
        const credential = new identity_1.DefaultAzureCredential();
        const tokenResponse = await credential.getToken("https://cognitiveservices.azure.com/.default");
        let response;
        try {
            if (referenceImagePath) {
                const editsUrl = `${this.editsEndpointBase}?api-version=${this.apiVersion}`;
                const formData = new form_data_1.default();
                formData.append("prompt", finalPrompt);
                formData.append("n", "1");
                formData.append("size", dto.size || '1024x1024');
                formData.append("image", fs.createReadStream(referenceImagePath));
                this.logger.log(`📡 Sending edit request to FLUX.1-Kontext-pro with prompt: ${finalPrompt}`);
                response = await axios_1.default.post(editsUrl, formData, {
                    headers: {
                        'Authorization': 'Bearer ' + tokenResponse.token,
                        ...formData.getHeaders()
                    },
                });
            }
            else {
                const generationsUrl = this.generationsEndpoint;
                const payload = {
                    prompt: finalPrompt,
                    output_format: 'png',
                    n: 1,
                    size: dto.size || '1024x1024'
                };
                this.logger.log(`📡 Sending request to FLUX.1-Kontext-pro with payload: ${JSON.stringify(payload, null, 2)}`);
                response = await axios_1.default.post(generationsUrl, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + tokenResponse.token
                    },
                    responseType: 'json'
                });
            }
            this.logger.log(`📥 FLUX API Response Status: ${response.status}`);
            this.logger.log(`📥 FLUX API Response Headers: ${JSON.stringify(response.headers, null, 2)}`);
            const choices = response.data.choices;
            if (!choices || choices.length === 0) {
                this.logger.error(`❌ No choices found in response. Response data: ${JSON.stringify(response.data)}`);
                throw new Error('No image data received from FLUX API');
            }
            const imageData = choices[0];
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
                filename = `flux-kontext-image-${(0, uuid_1.v4)()}.png`;
                this.logger.log(`📤 Uploading image from URL to Azure Blob Storage with SAS`);
                blobUrl = await this.azureBlobService.uploadFileFromUrlWithSas(imageData.url, `images/${filename}`);
                this.logger.log(`✅ Image uploaded to Azure Blob Storage from URL with SAS: ${blobUrl}`);
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
                this.logger.log(`🔍 PNG header validation: ${isPng ? 'Valid PNG' : 'Invalid PNG header'})`);
                this.logger.log(`🔍 PNG header bytes: ${pngHeader.toString('hex').toUpperCase()}`);
                filename = `flux-kontext-image-${(0, uuid_1.v4)()}.png`;
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
                this.logger.log(`📤 Uploading image to Azure Blob Storage with SAS`);
                blobUrl = await this.azureBlobService.uploadFileToBlobWithSas(tempPath, `images/${filename}`, 'image/png');
                this.logger.log(`✅ Image uploaded to Azure Blob Storage with SAS: ${blobUrl}`);
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
            this.logger.error('❌ Error generating image with FLUX.1-Kontext-pro:', error);
            throw new Error(`Failed to generate image with FLUX: ${error.message || error}`);
        }
    }
};
exports.FluxKontextImageService = FluxKontextImageService;
exports.FluxKontextImageService = FluxKontextImageService = FluxKontextImageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [azure_blob_service_1.AzureBlobService,
        llm_service_1.LLMService])
], FluxKontextImageService);
//# sourceMappingURL=flux-kontext-image.service.js.map