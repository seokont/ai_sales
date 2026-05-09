import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [PrismaModule, TelegramModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
