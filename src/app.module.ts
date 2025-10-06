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
import { FluxImageModule } from './infrastructure/modules/flux-image.module';

// 🧩 Controladores
import { HealthController } from './interfaces/controllers/health.controller';
import { LLMModule } from './infrastructure/modules/llm.module';
// 🧩 Workers (consumidores de cola)
import { VideoQueueConsumerService } from './infrastructure/services/video-queue-consumer.service';
import { PromoImageQueueConsumerService } from './infrastructure/services/promo-image-queue-consumer.service';



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
    FluxImageModule,
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
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  async onModuleInit() {
    this.logger.log('✅ Módulo principal inicializado correctamente.');
    this.logger.log(`🌐 Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
  }
}