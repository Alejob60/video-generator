// 📁 src/interfaces/dto/generate-promo-image.dto.ts

import { IsOptional, IsString, IsIn } from 'class-validator';

export class GeneratePromoImageDto {
  /**
   * 🧠 Prompt descriptivo para generación de imagen con IA (DALL·E o similar)
   * Ejemplo: "Un zapato deportivo flotando sobre un fondo futurista azul"
   */
  @IsOptional()
  @IsString()
  prompt?: string;

  /**
   * 📝 Texto que se superpondrá sobre la imagen generada (opcional)
   * Ejemplo: "¡Solo por hoy! 20% OFF"
   */
  @IsOptional()
  @IsString()
  textOverlay?: string;

  /**
   * 💼 Plan del usuario que solicita la imagen
   * Se usa para validar el uso de créditos y la expiración del recurso.
   * FREE: 10 créditos por imagen con marca de agua
   * CREATOR / PRO: acceso sin marca o con mayor duración
   */
  @IsString()
  @IsIn(['FREE', 'CREATOR', 'PRO'])
  plan!: 'FREE' | 'CREATOR' | 'PRO';
}
