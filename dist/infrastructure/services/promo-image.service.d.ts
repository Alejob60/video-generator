import { LLMService } from './llm.service';
import { AzureBlobService } from './azure-blob.service';
export declare class PromoImageService {
    private readonly llmService;
    private readonly azureBlobService;
    private readonly logger;
    private readonly endpoint;
    private readonly deployment;
    private readonly apiVersion;
    private readonly backendUrl;
    private readonly apiKey;
    private readonly openai;
    constructor(llmService: LLMService, azureBlobService: AzureBlobService);
    generateAndNotify(userId: string, input: {
        prompt?: string;
        imagePath?: string;
        textOverlay?: string;
    }): Promise<{
        imageUrl: string;
        prompt: string | null;
        imagePath: string | null;
        filename: string;
        plan?: string;
    }>;
    generateImageWithText({ prompt, }: {
        prompt?: string;
    }): Promise<{
        azureUrl: string;
        localFilename: string;
    }>;
    private generateImageFromPrompt;
}
