import { Module } from '@nestjs/common';
import { LLMController } from '../../interfaces/controllers/llm.controller';
import { LLMService } from '../services/llm.service';

@Module({
  controllers: [LLMController],
  providers: [LLMService],
  exports: [LLMService], // si otros módulos lo necesitan
})
export class LLMModule {}
