import { LLMService } from './llm.service';
export declare class AzureTTSService {
    private readonly llmService;
    private readonly logger;
    private readonly apiUrl;
    private readonly apiKey;
    private readonly voice;
    private readonly model;
    constructor(llmService: LLMService);
    generateAudioFromPrompt(prompt: string): Promise<{
        script: string;
        audioPath: string;
        fileName: string;
        duration: number;
    }>;
    private synthesizeAudio;
}
