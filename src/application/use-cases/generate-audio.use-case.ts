import { Injectable } from '@nestjs/common';
import { AudioGenerator } from '../../domain/services/audio.generator';
import { LLMService } from '../../infrastructure/services/llm.service';
import { AudioResult } from '../../domain/models/audio-result.model';

@Injectable()
export class GenerateAudioUseCase {
  constructor(
    private readonly llmService: LLMService,
    private readonly audioGenerator: AudioGenerator,
  ) {}

  async execute(prompt: string, duration: number = 30): Promise<AudioResult> {
    const script = await this.llmService.generateNarrativeScript(prompt, duration);
    return this.audioGenerator.generateFromText(script.script);
  }
}
