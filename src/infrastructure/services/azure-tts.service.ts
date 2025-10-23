import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { getAudioDurationInSeconds } from 'get-audio-duration';
import { AzureBlobService } from './azure-blob.service';
import { LLMService } from './llm.service';

@Injectable()
export class AzureTTSService {
  private readonly logger = new Logger(AzureTTSService.name);
  private readonly apiUrl = `${process.env.AZURE_TTS_ENDPOINT}/openai/deployments/${process.env.AZURE_TTS_DEPLOYMENT}/audio/speech?api-version=${process.env.AZURE_TTS_API_VERSION}`;
  private readonly apiKey = process.env.AZURE_TTS_KEY!;
  private readonly voice = process.env.AZURE_TTS_VOICE || 'nova';
  private readonly model = 'gpt-4o-mini-tts';

  constructor(
    private readonly blobService: AzureBlobService,
    private readonly llmService: LLMService
  ) {}

  async generateAudioFromPrompt(prompt: string): Promise<{
    script: string;
    duration: number;
    filename: string;
    blobUrl: string;
  }> {
    // Generar un script narrativo mejorado antes de enviar a TTS
    let improvedScript = prompt;
    
    try {
      this.logger.log(`📝 Mejorando script para narración promocional...`);
      const narrativeResult = await this.llmService.generateNarrativeScript(
        prompt, 
        30, // Duración por defecto
        'promotional' // Tipo de narración
      );
      improvedScript = narrativeResult.script;
      this.logger.log(`✅ Script mejorado: ${improvedScript}`);
    } catch (error) {
      this.logger.warn(`⚠️ Error mejorando script, usando prompt original: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      // Si falla la mejora, continuar con el prompt original
    }

    const filename = `audio-${uuidv4()}.mp3`;
    const localDir = path.join(__dirname, '../../../public/audio');
    const localPath = path.join(localDir, filename);

    try {
      if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });

      this.logger.log(`📡 Enviando texto a Azure TTS...`);

      const payload = {
        model: this.model,
        input: improvedScript, // Usar el script mejorado
        voice: this.voice,
      };

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        responseType: 'arraybuffer',
      });

      if (!response.data || response.data.length < 1000) {
        this.logger.error(`❌ Respuesta inválida de Azure TTS`);
        throw new Error('No se recibió contenido de audio válido');
      }

      fs.writeFileSync(localPath, response.data);
      const duration = await getAudioDurationInSeconds(localPath);

      this.logger.log(`☁️ Subiendo a Azure Blob Storage...`);
      await this.blobService.uploadFileToBlob(localPath, `audio/${filename}`, 'audio/mpeg');
      const blobUrl = await this.blobService.generateSasUrl(`audio/${filename}`, 86400); // 24h

      fs.unlinkSync(localPath);

      this.logger.log(`✅ Audio generado y subido correctamente`);
      return {
        script: improvedScript, // Devolver el script usado
        duration,
        filename,
        blobUrl,
      };
    } catch (error: any) {
      this.logger.error(`❌ Error al generar audio con Azure TTS`);
      this.logger.error(error?.message || 'Error desconocido');
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);

      if (
        error.code === 'ECONNREFUSED' ||
        error.message?.includes('Resource not found') ||
        error.message?.includes('ENOTFOUND')
      ) {
        this.logger.warn('⚠️ Reinicio simulado por error crítico...');
        this.triggerSelfRestart();
      }

      throw new Error('Error generando audio, pero el sistema sigue funcionando');
    }
  }

  private triggerSelfRestart() {
    const isAzure = process.env.WEBSITE_INSTANCE_ID;
    if (isAzure) {
      this.logger.warn('🔄 Reinicio simulado en Azure: finalizando proceso actual...');
      setTimeout(() => process.exit(1), 3000);
    } else {
      this.logger.warn('🔁 Reinicio local omitido (no es entorno Azure)');
    }
  }
}