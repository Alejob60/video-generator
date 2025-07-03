export declare class GeneratedImageEntity {
    id: number;
    userId: string;
    prompt: string;
    textOverlay?: string;
    fileName: string;
    azureUrl: string;
    status: 'READY' | 'EXPIRED' | 'ERROR';
    expiresInHours: number;
    createdAt: Date;
}
