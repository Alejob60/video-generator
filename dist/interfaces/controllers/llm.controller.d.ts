import { Request } from 'express';
import { LLMService } from '../../infrastructure/services/llm.service';
interface GeneratePromptDto {
    prompt: string;
    duration?: number;
    useJson?: boolean;
}
export declare class LLMController {
    private readonly llmService;
    private readonly logger;
    constructor(llmService: LLMService);
    generatePromptJson(dto: GeneratePromptDto, req: Request): Promise<{
        success: boolean;
        message: string;
        result: {
            promptJson: string;
        };
    } | {
        success: boolean;
        message: string;
        result?: undefined;
    }>;
}
export {};
