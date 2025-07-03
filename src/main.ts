// 📁 src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilitar CORS
  app.enableCors();

  // Activar validaciones globales para DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Servir archivos estáticos (acceso por URL)
  app.useStaticAssets(join(__dirname, '..', 'public', 'videos'), {
    prefix: '/videos/',
  });
  app.useStaticAssets(join(__dirname, '..', 'public/audio'), {
  prefix: '/audio/',
  });
  app.useStaticAssets(join(__dirname, '..', 'public/subtitles'), {
    prefix: '/subtitles/',
  });
  app.useStaticAssets(join(__dirname, '..', 'public/uploads'), {
    prefix: '/uploads/',
  });
  app.useStaticAssets(join(__dirname, '..', 'public/avatars'), {
    prefix: '/avatars/',
  });
  app.useStaticAssets(join(__dirname, '..', 'public/campaigns'), {
    prefix: '/campaigns/',
  });
  app.useStaticAssets(join(__dirname, '..', 'public/image'), {
    prefix: '/image/',
  });

  


  




  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🎬 Microservicio de video escuchando en http://localhost:${port}`);
}

bootstrap();
