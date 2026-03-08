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
var FluxKontextImageV2Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxKontextImageV2Service = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("openai");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const azure_blob_service_1 = require("./azure-blob.service");
const llm_service_1 = require("./llm.service");
let FluxKontextImageV2Service = FluxKontextImageV2Service_1 = class FluxKontextImageV2Service {
    constructor(azureBlobService, llmService) {
        this.azureBlobService = azureBlobService;
        this.llmService = llmService;
        this.logger = new common_1.Logger(FluxKontextImageV2Service_1.name);
        this.endpoint = 'https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/providers/blackforestlabs/v1/flux-2-pro';
        this.apiVersion = 'preview';
        this.apiKey = '7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS';
        this.backendUrl = process.env.MAIN_BACKEND_URL;
        this.openai = new openai_1.AzureOpenAI({
            apiKey: this.apiKey,
            endpoint: this.endpoint,
            apiVersion: this.apiVersion,
        });
    }
    async generateImage(dto) {
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
        try {
            this.logger.log(`📡 Solicitando imagen a FLUX.1-Kontext-pro con prompt: ${finalPrompt}`);
            const response = await fetch(`${this.endpoint}?api-version=${this.apiVersion}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    prompt: finalPrompt,
                    width: 1024,
                    height: 1024,
                    num_images: 1,
                    model: "flux-2-pro"
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`FLUX API error: ${response.status} - ${errorText}`);
            }
            const result = await response.json();
            this.logger.log(`📥 FLUX API Response received`);
            let base64Data;
            if (result.data && result.data[0] && result.data[0].b64_json) {
                base64Data = result.data[0].b64_json;
            }
            else if (result.images && result.images[0]) {
                base64Data = result.images[0];
            }
            else if (result.image) {
                base64Data = result.image;
            }
            else {
                this.logger.error(`❌ No image data found in response. Response data: ${JSON.stringify(result)}`);
                throw new Error('No image data received from FLUX API');
            }
            if (!base64Data) {
                this.logger.error(`❌ No base64 data found in response. Response data: ${JSON.stringify(result)}`);
                throw new Error('No base64 image data received from FLUX API');
            }
            this.logger.log(`ülü Base64 data received, length: ${base64Data.length}`);
            const buffer = Buffer.from(base64Data, 'base64');
            this.logger.log(`💾 Decoded buffer size: ${buffer.length} bytes`);
            const filename = `flux-kontext-${Date.now()}.png`;
            const outputDir = path.resolve('public/uploads');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
                this.logger.log(`📁 Carpeta creada: ${outputDir}`);
            }
            const localPath = path.join(outputDir, filename);
            fs.writeFileSync(localPath, buffer);
            this.logger.log(`💾 Imagen guardada en: ${localPath}`);
            const uploadedUrl = await this.azureBlobService.uploadToContainerWithSas(localPath, 'images');
            this.logger.log(`✅ Imagen subida a Azure Blob Storage with SAS: ${uploadedUrl}`);
            return {
                imageUrl: uploadedUrl,
                filename,
                prompt: finalPrompt
            };
        }
        catch (error) {
            this.logger.error('❌ Error generando imagen desde FLUX.1-Kontext-pro:', error);
            const policyViolation = error?.error?.code === 'content_policy_violation';
            if (policyViolation) {
                this.logger.error('🔒 Azure bloqueó el contenido por política.');
                throw new Error('Azure bloqueó el contenido del prompt por considerarlo sensible. Intenta con otra descripción.');
            }
            throw new Error(`Error generando imagen desde FLUX.1-Kontext-pro: ${error.message}`);
        }
    }
};
exports.FluxKontextImageV2Service = FluxKontextImageV2Service;
exports.FluxKontextImageV2Service = FluxKontextImageV2Service = FluxKontextImageV2Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [azure_blob_service_1.AzureBlobService,
        llm_service_1.LLMService])
], FluxKontextImageV2Service);
//# sourceMappingURL=flux-kontext-image-v2.service.js.map