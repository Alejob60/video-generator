import { Injectable, Logger } from '@nestjs/common';
import { AzureOpenAI, OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { LLMService } from './llm.service';
import { AzureBlobService } from './azure-blob.service';

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
    private readonly llmService: LLMService,
    private readonly azureBlobService: AzureBlobService,
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
  }): Promise<{
    imageUrl: string;
    prompt: string | null;
    imagePath: string | null;
    filename: string;
    plan?: string;
  }> {
    let { prompt, imagePath } = input;
    let improvedPrompt: string | null = null;

    if (!prompt && !imagePath) {
      throw new Error('Debe proporcionar un prompt o una ruta de imagen.');
    }

    // Si hay prompt: mejorarlo. Si hay imagen: describirla y mejorarla.
    if (prompt) {
      improvedPrompt = await this.llmService.improveImagePrompt(prompt);
    } else if (imagePath) {
      const type = await this.llmService.classifyImageType(imagePath);
      const basePrompt = await this.llmService.describeAndImproveImage(imagePath);

      switch (type) {
        case 'producto':
          improvedPrompt = `${basePrompt}. Fondo blanco profesional con luz suave y superficie reflectante.`;
          break;
        case 'persona':
          improvedPrompt = `${basePrompt}. Fondo de estudio moderno con iluminación suave.`;
          break;
        case 'mascota':
          improvedPrompt = `${basePrompt}. Fondo colorido con elementos divertidos.`;
          break;
        case 'paisaje':
          improvedPrompt = `${basePrompt}. Mejorar contraste y profundidad del fondo.`;
          break;
        default:
          improvedPrompt = basePrompt;
      }

      this.logger.log(`🎨 Prompt ajustado según tipo "${type}": ${improvedPrompt}`);
    }

    // Generar imagen y subirla
    const {
      azureUrl,
      localFilename,
    } = await this.generateImageWithText({
      prompt: improvedPrompt!,
    });

    // Notificar al backend principal
    await fetch(`${this.backendUrl}/promo-image/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        prompt: improvedPrompt,
        imageUrl: azureUrl,
        filename: localFilename,
      }),
    });

    return {
      imageUrl: azureUrl,
      prompt: improvedPrompt,
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

    const uploadedUrl = await this.azureBlobService.uploadToContainer(fallbackPath, 'images');
    this.logger.log(`✅ Imagen subida a Azure Blob Storage: ${uploadedUrl}`);

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
