import { SoraService } from '../../infrastructure/services/sora.service';
import { GenerateVideoDto } from '../dto/generate-video.dto';
export declare class SoraController {
    private readonly soraService;
    constructor(soraService: SoraService);
    generate(dto: GenerateVideoDto): Promise<{
        success: boolean;
        message: string;
        jobId: string;
        blobUrl: string;
    }>;
}
