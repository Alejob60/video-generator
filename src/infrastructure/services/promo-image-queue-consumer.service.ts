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
import { PromoImageService } from '../services/promo-image.service';
import { safeErrorMessage } from '../../common/utils/error.util';
import fetch from 'node-fetch';

@Injectable()
export class PromoImageQueueConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PromoImageQueueConsumerService.name);
  private receiver!: ServiceBusReceiver;
  private sbClient!: ServiceBusClient;

  private readonly connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION;
  private readonly queueName = process.env.AZURE_SERVICE_BUS_QUEUE_IMAGE || 'promo-image-queue';
  private readonly backendUrl = process.env.MAIN_BACKEND_URL || 'http://localhost:3001';

  constructor(private readonly promoImageService: PromoImageService) {}

  async onModuleInit(): Promise<void> {
    if (!this.connectionString || !this.queueName) {
      this.logger.error('❌ Configuración de Azure Service Bus incompleta para cola de imagen.');
      throw new Error('Faltan variables de entorno para cola de imagen.');
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
        this.logger.error('⚠️ Error en la cola de imágenes:', safeErrorMessage(args.error));
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
        this.logger.error(`❌ Fallo definitivo al procesar mensaje de imagen: ${msg}`);
        await this.receiver.deadLetterMessage(message, {
          deadLetterReason: 'ProcessingFailed',
          deadLetterErrorDescription: msg,
        });
      }
    }
  }

  private async handleMessage(message: ServiceBusReceivedMessage): Promise<void> {
    const { userId, prompt, imagePath, textOverlay } = message.body as {
      userId: string;
      prompt?: string;
      imagePath?: string;
      textOverlay?: string;
    };

    if (!userId || (!prompt && !imagePath)) {
      throw new Error('❌ Mensaje de imagen inválido: faltan campos requeridos.');
    }

    this.logger.log(`🖼️ Procesando imagen para userId=${userId} con prompt="${prompt || ''}"`);

    const result = await this.promoImageService.generateAndNotify(userId, {
      prompt,
      imagePath,
      textOverlay,
    });

    this.logger.log(`✅ Imagen generada: ${result.filename}`);

    // ✅ Notificar al backend principal para guardar en la galería
    try {
      const notifyUrl = `${this.backendUrl}/media/register-image`;

      const res = await fetch(notifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          prompt: result.prompt,
          imageUrl: result.imageUrl,
          filename: result.filename,
          plan: result.plan || 'FREE',
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Respuesta no exitosa del backend: ${res.status} ${body}`);
      }

      this.logger.log(`📨 Imagen registrada correctamente en backend para userId=${userId}`);
    } catch (err) {
      this.logger.error(`❌ Error notificando al backend principal: ${safeErrorMessage(err)}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('🛑 Cerrando conexiones con Azure Service Bus (cola de imagen)...');
    await Promise.all([
      this.receiver?.close(),
      this.sbClient?.close(),
    ]);
    this.logger.log('✅ Consumer de promo-image desconectado correctamente.');
  }
}
