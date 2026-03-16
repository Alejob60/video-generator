import { Request } from 'express';
import { VeoVideoService } from '../../infrastructure/services/veo-video.service';
import { AzureTTSService } from '../../infrastructure/services/azure-tts.service';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.service';
import { GenerateVideoDto } from '../dto/generate-video.dto';
export declare class VideoController {
    private readonly veoService;
    private readonly ttsService;
    private readonly azureBlobService;
    private readonly logger;
    constructor(veoService: VeoVideoService, ttsService: AzureTTSService, azureBlobService: AzureBlobService);
    checkHealth(): {
        status: string;
        veo: boolean;
        timestamp: Date;
    };
    generateVideo(dto: GenerateVideoDto, req: Request): Promise<{
        success: boolean;
        message: string;
        result: any;
    }>;
}
