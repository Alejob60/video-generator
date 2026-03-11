import { DalleImageService } from '../../infrastructure/services/dalle-image.service';
import { GeneratePromoImageDto } from '../dto/generate-promo-image.dto';
export declare class DalleImageController {
    private readonly dalleService;
    private readonly logger;
    constructor(dalleService: DalleImageService);
    generateImage(dto: GeneratePromoImageDto, userId?: string): Promise<{
        success: boolean;
        message: string;
        result: {
            imageUrl: string;
            prompt: string;
            filename: string;
        };
    }>;
}
