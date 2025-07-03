export declare class LLMService {
    private readonly logger;
    private readonly openai;
    constructor();
    generateNarrativeScript(prompt: string, duration: number): Promise<string>;
    improveVideoPrompt(prompt: string): Promise<string>;
    improveImagePrompt(prompt: string): Promise<string>;
    generateMusicPrompt(prompt: string): Promise<string>;
    private runPromptImprover;
    describeAndImproveImage(imagePath: string): Promise<string>;
    classifyImageType(imagePath: string): Promise<string>;
}
