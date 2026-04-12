import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/** jsonData from file uploads is only { sourceFile }; real catalog rows use title/description/price/url. */
function isUploadMetadataOnly(obj: Record<string, unknown>): boolean {
  const keys = Object.keys(obj);
  if (keys.length === 0) return true;
  const allowed = new Set(['sourceFile', 'source']);
  return keys.every((k) => allowed.has(k));
}

function formatCatalogLine(o: Record<string, unknown>): string {
  return `- ${o.title || ''}: ${o.description || o.content || ''} | Price: ${o.price ?? 'N/A'} | ${o.url || ''}`;
}

function hasCatalogShape(o: Record<string, unknown>): boolean {
  return Boolean(
    o.title || o.description || o.content || o.price != null || o.url,
  );
}

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  private formatKnowledgeForPrompt(k: {
    title: string;
    content: string;
    jsonData: unknown;
  }): string {
    if (k.jsonData == null || typeof k.jsonData !== 'object') {
      return `- ${k.title}: ${k.content}`;
    }

    const raw = k.jsonData as Record<string, unknown> | unknown[];

    if (Array.isArray(raw)) {
      const lines: string[] = [];
      for (const item of raw) {
        if (!item || typeof item !== 'object') continue;
        const o = item as Record<string, unknown>;
        if (isUploadMetadataOnly(o)) continue;
        if (!hasCatalogShape(o)) continue;
        lines.push(formatCatalogLine(o));
      }
      if (lines.length === 0) {
        return `- ${k.title}: ${k.content}`;
      }
      return lines.join('\n');
    }

    const single = raw as Record<string, unknown>;
    if (isUploadMetadataOnly(single)) {
      return `- ${k.title}: ${k.content}`;
    }
    if (!hasCatalogShape(single)) {
      return `- ${k.title}: ${k.content}`;
    }
    return formatCatalogLine(single);
  }

  async chat(companyId: string, messages: ChatMessage[]): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { knowledge: true },
    });

    if (!company) throw new Error('Company not found');

    const apiKey = company.groqKey || process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ API key not configured');

    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    const knowledgeContext = company.knowledge
      .map((k) => this.formatKnowledgeForPrompt(k))
      .join('\n');

    const systemPrompt =
      company.systemPrompt ||
      'You are an AI sales assistant. Sell products using knowledge. Answer politely.';

    const fullSystemPrompt = knowledgeContext
      ? `${systemPrompt}\n\nKnowledge base:\n${knowledgeContext}`
      : systemPrompt;

    const fullMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: fullSystemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: fullMessages,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'No response generated.';
  }
}
