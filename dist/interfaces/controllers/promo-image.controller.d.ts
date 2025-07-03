import { Request } from 'express';
import { PromoImageService } from '../../infrastructure/services/promo-image.service';
import { GeneratePromoImageDto } from '../dto/generate-promo-image.dto';
export declare class PromoImageController {
    private readonly promoImageService;
    private readonly logger;
    constructor(promoImageService: PromoImageService);
    generateImage(dto: GeneratePromoImageDto, file: Express.Multer.File, req: Request): Promise<{
        success: boolean;
        message: string;
        result: {
            imageUrl: string;
            prompt: string | null;
            imagePath: string | null;
            filename: string;
            plan?: string;
        };
    }>;
}
