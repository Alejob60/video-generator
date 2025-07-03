import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { VideoService } from '../services/video.service';
export declare class VideoQueueConsumerService implements OnModuleInit, OnModuleDestroy {
    private readonly videoService;
    private readonly logger;
    private receiver;
    private sbClient;
    private readonly connectionString;
    private readonly queueName;
    constructor(videoService: VideoService);
    onModuleInit(): Promise<void>;
    private handleMessageWithRetry;
    private handleMessage;
    onModuleDestroy(): Promise<void>;
}
