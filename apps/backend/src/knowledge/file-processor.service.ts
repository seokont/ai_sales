import {
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
} from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import { VisionService } from '../ai/vision.service';
import { KnowledgeService } from './knowledge.service';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_BASE64_IMAGE_SIZE = 4 * 1024 * 1024; // 4 MB for Groq base64 limit

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
};

export interface ProcessedFileResult {
  title: string;
  content: string;
  sourceFileName: string;
}

@Injectable()
export class FileProcessorService {
  constructor(
    private knowledgeService: KnowledgeService,
    private visionService: VisionService,
  ) {}

  async processAndSave(
    companyId: string,
    file: { buffer: Buffer; size: number; mimetype: string; originalname?: string },
  ): Promise<{ id: string; title: string }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new PayloadTooLargeException(
        `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024} MB limit`,
      );
    }

    const mimeType = file.mimetype || 'application/octet-stream';
    const type = ALLOWED_MIME_TYPES[mimeType];

    if (!type) {
      throw new BadRequestException(
        `Unsupported file type: ${mimeType}. Allowed: PDF, TXT, JPG, PNG, WEBP`,
      );
    }

    const originalName = file.originalname || 'uploaded-file';
    let title: string;
    let content: string;

    if (type === 'pdf') {
      const result = await this.extractFromPdf(file.buffer);
      title = result.title;
      content = result.content;
    } else if (type === 'txt') {
      content = file.buffer.toString('utf-8');
      title = originalName.replace(/\.[^.]+$/, '') || 'Text document';
    } else if (type === 'image') {
      if (file.size > MAX_BASE64_IMAGE_SIZE) {
        throw new PayloadTooLargeException(
          'Image size exceeds 4 MB limit for vision processing',
        );
      }
      content = await this.visionService.extractFromImage(
        companyId,
        file.buffer,
        mimeType,
      );
      title = originalName.replace(/\.[^.]+$/, '') || 'Image';
    } else {
      throw new BadRequestException('Unsupported file type');
    }

    if (!content || content.trim().length === 0) {
      throw new BadRequestException('No content could be extracted from file');
    }

    const item = await this.knowledgeService.createFromUpload(
      companyId,
      title,
      content.trim(),
      originalName,
    );

    return { id: item.id, title: item.title };
  }

  private async extractFromPdf(buffer: Buffer): Promise<{
    title: string;
    content: string;
  }> {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      await parser.destroy();
      const content = result?.text || '';
      const firstLine = content.split('\n').find((l) => l.trim().length > 0);
      const title = firstLine?.slice(0, 100).trim() || 'PDF document';
      return { title, content };
    } catch (err) {
      await parser.destroy().catch(() => {});
      throw new BadRequestException(
        `Failed to parse PDF: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    }
  }
}
