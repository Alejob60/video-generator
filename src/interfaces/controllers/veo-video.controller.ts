import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
} from '@nestjs/common';
import { VeoVideoService } from '../../infrastructure/services/veo-video.service';

export interface GenerateVeoVideoDto {
  prompt: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  videoLength?: number;
  fps?: number;
  negativePrompt?: string;
}

@Controller('media')
export class VeoVideoController {
  private readonly logger = new Logger(VeoVideoController.name);

  constructor(
    private readonly veoVideoService: VeoVideoService,
  ) {}

  /**
   * POST /media/veo/video
   * Generate video from text prompt using Google VEO3
   */
  @Post('veo/video')
  async generateVideo(
    @Body() dto: GenerateVeoVideoDto,
    @Headers('x-user-id') userId: string = 'anon',
  ) {
    try {
      this.logger.log(`🎬 Generating VEO3 video for user: ${userId}`);
      this.logger.log(`📝 Prompt: ${dto.prompt.substring(0, 100)}...`);
      
      const result = await this.veoVideoService.generateVideoAndNotify(
        userId,
        dto,
      );
      
      return {
        success: true,
        message: '✅ VEO3 video generated successfully',
        data: {
          videoUrl: result.videoUrl,
          prompt: result.prompt,
          filename: result.filename,
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ Error: ${error.message}`, error.stack);
      throw new Error(`VEO3 video generation failed: ${error.message}`);
    }
  }
}
