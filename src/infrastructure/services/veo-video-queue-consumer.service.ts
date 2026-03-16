import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ServiceBusClient, ServiceBusReceivedMessage } from '@azure/service-bus';
import { VeoVideoService } from './veo-video.service';
import { AzureBlobService } from './azure-blob.service';
import { AzureTTSService } from './azure-tts.service';

@Injectable()
export class VeoVideoQueueConsumerService implements OnModuleInit {
  private readonly logger = new Logger(VeoVideoQueueConsumerService.name);
  private sbClient: ServiceBusClient | null = null;
  private readonly serviceBusQueue: string;
  private readonly backendUrl: string;

  constructor(
    private readonly veoVideoService: VeoVideoService,
    private readonly azureBlobService: AzureBlobService,
    private readonly ttsService: AzureTTSService,
  ) {
    const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION!;
    this.serviceBusQueue = process.env.AZURE_SERVICE_BUS_QUEUE || 'video';
    this.backendUrl = process.env.MAIN_BACKEND_URL!;
    
    if (connectionString) {
      this.sbClient = new ServiceBusClient(connectionString);
      this.logger.log('✅ VEO3 Queue Consumer initialized');
    } else {
      this.logger.warn('⚠️ Service Bus connection not configured');
    }
  }

  async onModuleInit() {
    if (!this.sbClient) {
      this.logger.warn('⚠️ Cannot start VEO3 queue consumer - no Service Bus connection');
      return;
    }

    try {
      await this.startProcessingMessages();
    } catch (error: any) {
      this.logger.error(`❌ Error starting VEO3 queue consumer: ${error.message}`, error.stack);
    }
  }

  private async startProcessingMessages() {
    if (!this.sbClient) {
      this.logger.warn('⚠️ Service Bus client not available');
      return;
    }

    this.logger.log(`📡 Starting to process VEO3 messages from queue: ${this.serviceBusQueue}`);
    
    const receiver = this.sbClient.createReceiver(this.serviceBusQueue);
    
    // Process messages continuously
    const messages = await receiver.receiveMessages(1, { maxWaitTimeInMs: 5000 });
    
    for (const message of messages) {
      try {
        await this.processMessage(message);
        await receiver.completeMessage(message);
      } catch (error: any) {
        this.logger.error(`❌ Error processing VEO3 message: ${error.message}`, error.stack);
        await receiver.abandonMessage(message);
      }
    }
    
    // Continue processing (recursive call for continuous processing)
    setTimeout(() => this.startProcessingMessages(), 1000);
  }

  private async processMessage(message: ServiceBusReceivedMessage) {
    const { jobId, userId, prompt, duration, options } = message.body;
    
    this.logger.log(`🎬 [${jobId}] Processing VEO3 video generation for user: ${userId}`);
    this.logger.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
    this.logger.log(`⏱️ Duration: ${duration}s`);
    
    try {
      // Step 1: Generate video with VEO3 (takes 5-15 minutes)
      this.logger.log('🔧 Generating video with VEO3...');
      const videoResult = await this.veoVideoService.generateVideo({
        prompt,
        videoLength: duration,
        aspectRatio: '16:9',
        fps: 24,
        negativePrompt: 'blurry, low quality, distorted',
      });
      
      this.logger.log(`✅ Video generated: ${videoResult.filename}`);
      
      // Step 2: Generate TTS audio if requested
      let audioUrl: string | undefined;
      let script: string | undefined;
      
      if (options?.useVoice) {
        try {
          this.logger.log('🎤 Generating TTS audio...');
          const audioResult = await this.ttsService.generateAudioFromPrompt(prompt);
          audioUrl = audioResult.blobUrl;
          script = audioResult.script;
          this.logger.log('✅ Audio generated');
        } catch (err: any) {
          this.logger.warn(`⚠️ TTS generation failed: ${err.message}`);
        }
      }
      
      // Step 3: Prepare complete response
      const completePayload = {
        jobId,
        userId,
        type: 'veo3-complete',
        status: 'completed',
        videoUrl: videoResult.videoUrl,
        filename: videoResult.filename,
        prompt,
        duration,
        audioUrl,
        script,
        subtitles: options?.useSubtitles ? 'pendiente' : undefined,
        music: options?.useMusic ? 'pendiente' : undefined,
        completedAt: Date.now(),
      };
      
      // Step 4: Notify main backend
      this.logger.log(`🔔 Notifying main backend: ${this.backendUrl}/veo-video/complete`);
      
      try {
        const response = await fetch(`${this.backendUrl}/veo-video/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(completePayload),
        });
        
        if (response.ok) {
          this.logger.log('✅ Main backend notified successfully');
        } else {
          this.logger.warn(`⚠️ Backend notification failed: ${response.status}`);
        }
      } catch (err: any) {
        this.logger.error(`❌ Failed to notify backend: ${err.message}`);
      }
      
      this.logger.log(`✅ [${jobId}] VEO3 video generation completed successfully`);
      
    } catch (error: any) {
      this.logger.error(`❌ [${jobId}] VEO3 video generation failed: ${error.message}`, error.stack);
      
      // Notify backend of failure
      try {
        await fetch(`${this.backendUrl}/veo-video/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId,
            userId,
            type: 'veo3-complete',
            status: 'failed',
            error: error.message,
            failedAt: Date.now(),
          }),
        });
      } catch (notifyError: any) {
        this.logger.error(`❌ Failed to notify backend of error: ${notifyError.message}`);
      }
      
      throw error;
    }
  }
}
