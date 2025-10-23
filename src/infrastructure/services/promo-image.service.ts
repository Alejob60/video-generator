import { Injectable, Logger } from '@nestjs/common';
import { AzureOpenAI, OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { AzureBlobService } from './azure-blob.service';
import { FluxImageService } from './flux-image.service';
import { GenerateFluxImageDto } from '../../interfaces/dto/generate-flux-image.dto';

@Injectable()
export class PromoImageService {
  private readonly logger = new Logger(PromoImageService.name);
  private readonly endpoint = process.env.AZURE_OPENAI_IMAGE_ENDPOINT!;
  private readonly deployment = process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT!;
  private readonly apiVersion = process.env.AZURE_OPENAI_IMAGE_API_VERSION!;
  private readonly backendUrl = process.env.MAIN_BACKEND_URL!;
  private readonly apiKey = process.env.AZURE_OPENAI_IMAGE_API_KEY!;
  private readonly openai: OpenAI;

  constructor(
    private readonly azureBlobService: AzureBlobService,
    private readonly fluxImageService: FluxImageService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.endpoint,
    });
  }

  async generateAndNotify(userId: string, input: {
    prompt?: string;
    imagePath?: string;
    textOverlay?: string;
    useFlux?: boolean;
    isJsonPrompt?: boolean; // Add this to handle JSON prompts
  }): Promise<{
    imageUrl: string;
    prompt: string | null;
    imagePath: string | null;
    filename: string;
    plan?: string;
  }> {
    let { prompt, imagePath, useFlux, isJsonPrompt } = input;
    let finalPrompt: string | null = null;

    if (!prompt && !imagePath) {
      throw new Error('Debe proporcionar un prompt o una ruta de imagen.');
    }

    // Process JSON prompt if isJsonPrompt is true
    if (prompt && isJsonPrompt) {
      try {
        // Use LLM to convert JSON prompt to a natural language description
        finalPrompt = await this.fluxImageService['llmService'].improveImagePrompt(prompt);
        this.logger.log(`📋 Converted JSON prompt to natural language with LLM: ${finalPrompt}`);
      } catch (error: any) {
        this.logger.warn(`⚠️ Failed to convert JSON prompt with LLM, using as-is: ${error.message}`);
        // If LLM conversion fails, use the prompt as-is
        finalPrompt = prompt;
      }
    } else if (prompt) {
      // Usar el prompt directamente sin mejora
      finalPrompt = prompt;
    }

    // Generar imagen y subirla
    let azureUrl: string;
    let localFilename: string;

    if (useFlux && finalPrompt) {
      // Usar FLUX-1.1-pro para generar la imagen
      this.logger.log(`🤖 Usando FLUX-1.1-pro para generar imagen para usuario ${userId}`);
      // Create a DTO object instead of just passing a string
      const fluxDto: GenerateFluxImageDto = {
        prompt: finalPrompt,
        plan: 'FREE', // Default plan, you might want to pass this as a parameter
        isJsonPrompt: false // Set to false since we've already processed the JSON prompt
      };
      const fluxResult = await this.fluxImageService.generateImage(fluxDto);
      azureUrl = fluxResult.imageUrl;
      localFilename = fluxResult.filename;
    } else {
      // Usar DALL·E para generar la imagen (comportamiento original)
      this.logger.log(`🤖 Usando DALL·E para generar imagen para usuario ${userId}`);
      const result = await this.generateImageWithText({
        prompt: finalPrompt!,
      });
      azureUrl = result.azureUrl;
      localFilename = result.localFilename;
    }

    // Notificar al backend principal
    await fetch(`${this.backendUrl}/promo-image/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        prompt: finalPrompt,
        imageUrl: azureUrl,
        filename: localFilename,
        useFlux: useFlux || false,
      }),
    });

    return {
      imageUrl: azureUrl,
      prompt: finalPrompt,
      imagePath: null,
      filename: localFilename,
    };
  }

  async generateImageWithText({
    prompt,
  }: {
    prompt?: string;
  }): Promise<{ azureUrl: string; localFilename: string }> {
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const outputDir = path.resolve('public/uploads');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      this.logger.log(`📁 Carpeta creada: ${outputDir}`);
    }

    const baseImagePath = await this.generateImageFromPrompt(prompt!);

    const fallbackName = `promo_${timestamp}.png`;
    const fallbackPath = path.join(outputDir, fallbackName);
    fs.copyFileSync(baseImagePath, fallbackPath);
    this.logger.log('🧾 Imagen generada directamente, sin FFmpeg.');

    const uploadedUrl = await this.azureBlobService.uploadToContainerWithSas(fallbackPath, 'images');
    this.logger.log(`✅ Imagen subida a Azure Blob Storage with SAS: ${uploadedUrl}`);

    return {
      azureUrl: uploadedUrl,
      localFilename: fallbackName,
    };
  }

  private async generateImageFromPrompt(prompt: string): Promise<string> {
    if (!prompt) throw new Error('Prompt vacío');

    const blockedTerms = ['garras', 'arma', 'pelea', 'violencia', 'sangre'];
    const isBlocked = blockedTerms.some(term => prompt.toLowerCase().includes(term));
    if (isBlocked) {
      throw new Error('El prompt contiene palabras que pueden violar las políticas de contenido de Azure.');
    }

    this.logger.log(`📡 Solicitando imagen a Azure con prompt: ${prompt}`);

    const client = new AzureOpenAI({
      apiKey: this.apiKey,
      endpoint: this.endpoint,
      deployment: this.deployment,
      apiVersion: this.apiVersion,
    });

    try {
      const result = await client.images.generate({
        prompt,
        n: 1,
        size: '1024x1024',
        style: 'vivid',
        quality: 'standard',
      }) as any;

      const imageUrl = result.data?.[0]?.url;
      if (!imageUrl) throw new Error('No se pudo obtener la URL de la imagen generada.');

      const filename = `generated_${Date.now()}.png`;
      const outputDir = path.resolve('public/uploads');
      const localPath = path.join(outputDir, filename);

      this.logger.log(`🌐 Imagen recibida desde Azure. URL: ${imageUrl}`);

      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(localPath, Buffer.from(buffer));
      this.logger.log(`💾 Imagen descargada y guardada en: ${localPath}`);

      return localPath;
    } catch (error: any) {
      const policyViolation = error?.error?.code === 'content_policy_violation';
      if (policyViolation) {
        this.logger.error('🔒 Azure bloqueó el contenido por política.');
        throw new Error('Azure bloqueó el contenido del prompt por considerarlo sensible. Intenta con otra descripción.');
      }

      this.logger.error('❌ Error generando imagen desde Azure DALL·E.', error);
      throw new Error('Error generando imagen desde Azure DALL·E.');
    }
  }
  
}