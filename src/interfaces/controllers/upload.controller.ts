// 📁 src/interfaces/controllers/upload.controller.ts

import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AzureBlobService } from '../../infrastructure/services/azure-blob.service';
import * as path from 'path';

@Controller('')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(
    private readonly azureBlobService: AzureBlobService,
  ) {}

  /**
   * POST /upload
   * Upload image file to Azure Blob Storage
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      this.logger.log(`📤 Uploading file: ${file.originalname}`);

      if (!file) {
        throw new Error('No file provided');
      }

      // Generate filename with timestamp
      const ext = path.extname(file.originalname);
      const filename = `misy-image-${Date.now()}${ext}`;

      // Upload to Azure Blob Storage with SAS
      this.logger.log(`📤 Uploading to Azure Blob Storage with SAS`);
      const imageUrl = await this.azureBlobService.uploadFileToBlobWithSas(
        file.path,
        `images/${filename}`,
      );

      this.logger.log(`✅ File uploaded successfully: ${imageUrl}`);

      return {
        success: true,
        imageUrl,
        filename,
      };
    } catch (error: any) {
      this.logger.error(`❌ Upload error: ${error.message}`, error.stack);
      
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
}
