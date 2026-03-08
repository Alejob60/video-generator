// 📁 src/application/services/influencer.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ServiceBusService } from '../../infrastructure/services/service-bus.service';
import { MockInfluencerService } from '../../infrastructure/services/mock-influencer.service';
import { GenerateInfluencerDto } from '../../interfaces/dto/generate-influencer.dto';

export interface QueueInfluencerMessage {
  jobId: string;             // 🆔 ID del job en el sistema de influencer
  userId: string;            // 👤 ID del usuario que solicitó el video
  imageUrl: string;          // 🖼️ URL de la imagen del influencer
  script: string;            // 📝 Script que dirá el influencer
  voiceId: string;           // 🗣️ ID de la voz seleccionada
  plan: 'free' | 'pro';      // 💼 Plan del usuario
  timestamp: number;         // ⏰ Timestamp de creación
}

@Injectable()
export class InfluencerService {
  private readonly logger = new Logger(InfluencerService.name);

  constructor(
    private readonly mockInfluencerService: MockInfluencerService,
    private readonly bus: ServiceBusService,
  ) {}

  async initiateInfluencerGeneration(
    userId: string,
    dto: GenerateInfluencerDto,
  ): Promise<{ jobId: string; message: string }> {
    this.logger.log(`🎬 Initiating influencer video generation for user: ${userId}`);

    // Step 1: Authenticate with the mock influencer API
    const isAuthenticated = await this.mockInfluencerService.authenticate();
    if (!isAuthenticated) {
      throw new Error('❌ Failed to authenticate with influencer API');
    }

    // Step 2: Generate video job
    const { jobId, status } = await this.mockInfluencerService.generateVideoJob(dto);
    
    this.logger.log(`📋 Job created with ID: ${jobId}, status: ${status}`);

    // Step 3: Send message to the influencer queue
    await this.bus.sendInfluencerJobMessage(jobId, userId, {
      imageUrl: dto.imageUrl,
      script: dto.script,
      voiceId: dto.voiceId,
      plan: dto.plan,
      timestamp: Date.now(),
    });

    this.logger.log(`✅ Influencer job ${jobId} sent to queue for processing`);

    return {
      jobId,
      message: 'Influencer video generation initiated successfully',
    };
  }
}