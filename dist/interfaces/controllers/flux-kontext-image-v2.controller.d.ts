import { Request } from 'express';
import { FluxKontextImageV2Service } from '../../infrastructure/services/flux-kontext-image-v2.service';
import { GenerateFluxKontextImageDto } from '../dto/generate-flux-kontext-image.dto';
export declare class FluxKontextImageV2Controller {
    private readonly fluxKontextImageV2Service;
    private readonly logger;
    constructor(fluxKontextImageV2Service: FluxKontextImageV2Service);
    generateFluxKontextImage(dto: GenerateFluxKontextImageDto, req: Request): Promise<{
        success: boolean;
        message: string;
        result: any;
    }>;
}
