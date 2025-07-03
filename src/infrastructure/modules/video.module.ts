// src/infrastructure/modules/video.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VideoService } from '../services/video.service';
import { ServiceBusService } from '../services/service-bus.service';
import { VideoQueueConsumerService } from '../services/video-queue-consumer.service';
import { PromoImageModule } from './promo-image.module';
import { SoraModule } from './sora.module';
import { VideoController } from 'src/interfaces/controllers/video.controller';
import { AzureBlobService } from '../services/azure-blob.service';
import { AzureTTSService } from '../services/azure-tts.service';
import { LLMService } from '../services/llm.service';

@Module({
  imports: [ConfigModule, PromoImageModule, SoraModule],
  controllers: [VideoController],
  providers: [
    VideoService,
    ServiceBusService,
    VideoQueueConsumerService,
    AzureBlobService,
    AzureTTSService,  // ✅ nuevo
    LLMService,       // ✅ nuevo
  ],
  exports: [
    VideoService,
    ServiceBusService,
    AzureBlobService,
  ],
})
export class VideoModule {}
