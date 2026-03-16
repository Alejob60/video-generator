import { VeoVideoService } from '../../infrastructure/services/veo-video.service';
export interface GenerateVeoVideoDto {
    prompt: string;
    aspectRatio?: '16:9' | '9:16' | '1:1';
    videoLength?: number;
    fps?: number;
    negativePrompt?: string;
}
export declare class VeoVideoController {
    private readonly veoVideoService;
    private readonly logger;
    constructor(veoVideoService: VeoVideoService);
    generateVideo(dto: GenerateVeoVideoDto, userId?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            videoUrl: any;
            prompt: any;
            filename: any;
        };
    }>;
}
