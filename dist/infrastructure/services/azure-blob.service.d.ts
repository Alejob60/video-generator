export declare class AzureBlobService {
    private readonly logger;
    private readonly blobServiceClient;
    private readonly defaultContainerName;
    private readonly imagesContainerName;
    private readonly videoContainerName;
    private readonly accountName;
    private readonly accountKey;
    constructor();
    private getContentType;
    private getContainerNameFromPath;
    uploadFile(data: Buffer | string, blobPath: string): Promise<string>;
    uploadFileFromPath(filePath: string, filename: string): Promise<string>;
    uploadToContainer(filePath: string, containerName: string, blobName?: string): Promise<string>;
    uploadFileToBlob(filePath: string, fileName: string, mimeType?: string): Promise<string>;
    uploadFileFromUrl(url: string, filename: string): Promise<string>;
    copyBlobFromUrl(sourceUrl: string, filename: string): Promise<string>;
    generateSasUrl(blobName: string, durationSeconds: number): Promise<string>;
}
