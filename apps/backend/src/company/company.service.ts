import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanyDto } from '@ai-seller-widget/shared';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  private getAvatarsDir() {
    const dir = join(process.cwd(), 'uploads', 'avatars');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  }

  async saveAvatar(companyId: string, buffer: Buffer, ext: string) {
    const dir = this.getAvatarsDir();
    const filename = `${companyId}.${ext}`;
    const filepath = join(dir, filename);
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (company?.avatarPath) {
      const oldPath = join(dir, company.avatarPath);
      if (existsSync(oldPath)) unlinkSync(oldPath);
    }
    writeFileSync(filepath, buffer);
    await this.prisma.company.update({
      where: { id: companyId },
      data: { avatarPath: filename },
    });
    return { avatarPath: filename };
  }

  serveAvatar(avatarPath: string, res: import('express').Response) {
    const { createReadStream } = require('node:fs');
    const dir = this.getAvatarsDir();
    const filepath = join(dir, avatarPath);
    if (!existsSync(filepath)) {
      return res.status(404).send('Avatar not found');
    }
    const ext = avatarPath.split('.').pop()?.toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return createReadStream(filepath).pipe(res);
  }

  async findByUser(userId: string) {
    return this.prisma.userCompany.findMany({
      where: { userId },
      include: { company: true },
    });
  }

  async findOne(id: string, userId: string) {
    const uc = await this.prisma.userCompany.findFirst({
      where: { companyId: id, userId },
      include: { company: true },
    });
    if (!uc) throw new NotFoundException('Company not found');
    return uc.company;
  }

  async update(id: string, userId: string, dto: UpdateCompanyDto) {
    await this.findOne(id, userId);
    const { plan, ...rest } = dto;
    return this.prisma.company.update({
      where: { id },
      data: rest,
    });
  }

  async findById(id: string) {
    return this.prisma.company.findUnique({ where: { id } });
  }
}
