export declare class LLMService {
    private readonly logger;
    private readonly openai;
    constructor();
    generateNarrativeScript(prompt: string, duration: number, intent?: string): Promise<{
        script: string;
    }>;
    improveVideoPrompt(prompt: string): Promise<{
        scene: string;
        characters: string[];
        camera: string;
        lighting: string;
        style: string;
        interactionFocus: string;
    }>;
    improveImagePrompt(prompt: string): Promise<string>;
    generateMusicPrompt(prompt: string): Promise<string>;
    describeAndImproveImage(imagePath: string): Promise<string>;
    classifyImageType(imagePath: string): Promise<string>;
    private runJsonPrompt;
    private runRawPrompt;
}
