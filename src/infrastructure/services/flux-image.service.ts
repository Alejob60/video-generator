import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { LLMService } from './llm.service';
import { AzureBlobService } from './azure-blob.service';
import { GenerateFluxImageDto } from '../../interfaces/dto/generate-flux-image.dto';

@Injectable()
export class FluxImageService {
  private readonly logger = new Logger(FluxImageService.name);
  private readonly endpoint = 'https://labsc-m9j5kbl9-eastus2.services.ai.azure.com/openai/deployments/FLUX-1.1-pro/images/generations';
  private readonly apiVersion = '2025-04-01-preview';
  private readonly apiKey = process.env.FLUX_API_KEY || ''; // You'll need to add this to your .env file
  private readonly backendUrl = process.env.MAIN_BACKEND_URL!;

  constructor(
    private readonly llmService: LLMService,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  async generateImageAndNotify(userId: string, dto: GenerateFluxImageDto): Promise<{ imageUrl: string; filename: string; prompt: string }> {
    // Check if the prompt is already a JSON prompt
    let finalPrompt: string;
    
    if (dto.isJsonPrompt) {
      // If it's marked as a JSON prompt, use it as-is
      finalPrompt = dto.prompt;
      this.logger.log(`📋 Received JSON prompt, using as-is: ${finalPrompt}`);
    } else {
      try {
        // Try to parse the prompt as JSON
        const parsedPrompt = JSON.parse(dto.prompt);
        // If it's valid JSON, use it as-is
        finalPrompt = dto.prompt;
        this.logger.log(`📋 Detected JSON prompt, using as-is: ${JSON.stringify(parsedPrompt)}`);
      } catch (e) {
        // If it's not valid JSON, improve it using LLM service
        finalPrompt = await this.llmService.improveImagePrompt(dto.prompt);
        this.logger.log(`🎨 Improved text prompt for FLUX: ${finalPrompt}`);
      }
    }

    const url = `${this.endpoint}?api-version=${this.apiVersion}`;
    
    const payload = {
      prompt: finalPrompt,
      output_format: 'png',
      n: 1,
      size: dto.size || '1024x1024'
    };

    try {
      this.logger.log(`📡 Sending request to FLUX-1.1-pro with payload: ${JSON.stringify(payload, null, 2)}`);
      
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        responseType: 'json'
      });

      this.logger.log(`📥 FLUX API Response Status: ${response.status}`);
      this.logger.log(`📥 FLUX API Response Headers: ${JSON.stringify(response.headers, null, 2)}`);
      
      const imageData = response.data.data?.[0];
      if (!imageData) {
        throw new Error('No image data received from FLUX API');
      }

      // Log the structure of the response for debugging
      this.logger.log(`📊 FLUX API Response Structure - Keys: ${Object.keys(imageData).join(', ')}`);
      this.logger.log(`📊 FLUX API Response - Has URL: ${!!imageData.url}, Has b64_json: ${!!imageData.b64_json}`);
      
      if (imageData.url) {
        this.logger.log(`🌐 FLUX provided direct URL, length: ${imageData.url.length}`);
      }
      
      if (imageData.b64_json) {
        this.logger.log(`ülü FLUX provided base64 data, length: ${imageData.b64_json.length}`);
        // Log first 100 characters of base64 for debugging
        this.logger.log(`📋 Base64 sample (first 100 chars): ${imageData.b64_json.substring(0, 100)}`);
      }

      // Handle the image data - prefer URL if available, otherwise use base64
      let blobUrl: string;
      let filename: string;
      
      if (imageData.url) {
        // If URL is provided, download the image from the URL
        this.logger.log(`🌐 Image URL provided by FLUX: ${imageData.url}`);
        filename = `flux-image-${uuidv4()}.png`;
        this.logger.log(`📤 Uploading image from URL to Azure Blob Storage`);
        blobUrl = await this.azureBlobService.uploadFileFromUrl(imageData.url, `images/${filename}`);
        this.logger.log(`✅ Image uploaded to Azure Blob Storage from URL: ${blobUrl}`);
      } else if (imageData.b64_json) {
        // If base64 data is provided, decode and upload it
        this.logger.log(`ülü Base64 data provided by FLUX, length: ${imageData.b64_json.length}`);
        
        // Validate base64 data
        const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(imageData.b64_json);
        this.logger.log(`🔍 Base64 validation result: ${isValidBase64}`);
        
        // Log first 100 characters of base64 for debugging
        this.logger.log(`📋 Base64 sample (first 100 chars): ${imageData.b64_json.substring(0, 100)}`);
        
        // Fix: Remove any whitespace that might be in the base64 data
        const cleanBase64 = imageData.b64_json.replace(/\s/g, '');
        this.logger.log(`🧹 Cleaned base64 data, length: ${cleanBase64.length}`);
        
        const buffer = Buffer.from(cleanBase64, 'base64');
        this.logger.log(`💾 Decoded buffer size: ${buffer.length} bytes`);
        
        // Additional validation: Check if buffer starts with PNG header
        const pngHeader = buffer.slice(0, 8);
        const isPng = pngHeader.equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
        this.logger.log(`🔍 PNG header validation: ${isPng ? 'Valid PNG' : 'Invalid PNG header'}`);
        this.logger.log(`🔍 PNG header bytes: ${pngHeader.toString('hex').toUpperCase()}`);
        
        filename = `flux-image-${uuidv4()}.png`;
        const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);
        
        // Ensure temp directory exists
        const tempDir = path.dirname(tempPath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Save the image locally
        this.logger.log(`💾 Writing image to temporary file: ${tempPath}`);
        fs.writeFileSync(tempPath, buffer);
        
        // Verify file was written correctly
        const stats = fs.statSync(tempPath);
        this.logger.log(`🔍 Temporary file size: ${stats.size} bytes`);
        
        // Read the file back to verify it was written correctly
        const verifyBuffer = fs.readFileSync(tempPath);
        this.logger.log(`🔍 Verification buffer size: ${verifyBuffer.length} bytes`);
        const verifyPngHeader = verifyBuffer.slice(0, 8);
        this.logger.log(`🔍 Verification PNG header bytes: ${verifyPngHeader.toString('hex').toUpperCase()}`);
        
        this.logger.log(`📤 Uploading image to Azure Blob Storage`);
        // Upload to Azure Blob Storage
        blobUrl = await this.azureBlobService.uploadFileToBlob(tempPath, `images/${filename}`, 'image/png');
        this.logger.log(`✅ Image uploaded to Azure Blob Storage: ${blobUrl}`);
        
        // Instead of cleaning up the local file, we'll keep it in the temp folder as requested
        this.logger.log(`💾 Keeping temporary file in temp folder: ${tempPath}`);
      } else {
        throw new Error('Unexpected response format from FLUX API - no URL or base64 data found');
      }

      // Notify the main backend
      this.logger.log(`🔔 Notifying main backend about generated image`);
      await fetch(`${this.backendUrl}/flux-image/complete`, {
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
        prompt: finalPrompt
      };
    } catch (error: any) {
      this.logger.error('❌ Error generating image with FLUX-1.1-pro:', error);
      throw new Error(`Failed to generate image with FLUX: ${error.message || error}`);
    }
  }
  
