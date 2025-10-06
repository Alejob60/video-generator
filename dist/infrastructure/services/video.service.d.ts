import { ServiceBusService } from './service-bus.service';
import { AzureBlobService } from './azure-blob.service';
import { GenerateVideoDto } from '../../interfaces/dto/generate-video.dto';
export declare class VideoService {
    private readonly bus;
    private readonly azureBlobService;
    private readonly logger;
    private readonly soraEndpoint;
    private readonly apiKey;
    private readonly soraApiVersion;
    private readonly ttsUrl;
    private readonly ttsVoice;
    constructor(bus: ServiceBusService, azureBlobService: AzureBlobService);
    private buildPath;
    generateFullVideo(dto: GenerateVideoDto): Promise<{
        jobId: string;
        timestamp: number;
    }>;
    processGeneratedAssets(jobId: string, timestamp: number, metadata: any): Promise<{
        success: boolean;
        message: string;
        data: {
            prompt: string;
            timestamp: number;
            video_url: string;
            audio_url: string | null;
            subtitles_url: string | null;
        };
    }>;
    private waitForUrlAvailable;
    private downloadFile;
    private downloadTTS;
    private generateSubtitles;
    getVideoJobStatus(jobId: string): Promise<{
        status: string;
        generationId?: string;
    }>;
}
