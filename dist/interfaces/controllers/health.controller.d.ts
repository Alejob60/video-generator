import { ConfigService } from '@nestjs/config';
export declare class HealthController {
    private readonly configService;
    constructor(configService: ConfigService);
    getStatus(): {
        status: string;
        timestamp: string;
        service: string;
        version: string;
    };
    getHealth(): Promise<{
        status: string;
        services: Record<string, string>;
        timestamp: string;
    }>;
}
