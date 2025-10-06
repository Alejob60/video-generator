// src/infrastructure/modules/promo-image.module.ts
import { Module } from '@nestjs/common';
import { PromoImageService } from '../services/promo-image.service';
import { AzureBlobService } from '../services/azure-blob.service';
import { LLMService } from '../services/llm.service';
import { PromoImageController } from '../../interfaces/controllers/promo-image.controller';
import { FluxImageService } from '../services/flux-image.service';

@Module({
  controllers: [PromoImageController],
  providers: [PromoImageService, AzureBlobService, LLMService, FluxImageService],
  exports: [PromoImageService,LLMService],
})
export class PromoImageModule {}