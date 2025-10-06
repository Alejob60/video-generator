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
var AzureBlobService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureBlobService = void 0;
const common_1 = require("@nestjs/common");
const storage_blob_1 = require("@azure/storage-blob");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
let AzureBlobService = AzureBlobService_1 = class AzureBlobService {
    constructor() {
        this.logger = new common_1.Logger(AzureBlobService_1.name);
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        this.defaultContainerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
        this.imagesContainerName = process.env.AZURE_STORAGE_CONTAINER_IMAGES || this.defaultContainerName;
        this.videoContainerName = process.env.AZURE_STORAGE_CONTAINER_VIDEO || this.defaultContainerName;
        this.accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
        this.accountKey = process.env.AZURE_STORAGE_KEY;
        this.blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(connectionString);
        this.logger.log(`🔧 Azure Blob Service Configuration:`);
        this.logger.log(`   Default Container: ${this.defaultContainerName}`);
        this.logger.log(`   Images Container: ${this.imagesContainerName}`);
        this.logger.log(`   Video Container: ${this.videoContainerName}`);
    }
    getContentType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.mp3')
            return 'audio/mpeg';
        if (ext === '.png')
            return 'image/png';
        if (ext === '.jpg' || ext === '.jpeg')
            return 'image/jpeg';
        if (ext === '.mp4')
            return 'video/mp4';
        return 'application/octet-stream';
    }
    getContainerNameFromPath(blobPath) {
        if (blobPath.startsWith('images/')) {
            this.logger.log(`📂 Routing path '${blobPath}' to images container: ${this.imagesContainerName}`);
            return this.imagesContainerName;
        }
        else if (blobPath.startsWith('audio/')) {
            this.logger.log(`📂 Routing path '${blobPath}' to audio container: ${this.defaultContainerName}`);
            return this.defaultContainerName;
        }
        else if (blobPath.startsWith('video/')) {
            this.logger.log(`📂 Routing path '${blobPath}' to video container: ${this.videoContainerName}`);
            return this.videoContainerName;
        }
        else if (blobPath.startsWith('subtitles/')) {
            this.logger.log(`📂 Routing path '${blobPath}' to subtitles container: ${this.defaultContainerName}`);
            return this.defaultContainerName;
        }
        this.logger.log(`📂 Routing path '${blobPath}' to default container: ${this.defaultContainerName}`);
        return this.defaultContainerName;
    }
    async uploadFile(data, blobPath) {
        const containerName = this.getContainerNameFromPath(blobPath);
        const containerClient = this.blobServiceClient.getContainerClient(containerName);
        await containerClient.createIfNotExists();
        const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
        const buffer = typeof data === 'string' ? await (0, promises_1.readFile)(data) : data;
        this.logger.log(`📤 Uploading to Azure Blob: ${blobPath} in container: ${containerName}`);
        await blockBlobClient.uploadData(buffer, {
            blobHTTPHeaders: {
                blobContentType: this.getContentType(blobPath),
            },
        });
        return blockBlobClient.url;
    }
    async uploadFileFromPath(filePath, filename) {
        const containerName = this.getContainerNameFromPath(filename);
        const containerClient = this.blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(filename);
        const fileBuffer = (0, fs_1.readFileSync)(filePath);
        await blockBlobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: {
                blobContentType: this.getContentType(filePath),
            },
        });
        return blockBlobClient.url;
    }
    async uploadToContainer(filePath, containerName, blobName) {
        const containerClient = this.blobServiceClient.getContainerClient(containerName);
        await containerClient.createIfNotExists();
        const fileName = blobName || path.basename(filePath);
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        const fileBuffer = (0, fs_1.readFileSync)(filePath);
        await blockBlobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: {
                blobContentType: this.getContentType(filePath),
            },
        });
        return blockBlobClient.url;
    }
    async uploadFileToBlob(filePath, fileName, mimeType) {
        const containerName = this.getContainerNameFromPath(fileName);
        const containerClient = this.blobServiceClient.getContainerClient(containerName);
        await containerClient.createIfNotExists();
        const fileBuffer = (0, fs_1.readFileSync)(filePath);
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        await blockBlobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: {
                blobContentType: mimeType || this.getContentType(filePath),
            },
        });
        this.logger.log(`📤 File uploaded to container ${containerName} with name: ${fileName}`);
        return blockBlobClient.url;
    }
    async uploadFileFromUrl(url, filename) {
        const containerName = this.getContainerNameFromPath(filename);
        const containerClient = this.blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(filename);
        const response = await axios_1.default.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        await blockBlobClient.uploadData(buffer, {
            blobHTTPHeaders: { blobContentType: this.getContentType(filename) },
        });
        this.logger.log(`📤 File downloaded from URL and uploaded to container ${containerName} with name: ${filename}`);
        return blockBlobClient.url;
    }
    async copyBlobFromUrl(sourceUrl, filename) {
        const containerName = this.getContainerNameFromPath(filename);
        const containerClient = this.blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(filename);
        await blockBlobClient.syncCopyFromURL(sourceUrl);
        return blockBlobClient.url;
    }
    async generateSasUrl(blobName, durationSeconds) {
        const containerName = this.getContainerNameFromPath(blobName);
        const credential = new storage_blob_1.StorageSharedKeyCredential(this.accountName, this.accountKey);
        const sas = (0, storage_blob_1.generateBlobSASQueryParameters)({
            containerName: containerName,
            blobName,
            permissions: storage_blob_1.BlobSASPermissions.parse('r'),
            startsOn: new Date(),
            expiresOn: new Date(Date.now() + durationSeconds * 1000),
            protocol: storage_blob_1.SASProtocol.Https,
        }, credential).toString();
        return `https://${this.accountName}.blob.core.windows.net/${containerName}/${blobName}?${sas}`;
    }
};
exports.AzureBlobService = AzureBlobService;
exports.AzureBlobService = AzureBlobService = AzureBlobService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AzureBlobService);
//# sourceMappingURL=azure-blob.service.js.map