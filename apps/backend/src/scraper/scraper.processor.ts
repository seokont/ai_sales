import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ScraperRunner } from './scraper.runner';

@Processor('scrape')
export class ScraperProcessor extends WorkerHost {
  constructor(private scraperRunner: ScraperRunner) {
    super();
  }

  async process(job: Job<{ jobId: string; companyId: string; url: string }>) {
    const { jobId, companyId, url } = job.data;
    await this.scraperRunner.run(jobId, companyId, url);
  }
}
