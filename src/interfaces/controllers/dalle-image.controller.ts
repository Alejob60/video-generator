// 📁 src/interfaces/controllers/dalle-image.controller.ts

import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
} from '@nestjs/common';
import { DalleImageService } from '../../infrastructure/services/dalle-image.service';
import { GeneratePromoImageDto } from '../dto/generate-promo-image.dto';

@Controller('media')
export class DalleImageController {
  private readonly logger = new Logger(DalleImageController.name);

  constructor(
    private readonly dalleService: DalleImageService,
  ) {}

  /**
   * POST /media/image
   * Generate image using DALL-E 3
   */
  @Post('image')
  async generateImage(
    @Body() dto: GeneratePromoImageDto,
    @Headers('x-user-id') userId: string = 'anon',
  ) {
    try {
      if (!dto.prompt) {
        throw new Error('Prompt is required');
      }

      this.logger.log(`🎨 Generating DALL-E 3 image for user: ${userId}`);
      this.logger.log(`📝 Prompt: ${dto.prompt}`);
      
      const result = await this.dalleService.generateImage(dto.prompt, dto.plan || 'FREE');

      return {
        success: true,
        message: '✅ Imagen generada correctamente',
        result: {
          imageUrl: result.imageUrl,
          prompt: dto.prompt,
          filename: result.filename,
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ Error: ${error.message}`, error.stack);
      
      throw new Error(`DALL-E generation failed: ${error.message}`);
    }
  }
}
