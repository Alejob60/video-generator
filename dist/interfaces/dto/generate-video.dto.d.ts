export declare class GenerateVideoDto {
    prompt: Record<string, any> | string;
    useVoice: boolean;
    useSubtitles: boolean;
    useMusic: boolean;
    useSora: boolean;
    plan: 'free' | 'creator' | 'pro';
    n_seconds?: number;
}
