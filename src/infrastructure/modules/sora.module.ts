// src/infrastructure/modules/sora.module.ts
import { Module } from '@nestjs/common';
import { SoraService } from '../services/sora.service';
import { AzureBlobService } from '../services/azure-blob.service';
import { LLMService } from '../services/llm.service';
import { SoraVideoClientService } from '../services/sora-video-client.service';
@Module({
  providers: [SoraService, AzureBlobService, LLMService, SoraVideoClientService],
  exports: [SoraService, SoraVideoClientService],
})
export class SoraModule {}