  async generateImage(dto: GenerateFluxImageDto): Promise<{ imageUrl: string; filename: string }> {
    // Check if the prompt is already a JSON prompt
    let finalPrompt: string;
    
    if (dto.isJsonPrompt) {
      // If it's marked as a JSON prompt, use it as-is
      finalPrompt = dto.prompt;
      this.logger.log(`📋 Received JSON prompt, using as-is: ${finalPrompt}`);
    } else {
      try {
        // Try to parse the prompt as JSON
        const parsedPrompt = JSON.parse(dto.prompt);
        // If it's valid JSON, use it as-is
        finalPrompt = dto.prompt;
        this.logger.log(`📋 Detected JSON prompt, using as-is: ${JSON.stringify(parsedPrompt)}`);
      } catch (e) {
        // If it's not valid JSON, improve it using LLM service
        finalPrompt = await this.llmService.improveImagePrompt(dto.prompt);
        this.logger.log(`🎨 Improved text prompt for FLUX: ${finalPrompt}`);
      }
    }

    const url = `${this.endpoint}?api-version=${this.apiVersion}`;
    
    const payload = {
      prompt: finalPrompt,
      output_format: 'png',
      n: 1,
      size: dto.size || '1024x1024'
    };

    try {
      this.logger.log(`📡 Sending request to FLUX-1.1-pro with payload: ${JSON.stringify(payload, null, 2)}`);
      
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        responseType: 'json'
      });

      this.logger.log(`📥 FLUX API Response Status: ${response.status}`);
      this.logger.log(`📥 FLUX API Response Headers: ${JSON.stringify(response.headers, null, 2)}`);
      
      const imageData = response.data.data?.[0];
      if (!imageData) {
        throw new Error('No image data received from FLUX API');
      }

