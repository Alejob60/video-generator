import { AudioGenerator } from '../../domain/services/audio.generator';
import { LLMService } from '../../infrastructure/services/llm.service';
import { AudioResult } from '../../domain/models/audio-result.model';
export declare class GenerateAudioUseCase {
    private readonly llmService;
    private readonly audioGenerator;
    constructor(llmService: LLMService, audioGenerator: AudioGenerator);
    execute(prompt: string, duration?: number): Promise<AudioResult>;
}
