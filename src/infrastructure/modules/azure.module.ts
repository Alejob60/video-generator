// src/infrastructure/modules/azure.module.ts
import { Module } from '@nestjs/common';
import { AzureBlobService } from '../services/azure-blob.service';

@Module({
  providers: [AzureBlobService],
  exports: [AzureBlobService],
})
export class AzureModule {}
