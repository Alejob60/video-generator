// src/interfaces/controllers/health.controller.ts
import { Controller, Get, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Controller()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly configService: ConfigService) {}

  @Get('/status')
  getStatus() {
    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      service: 'video-generator',
      version: '1.0.0',
    };
  }

  @Get('/health')
  async getHealth() {
    const results: Record<string, string> = {
      llm: 'fail',
      tts: 'fail',
      sora: 'fail',
      blob: 'fail',
      backend: 'fail',
    };

    // Usar try-catch por servicio para evitar que una falla afecte a los demás
    try {
      const gptUrl = this.configService.get<string>('AZURE_OPENAI_GPT_URL');
      const gptKey = this.configService.get<string>('AZURE_OPENAI_KEY');
      if (gptUrl && gptKey) {
        await axios.post(
          gptUrl,
          {
            messages: [{ role: 'user', content: 'ping' }],
            temperature: 0,
            max_tokens: 10,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'api-key': gptKey,
            },
          },
        );
        results.llm = 'ok';
      }
    } catch (e) {
      this.logger.warn('❌ LLM check failed');
    }

    try {
      const ttsUrl = this.configService.get<string>('AZURE_TTS_ENDPOINT');
      const ttsKey = this.configService.get<string>('AZURE_TTS_KEY');
      if (ttsUrl && ttsKey) {
        await axios.post(
          `${ttsUrl}?api-version=2025-03-01-preview`,
          {
            model: 'gpt-4o-mini-tts',
            input: 'ping',
            voice: 'nova',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${ttsKey}`,
            },
          }
        );
        results.tts = 'ok';
      }
    } catch (e) {
      this.logger.warn('❌ TTS check failed');
    }

    try {
      const soraUrl = this.configService.get<string>('SORA_VIDEO_URL');
      if (soraUrl) {
        await axios.post(`${soraUrl}/video/generate`, {
          prompt: 'test video',
          n_seconds: 3,
          height: 64,
          width: 64,
          n_variants: 1,
        });
        results.sora = 'ok';
      }
    } catch (e) {
      this.logger.warn('❌ Sora check failed');
    }

    try {
      const blobKey = this.configService.get<string>('AZURE_STORAGE_KEY');
      if (blobKey) {
        results.blob = 'ok';
      }
    } catch (e) {
      this.logger.warn('❌ Blob check failed');
    }

    try {
      const backend = this.configService.get<string>('MAIN_BACKEND_URL');
      if (backend) {
        const ping = await axios.get(`${backend}/ping`);
        if (ping.status === 200) results.backend = 'ok';
      }
    } catch (e) {
      this.logger.warn('❌ Backend check failed');
    }

    const status = Object.values(results).every((r) => r === 'ok') ? 'ok' : 'degraded';

    return {
      status,
      services: results,
      timestamp: new Date().toISOString(),
    };
  }
}
