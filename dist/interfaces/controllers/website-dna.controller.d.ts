import { Request } from 'express';
import { WebsiteDnaService } from '../../infrastructure/services/website-dna.service';
import { ExtractWebsiteDnaDto } from '../dto/extract-website-dna.dto';
export declare class WebsiteDnaController {
    private readonly websiteDnaService;
    private readonly logger;
    constructor(websiteDnaService: WebsiteDnaService);
    extractWebsiteDna(dto: ExtractWebsiteDnaDto, req: Request): Promise<{
        success: boolean;
        message: string;
        requestId: number;
        result: any;
    }>;
}
