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
var DalleImageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DalleImageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const azure_blob_service_1 = require("./azure-blob.service");
let DalleImageService = DalleImageService_1 = class DalleImageService {
    constructor(configService, azureBlobService) {
        this.configService = configService;
        this.azureBlobService = azureBlobService;
        this.logger = new common_1.Logger(DalleImageService_1.name);
    }
    async generateImage(prompt, plan) {
        try {
            this.logger.log(`🎨 Generating DALL-E 3 image with prompt: ${prompt}`);
            const apiKey = this.configService.get('DALLE_API_KEY');
            if (!apiKey) {
                throw new Error('DALLE_API_KEY not configured');
            }
            const response = await axios_1.default.post('https://api.openai.com/v1/images/generations', {
                model: 'dall-e-3',
                prompt: prompt,
                n: 1,
                size: '1024x1024',
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            this.logger.log(`✅ DALL-E API response received`);
            const imageUrl = response.data.data[0].url;
            this.logger.log(`🌐 DALL-E image URL: ${imageUrl}`);
            const imageResponse = await axios_1.default.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(imageResponse.data);
            const timestamp = Date.now();
            const filename = `promo_${timestamp}.png`;
            const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);
            const tempDir = path.dirname(tempPath);
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            fs.writeFileSync(tempPath, buffer);
            this.logger.log(`💾 Image saved to temp: ${tempPath}`);
            this.logger.log(`📤 Uploading to Azure Blob Storage with SAS`);
            const blobUrl = await this.azureBlobService.uploadFileToBlobWithSas(tempPath, `images/${filename}`);
            this.logger.log(`✅ Image uploaded to Azure: ${blobUrl}`);
            fs.unlinkSync(tempPath);
            this.logger.log(`🗑️ Temp file deleted: ${tempPath}`);
            return {
                imageUrl: blobUrl,
                filename,
            };
        }
        catch (error) {
            this.logger.error(`❌ DALL-E generation error: ${error.message}`, error.stack);
            throw new Error(`DALL-E generation failed: ${error.message}`);
        }
    }
};
exports.DalleImageService = DalleImageService;
exports.DalleImageService = DalleImageService = DalleImageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        azure_blob_service_1.AzureBlobService])
], DalleImageService);
//# sourceMappingURL=dalle-image.service.js.map