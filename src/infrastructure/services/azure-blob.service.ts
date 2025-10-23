// src/infrastructure/services/azure-blob.service.ts
import { Injectable, Logger } from '@nestjs/common';
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

@Injectable()
export class AzureBlobService {
  private readonly logger = new Logger(AzureBlobService.name);
  private readonly blobServiceClient: BlobServiceClient;
  private readonly defaultContainerName: string;
  private readonly imagesContainerName: string;
  private readonly videoContainerName: string;
  private readonly accountName: string;
  private readonly accountKey: string;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    this.defaultContainerName = process.env.AZURE_STORAGE_CONTAINER_NAME!;
    this.imagesContainerName = process.env.AZURE_STORAGE_CONTAINER_IMAGES || this.defaultContainerName;
    this.videoContainerName = process.env.AZURE_STORAGE_CONTAINER_VIDEO || this.defaultContainerName;
    this.accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
    this.accountKey = process.env.AZURE_STORAGE_KEY!;
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    
    // Debug logging to verify environment variables
    this.logger.log(`🔧 Azure Blob Service Configuration:`);
    this.logger.log(`   Default Container: ${this.defaultContainerName}`);
    this.logger.log(`   Images Container: ${this.imagesContainerName}`);
    this.logger.log(`   Video Container: ${this.videoContainerName}`);
  }

  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.mp3') return 'audio/mpeg';
    if (ext === '.png') return 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.mp4') return 'video/mp4';
    return 'application/octet-stream';
  }

  private getContainerNameFromPath(blobPath: string): string {
    if (blobPath.startsWith('images/')) {
      this.logger.log(`📂 Routing path '${blobPath}' to images container: ${this.imagesContainerName}`);
      return this.imagesContainerName;
    } else if (blobPath.startsWith('audio/')) {
      this.logger.log(`📂 Routing path '${blobPath}' to audio container: ${this.defaultContainerName}`);
      return this.defaultContainerName;
    } else if (blobPath.startsWith('video/')) {
      this.logger.log(`📂 Routing path '${blobPath}' to video container: ${this.videoContainerName}`);
      return this.videoContainerName;
    } else if (blobPath.startsWith('subtitles/')) {
      this.logger.log(`📂 Routing path '${blobPath}' to subtitles container: ${this.defaultContainerName}`);
      return this.defaultContainerName;
    }
    this.logger.log(`📂 Routing path '${blobPath}' to default container: ${this.defaultContainerName}`);
    return this.defaultContainerName;
  }

  async uploadFile(data: Buffer | string, blobPath: string): Promise<string> {
    const containerName = this.getContainerNameFromPath(blobPath);
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    const buffer = typeof data === 'string' ? await readFile(data) : data;

    this.logger.log(`📤 Uploading to Azure Blob: ${blobPath} in container: ${containerName}`);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: this.getContentType(blobPath),
      },
    });

    return blockBlobClient.url;
  }

  async uploadFileFromPath(filePath: string, filename: string): Promise<string> {
    const containerName = this.getContainerNameFromPath(filename);
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
    const fileBuffer = readFileSync(filePath);

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: {
        blobContentType: this.getContentType(filePath),
      },
    });

    return blockBlobClient.url;
  }

  async uploadToContainerWithSas(filePath: string, containerName: string, blobName?: string, durationSeconds: number = 86400): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const fileName = blobName || path.basename(filePath);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const fileBuffer = readFileSync(filePath);

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: {
        blobContentType: this.getContentType(filePath),
      },
    });

    // Generate SAS URL
    const credential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
    const sas = generateBlobSASQueryParameters(
      {
        containerName: containerName,
        blobName: fileName,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: new Date(),
        expiresOn: new Date(Date.now() + durationSeconds * 1000),
        protocol: SASProtocol.Https,
      },
      credential,
    ).toString();

    return `https://${this.accountName}.blob.core.windows.net/${containerName}/${fileName}?${sas}`;
  }

  async uploadToContainer(filePath: string, containerName: string, blobName?: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const fileName = blobName || path.basename(filePath);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const fileBuffer = readFileSync(filePath);

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: {
        blobContentType: this.getContentType(filePath),
      },
    });

    return blockBlobClient.url;
  }

  async uploadFileToBlob(filePath: string, fileName: string, mimeType?: string): Promise<string> {
    const containerName = this.getContainerNameFromPath(fileName);
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const fileBuffer = readFileSync(filePath);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: {
        blobContentType: mimeType || this.getContentType(filePath),
      },
    });

    this.logger.log(`📤 File uploaded to container ${containerName} with name: ${fileName}`);
    return blockBlobClient.url;
  }

  async uploadFileFromUrl(url: string, filename: string): Promise<string> {
    const containerName = this.getContainerNameFromPath(filename);
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: this.getContentType(filename) },
    });

    this.logger.log(`📤 File downloaded from URL and uploaded to container ${containerName} with name: ${filename}`);
    return blockBlobClient.url;
  }

  async copyBlobFromUrl(sourceUrl: string, filename: string): Promise<string> {
    const containerName = this.getContainerNameFromPath(filename);
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    await blockBlobClient.syncCopyFromURL(sourceUrl);
    return blockBlobClient.url;
  }

  async uploadFileToBlobWithSas(filePath: string, fileName: string, mimeType?: string, durationSeconds: number = 86400): Promise<string> {
    const containerName = this.getContainerNameFromPath(fileName);
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const fileBuffer = readFileSync(filePath);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: {
        blobContentType: mimeType || this.getContentType(filePath),
      },
    });

    this.logger.log(`📤 File uploaded to container ${containerName} with name: ${fileName}`);
    
    // Generate SAS URL
    const credential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
    const sas = generateBlobSASQueryParameters(
      {
        containerName: containerName,
        blobName: fileName,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: new Date(),
        expiresOn: new Date(Date.now() + durationSeconds * 1000),
        protocol: SASProtocol.Https,
      },
      credential,
    ).toString();

    return `https://${this.accountName}.blob.core.windows.net/${containerName}/${fileName}?${sas}`;
  }

  async uploadFileFromUrlWithSas(url: string, filename: string, durationSeconds: number = 86400): Promise<string> {
    const containerName = this.getContainerNameFromPath(filename);
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: this.getContentType(filename) },
    });

    this.logger.log(`📤 File downloaded from URL and uploaded to container ${containerName} with name: ${filename}`);
    
    // Generate SAS URL
    const credential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
    const sas = generateBlobSASQueryParameters(
      {
        containerName: containerName,
        blobName: filename,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: new Date(),
        expiresOn: new Date(Date.now() + durationSeconds * 1000),
        protocol: SASProtocol.Https,
      },
      credential,
    ).toString();

    return `https://${this.accountName}.blob.core.windows.net/${containerName}/${filename}?${sas}`;
  }

  async generateSasUrl(blobName: string, durationSeconds: number): Promise<string> {
    // For SAS URL generation, we need to determine the container from the blob name
    const containerName = this.getContainerNameFromPath(blobName);
    const credential = new StorageSharedKeyCredential(this.accountName, this.accountKey);

    const sas = generateBlobSASQueryParameters(
      {
        containerName: containerName,
        blobName,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: new Date(),
        expiresOn: new Date(Date.now() + durationSeconds * 1000),
        protocol: SASProtocol.Https,
      },
      credential,
    ).toString();

    return `https://${this.accountName}.blob.core.windows.net/${containerName}/${blobName}?${sas}`;
  }
}