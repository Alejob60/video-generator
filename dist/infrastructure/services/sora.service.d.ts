import { AzureBlobService } from './azure-blob.service';
export declare class SoraService {
    private readonly azureBlobService;
    private readonly logger;
    private readonly endpoint;
    private readonly deployment;
    private readonly apiVersion;
    private readonly apiKey;
    constructor(azureBlobService: AzureBlobService);
    private getHeaders;
    createVideoJob(prompt: string, duration: number): Promise<string>;
    waitForVideo(jobId: string): Promise<{
        url: string;
    }>;
    uploadVideoToBlob(videoUrl: string, filename: string): Promise<string>;
    generateAndUploadVideo(prompt: string, duration: number): Promise<{
        blobUrl: string;
        jobId: string;
    }>;
}
