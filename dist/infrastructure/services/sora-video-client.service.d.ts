export declare class SoraVideoClientService {
    private readonly logger;
    private readonly endpoint;
    isHealthy(): Promise<boolean>;
    requestVideo(prompt: string, duration: number): Promise<{
        job_id: string;
        generation_id: string;
        video_url: string;
        file_name: string;
        duration: number;
    }>;
}
