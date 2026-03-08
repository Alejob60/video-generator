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
import { PromoImageService } from '../../infrastructure/services/promo-image.service';
import { FluxKontextImageService } from '../../infrastructure/services/flux-kontext-image.service';
import { Flux2ProService } from '../../infrastructure/services/flux-2-pro.service';
import { GeneratePromoImageDto } from '../dto/generate-promo-image.dto';
import { GenerateFluxImageDto } from '../dto/generate-flux-image.dto';

@Controller('media/flux-image')
export class FluxImageController {
  private readonly logger = new Logger(FluxImageController.name);

  constructor(
    private readonly fluxImageService: FluxImageService,
    private readonly promoImageService: PromoImageService,
    private readonly fluxKontextService: FluxKontextImageService,
    private readonly flux2ProService: Flux2ProService,
  ) {}

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

  @Post('/dual')
  async generateDual(@Body() dto: GeneratePromoImageDto, @Req() req: Request): Promise<{ promo: string; flux: string }> {
    const userId = (req as any).user?.id || 'anon';
    
    try {
      this.logger.log(`🎭 Generating DUAL images for user ${userId}: DALL-E + FLUX Kontext Pro`);
      
      // Generate DALL-E image (promo)
      const promoResult = await this.promoImageService.generateAndNotify(userId, { 
        prompt: dto.prompt, 
        useFlux: false 
      });
      
      // Generate FLUX Kontext Pro image
      const fluxKontextDto: GenerateFluxImageDto = {
        prompt: dto.prompt || '',
        plan: dto.plan || 'FREE',
        isJsonPrompt: false,
        size: '1024x1024'
      };
      const fluxKontextResult = await this.fluxKontextService.generateImage(fluxKontextDto);
      
      this.logger.log(`✅ Dual images generated successfully - DALL-E: ${promoResult.imageUrl}, FLUX Kontext: ${fluxKontextResult.imageUrl}`);
      
      return { 
        promo: promoResult.imageUrl, 
        flux: fluxKontextResult.imageUrl 
      };
    } catch (error: any) {
      this.logger.error(`❌ Error generating dual images for user ${userId}:`, error);
      throw new HttpException(
        `Error generating dual images: ${error.message || error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('/simple')
  async generateSimple(@Body() dto: GenerateFluxImageDto, @Req() req: Request) {
    const userId = (req as any).user?.id || 'anon';
    
    try {
      this.logger.log(`🚀 Generating simple FLUX 2 Pro image for user ${userId} with prompt: ${dto.prompt}`);
      
      const result = await this.flux2ProService.generateImageAndNotify(userId, dto);
      
      this.logger.log(`✅ FLUX 2 Pro image generated successfully for user ${userId}`);
      
      return {
        success: true,
        message: '✅ FLUX 2 Pro image generated successfully',
        data: {
          imageUrl: result.imageUrl,
          filename: result.filename,
          userId,
          prompt: result.prompt
        }
      };
    } catch (error: any) {
      this.logger.error(`❌ Error generating FLUX 2 Pro image for user ${userId}:`, error);
      throw new HttpException(
        `Error generating FLUX 2 Pro image: ${error.message || error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}