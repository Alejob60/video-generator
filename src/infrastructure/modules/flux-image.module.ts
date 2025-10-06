// src/infrastructure/modules/flux-image.module.ts
import { Module } from '@nestjs/common';
import { FluxImageService } from '../services/flux-image.service';
import { AzureBlobService } from '../services/azure-blob.service';
import { LLMService } from '../services/llm.service';
import { FluxImageController } from '../../interfaces/controllers/flux-image.controller';

@Module({
  controllers: [FluxImageController],
  providers: [FluxImageService, AzureBlobService, LLMService],
  exports: [FluxImageService],
})
export class FluxImageModule {}