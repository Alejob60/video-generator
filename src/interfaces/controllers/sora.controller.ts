import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { SoraService } from '../../infrastructure/services/sora.service';
import { GenerateVideoDto } from '../dto/generate-video.dto';

@Controller('videos')
export class SoraController {
  constructor(private readonly soraService: SoraService) {}

  @Post('generate')
  async generate(@Body() dto: GenerateVideoDto) {
    if (!dto.useSora) {
      throw new HttpException('⚠️ Este endpoint solo funciona si useSora es true.', HttpStatus.BAD_REQUEST);
    }

    const duration = dto.n_seconds ?? 10; // Default a 10 segundos si no se define

    const result = await this.soraService.generateAndUploadVideo(JSON.stringify(dto.prompt), duration);

    return {
      success: true,
      message: '✅ Video generado y subido exitosamente con Sora',
      jobId: result.jobId,
      blobUrl: result.blobUrl,
    };
  }
}
