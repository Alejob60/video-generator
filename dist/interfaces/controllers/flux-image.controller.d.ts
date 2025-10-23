import { Request } from 'express';
import { FluxImageService } from '../../infrastructure/services/flux-image.service';
import { PromoImageService } from '../../infrastructure/services/promo-image.service';
import { GeneratePromoImageDto } from '../dto/generate-promo-image.dto';
import { GenerateFluxImageDto } from '../dto/generate-flux-image.dto';
export declare class FluxImageController {
    private readonly fluxImageService;
    private readonly promoImageService;
    private readonly logger;
    constructor(fluxImageService: FluxImageService, promoImageService: PromoImageService);
    generateFluxImage(dto: GenerateFluxImageDto, req: Request): Promise<{
        success: boolean;
        message: string;
        data: {
            imageUrl: string;
            filename: string;
            userId: any;
            prompt: string;
        };
    }>;
    generateDual(dto: GeneratePromoImageDto, req: Request): Promise<{
        promo: string;
        flux: string;
    }>;
}
