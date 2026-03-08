// 📁 src/interfaces/controllers/website-dna.controller.ts
import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { WebsiteDnaService } from '../../infrastructure/services/website-dna.service';
import { ExtractWebsiteDnaDto } from '../dto/extract-website-dna.dto';

@Controller('media/website-dna')
export class WebsiteDnaController {
  private readonly logger = new Logger(WebsiteDnaController.name);

  constructor(private readonly websiteDnaService: WebsiteDnaService) {}

  @Post()
  async extractWebsiteDna(
    @Body() dto: ExtractWebsiteDnaDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id || 'anon';
    const requestId = Date.now();

    try {
      this.logger.log(`🧬 Iniciando extracción de ADN para sitio: ${dto.url} (Usuario: ${userId}, Request ID: ${requestId})`);
      
      const result = await this.websiteDnaService.extractDna(dto, userId);

      this.logger.log(`✅ ADN extraído exitosamente para ${dto.url} (Request ID: ${requestId})`);
      
      return {
        success: true,
        message: '✅ ADN del sitio web extraído exitosamente',
        requestId,
        result,
      };
    } catch (error: any) {
      this.logger.error(`❌ Error extrayendo ADN para ${dto.url} (Request ID: ${requestId}):`, error);
      
      throw new HttpException(
        `Error extrayendo ADN del sitio: ${error.message || error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}