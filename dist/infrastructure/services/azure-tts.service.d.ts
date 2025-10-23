import { AzureBlobService } from './azure-blob.service';
import { LLMService } from './llm.service';
export declare class AzureTTSService {
    private readonly blobService;
    private readonly llmService;
    private readonly logger;
    private readonly apiUrl;
    private readonly apiKey;
    private readonly voice;
    private readonly model;
    constructor(blobService: AzureBlobService, llmService: LLMService);
    generateAudioFromPrompt(prompt: string): Promise<{
        script: string;
        duration: number;
        filename: string;
        blobUrl: string;
    }>;
    private triggerSelfRestart;
}
