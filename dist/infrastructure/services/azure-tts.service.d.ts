import { AzureBlobService } from './azure-blob.service';
export declare class AzureTTSService {
    private readonly blobService;
    private readonly logger;
    private readonly apiUrl;
    private readonly apiKey;
    private readonly voice;
    private readonly model;
    constructor(blobService: AzureBlobService);
    generateAudioFromPrompt(prompt: string): Promise<{
        script: string;
        duration: number;
        filename: string;
        blobUrl: string;
    }>;
    private triggerSelfRestart;
}
