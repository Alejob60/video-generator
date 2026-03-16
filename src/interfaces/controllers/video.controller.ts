import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  Req,
  Get,
} from '@nestjs/common';
import { Request } from 'express';
import { VeoVideoService } from '../../infrastructure/services/veo-video.service';
import { AzureTTSService } from '../../infrastructure/services/azure-tts.service';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.service';
import { GenerateVideoDto } from '../dto/generate-video.dto';

@Controller('videos')
export class VideoController {
  private readonly logger = new Logger(VideoController.name);

  constructor(
    private readonly veoService: VeoVideoService,
    private readonly ttsService: AzureTTSService,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  @Get('health')
  checkHealth() {
    return {
      status: 'ok',
      veo: true, // VEO3 is available through Google Vertex AI
      timestamp: new Date(),
    };
  }

  @Post('generate')
  async generateVideo(@Body() dto: GenerateVideoDto, @Req() req: Request) {
    const userId = (req as any)?.user?.id || 'admin';
    const result: any = {
      userId,
      timestamp: Date.now(),
      videoUrl: '',
    };

    // 🧪 Validaciones
    if (!dto.prompt) {
      this.logger.warn(`[${userId}] ❌ Prompt inválido: "${dto.prompt}"`);
      throw new HttpException('El prompt es requerido.', HttpStatus.BAD_REQUEST);
    }

    const duration = dto.n_seconds || 10;
    const plan = typeof dto.plan === 'string' && ['free', 'creator', 'pro'].includes(dto.plan) ? dto.plan : 'free';
    result.duration = duration;
    result.plan = plan;

    try {
      this.logger.log(`🎬 [${userId}] Iniciando generación con duración=${duration}s y plan=${plan}`);

      // 🎥 Generar video con VEO3 (Google Vertex AI)
      this.logger.debug(`📤 Enviando solicitud a VEO3 con payload: ${JSON.stringify({ prompt: dto.prompt, duration, plan })}`);
      
      // Convertir DTO a formato VEO3
      const veoDto = {
        prompt: typeof dto.prompt === 'string' ? dto.prompt : JSON.stringify(dto.prompt),
        videoLength: Math.min(duration, 60), // VEO3 max 60 seconds
        aspectRatio: '16:9' as const,
        fps: 24,
        negativePrompt: 'blurry, low quality, distorted',
      };
      
      const veoResponse = await this.veoService.generateVideoAndNotify(userId, veoDto);
      const { videoUrl, filename } = veoResponse;

      if (!videoUrl || !filename) {
        this.logger.warn('⚠️ Respuesta incompleta de VEO3');
        result.error = 'Video no generado correctamente.';
        return {
          success: false,
          message: 'Fallo en la generación del video',
          result,
        };
      }

      result.videoUrl = videoUrl;
      result.fileName = filename;
      result.veoJobId = filename; // Usar filename como job ID para tracking

      // 🎙️ Narración (opcional)
      if (dto.useVoice) {
        try {
          this.logger.log('🎤 Generando narración TTS...');
          const audioResult = await this.ttsService.generateAudioFromPrompt(typeof dto.prompt === 'string' ? dto.prompt : JSON.stringify(dto.prompt));
          result.audioUrl = audioResult.blobUrl;
          result.script = audioResult.script;
        } catch (err) {
          this.logger.warn(`⚠️ Error en TTS: ${err instanceof Error ? err.message : err}`);
          result.audioError = 'No se pudo generar el audio';
        }
      }

      // 📝 Subtítulos y música (placeholders)
      if (dto.useSubtitles) result.subtitles = 'pendiente';
      if (dto.useMusic) result.music = 'pendiente';

      this.logger.log('✅ Video generado correctamente');
      return {
        success: true,
        message: 'Medios generados exitosamente',
        result,
      };

    } catch (err) {
      this.logger.error(`❌ Error en flujo general: ${err instanceof Error ? err.message : err}`);
      result.error = 'Fallo inesperado al generar video';
      return {
        success: false,
        message: 'Fallo interno en la generación del video',
        result,
      };
    }
  }
}
