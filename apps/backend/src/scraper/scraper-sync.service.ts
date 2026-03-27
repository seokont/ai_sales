import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScraperRunner } from './scraper.runner';
import { RunScraperDto } from '@ai-seller-widget/shared';

@Injectable()
export class ScraperSyncService {
  constructor(
    private prisma: PrismaService,
    private scraperRunner: ScraperRunner,
  ) {}

  async runScraper(companyId: string, dto: RunScraperDto) {
    const job = await this.prisma.scraperJob.create({
      data: {
        companyId,
        url: dto.url,
        status: 'running',
      },
    });

    this.scraperRunner.run(job.id, companyId, dto.url).catch(() => {});

    return job;
  }

  async getJobs(companyId: string) {
    return this.prisma.scraperJob.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getJob(jobId: string, companyId: string) {
    return this.prisma.scraperJob.findFirst({
      where: { id: jobId, companyId },
    });
  }
}
