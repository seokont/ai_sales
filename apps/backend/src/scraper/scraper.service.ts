import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { RunScraperDto } from '@ai-seller-widget/shared';

@Injectable()
export class ScraperService {
  constructor(
    @InjectQueue('scrape') private scrapeQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async runScraper(companyId: string, dto: RunScraperDto) {
    const job = await this.prisma.scraperJob.create({
      data: {
        companyId,
        url: dto.url,
        status: 'pending',
      },
    });

    await this.scrapeQueue.add(
      'scrapeSite',
      { jobId: job.id, companyId, url: dto.url },
      { attempts: 2, backoff: { type: 'exponential', delay: 5000 } },
    );

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
