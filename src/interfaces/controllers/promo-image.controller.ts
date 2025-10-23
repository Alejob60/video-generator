// 📁 src/interfaces/controllers/promo-image.controller.ts

import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  Logger,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PromoImageService } from '../../infrastructure/services/promo-image.service';
import { GeneratePromoImageDto } from '../dto/generate-promo-image.dto';

@Controller('media/image')
export class PromoImageController {
  private readonly logger = new Logger(PromoImageController.name);

  constructor(private readonly promoImageService: PromoImageService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async generateImage(
    @Body() dto: GeneratePromoImageDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id || 'anon';

    if (!dto.prompt && !file?.path) {
      throw new HttpException('❌ Debes enviar un prompt o una imagen.', HttpStatus.BAD_REQUEST);
    }

    try {
      this.logger.log(`📸 Generando imagen para el usuario ${userId}`);

      const result = await this.promoImageService.generateAndNotify(userId, {
        prompt: dto.prompt,
        imagePath: file?.path || undefined,
        useFlux: dto.useFlux,
        isJsonPrompt: dto.isJsonPrompt, // Pass the isJsonPrompt parameter
        //textOverlay: dto.textOverlay, // activable si lo implementas
      });

      this.logger.log(`✅ Imagen generada con éxito para usuario ${userId}`);
      return {
        success: true,
        message: '✅ Imagen generada correctamente',
        result,
      };
    } catch (error) {
      this.logger.error(`❌ Error generando imagen para usuario ${userId}:`, error);
      throw new HttpException('Error generando imagen.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}