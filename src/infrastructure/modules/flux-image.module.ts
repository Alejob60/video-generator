// src/infrastructure/modules/flux-image.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { FluxImageService } from '../services/flux-image.service';
import { FluxKontextImageService } from '../services/flux-kontext-image.service';
import { Flux2ProService } from '../services/flux-2-pro.service';
import { AzureBlobService } from '../services/azure-blob.service';
import { LLMService } from '../services/llm.service';
import { FluxImageController } from '../../interfaces/controllers/flux-image.controller';
import { PromoImageModule } from './promo-image.module';

@Module({
  imports: [forwardRef(() => PromoImageModule)],
  controllers: [FluxImageController],
  providers: [
    FluxImageService, 
    FluxKontextImageService, 
    Flux2ProService,
    AzureBlobService, 
    LLMService
  ],
  exports: [FluxImageService, FluxKontextImageService, Flux2ProService],
})
export class FluxImageModule {}