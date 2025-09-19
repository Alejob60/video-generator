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
import { GenerateAudioDto } from '../dto/generate-audio.dto';

@Controller('audio')
export class AudioController {
  private readonly logger = new Logger(AudioController.name);

  constructor(private readonly ttsService: AzureTTSService) {}

  @Post('generate')
  async generateAudio(@Body() dto: GenerateAudioDto, @Req() req: Request) {
    if (!dto.prompt) {
      throw new HttpException('Prompt requerido', HttpStatus.BAD_REQUEST);
    }

    const userId = (req as any).user?.id || 'labs';
    const generationId = `gen_${Date.now().toString(36)}_${Math.floor(Math.random() * 10000)}`;
    const timestamp = Date.now();

    try {
      this.logger.log(`🎙️ Generando audio para el usuario ${userId} con prompt:\n${dto.prompt}`);
      const result = await this.ttsService.generateAudioFromPrompt(dto.prompt);

      return {
        success: true,
        message: '🎧 Audio generado con éxito',
        result: {
          ...result, // Contiene: script, duration, filename, blobUrl
          generationId,
          userId,
          timestamp,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Error generando audio: ${errorMessage}`);
      throw new HttpException('Error generando audio', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
