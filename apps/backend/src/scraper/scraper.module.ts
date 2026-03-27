import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { ScraperSyncService } from './scraper-sync.service';
import { ScraperProcessor } from './scraper.processor';
import { ScraperRunner } from './scraper.runner';
import { CompanyModule } from '../company/company.module';

const useRedis = process.env.REDIS_ENABLED !== 'false';

const redisConfig = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const u = new URL(redisUrl);
  return {
    host: u.hostname || 'localhost',
    port: parseInt(u.port || '6379', 10),
    password: u.password || undefined,
  };
};

@Module({
  imports: [
    ...(useRedis
      ? [
          BullModule.forRoot({ connection: redisConfig() }),
          BullModule.registerQueue({ name: 'scrape' }),
        ]
      : []),
    CompanyModule,
  ],
  controllers: [ScraperController],
  providers: [
    ScraperRunner,
    ...(useRedis ? [ScraperProcessor] : []),
    {
      provide: ScraperService,
      useClass: useRedis ? ScraperService : ScraperSyncService,
    },
  ],
  exports: [ScraperService],
})
export class ScraperModule {}
