// 📁 src/interfaces/controllers/flux-kontext-image.controller.ts

import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FluxKontextImageService } from '../../infrastructure/services/flux-kontext-image.service';
import { GenerateFluxImageDto } from '../dto/generate-flux-image.dto';
import { LLMService } from '../../infrastructure/services/llm.service';

@Controller('media')
export class FluxKontextImageController {
  private readonly logger = new Logger(FluxKontextImageController.name);

  constructor(
   private readonly fluxKontextService: FluxKontextImageService,
   private readonly llmService: LLMService,
  ) {}

  /**
   * POST /media/flux-kontext/image
   * Generate image from text prompt using FLUX.1-Kontext-pro
   * 
   * @param enhancePrompt - If true, automatically enhances prompt using LLM before generation
   */
  @Post('flux-kontext/image')
  async generateFromText(
    @Body() dto: GenerateFluxImageDto & { enhancePrompt?: boolean },
    @Headers('x-user-id') userId: string = 'anon',
  ) {
    try {
      let finalPrompt = dto.prompt;
      let enhancedPromptUsed = false;

      // Automatic prompt enhancement if enabled
      if (dto.enhancePrompt === true) {
        this.logger.log('🔄 Enhancing prompt with LLM...');
        
        try {
          const improvedPrompt = await this.llmService.improveImagePrompt(dto.prompt);
          finalPrompt = improvedPrompt;
          enhancedPromptUsed = true;
          
          this.logger.log(`✅ Prompt enhanced successfully`);
          this.logger.log(`📝 Original: ${dto.prompt.substring(0, 80)}...`);
          this.logger.log(`📝 Enhanced: ${finalPrompt.substring(0, 80)}...`);
        } catch (llmError: any) {
          this.logger.warn(`⚠️ LLM enhancement failed: ${llmError.message}`);
          this.logger.warn('⚠️ Using original prompt as fallback');
          // Use original prompt if LLM fails
        }
      }

      this.logger.log(`📸 Generating FLUX Kontext image for user: ${userId}`);
      this.logger.log(`📝 Final prompt: ${finalPrompt}`);
      this.logger.log(`📏 Size: ${dto.size || '1024x1024'}`);
      
      const result = await this.fluxKontextService.generateImageAndNotify(
        userId,
        { ...dto, prompt: finalPrompt },
      );

      return {
        success: true,
        message: '✅ FLUX Kontext image generated successfully',
        data: {
          imageUrl: result.imageUrl,
          prompt: finalPrompt,
          filename: result.filename,
          enhancedPromptUsed,  // Indicates if LLM enhancement was used
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ Error: ${error.message}`, error.stack);
      
      throw new Error(`FLUX Kontext generation failed: ${error.message}`);
    }
  }

  /**
   * POST /media/flux-kontext/image-with-reference
   * Generate/edit image using FLUX.1-Kontext-pro with reference image upload
   * Accepts multipart/form-data with image file and prompt
   */
  @Post('flux-kontext/image-with-reference')
  @UseInterceptors(
    FileInterceptor('referenceImage', {
     storage: diskStorage({
        destination: './temp',
       filename: (req, file, callback) => {
         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
         const ext = extname(file.originalname);
          callback(null, `flux-ref-${uniqueSuffix}${ext}`);
        },
      }),
     fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
          return callback(new Error('Only image files (JPG, PNG) are allowed'), false);
        }
        callback(null, true);
      },
      limits: {
       fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async generateWithReferenceImage(
    @Body() body: { prompt: string; plan: string; enhancePrompt?: boolean },
    @UploadedFile() referenceImage: Express.Multer.File,
    @Headers('x-user-id') userId: string = 'anon',
  ) {
    try {
      if (!referenceImage) {
        throw new Error('Reference image is required');
      }

      this.logger.log(`📸 FLUX Kontext with reference image for user: ${userId}`);
      this.logger.log(`📝 Prompt: ${body.prompt}`);
      this.logger.log(`📁 Reference image: ${referenceImage.filename} (${referenceImage.size} bytes)`);

      let finalPrompt= body.prompt;
      let enhancedPromptUsed = false;

      // Enhance prompt if requested
      if (body.enhancePrompt === true) {
        try {
         const improvedPrompt = await this.llmService.improveImagePrompt(body.prompt);
         finalPrompt= improvedPrompt;
          enhancedPromptUsed = true;
          this.logger.log(`✅ Prompt enhanced: ${finalPrompt}`);
        } catch (llmError: any) {
          this.logger.warn(`⚠️ LLM enhancement failed, using original prompt`);
        }
      }

      // Generate image using service with reference image path
     const result = await this.fluxKontextService.generateImageAndNotify(
        userId,
        { 
         prompt: finalPrompt, 
         plan: (body.plan as 'FREE' | 'CREATOR' | 'PRO') || 'PRO',
          size: '1024x1024',
        },
        referenceImage.path, // Pass reference image path to service
      );

      return {
        success: true,
       message: '✅ FLUX Kontext image generated with reference',
        data: {
          imageUrl: result.imageUrl,
         prompt: finalPrompt,
         filename: result.filename,
          referenceImageName: referenceImage.originalname,
          enhancedPromptUsed,
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ Error generating with reference: ${error.message}`, error.stack);
      throw new Error(`FLUX Kontext generation with reference failed: ${error.message}`);
    }
  }
}
