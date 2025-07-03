import { Request } from 'express';
import { AzureTTSService } from '../../infrastructure/services/azure-tts.service';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.service';
import { LLMService } from '../../infrastructure/services/llm.service';
import { GenerateAudioDto } from '../dto/generate-audio.dto';
export declare class AudioController {
    private readonly ttsService;
    private readonly llmService;
    private readonly azureBlobService;
    private readonly logger;
    constructor(ttsService: AzureTTSService, llmService: LLMService, azureBlobService: AzureBlobService);
    generateAudio(dto: GenerateAudioDto, req: Request): Promise<{
        success: boolean;
        result: {
            script: string;
            audioUrl: string;
            duration: number;
        };
    }>;
}
