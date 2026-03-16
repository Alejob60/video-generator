import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AzureBlobService } from './azure-blob.service';
import { ServiceBusClient } from '@azure/service-bus';

export interface GenerateVeoVideoDto {
  prompt: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  videoLength?: number; // seconds
  fps?: number;
  negativePrompt?: string;
}

/**
 * Helper function to decode base64 encoded media content string to bytes
 */
function b64decode(b64EncodedString: string): Buffer {
  return Buffer.from(b64EncodedString, 'base64');
}

@Injectable()
export class VeoVideoService {
  private readonly logger = new Logger(VeoVideoService.name);
  private readonly apiKey = process.env.VERTEX_API_KEY || '';
  private readonly projectId = process.env.VERTEX_PROJECT_ID || 'orbital-prime-vision';
  private readonly location = process.env.VERTEX_LOCATION || 'us-central1';
  private readonly model = process.env.VEO3_MODEL || 'veo-3.1-generate-001'; // ✅ Confirmed working model
  private readonly backendUrl = process.env.MAIN_BACKEND_URL!;
  private readonly serviceBusConnection = process.env.AZURE_SERVICE_BUS_CONNECTION!;
  private readonly serviceBusQueue = process.env.AZURE_SERVICE_BUS_QUEUE || 'video';
  private client: any; // Google GenAI client
  private sbClient: ServiceBusClient | null = null;

  constructor(
    private readonly azureBlobService: AzureBlobService,
  ) {
    // Initialize Google GenAI client
    try {
      const { genai } = require('@google/genai');
      this.client = new genai.Client({
        project: this.projectId,
        location: this.location,
        apiKey: this.apiKey,
      });
      this.logger.log('✅ Google GenAI client initialized');
    } catch (error: any) {
      this.logger.warn(`⚠️ Google GenAI SDK not fully configured: ${error.message}`);
      this.logger.warn('📝 Will use fallback REST API method');
    }

    // Initialize Service Bus client for async processing
    if (this.serviceBusConnection) {
      this.sbClient = new ServiceBusClient(this.serviceBusConnection);
      this.logger.log('✅ Service Bus client initialized');
    } else {
      this.logger.warn('⚠️ Service Bus connection not configured - will process synchronously');
    }
  }

