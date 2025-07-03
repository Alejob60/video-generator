// src/interfaces/controllers/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Controller()
export class HealthController {
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

    try {
      // 🔍 LLM (GPT)
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

      // 🔍 TTS
      const ttsUrl = this.configService.get<string>('AZURE_TTS_ENDPOINT');
      const ttsKey = this.configService.get<string>('AZURE_TTS_KEY');
      if (ttsUrl && ttsKey) {
        await axios.post(
          `${ttsUrl}/audio/speech?api-version=2025-03-01-preview`,
          `<speak><voice name="nova">ping</voice></speak>`,
          {
            headers: {
              'Content-Type': 'application/ssml+xml',
              'Ocp-Apim-Subscription-Key': ttsKey,
            },
          },
        );
        results.tts = 'ok';
      }

      // 🔍 Sora
      const soraUrl = this.configService.get<string>('SORA_VIDEO_URL');
      if (soraUrl) {
        await axios.post(`${soraUrl}/video/generate`, {
          prompt: 'test video',
          n_seconds: 5,
          height: 128,
          width: 128,
          n_variants: 1,
        });
        results.sora = 'ok';
      }

      // 🔍 Blob Storage (solo valida que haya clave cargada)
      const blobKey = this.configService.get<string>('AZURE_STORAGE_KEY');
      if (blobKey) {
        results.blob = 'ok';
      }

      // 🔍 Backend Principal
      const backend = this.configService.get<string>('MAIN_BACKEND_URL');
      if (backend) {
        const ping = await axios.get(`${backend}/ping`);
        if (ping.status === 200) results.backend = 'ok';
      }
    } catch (error) {
      // Evitar crasheos por error en uno de los servicios
    }

    return {
      status: Object.values(results).every((r) => r === 'ok') ? 'ok' : 'degraded',
      services: results,
      timestamp: new Date().toISOString(),
    };
  }
}
