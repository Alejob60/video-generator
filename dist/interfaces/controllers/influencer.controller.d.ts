import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { InfluencerService } from '../../application/services/influencer.service';
import { GenerateInfluencerDto } from '../dto/generate-influencer.dto';
export declare class InfluencerController {
    private readonly influencerService;
    private readonly logger;
    constructor(influencerService: InfluencerService);
    generateInfluencerVideo(dto: GenerateInfluencerDto, req: Request): Promise<{
        success: boolean;
        message: string;
        statusCode: HttpStatus;
        result: {
            jobId: string;
            userId: any;
            timestamp: number;
        };
    }>;
}
