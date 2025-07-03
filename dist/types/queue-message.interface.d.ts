export interface QueueVideoMessage {
    jobId: string;
    audioId: number;
    script: string;
    prompt?: string;
    n_seconds?: number;
    narration?: boolean;
    subtitles?: boolean;
}
