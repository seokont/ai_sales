export type MessageRole = 'user' | 'assistant' | 'system';
export type KnowledgeType = 'manual' | 'scraper';

export interface ScrapedProduct {
  title: string;
  description: string;
  price: string;
  url: string;
}
