import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ServiceBusService } from '../services/service-bus.service';
import { VideoQueueConsumerService } from '../services/video-queue-consumer.service';
import { VideoModule } from '../modules/video.module';
import { safeErrorMessage } from 'src/common/utils/error.util';

@Module({
  imports: [
    ConfigModule,
    VideoModule, // Para que VideoService esté disponible para el consumidor
  ],
  providers: [
    ServiceBusService,
    VideoQueueConsumerService,
  ],
  exports: [ServiceBusService],
})
export class ServiceBusModule {}
