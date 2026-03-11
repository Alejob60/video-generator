import { AzureBlobService } from '../../infrastructure/services/azure-blob.service';
export declare class UploadController {
    private readonly azureBlobService;
    private readonly logger;
    constructor(azureBlobService: AzureBlobService);
    uploadFile(file: Express.Multer.File): Promise<{
        success: boolean;
        imageUrl: string;
        filename: string;
    }>;
}
