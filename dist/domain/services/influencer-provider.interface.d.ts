import { GenerateInfluencerDto } from '../../interfaces/dto/generate-influencer.dto';
export interface IInfluencerProvider {
    authenticate(): Promise<boolean>;
    generateVideoJob(dto: GenerateInfluencerDto): Promise<{
        jobId: string;
        status: string;
    }>;
}
