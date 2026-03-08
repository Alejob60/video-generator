import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AzureBlobService } from './azure-blob.service';
import { LLMService } from './llm.service';
import { GenerateFluxImageDto } from '../../interfaces/dto/generate-flux-image.dto';

@Injectable()
export class Flux2ProService {
  private readonly logger = new Logger(Flux2ProService.name);
  private readonly endpoint = process.env.FLUX_2_PRO_ENDPOINT!;
  private readonly apiKey = process.env.FLUX_2_PRO_API_KEY || '';
  private readonly backendUrl = process.env.MAIN_BACKEND_URL!;

  constructor(
    private readonly azureBlobService: AzureBlobService,
    private readonly llmService: LLMService,
  ) {}

  /**
   * Generate image with FLUX 2 Pro and notify backend
   */
  async generateImageAndNotify(
    userId: string, 
    dto: GenerateFluxImageDto
  ): Promise<{ imageUrl: string; filename: string; prompt: string }> {
    let finalPrompt = dto.prompt;
    
    // Process JSON prompt if needed
    if (dto.isJsonPrompt) {
      try {
        finalPrompt = await this.llmService.improveImagePrompt(dto.prompt);
        this.logger.log(`📋 Converted JSON prompt to natural language with LLM: ${finalPrompt}`);
      } catch (error: any) {
        this.logger.warn(`⚠️ Failed to convert JSON prompt with LLM, using as-is: ${error.message}`);
        finalPrompt = dto.prompt;
      }
    }

    this.logger.log(`📋 Using prompt: ${finalPrompt}`);

    const payload = {
      model: 'flux-2-pro',
      prompt: finalPrompt,
      output_format: 'png',
      n: 1,
      size: dto.size || '1024x1024',
    };

    try {
      this.logger.log(`📡 Sending request to FLUX 2 Pro with payload: ${JSON.stringify(payload, null, 2)}`);
      
      const response = await axios.post(this.endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        responseType: 'json',
      });

      this.logger.log(`📥 FLUX 2 Pro API Response Status: ${response.status}`);
      
      // Extract image data from response
      let imageData: any;
      
      if (response.data.choices && response.data.choices.length > 0) {
        imageData = response.data.choices[0];
      } else if (response.data.data && response.data.data.length > 0) {
        imageData = response.data.data[0];
      } else {
        throw new Error('No image data received from FLUX 2 Pro API');
      }
      
      this.logger.log(`📊 FLUX 2 Pro Response - Has URL: ${!!imageData.url}, Has b64_json: ${!!imageData.b64_json}`);

      // Handle image data (URL or base64)
      let blobUrl: string;
      let filename: string;

      if (imageData.url) {
        this.logger.log(`🌐 Image URL provided by FLUX 2 Pro: ${imageData.url}`);
        filename = `flux-2-pro-image-${uuidv4()}.png`;
        blobUrl = await this.azureBlobService.uploadFileFromUrlWithSas(imageData.url, `images/${filename}`);
        this.logger.log(`✅ Image uploaded to Azure Blob Storage from URL with SAS: ${blobUrl}`);
      } else if (imageData.b64_json) {
        this.logger.log(`📝 Base64 data provided by FLUX 2 Pro, length: ${imageData.b64_json.length}`);
        
        // Validate and decode base64
        const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(imageData.b64_json);
        this.logger.log(`🔍 Base64 validation result: ${isValidBase64}`);
        
        const cleanBase64 = imageData.b64_json.replace(/\s/g, '');
        const buffer = Buffer.from(cleanBase64, 'base64');
        
        this.logger.log(`💾 Decoded buffer size: ${buffer.length} bytes`);
        
        // Validate PNG header
        const pngHeader = buffer.slice(0, 8);
        const isPng = pngHeader.equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
        this.logger.log(`🔍 PNG header validation: ${isPng ? 'Valid PNG' : 'Invalid PNG header'}`);
        
        filename = `flux-2-pro-image-${uuidv4()}.png`;
        const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);
        
        // Ensure temp directory exists
        const tempDir = path.dirname(tempPath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Save temporarily and upload
        fs.writeFileSync(tempPath, buffer);
        this.logger.log(`💾 Writing image to temporary file: ${tempPath}`);
        
        blobUrl = await this.azureBlobService.uploadFileToBlobWithSas(tempPath, `images/${filename}`, 'image/png');
        this.logger.log(`✅ Image uploaded to Azure Blob Storage with SAS: ${blobUrl}`);
        this.logger.log(`💾 Keeping temporary file in temp folder: ${tempPath}`);
      } else {
        throw new Error('Unexpected response format from FLUX 2 Pro API - no URL or base64 data found');
      }

      // Notify main backend
      this.logger.log(`🔔 Notifying main backend about generated image`);
      await fetch(`${this.backendUrl}/flux-2-pro-image/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          prompt: finalPrompt,
          imageUrl: blobUrl,
          filename,
        }),
      });

      return {
        imageUrl: blobUrl,
        filename,
        prompt: finalPrompt,
      };
    } catch (error: any) {
      this.logger.error('❌ Error generating image with FLUX 2 Pro:', error);
      throw new Error(`Failed to generate image with FLUX 2 Pro: ${error.message || error}`);
    }
  }

  /**
   * Generate image without notification (for internal use)
   */
  async generateImage(dto: GenerateFluxImageDto): Promise<{ imageUrl: string; filename: string }> {
    const result = await this.generateImageAndNotify('internal', dto);
    return {
      imageUrl: result.imageUrl,
      filename: result.filename,
    };
  }
}
