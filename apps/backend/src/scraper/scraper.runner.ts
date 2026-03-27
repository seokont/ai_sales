import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import puppeteer from 'puppeteer';

interface ScrapedItem {
  title: string;
  description: string;
  price: string;
  url: string;
}

@Injectable()
export class ScraperRunner {
  constructor(private prisma: PrismaService) {}

  async run(jobId: string, companyId: string, url: string) {
    await this.prisma.scraperJob.update({
      where: { id: jobId },
      data: { status: 'running' },
    });

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
      );
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const items = await page.evaluate(() => {
        const results: ScrapedItem[] = [];
        const productSelectors = [
          '[data-product]',
          '.product',
          '.product-item',
          '.product-card',
          'article',
          '[class*="product"]',
          '[class*="item"]',
        ];

        for (const selector of productSelectors) {
          const elements = document.querySelectorAll(selector);
          const seen = new Set<string>();

          elements.forEach((el) => {
            const link = el.querySelector('a[href]');
            const href = link?.getAttribute('href') || '';
            const fullUrl = href.startsWith('http') ? href : new URL(href, window.location.href).href;

            const titleEl =
              el.querySelector('h1, h2, h3, [class*="title"], [class*="name"]') ||
              el.querySelector('a');
            const title = titleEl?.textContent?.trim() || '';

            const descEl = el.querySelector('[class*="description"], [class*="desc"], p');
            const description = descEl?.textContent?.trim() || '';

            const priceEl =
              el.querySelector('[class*="price"], [data-price]') ||
              el.querySelector('span:not([class])');
            const price = priceEl?.textContent?.trim() || '';

            if (title && !seen.has(title)) {
              seen.add(title);
              results.push({
                title,
                description: description.slice(0, 500),
                price,
                url: fullUrl,
              });
            }
          });

          if (results.length > 0) break;
        }

        if (results.length === 0) {
          const links = Array.from(document.querySelectorAll('a[href]'));
          links.slice(0, 20).forEach((a) => {
            const href = a.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
              const fullUrl = href.startsWith('http') ? href : new URL(href, window.location.href).href;
              const title = a.textContent?.trim() || fullUrl;
              results.push({
                title,
                description: '',
                price: '',
                url: fullUrl,
              });
            }
          });
        }

        return results;
      });

      await browser.close();

      const itemsToSave = items.slice(0, 50);
      const content = itemsToSave
        .map((i) => `${i.title}: ${i.description} | ${i.price} | ${i.url}`)
        .join('\n');

      await this.prisma.knowledgeItem.create({
        data: {
          companyId,
          title: `Scraped: ${new URL(url).hostname}`,
          content,
          type: 'scraper',
          jsonData: itemsToSave as object,
        },
      });

      await this.prisma.scraperJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          result: { items: itemsToSave, count: itemsToSave.length } as object,
        },
      });
    } catch (error) {
      await this.prisma.scraperJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        },
      });
    } finally {
      if (browser) await browser.close();
    }
  }
}
