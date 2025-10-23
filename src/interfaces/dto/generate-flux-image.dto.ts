// 📁 src/interfaces/dto/generate-flux-image.dto.ts

import { IsString, IsOptional, IsIn, IsBoolean } from 'class-validator';

export class GenerateFluxImageDto {
  /**
   * 🧠 Prompt descriptivo para generación de imagen con FLUX-1.1-pro
   * Ejemplo: "A majestic lion in the savannah at sunset"
   */
  @IsString()
  prompt!: string;

  /**
   * 💼 Plan del usuario que solicita la imagen
   * Se usa para validar el uso de créditos y la expiración del recurso.
   */
  @IsString()
  @IsIn(['FREE', 'CREATOR', 'PRO'])
  plan!: 'FREE' | 'CREATOR' | 'PRO';

  /**
   * 📐 Tamaño de la imagen a generar
   * Opciones: 1024x1024, 1024x768, 768x1024
   */
  @IsOptional()
  @IsString()
  @IsIn(['1024x1024', '1024x768', '768x1024'])
  size?: '1024x1024' | '1024x768' | '768x1024';
  
  /**
   * 📦 Indica si el prompt ya está en formato JSON y no necesita ser mejorado
   */
  @IsOptional()
  @IsBoolean()
  isJsonPrompt?: boolean;

  /**
   * 🚫 Prompt negativo para excluir elementos de la imagen
   * Ejemplo: "blurry, low quality, text, watermark"
   */
  @IsOptional()
  @IsString()
  negative_prompt?: string;
}