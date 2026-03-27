import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { KnowledgeService } from './knowledge.service';
import { CompanyService } from '../company/company.service';
import { FileProcessorService } from './file-processor.service';
import { CreateKnowledgeDto, UpdateKnowledgeDto } from '@ai-seller-widget/shared';

const MAX_UPLOAD_SIZE = 20 * 1024 * 1024; // 20 MB

@Controller('knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(
    private knowledgeService: KnowledgeService,
    private companyService: CompanyService,
    private fileProcessor: FileProcessorService,
  ) {}

  @Get('company/:companyId')
  async list(
    @Param('companyId') companyId: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.companyService.findOne(companyId, user.id);
    return this.knowledgeService.findAll(companyId);
  }

  @Post('company/:companyId')
  async create(
    @Param('companyId') companyId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateKnowledgeDto,
  ) {
    await this.companyService.findOne(companyId, user.id);
    return this.knowledgeService.create(companyId, dto);
  }

  @Post('company/:companyId/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_UPLOAD_SIZE },
    }),
  )
  async upload(
    @Param('companyId') companyId: string,
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    await this.companyService.findOne(companyId, user.id);
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.fileProcessor.processAndSave(companyId, file);
  }

  @Get('company/:companyId/:id')
  async findOne(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.companyService.findOne(companyId, user.id);
    return this.knowledgeService.findOne(id, companyId);
  }

  @Patch('company/:companyId/:id')
  async update(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateKnowledgeDto,
  ) {
    await this.companyService.findOne(companyId, user.id);
    return this.knowledgeService.update(id, companyId, dto);
  }

  @Delete('company/:companyId/:id')
  async remove(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.companyService.findOne(companyId, user.id);
    return this.knowledgeService.remove(id, companyId);
  }
}
