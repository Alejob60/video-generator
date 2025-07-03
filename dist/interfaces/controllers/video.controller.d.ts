import { Request } from 'express';
import { LLMService } from '../../infrastructure/services/llm.service';
import { SoraVideoClientService } from '../../infrastructure/services/sora-video-client.service';
import { AzureTTSService } from '../../infrastructure/services/azure-tts.service';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.service';
import { GenerateVideoDto } from '../dto/generate-video.dto';
export declare class VideoController {
    private readonly llmService;
    private readonly soraClient;
    private readonly ttsService;
    private readonly azureBlobService;
    private readonly logger;
    constructor(llmService: LLMService, soraClient: SoraVideoClientService, ttsService: AzureTTSService, azureBlobService: AzureBlobService);
    generateVideo(dto: GenerateVideoDto, req: Request): Promise<{
        success: boolean;
        message: string;
        result: any;
    }>;
}
