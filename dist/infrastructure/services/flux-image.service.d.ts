import { LLMService } from './llm.service';
import { AzureBlobService } from './azure-blob.service';
import { GenerateFluxImageDto } from '../../interfaces/dto/generate-flux-image.dto';
export declare class FluxImageService {
    private readonly llmService;
    private readonly azureBlobService;
    private readonly logger;
    private readonly endpoint;
    private readonly apiVersion;
    private readonly apiKey;
    private readonly backendUrl;
    constructor(llmService: LLMService, azureBlobService: AzureBlobService);
    generateImageAndNotify(userId: string, dto: GenerateFluxImageDto): Promise<{
        imageUrl: string;
        filename: string;
        prompt: string;
    }>;
    generateImage(dto: GenerateFluxImageDto): Promise<{
        imageUrl: string;
        filename: string;
    }>;
}
