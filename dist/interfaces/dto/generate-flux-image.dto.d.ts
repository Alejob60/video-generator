export declare class GenerateFluxImageDto {
    prompt: string;
    plan: 'FREE' | 'CREATOR' | 'PRO';
    size?: '1024x1024' | '1024x768' | '768x1024';
    isJsonPrompt?: boolean;
    negative_prompt?: string;
}
