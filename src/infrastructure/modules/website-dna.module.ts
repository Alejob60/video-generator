// 📁 src/infrastructure/modules/website-dna.module.ts
import { Module } from '@nestjs/common';
import { WebsiteDnaService } from '../services/website-dna.service';
import { WebsiteDnaController } from '../../interfaces/controllers/website-dna.controller';

@Module({
  imports: [],
  controllers: [WebsiteDnaController],
  providers: [WebsiteDnaService],
  exports: [WebsiteDnaService],
})
export class WebsiteDnaModule {}