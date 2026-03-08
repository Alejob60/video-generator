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
import { safeErrorMessage } from '../../common/utils/error.util';
import fetch from 'node-fetch';
import { QueueInfluencerMessage } from '../../application/services/influencer.service';

@Injectable()
export class InfluencerQueueConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InfluencerQueueConsumerService.name);
  private receiver!: ServiceBusReceiver;
  private sbClient!: ServiceBusClient;

  private readonly connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION;
  private readonly queueName = process.env.AZURE_SERVICE_BUS_QUEUE_INFLUENCER || 'influencer-video-queue';
  private readonly backendUrl = process.env.MAIN_BACKEND_URL || 'http://localhost:3001';

  async onModuleInit(): Promise<void> {
    if (!this.connectionString || !this.queueName) {
      this.logger.error('❌ Configuración de Azure Service Bus incompleta para cola de influencers.');
      throw new Error('Faltan variables de entorno para cola de influencers.');
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
        this.logger.error('⚠️ Error en la cola de influencers:', safeErrorMessage(args.error));
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
        this.logger.error(`❌ Fallo definitivo al procesar mensaje de influencer: ${msg}`);
        await this.receiver.deadLetterMessage(message, {
          deadLetterReason: 'ProcessingFailed',
          deadLetterErrorDescription: msg,
        });
      }
    }
  }

  private async handleMessage(message: ServiceBusReceivedMessage): Promise<void> {
    const { jobId, userId, imageUrl, script, voiceId, plan, timestamp }: QueueInfluencerMessage = 
      message.body as QueueInfluencerMessage;

    if (!jobId || !userId || !imageUrl || !script) {
      throw new Error('❌ Mensaje de influencer inválido: faltan campos requeridos.');
    }

    this.logger.log(`👤 Procesando video de influencer para userId=${userId}, jobId=${jobId}`);

    // Simulate rendering time (5 seconds)
    this.logger.log(`🎬 Rendering influencer video job ID: ${jobId}`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Generate dummy result
    const result = {
      videoUrl: `https://fake-azure-storage/influencer_result_${jobId}.mp4`,
      jobId,
      userId,
      imageUrl,
      script,
      voiceId,
      plan,
      timestamp,
      status: 'completed',
      duration: 30, // seconds
      resolution: '1080p',
    };

    this.logger.log(`✅ Video de influencer generado: ${result.videoUrl}`);

    // ✅ Notificar al backend principal
    try {
      const notifyUrl = `${this.backendUrl}/media/register-influencer-video`;

      const res = await fetch(notifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Respuesta no exitosa del backend: ${res.status} ${body}`);
      }

      this.logger.log(`📨 Video de influencer registrado correctamente en backend para userId=${userId}`);
    } catch (err) {
      this.logger.error(`❌ Error notificando al backend principal: ${safeErrorMessage(err)}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('🛑 Cerrando conexiones con Azure Service Bus (cola de influencers)...');
    await Promise.all([
      this.receiver?.close(),
      this.sbClient?.close(),
    ]);
    this.logger.log('✅ Consumer de influencer desconectado correctamente.');
  }
}