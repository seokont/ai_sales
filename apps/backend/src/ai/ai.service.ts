import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

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
      .map((k) => {
        if (k.jsonData && typeof k.jsonData === 'object') {
          const items = Array.isArray(k.jsonData) ? k.jsonData : [k.jsonData];
          return items
            .map((item: unknown) => {
              const o = item as Record<string, unknown>;
              return `- ${o.title || ''}: ${o.description || o.content || ''} | Price: ${o.price || 'N/A'} | ${o.url || ''}`;
            })
            .join('\n');
        }
        return `- ${k.title}: ${k.content}`;
      })
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
