import { Request } from 'express';
import { FluxImageService } from '../../infrastructure/services/flux-image.service';
import { GenerateFluxImageDto } from '../dto/generate-flux-image.dto';
export declare class FluxImageController {
    private readonly fluxImageService;
    private readonly logger;
    constructor(fluxImageService: FluxImageService);
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
}
