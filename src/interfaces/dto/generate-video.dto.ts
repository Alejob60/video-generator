// 📁 src/interfaces/dto/generate-video.dto.ts

import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  IsDefined,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GenerateVideoDto {
  /**
   * 🎯 Prompt original ingresado por el usuario
   * Puede ser un string o un objeto JSON
   */
  @IsDefined()
  prompt!: Record<string, any> | string;

  /**
   * 🔊 ¿Incluir narración generada con TTS?
   * true = incluir narración usando Azure TTS (voz Nova)
   */
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  useVoice!: boolean;

  /**
   * 💬 ¿Incluir subtítulos en el video?
   * true = genera archivo .srt sincronizado con el libreto
   */
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  useSubtitles!: boolean;

  /**
   * 🎵 ¿Incluir música de fondo?
   * true = (solo visible en V2) combina música y audio narrado
   */
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  useMusic!: boolean;

  /**
   * 🎥 ¿Usar el modelo Sora para generar el video?
   * true = usa Azure OpenAI Video (Sora), false = pipeline interno
   */
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  useSora!: boolean;

  /**
   * 💼 Plan del usuario que hace la solicitud
   * Se usa para control de créditos y expiración (ej. FREE vs PRO)
   */
  @IsString()
  @IsIn(['free', 'creator', 'pro'])
  plan!: 'free' | 'creator' | 'pro';

  /**
   * ⏱️ Duración deseada del video (en segundos)
   * Rango permitido: 5s - 20s (ajustable por plan)
   */
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(5)
  @Max(20)
  n_seconds?: number;
}
