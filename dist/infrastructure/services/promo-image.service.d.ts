import { AzureBlobService } from './azure-blob.service';
import { FluxImageService } from './flux-image.service';
export declare class PromoImageService {
    private readonly azureBlobService;
    private readonly fluxImageService;
    private readonly logger;
    private readonly endpoint;
    private readonly deployment;
    private readonly apiVersion;
    private readonly backendUrl;
    private readonly apiKey;
    private readonly openai;
    constructor(azureBlobService: AzureBlobService, fluxImageService: FluxImageService);
    generateAndNotify(userId: string, input: {
        prompt?: string;
        imagePath?: string;
        textOverlay?: string;
        useFlux?: boolean;
        isJsonPrompt?: boolean;
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
