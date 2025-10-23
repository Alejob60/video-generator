import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServiceBusClient, ServiceBusSender } from '@azure/service-bus';
import * as util from 'util';

@Injectable()
export class ServiceBusService implements OnModuleDestroy {
  private readonly logger = new Logger(ServiceBusService.name);
  private readonly sbClient: ServiceBusClient;
  private readonly senders: Record<string, ServiceBusSender> = {};

  constructor(private readonly configService: ConfigService) {
    const connStr = this.configService.get<string>('AZURE_SERVICE_BUS_CONNECTION');

    if (!connStr) {
      throw new Error('❌ AZURE_SERVICE_BUS_CONNECTION no está definida');
    }

    this.sbClient = new ServiceBusClient(connStr);

    // Inicializa los senders según las colas disponibles
    const videoQueue = this.configService.get<string>('AZURE_SERVICE_BUS_QUEUE') || 'video';
    const imageQueue = this.configService.get<string>('AZURE_SERVICE_BUS_QUEUE_IMAGE') || 'imagen';

    if (videoQueue) {
      this.senders['video'] = this.sbClient.createSender(videoQueue);
    }

    if (imageQueue) {
      this.senders['image'] = this.sbClient.createSender(imageQueue);
    }
  }

  async sendVideoJobMessage(
    jobId: string,
    timestamp: number,
    metadata: Record<string, any>,
  ): Promise<void> {
    if (!this.senders['video']) {
      throw new Error('❌ Cola de video no está configurada correctamente');
    }

    // Aseguramos que todos los campos requeridos estén presentes
    const messageBody = {
      jobId,
      audioId: timestamp,
      script: metadata.script || '',
      prompt: metadata.prompt || '',
      n_seconds: metadata.n_seconds || 20,
      narration: metadata.narration ?? false,
      subtitles: metadata.subtitles ?? false,
      ...metadata,
    };

    try {
      await this.senders['video'].sendMessages({
        body: messageBody,
        timeToLive: 1000 * 60 * 10, // 10 minutos
      });

      this.logger.log(`📤 Video Job enviado: jobId=${jobId}, audioId=${timestamp}`);
    } catch (error) {
      this.handleError(error, 'video');
    }
  }

  async sendImageJobMessage(
    userId: string,
    prompt: string,
  ): Promise<void> {
    if (!this.senders['image']) {
      throw new Error('❌ Cola de imagen no está configurada correctamente');
    }

    const messageBody = {
      userId,
      prompt,
      timestamp: Date.now(),
    };

    try {
      await this.senders['image'].sendMessages({
        body: messageBody,
        timeToLive: 1000 * 60 * 10, // 10 minutos
      });

      this.logger.log(`🖼️ Imagen encolada para userId=${userId}`);
    } catch (error) {
      this.handleError(error, 'image');
    }
  }

  private handleError(error: unknown, queueType: string) {
    const errorMsg = error instanceof Error
      ? error.message
      : util.inspect(error, { depth: 2, colors: false });

    this.logger.error(`❌ Error en cola '${queueType}':\n${errorMsg}`);
    throw error;
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('🔌 Cerrando conexión con Azure Service Bus...');
    await Promise.all([
      ...Object.values(this.senders).map((s) => s.close()),
      this.sbClient.close(),
    ]);
    this.logger.log('✅ Conexión a Service Bus cerrada correctamente');
  }
}