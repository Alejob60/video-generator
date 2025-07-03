export declare class AzureBlobService {
    private readonly logger;
    private readonly blobServiceClient;
    private readonly containerName;
    private readonly accountName;
    private readonly accountKey;
    constructor();
    private getContentType;
    uploadFile(data: Buffer | string, blobPath: string): Promise<string>;
    uploadFileFromPath(filePath: string, filename: string): Promise<string>;
    uploadToContainer(filePath: string, containerName: string, blobName?: string): Promise<string>;
    uploadFileToBlob(filePath: string, fileName: string, mimeType?: string): Promise<string>;
    uploadFileFromUrl(url: string, filename: string): Promise<string>;
    copyBlobFromUrl(sourceUrl: string, filename: string): Promise<string>;
    generateSasUrl(blobName: string, durationSeconds: number): Promise<string>;
}
