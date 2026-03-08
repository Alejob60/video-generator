// 📁 src/interfaces/dto/extract-website-dna.dto.ts
import { IsString, IsUrl, IsEnum, IsOptional, Length } from 'class-validator';

export enum ExtractionMode {
  FULL = 'full',
  VISUAL = 'visual', 
  CONTENT = 'content',
  STRUCTURE = 'structure'
}

export class ExtractWebsiteDnaDto {
  @IsUrl({}, { message: 'La URL debe ser válida' })
  @Length(1, 2048, { message: 'La URL no puede exceder 2048 caracteres' })
  url!: string;

  @IsOptional()
  @IsString({ message: 'La estructura HTML debe ser una cadena de texto' })
  html_structure?: string;

  @IsOptional()
  @IsEnum(ExtractionMode, { 
    message: `Modo de extracción inválido. Valores permitidos: ${Object.values(ExtractionMode).join(', ')}`
  })
  extraction_mode?: ExtractionMode;

  @IsString({ message: 'El plan es requerido' })
  @IsEnum(['FREE', 'CREATOR', 'PRO'], { 
    message: 'Plan inválido. Valores permitidos: FREE, CREATOR, PRO' 
  })
  plan!: string;

  @IsOptional()
  @IsString()
  screenshot_base64?: string;
}