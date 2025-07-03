import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class ServiceBusService implements OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private readonly sbClient;
    private readonly senders;
    constructor(configService: ConfigService);
    sendVideoJobMessage(jobId: string, timestamp: number, metadata: Record<string, any>): Promise<void>;
    sendImageJobMessage(userId: string, prompt: string): Promise<void>;
    private handleError;
    onModuleDestroy(): Promise<void>;
}
