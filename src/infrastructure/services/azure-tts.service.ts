// src/infrastructure/services/azure-tts.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getAudioDurationInSeconds } from 'get-audio-duration';
import { LLMService } from './llm.service';

@Injectable()
export class AzureTTSService {
  private readonly logger = new Logger(AzureTTSService.name);

  private readonly apiUrl =
    'https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4o-mini-tts/audio/speech?api-version=2025-03-01-preview';

  private readonly apiKey: string = process.env.AZURE_TTS_KEY!;
  private readonly voice: string = process.env.AZURE_TTS_VOICE || 'nova';
  private readonly model: string = 'gpt-4o-mini-tts';

  constructor(private readonly llmService: LLMService) {const duration = 30; // duración por defecto si no se especifica
}

 async generateAudioFromPrompt(prompt: string): Promise<{
    script: string;
    audioPath: string;
    fileName: string;
    duration: number;
  }> {
    this.logger.log(`🧠 Generando libreto desde prompt: "${prompt}"`);

    const duration = 30; // o puedes recibirlo como parámetro si prefieres
    const script = await this.llmService.generateNarrativeScript(prompt, duration);

    const audioBuffer = await this.synthesizeAudio(script);

    const filename = `audio-${uuidv4()}.mp3`;
    const audioPath = path.join(__dirname, '../../../public/audio', filename);

    fs.writeFileSync(audioPath, audioBuffer);
    this.logger.log(`✅ Audio guardado localmente en: ${audioPath}`);

    const finalDuration = await getAudioDurationInSeconds(audioPath);

    return {
      script,
      audioPath,
      fileName: filename,
      duration: finalDuration,
    };
  }


  private async synthesizeAudio(text: string): Promise<Buffer> {
    try {
      this.logger.log(`🎤 Generando audio con voz: ${this.voice}`);

      const payload = {
        model: this.model,
        input: text,
        voice: this.voice,
      };

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      };

      const response = await axios.post(this.apiUrl, payload, {
        headers,
        responseType: 'arraybuffer',
      });

      return response.data;
    } catch (error: any) {
      this.logger.error(`❌ Error generando audio: ${error?.response?.status} - ${error?.response?.data}`);
      throw new Error('Error al generar audio');
    }
  }
}
