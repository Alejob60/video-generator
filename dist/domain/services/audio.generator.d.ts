import { AudioResult } from '../models/audio-result.model';
export declare abstract class AudioGenerator {
    abstract generateFromText(prompt: string): Promise<AudioResult>;
}
