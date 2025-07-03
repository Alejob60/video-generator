import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SoraVideoClientService {
  private readonly logger = new Logger(SoraVideoClientService.name);
  private readonly endpoint = process.env.SORA_VIDEO_URL!; // debe ser: https://sora-video-creator... sin /video/generate

  async requestVideo(
    prompt: string,
    duration: number
  ): Promise<{
    job_id: string;
    generation_id: string;
    video_url: string;
    file_name: string;
    duration: number;
  }> {
    const body = {
      prompt,
      n_seconds: duration,
      height: 720,
      width: 1280,
      n_variants: 1,
    };

    try {
      this.logger.log(`🎥 Enviando solicitud a microservicio Sora con prompt mejorado:\n${prompt}`);

      const response = await axios.post(`${this.endpoint}/video/generate`, body, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { job_id, generation_id, video_url, file_name, duration } = response.data;

      if (!video_url || !job_id || !generation_id) {
        this.logger.error(`❌ Respuesta incompleta desde Sora: ${JSON.stringify(response.data)}`);
        throw new Error('La respuesta del microservicio Sora no contiene los campos esperados.');
      }

      this.logger.log(`✅ Video generado exitosamente: ${video_url}`);

      return {
        job_id,
        generation_id,
        video_url,
        file_name,
        duration,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error('❌ Axios error al contactar Sora:', error.response?.data || error.message);
      } else if (error instanceof Error) {
        this.logger.error('❌ Error al contactar Sora:', error.message);
      } else {
        this.logger.error('❌ Error desconocido al contactar Sora:', error);
      }
      throw new Error('Error al generar video en el microservicio Sora.');
    }
  }
}
