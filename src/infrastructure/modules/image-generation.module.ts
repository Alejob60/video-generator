// 📁 src/infrastructure/modules/image-generation.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FluxKontextImageController } from '../../interfaces/controllers/flux-kontext-image.controller';
import { DalleImageController } from '../../interfaces/controllers/dalle-image.controller';
import { UploadController } from '../../interfaces/controllers/upload.controller';
import { FluxKontextImageService } from '../services/flux-kontext-image.service';
import { DalleImageService } from '../services/dalle-image.service';
import { AzureBlobService } from '../services/azure-blob.service';
import { LLMService } from '../services/llm.service';

@Module({
  imports: [ConfigModule],
  controllers: [FluxKontextImageController, DalleImageController, UploadController],
  providers: [FluxKontextImageService, DalleImageService, AzureBlobService, LLMService],
  exports: [FluxKontextImageService, DalleImageService, LLMService],
})
export class ImageGenerationModule {}
