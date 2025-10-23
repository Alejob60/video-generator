import { ConfigService } from '@nestjs/config';
export declare class HealthController {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    getStatus(): {
        status: string;
        timestamp: string;
        service: string;
        version: string;
    };
    getHealth(check?: string): Promise<{
        status: string;
        services: Record<string, string>;
        timestamp: string;
    } | {
        status: string;
        timestamp: string;
        service: string;
        version: string;
        note: string;
    }>;
    private performFullHealthCheck;
}
