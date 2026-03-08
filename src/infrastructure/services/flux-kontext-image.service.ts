import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AzureBlobService } from './azure-blob.service';
import { LLMService } from './llm.service';
import { GenerateFluxImageDto } from '../../interfaces/dto/generate-flux-image.dto';
import { DefaultAzureCredential } from '@azure/identity';
import FormData from 'form-data';

@Injectable()
export class FluxKontextImageService {
  private readonly logger = new Logger(FluxKontextImageService.name);
  private readonly generationsEndpoint = `${process.env.ENDPOINT_FLUX_KONTENT_PRO}/openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview`;
  private readonly apiKey = process.env.ENDPOINT_FLUX_KONTENT_PRO_API_KEY || '';
  private readonly editsEndpointBase = `${process.env.ENDPOINT_FLUX_KONTENT_PRO}/openai/deployments/FLUX.1-Kontext-pro/images/edits`;
  private readonly apiVersion = '2025-04-01-preview';
  private readonly backendUrl = process.env.MAIN_BACKEND_URL!;

  constructor(
    private readonly azureBlobService: AzureBlobService,
    private readonly llmService: LLMService,
  ) {}

  /**
   * Generate image with FLUX.1-Kontext-pro and notify backend
   */
  async generateImageAndNotify(
    userId: string, 
    dto: GenerateFluxImageDto, 
    referenceImagePath?: string
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

    // Get Azure AD token for authentication
    const credential = new DefaultAzureCredential();
    const tokenResponse = await credential.getToken('https://cognitiveservices.azure.com/.default');
    
    let response: any;

    try {
      if (referenceImagePath) {
        // Use edits endpoint with reference image
        const editsUrl = `${this.editsEndpointBase}?api-version=${this.apiVersion}`;
        const formData = new FormData();
        
        formData.append('prompt', finalPrompt);
        formData.append('n', '1');
        formData.append('size', dto.size || '1024x1024');
        formData.append('image', fs.createReadStream(referenceImagePath));

        this.logger.log(`📡 Sending edit request to FLUX.1-Kontext-pro with prompt: ${finalPrompt}`);
        
        response = await axios.post(editsUrl, formData, {
          headers: {
            'Authorization': `Bearer ${tokenResponse.token}`,
            ...formData.getHeaders(),
          },
        });
      } else {
        // Use generations endpoint (no reference image)
        const generationsUrl = this.generationsEndpoint;
        const payload = {
          prompt: finalPrompt,
          output_format: 'png',
          n: 1,
          size: dto.size || '1024x1024',
        };

        this.logger.log(`📡 Sending request to FLUX.1-Kontext-pro with payload: ${JSON.stringify(payload, null, 2)}`);
        
        response = await axios.post(generationsUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenResponse.token}`,
          },
          responseType: 'json',
        });
      }

      this.logger.log(`📥 FLUX API Response Status: ${response.status}`);
      
      // Extract image data from response
      const choices = response.data.choices;
      if (!choices || choices.length === 0) {
        throw new Error('No image data received from FLUX API');
      }

      const imageData = choices[0];
      
      this.logger.log(`📊 FLUX API Response - Has URL: ${!!imageData.url}, Has b64_json: ${!!imageData.b64_json}`);

      // Handle image data (URL or base64)
      let blobUrl: string;
      let filename: string;

      if (imageData.url) {
        this.logger.log(`🌐 Image URL provided by FLUX: ${imageData.url}`);
        filename = `flux-kontext-image-${uuidv4()}.png`;
        blobUrl = await this.azureBlobService.uploadFileFromUrlWithSas(imageData.url, `images/${filename}`);
        this.logger.log(`✅ Image uploaded to Azure Blob Storage from URL with SAS: ${blobUrl}`);
      } else if (imageData.b64_json) {
        this.logger.log(`📝 Base64 data provided by FLUX, length: ${imageData.b64_json.length}`);
        
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
        
        filename = `flux-kontext-image-${uuidv4()}.png`;
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
        throw new Error('Unexpected response format from FLUX API - no URL or base64 data found');
      }

      // Notify main backend
      this.logger.log(`🔔 Notifying main backend about generated image`);
      await fetch(`${this.backendUrl}/flux-kontext-image/complete`, {
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
      this.logger.error('❌ Error generating image with FLUX.1-Kontext-pro:', error);
      throw new Error(`Failed to generate image with FLUX: ${error.message || error}`);
    }
  }

  /**
   * Generate image without notification (for internal use)
   */
  async generateImage(
    dto: GenerateFluxImageDto, 
    referenceImagePath?: string
  ): Promise<{ imageUrl: string; filename: string }> {
    const result = await this.generateImageAndNotify('internal', dto, referenceImagePath);
    return {
      imageUrl: result.imageUrl,
      filename: result.filename,
    };
  }
}
