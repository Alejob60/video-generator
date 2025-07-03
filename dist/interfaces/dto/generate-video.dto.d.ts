export declare class GenerateVideoDto {
    prompt: string;
    useVoice: boolean;
    useSubtitles: boolean;
    useMusic: boolean;
    useSora: boolean;
    plan: 'free' | 'creator' | 'pro';
    duration?: number;
}
