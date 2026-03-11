// 📁 src/app.module.ts
import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';

// 🧩 Módulos de infraestructura y servicios
import { ServiceBusModule } from './infrastructure/messaging/service-bus.module';
import { VideoModule } from './infrastructure/modules/video.module';
import { AudioModule } from './infrastructure/modules/audio.module';
import { PromoImageModule } from './infrastructure/modules/promo-image.module';
import { SoraModule } from './infrastructure/modules/sora.module';
import { ImageGenerationModule } from './infrastructure/modules/image-generation.module'; // NEW - FLUX Kontext + DALL-E
// import { FluxImageModule } from './infrastructure/modules/flux-image.module'; // DISABLED
// import { InfluencerModule } from './infrastructure/modules/influencer.module'; // Módulo de influencers
import { WebsiteDnaModule } from './infrastructure/modules/website-dna.module'; // Nuevo módulo de extracción de ADN

// 🧩 Controladores
import { HealthController } from './interfaces/controllers/health.controller';
import { LLMModule } from './infrastructure/modules/llm.module';
// 🧩 Workers (consumidores de cola)
import { VideoQueueConsumerService } from './infrastructure/services/video-queue-consumer.service';
import { PromoImageQueueConsumerService } from './infrastructure/services/promo-image-queue-consumer.service';
import { InfluencerQueueConsumerService } from './infrastructure/services/influencer-queue-consumer.service';

@Module({
  imports: [
    // 🌍 Cargar variables de entorno globalmente
    ConfigModule.forRoot({ isGlobal: true }),

    // 🌐 Servir archivos estáticos desde /public
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),

    // 🧩 Módulos funcionales del sistema
    ServiceBusModule,
    VideoModule,
    AudioModule,
    PromoImageModule,
    SoraModule,
    ImageGenerationModule, // NEW - FLUX Kontext + DALL-E
    // FluxImageModule, // DISABLED
    WebsiteDnaModule, // Módulo de extracción de ADN
    LLMModule,
  ],
  controllers: [
    // 📡 Controladores HTTP
    HealthController,
  ],
  providers: [
    // 🔁 Consumidores de Azure Service Bus
    VideoQueueConsumerService,
    PromoImageQueueConsumerService,
    InfluencerQueueConsumerService,
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  async onModuleInit() {
    this.logger.log('✅ Módulo principal inicializado correctamente.');
    this.logger.log(`🌐 Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
  }
}