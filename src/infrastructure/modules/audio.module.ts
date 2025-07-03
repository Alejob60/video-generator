import { Module } from '@nestjs/common';
import { AudioController } from '../../interfaces/controllers/audio.controller';
import { AudioGeneratorService } from '../../infrastructure/services/audio-generator.service';
import { AzureTTSService } from '../../infrastructure/services/azure-tts.service';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.service';
import { LLMService } from '../../infrastructure/services/llm.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm'; // 👈 necesario

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [AudioController],
  providers: [
    AudioGeneratorService,
    AzureTTSService,
    AzureBlobService,
    LLMService,
  ],
  exports: [AzureTTSService],
})
export class AudioModule {}
