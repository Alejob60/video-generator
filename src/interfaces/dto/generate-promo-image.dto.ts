// 📁 src/interfaces/dto/generate-promo-image.dto.ts

import { IsOptional, IsString, IsIn, IsBoolean } from 'class-validator';

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

  /**
   * 🔀 Usar FLUX-1.1-pro en lugar de DALL·E para la generación de imágenes
   * Cuando es true, utiliza el modelo FLUX-1.1-pro para generar la imagen
   * Cuando es false o no se especifica, utiliza DALL·E
   */
  @IsOptional()
  @IsBoolean()
  useFlux?: boolean;
  
  /**
   * 📦 Indica si el prompt ya está en formato JSON y no necesita ser mejorado
   */
  @IsOptional()
  @IsBoolean()
  isJsonPrompt?: boolean;
}