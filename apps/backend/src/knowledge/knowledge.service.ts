import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKnowledgeDto, UpdateKnowledgeDto } from '@ai-seller-widget/shared';

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateKnowledgeDto) {
    return this.prisma.knowledgeItem.create({
      data: {
        companyId,
        title: dto.title,
        content: dto.content,
        type: 'manual',
        jsonData: dto.jsonData as object | undefined,
      },
    });
  }

  async createFromUpload(
    companyId: string,
    title: string,
    content: string,
    sourceFileName?: string,
  ) {
    return this.prisma.knowledgeItem.create({
      data: {
        companyId,
        title,
        content,
        type: 'upload',
        jsonData: sourceFileName ? { sourceFile: sourceFileName } : undefined,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.knowledgeItem.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const item = await this.prisma.knowledgeItem.findFirst({
      where: { id, companyId },
    });
    if (!item) throw new NotFoundException('Knowledge item not found');
    return item;
  }

  async update(id: string, companyId: string, dto: UpdateKnowledgeDto) {
    await this.findOne(id, companyId);
    const data: { title?: string; content?: string; jsonData?: object } = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.jsonData !== undefined) data.jsonData = dto.jsonData as object;
    return this.prisma.knowledgeItem.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.knowledgeItem.delete({ where: { id } });
  }
}
