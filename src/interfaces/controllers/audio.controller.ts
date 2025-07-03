// src/interfaces/controllers/audio.controller.ts
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
import { AzureTTSService } from '../../infrastructure/services/azure-tts.service';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.service';
import { LLMService } from '../../infrastructure/services/llm.service';
import { GenerateAudioDto } from '../dto/generate-audio.dto';
import * as fs from 'fs';

@Controller('audio')
export class AudioController {
  private readonly logger = new Logger(AudioController.name);

  constructor(
    private readonly ttsService: AzureTTSService,
    private readonly llmService: LLMService,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  @Post('generate')
  async generateAudio(@Body() dto: GenerateAudioDto, @Req() req: Request) {
    if (!dto.prompt) {
      throw new HttpException('Prompt requerido', HttpStatus.BAD_REQUEST);
    }

    const duration = dto.duration || 20;
    const userId = (req as any).user?.id || 'anon';

    try {
      // ✅ 1. Generar libreto narrativo con IA
      const script = await this.llmService.generateNarrativeScript(dto.prompt, duration);

      // ✅ 2. Generar audio TTS desde el libreto
      const audioResult = await this.ttsService.generateAudioFromPrompt(script);

      // ✅ 3. Subir el archivo a Azure Blob Storage
      const blobName = `audio/${audioResult.fileName}`;
      await this.azureBlobService.uploadFileToBlob(audioResult.audioPath, blobName, 'audio/mpeg');

      // ✅ 4. Generar URL SAS segura (24 horas)
      const audioUrl = await this.azureBlobService.generateSasUrl(blobName, 86400);

      // ✅ 5. Borrar archivo temporal local
      fs.unlinkSync(audioResult.audioPath);

      // ✅ 6. Enviar respuesta
      return {
        success: true,
        result: {
          script,
          audioUrl,
          duration: audioResult.duration,
        },
      };
    } catch (error) {
      this.logger.error('❌ Error generando audio:', error);
      throw new HttpException('Error generando audio', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
