import { AzureBlobService } from './azure-blob.service';
export interface GenerateVeoVideoDto {
    prompt: string;
    aspectRatio?: '16:9' | '9:16' | '1:1';
    videoLength?: number;
    fps?: number;
    negativePrompt?: string;
}
export declare class VeoVideoService {
    private readonly azureBlobService;
    private readonly logger;
    private readonly apiKey;
    private readonly projectId;
    private readonly location;
    private readonly model;
    private readonly backendUrl;
    private readonly serviceBusConnection;
    private readonly serviceBusQueue;
    private client;
    private sbClient;
    constructor(azureBlobService: AzureBlobService);
    queueVideoGeneration(userId: string, dto: GenerateVeoVideoDto, options?: {
        useVoice?: boolean;
        useSubtitles?: boolean;
        useMusic?: boolean;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    private callVeoApiWithSdk;
    private callVeoApi;
    private pollForCompletion;
    private extractVideoData;
    generateVideo(dto: GenerateVeoVideoDto): Promise<{
        videoUrl: string;
        filename: string;
    }>;
}
