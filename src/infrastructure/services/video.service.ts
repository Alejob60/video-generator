import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { ServiceBusService } from './service-bus.service';
import { AzureBlobService } from './azure-blob.service';
import { GenerateVideoDto } from '../../interfaces/dto/generate-video.dto';

// Aseguramos que el directorio public exista
const publicDir = path.resolve(__dirname, '../../../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  private readonly soraEndpoint = process.env.AZURE_SORA_URL!;
  private readonly apiKey = process.env.AZURE_SORA_API_KEY!;
  private readonly soraApiVersion = process.env.AZURE_SORA_API_VERSION || '2025-02-15-preview';
  private readonly ttsUrl = process.env.AZURE_TTS_ENDPOINT || 'https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com';
  private readonly ttsKey = process.env.AZURE_TTS_KEY || process.env.AZURE_OPENAI_KEY;
  private readonly ttsVoice = process.env.AZURE_TTS_VOICE || 'nova';

  constructor(
    private readonly bus: ServiceBusService,
    private readonly azureBlobService: AzureBlobService,
  ) {
    // Creamos los directorios necesarios
    const dirs = ['videos', 'audio', 'subtitles'];
    dirs.forEach(dir => {
      const dirPath = path.join(publicDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  private buildPath(type: 'video' | 'audio' | 'subtitles', timestamp: number): string {
    const base = path.resolve(__dirname, '../../../public');
    return {
      video: `${base}/videos/sora_video_${timestamp}.mp4`,
      audio: `${base}/audio/audio_${timestamp}.mp3`,
      subtitles: `${base}/subtitles/${timestamp}.srt`,
    }[type];
  }

  async generateFullVideo(dto: GenerateVideoDto): Promise<{ jobId: string; timestamp: number }> {
    try {
      this.logger.log(`🎬 Iniciando generación de video con prompt JSON directo...`);

      const soraPayload = {
        prompt: dto.prompt, // JSON directo del frontend
        duration: dto.n_seconds ?? 10,
        realism: "photorealistic",
        physics: "natural",
        lighting: "ambient realistic",
      };

      const { data } = await axios.post(
        `${this.soraEndpoint}/video/generations/jobs?api-version=${this.soraApiVersion}`,
        {
          prompt: JSON.stringify(dto.prompt),
          n_variants: 1,
          n_seconds: dto.n_seconds || 5,
          height: 1080,
          width: 1080,
          model: 'soramodel',
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      const jobId = data.id;
      this.logger.log(`📨 Job enviado a Sora con ID: ${jobId}`);

      // Enviamos mensaje a la cola con todos los campos requeridos
      await this.bus.sendVideoJobMessage(jobId, Date.now(), {
        script: JSON.stringify(dto.prompt),
        prompt: JSON.stringify(dto.prompt),
        n_seconds: dto.n_seconds || 5,
        narration: dto.useVoice || false,
        subtitles: dto.useSubtitles || false,
      });

      return { jobId, timestamp: Date.now() };
    } catch (error) {
      this.logger.error(`❌ Error al generar video`, error);
      throw error;
    }
  }

  async processGeneratedAssets(jobId: string, timestamp: number, metadata: any): Promise<{
    success: boolean;
    message: string;
    data: {
      prompt: string;
      timestamp: number;
      video_url: string;
      audio_url: string | null;
      subtitles_url: string | null;
    };
  }> {
    const statusUrl = `${this.soraEndpoint}/openai/v1/video/generations/jobs/${jobId}?api-version=preview`;
    let status = '';
    let generationId = '';
    let attempts = 0;

    while (status !== 'succeeded' && status !== 'failed' && attempts < 30) {
      try {
        const response = await axios.get(statusUrl, {
          headers: { 'api-key': this.apiKey },
        });

        status = response.data.status;
        generationId = response.data.generations?.[0]?.id || '';
        this.logger.log(`🔁 Estado del job ${jobId}: ${status}`);
      } catch (err) {
        this.logger.warn(`⚠️ Error al consultar estado (intento ${attempts + 1}): ${safeErrorMessage(err)}`);
      }

      if (status !== 'succeeded') {
        await new Promise(res => setTimeout(res, 5000));
        attempts++;
      }
    }

    if (!generationId) {
      throw new Error('⛔ Generación fallida o incompleta en Sora.');
    }

    const videoUrl = `${this.soraEndpoint}/openai/v1/video/generations/${generationId}/content/video?api-version=preview`;
    await this.waitForUrlAvailable(videoUrl);

    const videoPath = this.buildPath('video', timestamp);
    const audioPath = this.buildPath('audio', timestamp);
    const subtitlePath = this.buildPath('subtitles', timestamp);

    await this.downloadFile(videoUrl, videoPath);

    let audio_blob_url: string | null = null;
    let subtitles_blob_url: string | null = null;

    if (metadata.narration === true) {
      this.logger.log('🎙️ Generando narración...');
      await this.downloadTTS(metadata.script, audioPath);
      audio_blob_url = await this.azureBlobService.uploadFile(audioPath, 'audio');
    }

    if (metadata.subtitles === true) {
      this.logger.log('📝 Generando subtítulos...');
      this.generateSubtitles(metadata.script, subtitlePath);
      subtitles_blob_url = await this.azureBlobService.uploadFile(subtitlePath, 'subtitles');
    }

    const video_blob_url = await this.azureBlobService.uploadFile(videoPath, 'video');
    this.logger.log(`📤 Video subido: ${video_blob_url}`);

    return {
      success: true,
      message: '🎬 Medios generados exitosamente',
      data: {
        prompt: metadata.script,
        timestamp,
        video_url: video_blob_url,
        audio_url: audio_blob_url,
        subtitles_url: subtitles_blob_url,
      },
    };
  }

  private async waitForUrlAvailable(url: string, maxAttempts = 30, delayMs = 5000): Promise<void> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await axios.head(url, {
          headers: { 'api-key': this.apiKey },
          validateStatus: status => status < 500,
        });

        if (response.status === 200) {
          this.logger.log(`🎯 URL disponible: ${url}`);
          return;
        }

        this.logger.log(`🕐 Reintentando acceso (${attempts + 1})...`);
      } catch (err) {
        this.logger.warn(`🔁 Error al verificar URL (${attempts + 1}): ${safeErrorMessage(err)}`);
      }

      await new Promise(resolve => setTimeout(resolve, delayMs));
      attempts++;
    }

    throw new Error(`⛔ No se pudo acceder al recurso tras ${maxAttempts} intentos: ${url}`);
  }

  private async downloadFile(url: string, targetPath: string): Promise<void> {
    const response = await axios.get(url, {
      headers: { 'api-key': this.apiKey },
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(targetPath);
    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  private async downloadTTS(text: string, targetPath: string): Promise<void> {
    try {
      const response = await axios.post(
        `${this.ttsUrl}/openai/deployments/gpt-4o-mini-tts/audio/speech?api-version=2025-03-01-preview`,
        {
          model: 'gpt-4o-mini-tts',
          input: text,
          voice: this.ttsVoice,
        },
        {
          headers: {
            'api-key': this.ttsKey,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
        },
      );

      const writer = fs.createWriteStream(targetPath);
      return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`❌ Error al generar audio TTS: ${safeErrorMessage(error)}`);
      throw error;
    }
  }

  private generateSubtitles(script: string, subtitlePath: string): void {
    const lines = script.split('.').map(s => s.trim()).filter(Boolean);
    const srt = lines.map((line, i) => {
      const start = `00:00:${String(i * 2).padStart(2, '0')},000`;
      const end = `00:00:${String(i * 2 + 1).padStart(2, '0')},800`;
      return `${i + 1}\n${start} --> ${end}\n${line}\n`;
    }).join('\n');

    fs.writeFileSync(subtitlePath, srt);
  }

  async getVideoJobStatus(jobId: string): Promise<{ status: string; generationId?: string }> {
    const statusUrl = `${this.soraEndpoint}/openai/v1/video/generations/jobs/${jobId}?api-version=preview`;
    const { data } = await axios.get(statusUrl, {
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    return {
      status: data.status,
      generationId: data.generations?.[0]?.id,
    };
  }
}

// Función auxiliar para manejo seguro de errores
function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}