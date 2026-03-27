import { Body, Controller, ForbiddenException, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ScraperService } from './scraper.service';
import { CompanyService } from '../company/company.service';
import { RunScraperDto } from '@ai-seller-widget/shared';

@Controller('scraper')
@UseGuards(JwtAuthGuard)
export class ScraperController {
  constructor(
    private scraperService: ScraperService,
    private companyService: CompanyService,
  ) {}

  @Post('company/:companyId/run')
  async run(
    @Param('companyId') companyId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: RunScraperDto,
  ) {
    const company = await this.companyService.findOne(companyId, user.id);
    if (company.plan === 'free') {
      throw new ForbiddenException('Scraper is available on Pro and Enterprise plans');
    }
    return this.scraperService.runScraper(companyId, dto);
  }

  @Get('company/:companyId/jobs')
  async listJobs(
    @Param('companyId') companyId: string,
    @CurrentUser() user: { id: string },
  ) {
    const company = await this.companyService.findOne(companyId, user.id);
    if (company.plan === 'free') {
      throw new ForbiddenException('Scraper is available on Pro and Enterprise plans');
    }
    return this.scraperService.getJobs(companyId);
  }

  @Get('company/:companyId/jobs/:jobId')
  async getJob(
    @Param('companyId') companyId: string,
    @Param('jobId') jobId: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.companyService.findOne(companyId, user.id);
    return this.scraperService.getJob(jobId, companyId);
  }
}
