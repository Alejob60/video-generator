import { OnModuleInit } from '@nestjs/common';
import { VeoVideoService } from './veo-video.service';
import { AzureBlobService } from './azure-blob.service';
import { AzureTTSService } from './azure-tts.service';
export declare class VeoVideoQueueConsumerService implements OnModuleInit {
    private readonly veoVideoService;
    private readonly azureBlobService;
    private readonly ttsService;
    private readonly logger;
    private sbClient;
    private readonly serviceBusQueue;
    private readonly backendUrl;
    constructor(veoVideoService: VeoVideoService, azureBlobService: AzureBlobService, ttsService: AzureTTSService);
    onModuleInit(): Promise<void>;
    private startProcessingMessages;
    private processMessage;
}
