import { Module } from '@nestjs/common';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { FileProcessorService } from './file-processor.service';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [CompanyModule],
  controllers: [KnowledgeController],
  providers: [KnowledgeService, FileProcessorService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
