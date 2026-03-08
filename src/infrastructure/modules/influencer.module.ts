// 📁 src/infrastructure/modules/influencer.module.ts

import { Module, Logger } from '@nestjs/common';
import { ServiceBusService } from '../services/service-bus.service';
import { MockInfluencerService } from '../services/mock-influencer.service';
import { InfluencerService } from '../../application/services/influencer.service';
import { InfluencerController } from '../../interfaces/controllers/influencer.controller';
import { InfluencerQueueConsumerService } from '../services/influencer-queue-consumer.service';

@Module({
  imports: [],
  controllers: [
    // 📡 Controller para endpoints HTTP
    InfluencerController,
  ],
  providers: [
    // 🔧 Servicios de la aplicación
    InfluencerService,
    
    // 🧪 Servicios de infraestructura
    MockInfluencerService,
    ServiceBusService,
    
    // 👂 Consumidor de cola para procesamiento asíncrono
    InfluencerQueueConsumerService,
    
    // 🪵 Logger
    Logger,
  ],
  exports: [
    // Exportar servicios que podrían ser usados por otros módulos
    InfluencerService,
    MockInfluencerService,
  ],
})
export class InfluencerModule {}