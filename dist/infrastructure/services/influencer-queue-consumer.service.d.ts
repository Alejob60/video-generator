import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class InfluencerQueueConsumerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private receiver;
    private sbClient;
    private readonly connectionString;
    private readonly queueName;
    private readonly backendUrl;
    onModuleInit(): Promise<void>;
    private handleMessageWithRetry;
    private handleMessage;
    onModuleDestroy(): Promise<void>;
}
