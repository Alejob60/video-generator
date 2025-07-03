import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import {
  ServiceBusClient,
  ServiceBusReceiver,
  ServiceBusReceivedMessage,
  ProcessErrorArgs,
} from '@azure/service-bus';
import { VideoService } from '../services/video.service';
import { QueueVideoMessage } from '../../types/queue-message.interface';
import { safeErrorMessage } from '../../common/utils/error.util';

@Injectable()
export class VideoQueueConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VideoQueueConsumerService.name);
  private receiver!: ServiceBusReceiver;
  private sbClient!: ServiceBusClient;
  private readonly connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION;
  private readonly queueName = process.env.AZURE_SERVICE_BUS_QUEUE || 'video-processing-queue';

  constructor(private readonly videoService: VideoService) {}

  async onModuleInit(): Promise<void> {
    if (!this.connectionString || !this.queueName) {
      this.logger.error('❌ Configuración de Azure Service Bus incompleta.');
      throw new Error('Faltan variables de entorno para conectar con Service Bus.');
    }

    this.sbClient = new ServiceBusClient(this.connectionString);
    this.receiver = this.sbClient.createReceiver(this.queueName, {
      receiveMode: 'peekLock',
    });

    this.logger.log(`📥 Suscrito correctamente a la cola: ${this.queueName}`);

    this.receiver.subscribe({
      processMessage: async (message: ServiceBusReceivedMessage) => {
        await this.handleMessageWithRetry(message);
      },
      processError: async (args: ProcessErrorArgs) => {
        this.logger.error('⚠️ Error en el receptor de mensajes:', safeErrorMessage(args.error));
      },
    });
  }

  private async handleMessageWithRetry(message: ServiceBusReceivedMessage, attempt = 1): Promise<void> {
    const maxRetries = 3;
    try {
      await this.handleMessage(message);
      await this.receiver.completeMessage(message);
    } catch (error) {
      const msg = safeErrorMessage(error);

      this.logger.error(`❌ Fallo en intento ${attempt}: ${msg}`);

      if (attempt < maxRetries) {
        this.logger.warn(`🔁 Reintentando procesamiento (intento ${attempt + 1}/${maxRetries})...`);
        setTimeout(() => this.handleMessageWithRetry(message, attempt + 1), 2000);
      } else {
        this.logger.error(`❌ Fallo definitivo al procesar mensaje: ${msg}`);
        await this.receiver.deadLetterMessage(message, {
          deadLetterReason: 'ProcessingFailed',
          deadLetterErrorDescription: msg,
        });
      }
    }
  }

  private async handleMessage(message: ServiceBusReceivedMessage): Promise<void> {
    const data = message.body as QueueVideoMessage;

    if (!data?.jobId || !data?.audioId || !data?.script) {
      throw new Error('❌ Mensaje inválido: Faltan campos requeridos.');
    }

    this.logger.log(`📨 Mensaje recibido:
🆔 Job ID: ${data.jobId}
🎧 Audio ID: ${data.audioId}
🧠 Narración: ${data.narration}
💬 Subtítulos: ${data.subtitles}
⏱️ Duración: ${data.n_seconds}`);

    await this.videoService.processGeneratedAssets(data.jobId, data.audioId, {
      script: data.script,
      narration: data.narration ?? false,
      subtitles: data.subtitles ?? false,
      n_seconds: data.n_seconds ?? 20,
      prompt: data.prompt ?? '',
    });

    this.logger.log(`✅ Procesamiento exitoso para jobId=${data.jobId}`);
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('🛑 Cerrando conexiones con Azure Service Bus...');
    await Promise.all([
      this.receiver?.close(),
      this.sbClient?.close(),
    ]);
    this.logger.log('✅ Consumer desconectado correctamente.');
  }
}
