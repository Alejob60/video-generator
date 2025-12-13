// 📁 src/infrastructure/modules/flux-kontext-image.module.ts

import { Module } from '@nestjs/common';
import { FluxKontextImageService } from '../services/flux-kontext-image.service';
import { AzureBlobService } from '../services/azure-blob.service';
import { LLMService } from '../services/llm.service';
import { FluxKontextImageController } from '../../interfaces/controllers/flux-kontext-image.controller';

@Module({
  imports: [],
  controllers: [FluxKontextImageController],
  providers: [
    FluxKontextImageService,
    AzureBlobService,
    LLMService,
  ],
  exports: [
    FluxKontextImageService,
  ],
})
export class FluxKontextImageModule {}