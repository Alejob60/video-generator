// src/infrastructure/modules/service-bus.module.ts
import { Module } from '@nestjs/common';
import { VideoModule } from './video.module'; // 👈 Importar módulo que contiene VideoService
import { VideoQueueConsumerService } from '../services/video-queue-consumer.service';

@Module({
  imports: [VideoModule], // 👈 Muy importante
  providers: [VideoQueueConsumerService],
})
export class ServiceBusModule {}
