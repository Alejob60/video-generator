import { Request } from 'express';
import { AzureTTSService } from '../../infrastructure/services/azure-tts.service';
import { GenerateAudioDto } from '../dto/generate-audio.dto';
export declare class AudioController {
    private readonly ttsService;
    private readonly logger;
    constructor(ttsService: AzureTTSService);
    generateAudio(dto: GenerateAudioDto, req: Request): Promise<{
        success: boolean;
        message: string;
        result: {
            generationId: string;
            userId: any;
            timestamp: number;
            script: string;
            duration: number;
            filename: string;
            blobUrl: string;
        };
    }>;
}
