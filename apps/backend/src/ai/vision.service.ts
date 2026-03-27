import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const VISION_PROMPT = `Describe the image content and extract all visible text (OCR). 
The result must be structured text suitable for a knowledge base. 
Include: product names, prices, descriptions, any text visible in the image.`;

@Injectable()
export class VisionService {
  constructor(private prisma: PrismaService) {}

  async extractFromImage(
    companyId: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) throw new Error('Company not found');

    const apiKey = company.groqKey || process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ API key not configured');

    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const completion = await client.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: VISION_PROMPT,
            },
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || 'No content extracted.';
  }
}
