import { AzureTTSService } from './azure-tts.service';
import { LLMService } from './llm.service';
import { AzureBlobService } from './azure-blob.service';
export declare class AudioGeneratorService {
    private readonly ttsService;
    private readonly llmService;
    private readonly azureBlobService;
    private readonly logger;
    private readonly backendUrl;
    constructor(ttsService: AzureTTSService, llmService: LLMService, azureBlobService: AzureBlobService);
    generateAudio(userId: string, prompt: string, duration: number, plan?: string, creditsUsed?: number): Promise<{
        script: string;
        audioUrl: string;
        duration: number;
    }>;
}
