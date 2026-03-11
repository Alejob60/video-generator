import { AzureBlobService } from './azure-blob.service';
import { LLMService } from './llm.service';
import { GenerateFluxImageDto } from '../../interfaces/dto/generate-flux-image.dto';
export declare class FluxKontextImageService {
    private readonly azureBlobService;
    private readonly llmService;
    private readonly logger;
    private readonly baseURL;
    private readonly deployment;
    private readonly apiVersion;
    private readonly apiKey;
    private readonly backendUrl;
    constructor(azureBlobService: AzureBlobService, llmService: LLMService);
    generateImageAndNotify(userId: string, dto: GenerateFluxImageDto, referenceImagePath?: string): Promise<{
        imageUrl: string;
        filename: string;
        prompt: string;
    }>;
    private generateWithDalleFallback;
    generateImage(dto: GenerateFluxImageDto, referenceImagePath?: string): Promise<{
        imageUrl: string;
        filename: string;
    }>;
}
