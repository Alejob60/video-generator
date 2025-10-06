import { Request } from 'express';
import { SoraVideoClientService } from '../../infrastructure/services/sora-video-client.service';
import { AzureTTSService } from '../../infrastructure/services/azure-tts.service';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.service';
import { GenerateVideoDto } from '../dto/generate-video.dto';
export declare class VideoController {
    private readonly soraClient;
    private readonly ttsService;
    private readonly azureBlobService;
    private readonly logger;
    constructor(soraClient: SoraVideoClientService, ttsService: AzureTTSService, azureBlobService: AzureBlobService);
    checkHealth(): {
        status: string;
        sora: Promise<boolean>;
        timestamp: Date;
    };
    generateVideo(dto: GenerateVideoDto, req: Request): Promise<{
        success: boolean;
        message: string;
        result: any;
    }>;
}
