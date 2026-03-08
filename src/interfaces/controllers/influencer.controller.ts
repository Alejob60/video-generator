// 📁 src/interfaces/controllers/influencer.controller.ts

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
import { InfluencerService } from '../../application/services/influencer.service';
import { GenerateInfluencerDto } from '../dto/generate-influencer.dto';

@Controller('media/influencer')
export class InfluencerController {
  private readonly logger = new Logger(InfluencerController.name);

  constructor(private readonly influencerService: InfluencerService) {}

  @Post()
  async generateInfluencerVideo(
    @Body() dto: GenerateInfluencerDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id || 'anon';

    try {
      this.logger.log(`🎬 Generating influencer video for user ${userId}`);

      // Validate required fields
      if (!dto.imageUrl || !dto.script || !dto.voiceId) {
        throw new HttpException(
          '❌ imageUrl, script, and voiceId are required.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.influencerService.initiateInfluencerGeneration(
        userId,
        dto,
      );

      this.logger.log(`✅ Influencer video generation initiated for user ${userId}`);

      // Return 201 Created quickly while heavy processing goes to the queue
      return {
        success: true,
        message: 'Influencer video generation initiated successfully',
        statusCode: HttpStatus.CREATED,
        result: {
          jobId: result.jobId,
          userId,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      this.logger.error(
        `❌ Error generating influencer video for user ${userId}:`,
        error,
      );
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Error initiating influencer video generation.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}