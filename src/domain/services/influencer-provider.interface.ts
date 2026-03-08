// 📁 src/domain/services/influencer-provider.interface.ts

import { GenerateInfluencerDto } from '../../interfaces/dto/generate-influencer.dto';

export interface IInfluencerProvider {
  /**
   * Autentica con la API de influencer externa
   * @returns Promise<boolean> - true si la autenticación es exitosa
   */
  authenticate(): Promise<boolean>;

  /**
   * Inicia la generación de un video de influencer
   * @param dto - Datos para la generación del video
   * @returns Promise<{ jobId: string, status: string }> - ID del trabajo y estado inicial
   */
  generateVideoJob(dto: GenerateInfluencerDto): Promise<{ jobId: string, status: string }>;
}