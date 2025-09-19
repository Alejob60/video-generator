import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { LLMService } from '../../infrastructure/services/llm.service';

interface GeneratePromptDto {
  prompt: string;
  duration?: number;
  useJson?: boolean;
}

@Controller('llm')
export class LLMController {
  private readonly logger = new Logger(LLMController.name);

  constructor(
    private readonly llmService: LLMService,

  ) {}

  // 🔹 Endpoint específico para obtener prompt JSON editable
  @Post('generate-json')
  async generatePromptJson(@Body() dto: GeneratePromptDto, @Req() req: Request) {
    const userId = (req as any)?.user?.id || 'admin';
    if (!dto.prompt || dto.prompt.trim().length < 5) {
      throw new HttpException('El prompt debe tener al menos 5 caracteres.', HttpStatus.BAD_REQUEST);
    }

    try {
      this.logger.log(`📝 [${userId}] Generando JSON editable del prompt`);
      const improvedPrompt = await this.llmService.improveVideoPrompt(dto.prompt.trim());
      const jsonEditable = JSON.stringify(improvedPrompt, null, 2);

      return { success: true, message: 'Prompt JSON generado', result: { promptJson: jsonEditable } };
    } catch (err) {
      this.logger.error(`❌ Error generando JSON: ${err instanceof Error ? err.message : err}`);
      return { success: false, message: 'Error interno generando prompt JSON' };
    }
  }
}
