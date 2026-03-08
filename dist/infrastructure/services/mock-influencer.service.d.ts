import { IInfluencerProvider } from '../../domain/services/influencer-provider.interface';
import { GenerateInfluencerDto } from '../../interfaces/dto/generate-influencer.dto';
export declare class MockInfluencerService implements IInfluencerProvider {
    private readonly logger;
    authenticate(): Promise<boolean>;
    generateVideoJob(dto: GenerateInfluencerDto): Promise<{
        jobId: string;
        status: string;
    }>;
}
