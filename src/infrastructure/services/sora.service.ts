import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AzureBlobService } from './azure-blob.service';

@Injectable()
export class SoraService {
  private readonly logger = new Logger(SoraService.name);
  private readonly endpoint = process.env.AZURE_SORA_URL!;
  private readonly deployment = process.env.AZURE_SORA_DEPLOYMENT!;
  private readonly apiVersion = process.env.AZURE_SORA_API_VERSION || '2025-02-15-preview';
  private readonly apiKey = process.env.AZURE_SORA_API_KEY!;

  constructor(
    private readonly azureBlobService: AzureBlobService
  ) {}

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'api-key': this.apiKey,
    };
  }

  async createVideoJob(prompt: string, duration: number): Promise<string> {
    const url = `${this.endpoint}/openai/deployments/${this.deployment}/video/generations/jobs?api-version=${this.apiVersion}`;
    this.logger.log(`🌐 Enviando POST a: ${url}`);
    this.logger.log(`🚀 Prompt enviado: ${prompt}`);

    const body = {
      prompt: prompt,
      n_seconds: duration,
      n_variants: 1,
      height: 720,
      width: 1280,
    };

    try {
      const response = await axios.post(url, body, { headers: this.getHeaders() });
      const jobId = response.data.id;
      this.logger.log(`📨 Job de video creado con ID: ${jobId}`);
      return jobId;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error('❌ Error creando el job de video en Sora:', error.response?.data || error.message);
      } else {
        this.logger.error('❌ Error inesperado:', error);
      }
      throw new Error('Fallo al crear el job de video en Sora');
    }
  }

  async waitForVideo(jobId: string): Promise<{ url: string }> {
    const statusUrl = `${this.endpoint}/openai/deployments/${this.deployment}/video/generations/jobs/${jobId}?api-version=${this.apiVersion}`;
    const maxAttempts = 60;
    const intervalMs = 5000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      this.logger.log(`⏳ Esperando video (intento ${attempt})...`);
      await new Promise((resolve) => setTimeout(resolve, intervalMs));

      const response = await axios.get(statusUrl, { headers: this.getHeaders() });
      const status = response.data.status;
      this.logger.log(`🛰 Estado actual del job: ${status}`);

      if (status === 'succeeded') {
        const generations = response.data.generations ?? [];
        this.logger.debug(`📦 Respuesta completa del job:\n${JSON.stringify(response.data, null, 2)}`);

        if (generations.length > 0) {
          const generationId = generations[0].id;

          const videoUrl = `${this.endpoint}/openai/deployments/${this.deployment}/video/generations/${generationId}/content/video?api-version=${this.apiVersion}`;

          this.logger.log(`🎬 Generation ID: ${generationId}`);
          this.logger.log(`🔗 URL del video: ${videoUrl}`);
          this.logger.log('⏱ Esperando 15 segundos adicionales para disponibilidad del archivo...');
          await new Promise((resolve) => setTimeout(resolve, 15000));

          return { url: videoUrl };
        } else {
          this.logger.warn('⚠️ El video fue marcado como generado pero no se devolvió ninguna generación.');
          throw new Error('Video generado pero sin contenido accesible.');
        }
      } else if (status === 'failed') {
        this.logger.error(`❌ Job ${jobId} fallido:`, JSON.stringify(response.data, null, 2));
        throw new Error('La generación del video falló.');
      }
    }

    throw new Error('⏰ Tiempo agotado esperando el video de Sora.');
  }

  async uploadVideoToBlob(videoUrl: string, filename: string): Promise<string> {
    const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);
    this.logger.log(`⬇️ Descargando video temporalmente: ${tempPath}`);
    this.logger.log(`📡 Desde: ${videoUrl}`);

    const response = await axios.get(videoUrl, {
      responseType: 'arraybuffer',
      headers: {
        ...this.getHeaders(),
        Accept: 'video/mp4',
      },
    });

    fs.writeFileSync(tempPath, response.data);
    this.logger.log('📦 Video descargado localmente.');

    const blobUrl = await this.azureBlobService.uploadFileToBlob(tempPath, filename, 'video/mp4');
    fs.unlinkSync(tempPath);

    this.logger.log(`☁️ Video subido a Azure Blob: ${blobUrl}`);
    return blobUrl;
  }

  async generateAndUploadVideo(prompt: string, duration: number): Promise<{
    blobUrl: string;
    jobId: string;
  }> {
    const jobId = await this.createVideoJob(JSON.stringify(prompt), duration);
    const { url: videoUrl } = await this.waitForVideo(jobId);
    const filename = `video-${uuidv4()}.mp4`;
    const blobUrl = await this.uploadVideoToBlob(videoUrl, filename);

    return {
      blobUrl,
      jobId,
    };
  }
}
