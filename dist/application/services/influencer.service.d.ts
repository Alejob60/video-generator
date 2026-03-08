import { ServiceBusService } from '../../infrastructure/services/service-bus.service';
import { MockInfluencerService } from '../../infrastructure/services/mock-influencer.service';
import { GenerateInfluencerDto } from '../../interfaces/dto/generate-influencer.dto';
export interface QueueInfluencerMessage {
    jobId: string;
    userId: string;
    imageUrl: string;
    script: string;
    voiceId: string;
    plan: 'free' | 'pro';
    timestamp: number;
}
export declare class InfluencerService {
    private readonly mockInfluencerService;
    private readonly bus;
    private readonly logger;
    constructor(mockInfluencerService: MockInfluencerService, bus: ServiceBusService);
    initiateInfluencerGeneration(userId: string, dto: GenerateInfluencerDto): Promise<{
        jobId: string;
        message: string;
    }>;
}
