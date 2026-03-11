import { AzureBlobService } from './azure-blob.service';
import { LLMService } from './llm.service';
import { GenerateFluxImageDto } from '../../interfaces/dto/generate-flux-image.dto';
export declare class Flux2ProService {
    private readonly azureBlobService;
    private readonly llmService;
    private readonly logger;
    private readonly endpoint;
    private readonly deployment;
    private readonly apiVersion;
    private readonly apiKey;
    private readonly backendUrl;
    constructor(azureBlobService: AzureBlobService, llmService: LLMService);
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
