// 📁 src/infrastructure/services/mock-influencer.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { IInfluencerProvider } from '../../domain/services/influencer-provider.interface';
import { GenerateInfluencerDto } from '../../interfaces/dto/generate-influencer.dto';

@Injectable()
export class MockInfluencerService implements IInfluencerProvider {
  private readonly logger = new Logger(MockInfluencerService.name);

  async authenticate(): Promise<boolean> {
    this.logger.log('🔍 Authenticating with mock influencer API...');
    
    // Simulate delay for authentication
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if API key exists
    const apiKey = process.env.MOCK_INFLUENCER_API_KEY;
    if (!apiKey) {
      this.logger.error('❌ MOCK_INFLUENCER_API_KEY not configured');
      return false;
    }

    this.logger.log('✅ Mock influencer API authentication successful');
    return true;
  }

  async generateVideoJob(dto: GenerateInfluencerDto): Promise<{ jobId: string, status: string }> {
    this.logger.log(`🎬 Initiating influencer video job generation for image: ${dto.imageUrl}`);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate a fake job ID
    const jobId = `job_inf_${Date.now().toString(36)}_${Math.floor(Math.random() * 100000)}`;
    
    this.logger.log(`✅ Generated mock influencer job ID: ${jobId}`);
    
    return {
      jobId,
      status: 'PENDING'
    };
  }
}