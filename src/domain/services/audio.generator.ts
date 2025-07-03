import { AudioResult } from '../models/audio-result.model';

export abstract class AudioGenerator {
  abstract generateFromText(prompt: string): Promise<AudioResult>;
}
