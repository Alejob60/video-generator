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
  private readonly containerName: string;
  private readonly accountName: string;
  private readonly accountKey: string;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!;
    this.accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
    this.accountKey = process.env.AZURE_STORAGE_KEY!;
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  }

  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.mp3') return 'audio/mpeg';
    if (ext === '.png') return 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.mp4') return 'video/mp4';
    return 'application/octet-stream';
  }

  async uploadFile(data: Buffer | string, blobPath: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    await containerClient.createIfNotExists();

    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    const buffer = typeof data === 'string' ? await readFile(data) : data;

    this.logger.log(`📤 Subiendo a Azure Blob: ${blobPath}`);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: this.getContentType(blobPath),
      },
    });

    return blockBlobClient.url;
  }

  async uploadFileFromPath(filePath: string, filename: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
    const fileBuffer = readFileSync(filePath);

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: {
        blobContentType: this.getContentType(filePath),
      },
    });

    return blockBlobClient.url;
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
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    await containerClient.createIfNotExists();

    const fileBuffer = readFileSync(filePath);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: {
        blobContentType: mimeType || this.getContentType(filePath),
      },
    });

    return blockBlobClient.url;
  }

  async uploadFileFromUrl(url: string, filename: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: this.getContentType(filename) },
    });

    return blockBlobClient.url;
  }

  async copyBlobFromUrl(sourceUrl: string, filename: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    await blockBlobClient.syncCopyFromURL(sourceUrl);
    return blockBlobClient.url;
  }

  async generateSasUrl(blobName: string, durationSeconds: number): Promise<string> {
    const credential = new StorageSharedKeyCredential(this.accountName, this.accountKey);

    const sas = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: new Date(),
        expiresOn: new Date(Date.now() + durationSeconds * 1000),
        protocol: SASProtocol.Https,
      },
      credential,
    ).toString();

    return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blobName}?${sas}`;
  }
}
