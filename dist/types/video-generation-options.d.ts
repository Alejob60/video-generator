export interface VideoGenerationOptions {
    prompt: string;
    script: string;
    image: string | null;
    useVoice: boolean;
    useSubtitles: boolean;
    useMusic: boolean;
    useSora: boolean;
    plan: string;
    n_seconds: number;
    userId?: string;
    timestamp?: number;
}
