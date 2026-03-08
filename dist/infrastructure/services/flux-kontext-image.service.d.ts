import { AzureBlobService } from './azure-blob.service';
import { GenerateFluxKontextImageDto } from '../../interfaces/dto/generate-flux-kontext-image.dto';
import { LLMService } from './llm.service';
export declare class FluxKontextImageService {
    private readonly azureBlobService;
    private readonly llmService;
    private readonly logger;
    private readonly generationsEndpoint;
    private readonly apiKey;
    private readonly editsEndpointBase;
    private readonly apiVersion;
    private readonly backendUrl;
    constructor(azureBlobService: AzureBlobService, llmService: LLMService);
    generateImageAndNotify(userId: string, dto: GenerateFluxKontextImageDto, referenceImagePath?: string): Promise<{
        imageUrl: string;
        filename: string;
        prompt: string;
    }>;
    generateImage(dto: GenerateFluxKontextImageDto, referenceImagePath?: string): Promise<{
        imageUrl: string;
        filename: string;
    }>;
}