  /**
   * Queue video generation request for async processing (like Sora)
   * Returns immediately with job ID - actual generation happens in background
   */
  async queueVideoGeneration(
    userId: string,
    dto: GenerateVeoVideoDto,
    options?: { useVoice?: boolean; useSubtitles?: boolean; useMusic?: boolean }
  ): Promise<{ jobId: string; status: string }> {
    this.logger.log(`🎬 [${userId}] Queueing VEO3 video generation`);
    
    const jobId = uuidv4();
    
    try {
      // Send message to Service Bus queue
      if (!this.sbClient) {
        throw new Error('Service Bus client not initialized');
      }

      const sender = this.sbClient.createSender(this.serviceBusQueue);
      
      const message = {
        body: {
          jobId,
          userId,
          type: 'veo3-video-generation',
          prompt: dto.prompt,
          duration: dto.videoLength || 5,
          plan: 'pro', // Default plan
          options: options || {},
          timestamp: Date.now(),
        },
      };

      await sender.sendMessages(message);
      await sender.close();

      this.logger.log(`✅ Video generation queued - Job ID: ${jobId}`);
      
      return {
        jobId,
        status: 'queued',
      };

    } catch (error: any) {
      this.logger.error(`❌ Error queuing video: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Call Vertex AI VEO3 API using Google GenAI SDK
   * Modeled after Python example from official documentation
   */
  private async callVeoApiWithSdk(dto: GenerateVeoVideoDto): Promise<any> {
    try {
      this.logger.log(`📡 Sending request to VEO3 via Google GenAI SDK`);
      this.logger.log(`Model: ${this.model}`);
      
      // Import types dynamically (similar to Python's from google.genai import types)
      const genai = require('@google/genai');
      const types = genai.types || genai;
      
      // Create source object (similar to Python's types.GenerateVideosSource)
      const source = {
        prompt: dto.prompt,
      };
      
      // Create config object (similar to Python's types.GenerateVideosConfig)
      const config = {
        aspectRatio: dto.aspectRatio || '16:9',
        number_of_videos: 1, // Default to 1 video
        duration_seconds: dto.videoLength || 5,
        person_generation: 'allow_all',
        generate_audio: false,
        resolution: '720p',
        seed: 0,
      };
      
      this.logger.log(`📋 Source: ${JSON.stringify(source)}`);
      this.logger.log(`📋 Config: ${JSON.stringify(config)}`);
      
      // Generate the video generation request (similar to Python's client.models.generate_videos)
      const operation = await this.client.models.generateVideos(
        this.model,
        source,
        config
      );
      
      this.logger.log(`📥 VEO3 SDK Response - Operation: ${operation.name}`);
      
      return operation;
      
    } catch (error: any) {
      this.logger.error(`❌ VEO3 SDK error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Call Vertex AI VEO3 API using predictLongRunning endpoint
   * Correct URL format: https://us-central1-aiplatform.googleapis.com/v1/projects/{project}/locations/{location}/publishers/google/models/{model}:predictLongRunning
   */
  private async callVeoApi(dto: GenerateVeoVideoDto): Promise<any> {
    // Use predictLongRunning endpoint for asynchronous video generation
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}:predictLongRunning`;
    
    const payload = {
      instances: [
        {
          prompt: dto.prompt,
        },
      ],
      parameters: {
        aspectRatio: dto.aspectRatio || '16:9',
        videoLength: dto.videoLength || 5,
        fps: dto.fps || 24,
        negativePrompt: dto.negativePrompt || 'blurry, low quality, distorted',
      },
    };
    
    this.logger.log(`📡 Sending request to VEO3 LongRunning API: ${endpoint}`);
    this.logger.log(`Model: ${this.model}`);
    this.logger.log(`Payload: ${JSON.stringify(payload, null, 2)}`);
    
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        key: this.apiKey,
      },
    });
    
    this.logger.log(`📥 VEO3 API Response Status: ${response.status}`);
    this.logger.log(`📋 Operation Name: ${response.data.name}`);
    
    return response.data;
  }

  /**
   * Poll for operation completion using Google GenAI SDK or REST API fallback
   * Google VEO3 typically takes 5-15 minutes for video generation
   */
  private async pollForCompletion(operation: any): Promise<any> {
    this.logger.log('⏳ Polling for video generation completion...');
    
    let attempts = 0;
    const maxAttempts = 90; // 15 minutes max (90 * 10s)
    const pollInterval = 10000; // 10 seconds
    
    while (attempts < maxAttempts) {
      attempts++;
      const elapsedTime = Math.round((attempts * pollInterval) / 1000 / 60);
      this.logger.log(`   Poll attempt ${attempts}/${maxAttempts} (${elapsedTime} min elapsed)...`);
      
      try {
        let result;
        
        // Try SDK first
        if (this.client && operation.name) {
          this.logger.log('   🔧 Using SDK for polling');
          result = await this.client.operations.get(operation.name);
        } else {
          this.logger.log('   🔧 Using REST API for polling');
          // Fallback to REST - but we know this doesn't work well
          throw new Error('REST API polling not supported - requires SDK');
        }
        
        // Check if operation is complete
        if (result.done) {
          this.logger.log('✅ Video generation complete!');
          
          // Check for errors in the operation
          if (result.error) {
            throw new Error(`Operation failed: ${JSON.stringify(result.error)}`);
          }
          
          return result;
        }
        
        // Log progress metadata if available
        if (result.metadata) {
          this.logger.log(`   Progress: ${JSON.stringify(result.metadata)}`);
        }
        
        this.logger.log('   Video not ready yet, waiting...');
        
      } catch (error: any) {
        this.logger.warn(`   Poll error: ${error.message}`);
        // Don't fail on transient errors, continue polling
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error('Video generation timeout after 15 minutes. The operation may still be running.');
  }

  /**
   * Extract video bytes from long-running operation response
   */
  private extractVideoData(result: any): Buffer {
    // For LongRunning operations, the response is in result.response
    if (!result.response) {
      throw new Error('No response found in operation result');
    }
    
    const response = result.response;
    
    // Check if videos array exists
    if (!response.generatedVideos || response.generatedVideos.length === 0) {
      throw new Error('No videos generated in response');
    }
    
    const generatedVideo = response.generatedVideos[0];
    
    // Handle different video data formats
    let videoBytes: Buffer;
    
    if (generatedVideo.video?.bytes) {
      // Direct base64 bytes - use b64decode helper function
      this.logger.log('📊 Using direct base64 bytes format');
      videoBytes = b64decode(generatedVideo.video.bytes);
    } else if (generatedVideo.video?.uri) {
      // Video URI - need to download
      throw new Error('Video URI format not yet implemented. Requires GCS download.');
    } else {
      throw new Error('Video data not found in expected format');
    }
    
    this.logger.log(`📊 Video size: ${videoBytes.length} bytes (${(videoBytes.length / 1024 / 1024).toFixed(2)} MB)`);
    
    return videoBytes;
  }

  /**
   * Generate video without queue (for internal/sync use only)
   */
  async generateVideo(dto: GenerateVeoVideoDto): Promise<{ videoUrl: string; filename: string }> {
    // This is for synchronous generation - not recommended for production
    const operation = await this.callVeoApiWithSdk(dto);
    const result = await this.pollForCompletion(operation);
    const videoBytes = this.extractVideoData(result);
    
    const filename = `veo-video-${Date.now()}.mp4`;
    const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);
    const tempDir = path.dirname(tempPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    fs.writeFileSync(tempPath, videoBytes);
    
    const blobUrl = await this.azureBlobService.uploadFileToBlobWithSas(
      tempPath,
      `videos/${filename}`,
      'video/mp4',
    );
    
    return {
      videoUrl: blobUrl,
      filename,
    };
  }
}
