import { ConfigService } from '@nestjs/config';
import { AzureBlobService } from './azure-blob.service';
export declare class DalleImageService {
    private readonly configService;
    private readonly azureBlobService;
    private readonly logger;
    constructor(configService: ConfigService, azureBlobService: AzureBlobService);
    generateImage(prompt: string, plan: string): Promise<{
        imageUrl: string;
        filename: string;
    }>;
}
