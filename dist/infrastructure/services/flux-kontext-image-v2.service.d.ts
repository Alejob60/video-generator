import { AzureBlobService } from './azure-blob.service';
import { GenerateFluxKontextImageDto } from '../../interfaces/dto/generate-flux-kontext-image.dto';
import { LLMService } from './llm.service';
export declare class FluxKontextImageV2Service {
    private readonly azureBlobService;
    private readonly llmService;
    private readonly logger;
    private readonly endpoint;
    private readonly apiVersion;
    private readonly apiKey;
    private readonly backendUrl;
    private readonly openai;
    constructor(azureBlobService: AzureBlobService, llmService: LLMService);
    generateImage(dto: GenerateFluxKontextImageDto): Promise<{
        imageUrl: string;
        filename: string;
        prompt: string;
    }>;
}
