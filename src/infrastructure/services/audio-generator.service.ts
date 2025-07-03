import { Injectable, Logger } from '@nestjs/common';
import { AzureTTSService } from './azure-tts.service';
import { LLMService } from './llm.service';
import { AzureBlobService } from './azure-blob.service';
import fetch from 'node-fetch';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class AudioGeneratorService {
  private readonly logger = new Logger(AudioGeneratorService.name);
  private readonly backendUrl = process.env.MAIN_BACKEND_URL!;

  constructor(
    private readonly ttsService: AzureTTSService,
    private readonly llmService: LLMService,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  async generateAudio(
    userId: string,
    prompt: string,
    duration: number,
    plan: string = 'FREE',
    creditsUsed: number = 5,
  ): Promise<{
    script: string;
    audioUrl: string;
    duration: number;
  }> {
    try {
      this.logger.log(`🎬 Generando libreto IA para duración de ${duration}s...`);
      const script = await this.llmService.generateNarrativeScript(prompt, duration);
      this.logger.log(`📝 Libreto generado: ${script}`);

      this.logger.log(`🎙️ Generando audio TTS...`);
      const ttsResult = await this.ttsService.generateAudioFromPrompt(script);
      const audioPath = ttsResult.audioPath;
      const fileName = path.basename(audioPath);
      const blobName = `audio/${fileName}`;

      this.logger.log(`☁️ Subiendo audio a Azure Blob: ${blobName}`);
      await this.azureBlobService.uploadFileToBlob(audioPath, blobName, 'audio/mpeg');

      this.logger.log(`🔐 Generando URL segura (SAS, 24h)...`);
      const audioUrl = await this.azureBlobService.generateSasUrl(blobName, 86400);

      this.logger.log(`📡 Notificando al backend principal...`);
      await fetch(`${this.backendUrl}/audio/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          prompt: script,
          audioUrl,
          duration: ttsResult.duration,
          plan,
          creditsUsed,
          fileName,
          status: 'ready',
          timestamp: Date.now(),
          source: 'audio-generator',
        }),
      });
      this.logger.log(`✅ Notificación enviada al backend principal`);

      // 🧹 Eliminar archivo local
      fs.unlinkSync(audioPath);

      return {
        script,
        audioUrl,
        duration: ttsResult.duration,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`❌ Error generando audio: ${error.message}`, error.stack);
        throw new Error(`Fallo en generación de audio: ${error.message}`);
      } else {
        const stringified = JSON.stringify(error);
        this.logger.error(`❌ Error desconocido: ${stringified}`);
        throw new Error('Fallo en generación de audio: error desconocido');
      }
    }
  }
}
