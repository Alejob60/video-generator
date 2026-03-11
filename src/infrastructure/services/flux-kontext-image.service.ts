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
import { OpenAI } from 'openai';

@Injectable()
export class FluxKontextImageService {
  private readonly logger = new Logger(FluxKontextImageService.name);
  private readonly baseURL = process.env.FLUX_KONTEXT_PRO_BASE_URL || 'https://labsc-m9j5kbl9-eastus2.services.ai.azure.com';
  private readonly deployment = process.env.FLUX_KONTEXT_PRO_DEPLOYMENT || 'FLUX.1-Kontext-pro';
  private readonly apiVersion = '2025-04-01-preview';
  private readonly apiKey = process.env.FLUX_KONTEXT_PRO_API_KEY || '';
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

    // Use API Key for authentication (Bearer token)
    const authHeader = `Bearer ${this.apiKey}`;
    
    let response: any;

    try {
      if (referenceImagePath) {
        // Use edits endpoint with reference image
        const editsPath = `openai/deployments/${this.deployment}/images/edits`;
        const editsUrl = `${this.baseURL}/${editsPath}?api-version=${this.apiVersion}`;
        const formData = new FormData();
        
        formData.append('model', this.deployment);
        formData.append('prompt', finalPrompt);
        formData.append('n', '1');
        formData.append('size', dto.size || '1024x1024');
        formData.append('image', fs.createReadStream(referenceImagePath));

        this.logger.log(`📡 Sending edit request to FLUX.1-Kontext-pro with prompt: ${finalPrompt}`);
        
        response = await axios.post(editsUrl, formData, {
          headers: {
            'Authorization': authHeader,
            ...formData.getHeaders(),
          },
        });
      } else {
        // Use generations endpoint (no reference image)
        const generationsPath = `openai/deployments/${this.deployment}/images/generations`;
        const generationsUrl = `${this.baseURL}/${generationsPath}?api-version=${this.apiVersion}`;
        const payload = {
          model: this.deployment,
          prompt: finalPrompt,
          output_format: 'png',
          n: 1,
          size: dto.size || '1024x1024',
        };

        this.logger.log(`📡 Sending request to FLUX.1-Kontext-pro with payload: ${JSON.stringify(payload, null, 2)}`);
        
        response = await axios.post(generationsUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          responseType: 'json',
        });
      }

      this.logger.log(`📥 FLUX API Response Status: ${response.status}`);
      this.logger.log(`🔍 FLUX API Response Type: response.data=${typeof response.data}, isArray=${Array.isArray(response.data)}`);
      
      // Extract image data from response - Handle multiple formats
      let imageData: any;
      
      // Format 1: Direct b64_json in response.data (Foundry format)
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        // Check if it has b64_json directly
        if (response.data.b64_json) {
          imageData = response.data;
          this.logger.log('📊 Using direct response.data.b64_json format');
        }
        // Check if it has data array inside (OpenAI/Foundry standard)
        else if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          imageData = response.data.data[0];
          this.logger.log('📊 Using response.data.data[0] format');
        }
        // Check choices array (alternative format)
        else if (response.data.choices && Array.isArray(response.data.choices) && response.data.choices.length > 0) {
          imageData = response.data.choices[0];
          this.logger.log('📊 Using response.data.choices[0] format');
        }
      }
      // Format 2: response.data is array directly
      else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        imageData = response.data[0];
        this.logger.log('📊 Using response.data[0] format');
      }
      // Fallback to top-level choices
      else if (response.choices && Array.isArray(response.choices) && response.choices.length > 0) {
        imageData = response.choices[0];
        this.logger.log('📊 Using response.choices[0] format');
      } else {
        this.logger.error(`❌ Unexpected response structure. Keys: ${Object.keys(response.data || {}).join(', ')}`);
        throw new Error('No image data received from FLUX API - unexpected response format');
      }
      
      this.logger.log(`📊 FLUX API Response - Has URL: ${!!imageData.url}, Has b64_json: ${!!imageData.b64_json}`);

      // Handle image data (URL or base64)
      let blobUrl: string;
      let filename: string;

      if (imageData.url) {
        this.logger.log(`🌐 Image URL provided by FLUX: ${imageData.url}`);
        filename = `misy-image-${Date.now()}.png`;
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
        
        filename = `misy-image-${Date.now()}.png`;
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
      this.logger.warn('⚠️ FALLBACK: Attempting to generate with DALL-E 3...');
      
      // FALLBACK TO DALL-E 3
      try {
        return await this.generateWithDalleFallback(userId, finalPrompt);
      } catch (dalleError: any) {
        this.logger.error('❌ Fallback to DALL-E also failed:', dalleError);
        throw new Error(`Failed to generate image with FLUX and DALL-E fallback: ${error.message}`);
      }
    }
  }

  /**
   * Fallback method to generate image with DALL-E 3 when FLUX fails
   */
  private async generateWithDalleFallback(
    userId: string,
    prompt: string
  ): Promise<{ imageUrl: string; filename: string; prompt: string }> {
    this.logger.log('🔄 Using DALL-E 3 as fallback for FLUX');
    
    const apiKey = process.env.AZURE_OPENAI_IMAGE_API_KEY || process.env.OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_IMAGE_ENDPOINT || 'https://api.openai.com/v1';
    
    if (!apiKey) {
      throw new Error('DALL-E API key not configured for fallback');
    }
    
    const openai = new OpenAI({
      apiKey,
      baseURL: endpoint,
    });
    
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
    });
    
    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('DALL-E fallback did not return an image URL');
    }
    this.logger.log(`🌐 DALL-E fallback URL: ${imageUrl}`);
    
    // Download and upload to Azure Blob
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(imageResponse.data);
    
    const filename = `promo-${Date.now()}.png`;
    const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);
    
    const tempDir = path.dirname(tempPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(tempPath, buffer);
    this.logger.log(`💾 Saved DALL-E fallback to temp: ${tempPath}`);
    
    const blobUrl = await this.azureBlobService.uploadFileToBlobWithSas(tempPath, `images/${filename}`, 'image/png');
    this.logger.log(`✅ DALL-E fallback uploaded to Azure: ${blobUrl}`);
    
    // Notify backend
    await fetch(`${this.backendUrl}/flux-kontext-image/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        prompt,
        imageUrl: blobUrl,
        filename,
        fallbackUsed: true,
      }),
    });
    
    return {
      imageUrl: blobUrl,
      filename,
      prompt,
    };
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
