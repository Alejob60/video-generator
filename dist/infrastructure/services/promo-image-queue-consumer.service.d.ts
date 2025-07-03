import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PromoImageService } from '../services/promo-image.service';
export declare class PromoImageQueueConsumerService implements OnModuleInit, OnModuleDestroy {
    private readonly promoImageService;
    private readonly logger;
    private receiver;
    private sbClient;
    private readonly connectionString;
    private readonly queueName;
    private readonly backendUrl;
    constructor(promoImageService: PromoImageService);
    onModuleInit(): Promise<void>;
    private handleMessageWithRetry;
    private handleMessage;
    onModuleDestroy(): Promise<void>;
}