      // Log the structure of the response for debugging
      this.logger.log(`📊 FLUX API Response Structure - Keys: ${Object.keys(imageData).join(', ')}`);
      this.logger.log(`📊 FLUX API Response - Has URL: ${!!imageData.url}, Has b64_json: ${!!imageData.b64_json}`);
      
      if (imageData.url) {
        this.logger.log(`🌐 FLUX provided direct URL, length: ${imageData.url.length}`);
      }
      
      if (imageData.b64_json) {
        this.logger.log(`ülü FLUX provided base64 data, length: ${imageData.b64_json.length}`);
        // Log first 100 characters of base64 for debugging
        this.logger.log(`📋 Base64 sample (first 100 chars): ${imageData.b64_json.substring(0, 100)}`);
      }

      // Handle the image data - prefer URL if available, otherwise use base64
      let blobUrl: string;
      let filename: string;
      
      if (imageData.url) {
        // If URL is provided, download the image from the URL
        this.logger.log(`🌐 Image URL provided by FLUX: ${imageData.url}`);
        filename = `flux-image-${uuidv4()}.png`;
        this.logger.log(`📤 Uploading image from URL to Azure Blob Storage`);
        blobUrl = await this.azureBlobService.uploadFileFromUrl(imageData.url, `images/${filename}`);
        this.logger.log(`✅ Image uploaded to Azure Blob Storage from URL: ${blobUrl}`);
      } else if (imageData.b64_json) {
        // If base64 data is provided, decode and upload it
        this.logger.log(`ülü Base64 data provided by FLUX, length: ${imageData.b64_json.length}`);
        
        // Validate base64 data
        const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(imageData.b64_json);
        this.logger.log(`🔍 Base64 validation result: ${isValidBase64}`);
        
        // Log first 100 characters of base64 for debugging
        this.logger.log(`📋 Base64 sample (first 100 chars): ${imageData.b64_json.substring(0, 100)}`);
        
        // Fix: Remove any whitespace that might be in the base64 data
        const cleanBase64 = imageData.b64_json.replace(/\s/g, '');
        this.logger.log(`🧹 Cleaned base64 data, length: ${cleanBase64.length}`);
        
        const buffer = Buffer.from(cleanBase64, 'base64');
        this.logger.log(`💾 Decoded buffer size: ${buffer.length} bytes`);
        
        // Additional validation: Check if buffer starts with PNG header
        const pngHeader = buffer.slice(0, 8);
        const isPng = pngHeader.equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
        this.logger.log(`🔍 PNG header validation: ${isPng ? 'Valid PNG' : 'Invalid PNG header'}`);
        this.logger.log(`🔍 PNG header bytes: ${pngHeader.toString('hex').toUpperCase()}`);
        
        filename = `flux-image-${uuidv4()}.png`;
        const tempPath = path.join(__dirname, '..', '..', '..', 'temp', filename);
        
        // Ensure temp directory exists
        const tempDir = path.dirname(tempPath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Save the image locally
        this.logger.log(`💾 Writing image to temporary file: ${tempPath}`);
        fs.writeFileSync(tempPath, buffer);
        
        // Verify file was written correctly
        const stats = fs.statSync(tempPath);
        this.logger.log(`🔍 Temporary file size: ${stats.size} bytes`);
        
        // Read the file back to verify it was written correctly
        const verifyBuffer = fs.readFileSync(tempPath);
        this.logger.log(`🔍 Verification buffer size: ${verifyBuffer.length} bytes`);
        const verifyPngHeader = verifyBuffer.slice(0, 8);
        this.logger.log(`🔍 Verification PNG header bytes: ${verifyPngHeader.toString('hex').toUpperCase()}`);
        
        this.logger.log(`📤 Uploading image to Azure Blob Storage`);
        // Upload to Azure Blob Storage
        blobUrl = await this.azureBlobService.uploadFileToBlob(tempPath, `images/${filename}`, 'image/png');
        this.logger.log(`✅ Image uploaded to Azure Blob Storage: ${blobUrl}`);
        
        // Instead of cleaning up the local file, we'll keep it in the temp folder as requested
        this.logger.log(`💾 Keeping temporary file in temp folder: ${tempPath}`);
      } else {
        throw new Error('Unexpected response format from FLUX API - no URL or base64 data found');
      }
      
      return {
        imageUrl: blobUrl,
        filename
      };
    } catch (error: any) {
      this.logger.error('❌ Error generating image with FLUX-1.1-pro:', error);
      throw new Error(`Failed to generate image with FLUX: ${error.message || error}`);
    }
  }
}