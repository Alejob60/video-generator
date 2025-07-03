// src/interfaces/controllers/video.controller.ts
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
import * as fs from 'fs';
import axios from 'axios';

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
    const userId = (req as any).user?.id || 'anon';
    const duration = dto.duration || 10;

    if (!dto.prompt) {
      throw new HttpException('Prompt requerido', HttpStatus.BAD_REQUEST);
    }

    try {
      this.logger.log(`🎬 [${userId}] Iniciando generación de video...`);

      // 1️⃣ Mejorar el prompt
      const improvedPrompt = await this.llmService.improveVideoPrompt(dto.prompt);
      this.logger.log(`✨ Prompt mejorado:\n${improvedPrompt}`);

      // 2️⃣ Solicitar generación de video a microservicio Sora
      const soraResponse = await this.soraClient.requestVideo(improvedPrompt, duration);
      const { video_url, job_id, generation_id, file_name } = soraResponse;

      if (!video_url || !job_id || !generation_id || !file_name) {
        this.logger.error(`❌ Respuesta incompleta desde sora-video:\n${JSON.stringify(soraResponse)}`);
        throw new HttpException('Error en microservicio Sora', HttpStatus.BAD_GATEWAY);
      }

      this.logger.log(`🎥 Video generado exitosamente: ${video_url}`);

      // 🧩 Armar respuesta inicial
      const result: any = {
        prompt: improvedPrompt,
        videoUrl: video_url,
        fileName: file_name,
        soraJobId: job_id,
        generationId: generation_id,
        duration,
        userId,
        timestamp: Date.now(),
      };

      // 3️⃣ Narración (si el usuario la solicitó)
      if (dto.useVoice) {
        this.logger.log('🎙️ Generando narración con TTS...');
        const audioResult = await this.ttsService.generateAudioFromPrompt(improvedPrompt);
        const blobName = `audio/${audioResult.fileName}`;

        await this.azureBlobService.uploadFileToBlob(audioResult.audioPath, blobName, 'audio/mpeg');
        const audioUrl = await this.azureBlobService.generateSasUrl(blobName, 86400);
        fs.unlinkSync(audioResult.audioPath);

        result.audioUrl = audioUrl;
        result.script = audioResult.script;
      }

      // 4️⃣ Subtítulos (pendiente - versión 2)
      if (dto.useSubtitles) {
        this.logger.log('📝 Subtítulos solicitados (pendiente generación en versión 2)');
        result.subtitles = 'pendiente';
      }

      // 5️⃣ Música (pendiente - versión 2)
      if (dto.useMusic) {
        this.logger.log('🎵 Música solicitada (pendiente generación en versión 2)');
        result.music = 'pendiente';
      }

      // ✅ Respuesta final
      return {
        success: true,
        message: 'Video generado correctamente',
        result,
      };

    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error('❌ Axios error:', error.response?.data || error.message);
      } else {
        this.logger.error('❌ Error inesperado:', error);
      }
      throw new HttpException('Error al generar video', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
