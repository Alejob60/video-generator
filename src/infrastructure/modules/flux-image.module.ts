// src/infrastructure/modules/flux-image.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { FluxImageService } from '../services/flux-image.service';
import { AzureBlobService } from '../services/azure-blob.service';
import { LLMService } from '../services/llm.service';
import { FluxImageController } from '../../interfaces/controllers/flux-image.controller';
import { PromoImageModule } from './promo-image.module';

@Module({
  imports: [forwardRef(() => PromoImageModule)],
  controllers: [FluxImageController],
  providers: [FluxImageService, AzureBlobService, LLMService],
  exports: [FluxImageService],
})
export class FluxImageModule {}