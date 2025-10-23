import { AzureBlobService } from './azure-blob.service';
import { GenerateFluxImageDto } from '../../interfaces/dto/generate-flux-image.dto';
import { LLMService } from './llm.service';
import { GeneratePromoImageDto } from '../../interfaces/dto/generate-promo-image.dto';
export declare class FluxImageService {
    private readonly azureBlobService;
    private readonly llmService;
    private readonly logger;
    private readonly endpoint;
    private readonly apiVersion;
    private readonly apiKey;
    private readonly backendUrl;
    constructor(azureBlobService: AzureBlobService, llmService: LLMService);
    generateFromPromoDto(dto: GeneratePromoImageDto): Promise<string>;
    generateImageAndNotify(userId: string, dto: GenerateFluxImageDto): Promise<{
        imageUrl: string;
        filename: string;
        prompt: string;
    }>;
    generateImage(dto: GenerateFluxImageDto): Promise<{
        imageUrl: string;
        filename: string;
    }>;
    private convertJsonToNaturalLanguage;
}
