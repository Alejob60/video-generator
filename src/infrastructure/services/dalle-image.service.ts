// 📁 src/infrastructure/services/dalle-image.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { AzureBlobService } from './azure-blob.service';

@Injectable()
export class DalleImageService {
  private readonly logger = new Logger(DalleImageService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  /**
   * Generate image using DALL-E 3
   */
  async generateImage(prompt: string, plan: string): Promise<{ imageUrl: string; filename: string }> {
    try {
      this.logger.log(`🎨 Generating DALL-E 3 image with prompt: ${prompt}`);

      const apiKey = this.configService.get<string>('DALLE_API_KEY');
      
      if (!apiKey) {
        throw new Error('DALLE_API_KEY not configured');
      }

      // Call DALL-E API
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`✅ DALL-E API response received`);

      const imageUrl = response.data.data[0].url;
      this.logger.log(`🌐 DALL-E image URL: ${imageUrl}`);

      // Download image from DALL-E URL
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(imageResponse.data);

      // Generate filename
      const timestamp = Date.now();
      const filename = `promo_${timestamp}.png`;
      const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);

      // Ensure temp directory exists
      const tempDir = path.dirname(tempPath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Save temporarily
      fs.writeFileSync(tempPath, buffer);
      this.logger.log(`💾 Image saved to temp: ${tempPath}`);

      // Upload to Azure Blob Storage with SAS
      this.logger.log(`📤 Uploading to Azure Blob Storage with SAS`);
      const blobUrl = await this.azureBlobService.uploadFileToBlobWithSas(tempPath, `images/${filename}`);
      this.logger.log(`✅ Image uploaded to Azure: ${blobUrl}`);

      // Clean up temp file
      fs.unlinkSync(tempPath);
      this.logger.log(`🗑️ Temp file deleted: ${tempPath}`);

      return {
        imageUrl: blobUrl,
        filename,
      };
    } catch (error: any) {
      this.logger.error(`❌ DALL-E generation error: ${error.message}`, error.stack);
      throw new Error(`DALL-E generation failed: ${error.message}`);
    }
  }
}
