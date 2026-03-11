import { FluxKontextImageService } from '../../infrastructure/services/flux-kontext-image.service';
import { GenerateFluxImageDto } from '../dto/generate-flux-image.dto';
import { LLMService } from '../../infrastructure/services/llm.service';
export declare class FluxKontextImageController {
    private readonly fluxKontextService;
    private readonly llmService;
    private readonly logger;
    constructor(fluxKontextService: FluxKontextImageService, llmService: LLMService);
    generateFromText(dto: GenerateFluxImageDto & {
        enhancePrompt?: boolean;
    }, userId?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            imageUrl: string;
            prompt: string;
            filename: string;
            enhancedPromptUsed: boolean;
        };
    }>;
    generateWithReferenceImage(body: {
        prompt: string;
        plan: string;
        enhancePrompt?: boolean;
    }, referenceImage: Express.Multer.File, userId?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            imageUrl: string;
            prompt: string;
            filename: string;
            referenceImageName: string;
            enhancedPromptUsed: boolean;
        };
    }>;
}
