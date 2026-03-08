import { Request } from 'express';
import { FluxKontextImageService } from '../../infrastructure/services/flux-kontext-image.service';
import { GenerateFluxKontextImageDto } from '../dto/generate-flux-kontext-image.dto';
export declare class FluxKontextImageController {
    private readonly fluxKontextImageService;
    private readonly logger;
    constructor(fluxKontextImageService: FluxKontextImageService);
    generateFluxKontextImage(dto: GenerateFluxKontextImageDto, referenceImage: Express.Multer.File, req: Request): Promise<{
        success: boolean;
        message: string;
        data: {
            imageUrl: any;
            filename: any;
            userId: any;
            prompt: any;
        };
    }>;
}
