// 📁 src/interfaces/dto/generate-audio.dto.ts

import { IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class GenerateAudioDto {
  /**
   * 🎙️ Prompt base ingresado por el usuario para generar un libreto y convertirlo en voz
   * Ejemplo: "Explica en 30 segundos cómo funciona la energía solar"
   */
  @IsString()
  @MinLength(3, { message: 'El prompt debe tener al menos 3 caracteres' })
  prompt!: string;

  /**
   * ⏱️ Duración deseada del audio generado (opcional)
   * El sistema ajustará el libreto automáticamente para que encaje en esta duración.
   * Valores permitidos: 20, 30 o 60 segundos
   */
  @IsOptional()
  @IsIn([20, 30, 60], { message: 'La duración debe ser 20, 30 o 60 segundos' })
  duration?: number;
}
