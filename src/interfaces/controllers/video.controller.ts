import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { LLMService } from '../../infrastructure/services/llm.service';
import { SoraVideoClientService } from '../../infrastructure/services/sora-video-client.service';
import { AzureTTSService } from '../../infrastructure/services/azure-tts.service';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.service';
import { GenerateVideoDto } from '../dto/generate-video.dto';

@Controller('videos')
export class VideoController {
  private readonly logger = new Logger(VideoController.name);

  constructor(
    private readonly llmService: LLMService,
    private readonly soraClient: SoraVideoClientService,
    private readonly ttsService: AzureTTSService,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  @Post('generate')
  async generateVideo(@Body() dto: GenerateVideoDto, @Req() req: Request) {
    const userId = (req as any)?.user?.id || 'admin';
    const result: any = {
      userId,
      timestamp: Date.now(),
      videoUrl: '',
    };

    // 🧪 Validaciones
    if (!dto.prompt || typeof dto.prompt !== 'string' || dto.prompt.trim().length < 10) {
      this.logger.warn(`[${userId}] ❌ Prompt inválido: "${dto.prompt}"`);
      throw new HttpException('El prompt debe tener al menos 10 caracteres.', HttpStatus.BAD_REQUEST);
    }

    const duration = 20;
    const plan = typeof dto.plan === 'string' && ['free', 'creator', 'pro'].includes(dto.plan) ? dto.plan : 'free';
    result.duration = duration;
    result.plan = plan;

    try {
      this.logger.log(`🎬 [${userId}] Iniciando generación con duración=${duration}s y plan=${plan}`);

      // 🔄 Check disponibilidad de Sora
      const soraDisponible = await this.soraClient.isHealthy();
      if (!soraDisponible) {
        this.logger.warn('🚫 Sora no disponible');
        result.error = 'Sora offline';
        return {
          success: false,
          message: 'Sora offline',
          result,
        };
      }

      // ✨ Mejorar prompt
      this.logger.log('🧠 Solicitando mejora del prompt...');
      const improvedPromptObject = await this.llmService.improveVideoPrompt(dto.prompt.trim());
      const improvedPromptString = `${improvedPromptObject.scene}. Characters: ${improvedPromptObject.characters.join(', ')}. Camera: ${improvedPromptObject.camera}. Lighting: ${improvedPromptObject.lighting}. Style: ${improvedPromptObject.style}. Focus: ${improvedPromptObject.interactionFocus}`;
      result.prompt = improvedPromptObject;

      // 📤 Enviar a Sora
      this.logger.debug(`📤 Enviando solicitud a Sora con payload: ${JSON.stringify({ prompt: improvedPromptString, duration, plan })}`);
      const soraResponse = await this.soraClient.requestVideo(improvedPromptString, duration);
      const { video_url, job_id, generation_id, file_name } = soraResponse;

      if (!video_url || !file_name) {
        this.logger.warn('⚠️ Respuesta incompleta de Sora');
        result.error = 'Video no generado correctamente.';
        return {
          success: false,
          message: 'Fallo en la generación del video',
          result,
        };
      }

      result.videoUrl = video_url;
      result.fileName = file_name;
      result.soraJobId = job_id;
      result.generationId = generation_id;

      // 🎙️ Narración (opcional)
      if (dto.useVoice) {
        try {
          this.logger.log('🎤 Generando narración TTS...');
          const audioResult = await this.ttsService.generateAudioFromPrompt(improvedPromptString);
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
