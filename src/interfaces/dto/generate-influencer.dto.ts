// 📁 src/interfaces/dto/generate-influencer.dto.ts

import { IsString, IsIn, IsUrl, MinLength } from 'class-validator';

export class GenerateInfluencerDto {
  /**
   * 🖼️ URL de la imagen del rostro del influencer
   * Ejemplo: "https://storage.example.com/avatars/influencer1.jpg"
   */
  @IsUrl()
  imageUrl!: string;

  /**
   * 📝 Script que el influencer debe decir
   * Ejemplo: "Hola, soy tu asistente virtual y hoy te hablaré sobre IA..."
   */
  @IsString()
  @MinLength(10, { message: 'El script debe tener al menos 10 caracteres' })
  script!: string;

  /**
   * 🗣️ ID de la voz a utilizar para el audio
   * Ejemplo: "nova", "jenny", "david"
   */
  @IsString()
  @MinLength(1, { message: 'El ID de voz es requerido' })
  voiceId!: string;

  /**
   * 💼 Plan del usuario que solicita el video
   * Se usa para control de créditos y limitaciones
   */
  @IsString()
  @IsIn(['free', 'pro'])
  plan!: 'free' | 'pro';
}