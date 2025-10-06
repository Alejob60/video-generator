// 📁 src/interfaces/controllers/flux-image.controller.ts

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
import { FluxImageService } from '../../infrastructure/services/flux-image.service';
import { GenerateFluxImageDto } from '../dto/generate-flux-image.dto';

@Controller('media/flux-image')
export class FluxImageController {
  private readonly logger = new Logger(FluxImageController.name);

  constructor(private readonly fluxImageService: FluxImageService) {}

  @Post()
  async generateFluxImage(
    @Body() dto: GenerateFluxImageDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id || 'anon';

    try {
      this.logger.log(`📸 Generating FLUX image for user ${userId} with prompt: ${dto.prompt}`);

      const result = await this.fluxImageService.generateImageAndNotify(userId, dto);

      this.logger.log(`✅ FLUX image generated successfully for user ${userId}`);
      return {
        success: true,
        message: '✅ FLUX image generated successfully',
        data: {
          imageUrl: result.imageUrl,
          filename: result.filename,
          userId,
          prompt: result.prompt
        }
      };
    } catch (error: any) {
      this.logger.error(`❌ Error generating FLUX image for user ${userId}:`, error);
      throw new HttpException(
        `Error generating FLUX image: ${error.message || error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}